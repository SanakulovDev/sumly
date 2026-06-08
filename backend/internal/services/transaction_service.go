package services

import (
	"fmt"
	"strings"
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// TransactionInput is the validated payload for creating/updating a transaction.
type TransactionInput struct {
	Type            models.TransactionType
	Amount          float64
	CategoryID      uint
	PaymentMethodID uint
	Description     string
	TransactionDate time.Time
}

// ListTransactionsResult bundles a page of transactions with pagination metadata.
type ListTransactionsResult struct {
	Transactions []models.Transaction
	Total        int64
	Page         int
	PageSize     int
}

// TransactionService implements transaction management. It validates that the
// referenced category and payment method belong to the user before persisting.
type TransactionService struct {
	repo       *repositories.TransactionRepository
	categories *repositories.CategoryRepository
	payments   *repositories.PaymentMethodRepository
}

// NewTransactionService constructs a TransactionService.
func NewTransactionService(
	repo *repositories.TransactionRepository,
	categories *repositories.CategoryRepository,
	payments *repositories.PaymentMethodRepository,
) *TransactionService {
	return &TransactionService{repo: repo, categories: categories, payments: payments}
}

// Create validates and stores a new transaction.
func (s *TransactionService) Create(userID uint, in TransactionInput) (*models.Transaction, error) {
	if err := s.validate(userID, in); err != nil {
		return nil, err
	}

	tx := &models.Transaction{
		UserID:          userID,
		Type:            in.Type,
		Amount:          in.Amount,
		CategoryID:      in.CategoryID,
		PaymentMethodID: in.PaymentMethodID,
		Description:     strings.TrimSpace(in.Description),
		TransactionDate: in.TransactionDate,
	}
	if err := s.repo.Create(tx); err != nil {
		return nil, err
	}
	// Reload with associations so the response includes category/payment names.
	return s.repo.FindByID(userID, tx.ID)
}

// Get returns a single transaction owned by the user.
func (s *TransactionService) Get(userID, id uint) (*models.Transaction, error) {
	tx, err := s.repo.FindByID(userID, id)
	if err != nil {
		return nil, mapNotFound(err)
	}
	return tx, nil
}

// Update validates and persists changes to an existing transaction.
func (s *TransactionService) Update(userID, id uint, in TransactionInput) (*models.Transaction, error) {
	tx, err := s.repo.FindByID(userID, id)
	if err != nil {
		return nil, mapNotFound(err)
	}
	if err := s.validate(userID, in); err != nil {
		return nil, err
	}

	tx.Type = in.Type
	tx.Amount = in.Amount
	tx.CategoryID = in.CategoryID
	tx.PaymentMethodID = in.PaymentMethodID
	tx.Description = strings.TrimSpace(in.Description)
	tx.TransactionDate = in.TransactionDate

	if err := s.repo.Update(tx); err != nil {
		return nil, err
	}
	return s.repo.FindByID(userID, tx.ID)
}

// Delete removes a transaction owned by the user.
func (s *TransactionService) Delete(userID, id uint) error {
	if err := s.repo.Delete(userID, id); err != nil {
		return mapNotFound(err)
	}
	return nil
}

// List returns a filtered, paginated page of transactions.
func (s *TransactionService) List(userID uint, f repositories.TransactionFilter) (*ListTransactionsResult, error) {
	// Apply sane pagination defaults and bounds.
	if f.Page < 1 {
		f.Page = 1
	}
	if f.PageSize < 1 {
		f.PageSize = 20
	}
	if f.PageSize > 100 {
		f.PageSize = 100
	}

	txs, total, err := s.repo.List(userID, f)
	if err != nil {
		return nil, err
	}
	return &ListTransactionsResult{
		Transactions: txs,
		Total:        total,
		Page:         f.Page,
		PageSize:     f.PageSize,
	}, nil
}

// validate enforces business rules: positive amount, valid type, and that the
// referenced category/payment method belong to the user and match the type.
func (s *TransactionService) validate(userID uint, in TransactionInput) error {
	if !in.Type.Valid() {
		return fmt.Errorf("%w: type must be 'income' or 'expense'", ErrValidation)
	}
	if in.Amount <= 0 {
		return fmt.Errorf("%w: amount must be greater than zero", ErrValidation)
	}
	if in.TransactionDate.IsZero() {
		return fmt.Errorf("%w: transaction_date is required", ErrValidation)
	}

	category, err := s.categories.FindByID(userID, in.CategoryID)
	if err != nil {
		return fmt.Errorf("%w: category not found", ErrValidation)
	}
	if category.Type != in.Type {
		return fmt.Errorf("%w: category type does not match transaction type", ErrValidation)
	}

	if _, err := s.payments.FindByID(userID, in.PaymentMethodID); err != nil {
		return fmt.Errorf("%w: payment method not found", ErrValidation)
	}
	return nil
}
