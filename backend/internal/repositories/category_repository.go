package repositories

import (
	"errors"

	"github.com/sumly/backend/internal/models"
	"gorm.io/gorm"
)

// CategoryRepository handles persistence for categories. Every query is scoped
// by user id so users can only ever touch their own data.
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository constructs a CategoryRepository.
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create inserts a new category.
func (r *CategoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

// CreateMany inserts multiple categories in one statement (used for seeding).
func (r *CategoryRepository) CreateMany(categories []models.Category) error {
	if len(categories) == 0 {
		return nil
	}
	return r.db.Create(&categories).Error
}

// ListByUser returns all categories owned by the user, newest first.
func (r *CategoryRepository) ListByUser(userID uint) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Where("user_id = ?", userID).Order("type asc, name asc").Find(&categories).Error
	return categories, err
}

// FindByID returns a category owned by the user, or ErrNotFound.
func (r *CategoryRepository) FindByID(userID, id uint) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&category).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &category, err
}

// Update persists changes to an existing category.
func (r *CategoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

// Delete removes a category owned by the user.
func (r *CategoryRepository) Delete(userID, id uint) error {
	res := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Category{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// CountTransactions reports how many transactions reference this category.
// Used to prevent deleting a category that is still in use.
func (r *CategoryRepository) CountTransactions(userID, id uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Transaction{}).
		Where("user_id = ? AND category_id = ?", userID, id).
		Count(&count).Error
	return count, err
}
