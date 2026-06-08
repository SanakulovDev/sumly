package repositories

import (
	"errors"

	"github.com/sumly/backend/internal/models"
	"gorm.io/gorm"
)

// PaymentMethodRepository handles persistence for payment methods, scoped by
// user id.
type PaymentMethodRepository struct {
	db *gorm.DB
}

// NewPaymentMethodRepository constructs a PaymentMethodRepository.
func NewPaymentMethodRepository(db *gorm.DB) *PaymentMethodRepository {
	return &PaymentMethodRepository{db: db}
}

// Create inserts a new payment method.
func (r *PaymentMethodRepository) Create(pm *models.PaymentMethod) error {
	return r.db.Create(pm).Error
}

// CreateMany inserts multiple payment methods in one statement (used for seeding).
func (r *PaymentMethodRepository) CreateMany(pms []models.PaymentMethod) error {
	if len(pms) == 0 {
		return nil
	}
	return r.db.Create(&pms).Error
}

// ListByUser returns all payment methods owned by the user.
func (r *PaymentMethodRepository) ListByUser(userID uint) ([]models.PaymentMethod, error) {
	var pms []models.PaymentMethod
	err := r.db.Where("user_id = ?", userID).Order("name asc").Find(&pms).Error
	return pms, err
}

// FindByID returns a payment method owned by the user, or ErrNotFound.
func (r *PaymentMethodRepository) FindByID(userID, id uint) (*models.PaymentMethod, error) {
	var pm models.PaymentMethod
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&pm).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &pm, err
}

// Update persists changes to an existing payment method.
func (r *PaymentMethodRepository) Update(pm *models.PaymentMethod) error {
	return r.db.Save(pm).Error
}

// Delete removes a payment method owned by the user.
func (r *PaymentMethodRepository) Delete(userID, id uint) error {
	res := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.PaymentMethod{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// CountTransactions reports how many transactions reference this payment method.
func (r *PaymentMethodRepository) CountTransactions(userID, id uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Transaction{}).
		Where("user_id = ? AND payment_method_id = ?", userID, id).
		Count(&count).Error
	return count, err
}
