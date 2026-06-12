// Package repositories provides the data-access layer. Repositories are the
// only place that talks to GORM directly; services depend on them so business
// logic stays free of persistence details.
package repositories

import (
	"errors"

	"github.com/sumly/backend/internal/models"
	"gorm.io/gorm"
)

// ErrNotFound is returned when a requested record does not exist.
var ErrNotFound = errors.New("record not found")

// UserRepository handles persistence for users.
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository constructs a UserRepository.
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create inserts a new user.
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByEmail returns the user with the given email, or ErrNotFound.
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

// FindByID returns the user with the given id, or ErrNotFound.
func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

// UpdatePassword replaces the user's password hash.
func (r *UserRepository) UpdatePassword(userID uint, passwordHash string) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", userID).
		Update("password_hash", passwordHash).Error
}

// EmailExists reports whether a user already uses the given email.
func (r *UserRepository) EmailExists(email string) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}
