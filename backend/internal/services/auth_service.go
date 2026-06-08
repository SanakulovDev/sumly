package services

import (
	"fmt"
	"strings"
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
	"github.com/sumly/backend/internal/utils"
	"gorm.io/gorm"
)

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

// AuthService implements registration, login and the seeding of default data.
type AuthService struct {
	db           *gorm.DB
	users        *repositories.UserRepository
	categories   *repositories.CategoryRepository
	payments     *repositories.PaymentMethodRepository
	jwtSecret    string
	jwtExpiresIn time.Duration
}

// NewAuthService constructs an AuthService.
func NewAuthService(
	db *gorm.DB,
	users *repositories.UserRepository,
	categories *repositories.CategoryRepository,
	payments *repositories.PaymentMethodRepository,
	jwtSecret string,
	jwtExpiresIn time.Duration,
) *AuthService {
	return &AuthService{
		db:           db,
		users:        users,
		categories:   categories,
		payments:     payments,
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

// issueToken signs a JWT for the user and wraps it in an AuthResult.
func (s *AuthService) issueToken(user *models.User) (*AuthResult, error) {
	token, err := utils.GenerateToken(user.ID, s.jwtSecret, s.jwtExpiresIn)
	if err != nil {
		return nil, err
	}
	return &AuthResult{Token: token, User: user}, nil
}
