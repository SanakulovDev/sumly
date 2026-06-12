package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
	"github.com/sumly/backend/internal/utils"
	"gorm.io/gorm"
)

// resetTokenTTL is how long a password reset link stays valid.
const resetTokenTTL = time.Hour

// RegisterInput is the validated payload for user registration.
type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

// LoginInput is the validated payload for user login.
type LoginInput struct {
	Email    string
	Password string
}

// AuthResult bundles the issued token with the authenticated user.
type AuthResult struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

// AuthService implements registration, login, password recovery and the
// seeding of default data.
type AuthService struct {
	db           *gorm.DB
	users        *repositories.UserRepository
	resets       *repositories.PasswordResetRepository
	categories   *repositories.CategoryRepository
	payments     *repositories.PaymentMethodRepository
	mailer       *Mailer
	appURL       string
	jwtSecret    string
	jwtExpiresIn time.Duration
}

// NewAuthService constructs an AuthService.
func NewAuthService(
	db *gorm.DB,
	users *repositories.UserRepository,
	resets *repositories.PasswordResetRepository,
	categories *repositories.CategoryRepository,
	payments *repositories.PaymentMethodRepository,
	mailer *Mailer,
	appURL string,
	jwtSecret string,
	jwtExpiresIn time.Duration,
) *AuthService {
	return &AuthService{
		db:           db,
		users:        users,
		resets:       resets,
		categories:   categories,
		payments:     payments,
		mailer:       mailer,
		appURL:       appURL,
		jwtSecret:    jwtSecret,
		jwtExpiresIn: jwtExpiresIn,
	}
}

// Register creates a new user, seeds their default categories and payment
// methods in a single transaction, and returns a signed JWT. The seed and user
// creation are atomic so a partially-initialised account can never exist.
func (s *AuthService) Register(in RegisterInput) (*AuthResult, error) {
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))

	exists, err := s.users.EmailExists(in.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("%w: email already registered", ErrConflict)
	}

	hash, err := utils.HashPassword(in.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:         strings.TrimSpace(in.Name),
		Email:        in.Email,
		PasswordHash: hash,
	}

	// Run user creation + seeding atomically.
	err = s.db.Transaction(func(tx *gorm.DB) error {
		userRepo := repositories.NewUserRepository(tx)
		categoryRepo := repositories.NewCategoryRepository(tx)
		paymentRepo := repositories.NewPaymentMethodRepository(tx)

		if err := userRepo.Create(user); err != nil {
			return err
		}
		if err := categoryRepo.CreateMany(buildSeedCategories(user.ID)); err != nil {
			return err
		}
		if err := paymentRepo.CreateMany(buildSeedPaymentMethods(user.ID)); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.issueToken(user)
}

// Login validates credentials and returns a signed JWT.
func (s *AuthService) Login(in LoginInput) (*AuthResult, error) {
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))

	user, err := s.users.FindByEmail(in.Email)
	if err != nil {
		// Do not leak whether the email exists.
		return nil, ErrUnauthorized
	}
	if !utils.CheckPassword(user.PasswordHash, in.Password) {
		return nil, ErrUnauthorized
	}
	return s.issueToken(user)
}

// Me returns the currently authenticated user.
func (s *AuthService) Me(userID uint) (*models.User, error) {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, ErrNotFound
	}
	return user, nil
}

// RequestPasswordReset issues a single-use reset token and emails the reset
// link to the user. It returns the plain token so development environments can
// surface it for testing. When the email is unknown it returns ErrNotFound —
// the handler still responds with a generic success to avoid leaking which
// emails are registered.
func (s *AuthService) RequestPasswordReset(email string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	user, err := s.users.FindByEmail(email)
	if err != nil {
		return "", ErrNotFound
	}

	// Only the newest link should work.
	if err := s.resets.InvalidateForUser(user.ID); err != nil {
		return "", err
	}

	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	token := hex.EncodeToString(raw)

	if err := s.resets.Create(&models.PasswordResetToken{
		UserID:    user.ID,
		TokenHash: hashResetToken(token),
		ExpiresAt: time.Now().Add(resetTokenTTL),
	}); err != nil {
		return "", err
	}

	link := fmt.Sprintf("%s/reset-password?token=%s", strings.TrimRight(s.appURL, "/"), token)
	body := fmt.Sprintf(
		"Hi %s,\n\nUse the link below to set a new Sumly password. It expires in 1 hour.\n\n%s\n\nIf you didn't request this, you can ignore this email.",
		user.Name, link,
	)
	if err := s.mailer.Send(user.Email, "Reset your Sumly password", body); err != nil {
		return "", err
	}
	return token, nil
}

// ResetPassword sets a new password for the user owning a valid reset token,
// then consumes the token.
func (s *AuthService) ResetPassword(token, newPassword string) error {
	record, err := s.resets.FindValidByHash(hashResetToken(strings.TrimSpace(token)))
	if err != nil {
		return fmt.Errorf("%w: invalid or expired reset link", ErrValidation)
	}

	hash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(record.UserID, hash); err != nil {
		return err
	}
	return s.resets.MarkUsed(record.ID)
}

// ChangePassword updates the password of a signed-in user after verifying the
// current one, and invalidates any outstanding reset links.
func (s *AuthService) ChangePassword(userID uint, currentPassword, newPassword string) error {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return ErrNotFound
	}
	if !utils.CheckPassword(user.PasswordHash, currentPassword) {
		return ErrUnauthorized
	}

	hash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(user.ID, hash); err != nil {
		return err
	}
	return s.resets.InvalidateForUser(user.ID)
}

// hashResetToken returns the hex SHA-256 of a plain reset token.
func hashResetToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

// issueToken signs a JWT for the user and wraps it in an AuthResult.
func (s *AuthService) issueToken(user *models.User) (*AuthResult, error) {
	token, err := utils.GenerateToken(user.ID, s.jwtSecret, s.jwtExpiresIn)
	if err != nil {
		return nil, err
	}
	return &AuthResult{Token: token, User: user}, nil
}
