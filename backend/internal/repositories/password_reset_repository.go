package repositories

import (
	"errors"
	"time"

	"github.com/sumly/backend/internal/models"
	"gorm.io/gorm"
)

// PasswordResetRepository handles persistence for password reset tokens.
type PasswordResetRepository struct {
	db *gorm.DB
}

// NewPasswordResetRepository constructs a PasswordResetRepository.
func NewPasswordResetRepository(db *gorm.DB) *PasswordResetRepository {
	return &PasswordResetRepository{db: db}
}

// Create inserts a new reset token.
func (r *PasswordResetRepository) Create(token *models.PasswordResetToken) error {
	return r.db.Create(token).Error
}

// FindValidByHash returns the unused, unexpired token with the given hash, or
// ErrNotFound.
func (r *PasswordResetRepository) FindValidByHash(hash string) (*models.PasswordResetToken, error) {
	var token models.PasswordResetToken
	err := r.db.
		Where("token_hash = ? AND used_at IS NULL AND expires_at > ?", hash, time.Now()).
		First(&token).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &token, err
}

// MarkUsed stamps the token as consumed so it cannot be replayed.
func (r *PasswordResetRepository) MarkUsed(id uint) error {
	return r.db.Model(&models.PasswordResetToken{}).
		Where("id = ?", id).
		Update("used_at", time.Now()).Error
}

// InvalidateForUser marks all of a user's outstanding tokens as used. Called
// when a new token is issued or the password changes, so only the latest link
// works.
func (r *PasswordResetRepository) InvalidateForUser(userID uint) error {
	return r.db.Model(&models.PasswordResetToken{}).
		Where("user_id = ? AND used_at IS NULL", userID).
		Update("used_at", time.Now()).Error
}
