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
	Currency        string
	CategoryID      uint
	PaymentMethodID uint
	Description     string
	CardLast4       string
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
	currency   *CurrencyService
}

// NewTransactionService constructs a TransactionService.
func NewTransactionService(
	repo *repositories.TransactionRepository,
	categories *repositories.CategoryRepository,
	payments *repositories.PaymentMethodRepository,
	currency *CurrencyService,
) *TransactionService {
	return &TransactionService{repo: repo, categories: categories, payments: payments, currency: currency}
}

// Create validates and stores a new transaction.
func (s *TransactionService) Create(userID uint, in TransactionInput) (*models.Transaction, error) {
	cardLast4, err := s.validate(userID, in)
	if err != nil {
		return nil, err
	}
	currency, err := s.normalizeCurrency(in.Currency)
	if err != nil {
		return nil, err
	}

	tx := &models.Transaction{
		UserID:          userID,
		Type:            in.Type,
		Amount:          in.Amount,
		Currency:        currency,
		AmountBase:      s.currency.ConvertToBase(in.Amount, currency),
		CategoryID:      in.CategoryID,
		PaymentMethodID: in.PaymentMethodID,
		Description:     strings.TrimSpace(in.Description),
		CardLast4:       cardLast4,
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
	cardLast4, err := s.validate(userID, in)
	if err != nil {
		return nil, err
	}
	currency, err := s.normalizeCurrency(in.Currency)
	if err != nil {
		return nil, err
	}

	tx.Type = in.Type
	tx.Amount = in.Amount
	tx.Currency = currency
	tx.AmountBase = s.currency.ConvertToBase(in.Amount, currency)
	tx.CategoryID = in.CategoryID
	tx.PaymentMethodID = in.PaymentMethodID
	tx.Description = strings.TrimSpace(in.Description)
	tx.CardLast4 = cardLast4
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

// TopAmounts returns up to `limit` of the user's most frequently used amounts,
// optionally scoped to a transaction type. Invalid types are ignored (treated
// as "all"), so the caller never gets an error for a bad query param.
func (s *TransactionService) TopAmounts(userID uint, txType models.TransactionType, currency string, limit int) ([]float64, error) {
	if !txType.Valid() {
		txType = ""
	}
	currency = strings.ToUpper(strings.TrimSpace(currency))
	if !IsSupported(currency) {
		currency = ""
	}
	if limit < 1 || limit > 10 {
		limit = 6
	}
	return s.repo.TopAmounts(userID, txType, currency, limit)
}

// validate enforces business rules: positive amount, valid type, that the
// referenced category/payment method belong to the user and match the type, and
// that card payments carry exactly 4 numeric digits. It returns the cleaned
// card-last-4 value to persist (empty for non-card methods).
func (s *TransactionService) validate(userID uint, in TransactionInput) (string, error) {
	if !in.Type.Valid() {
		return "", fmt.Errorf("%w: type must be 'income' or 'expense'", ErrValidation)
	}
	if in.Amount <= 0 {
		return "", fmt.Errorf("%w: amount must be greater than zero", ErrValidation)
	}
	if in.TransactionDate.IsZero() {
		return "", fmt.Errorf("%w: transaction_date is required", ErrValidation)
	}

	category, err := s.categories.FindByID(userID, in.CategoryID)
	if err != nil {
		return "", fmt.Errorf("%w: category not found", ErrValidation)
	}
	if category.Type != in.Type {
		return "", fmt.Errorf("%w: category type does not match transaction type", ErrValidation)
	}

	payment, err := s.payments.FindByID(userID, in.PaymentMethodID)
	if err != nil {
		return "", fmt.Errorf("%w: payment method not found", ErrValidation)
	}

	// Card rule: card methods require exactly 4 digits; non-card methods never
	// store card digits (any provided value is discarded).
	last4 := strings.TrimSpace(in.CardLast4)
	if payment.IsCard {
		if !isFourDigits(last4) {
			return "", fmt.Errorf("%w: card_last4 must be exactly 4 digits for card payments", ErrValidation)
		}
		return last4, nil
	}
	return "", nil
}

// normalizeCurrency upper-cases and validates the currency, defaulting to the
// base currency when empty.
func (s *TransactionService) normalizeCurrency(currency string) (string, error) {
	c := strings.ToUpper(strings.TrimSpace(currency))
	if c == "" {
		c = BaseCurrency
	}
	if !IsSupported(c) {
		return "", fmt.Errorf("%w: unsupported currency", ErrValidation)
	}
	return c, nil
}

// isFourDigits reports whether s is exactly four ASCII digits.
func isFourDigits(s string) bool {
	if len(s) != 4 {
		return false
	}
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}
