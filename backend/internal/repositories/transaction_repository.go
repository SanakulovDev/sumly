package repositories

import (
	"errors"
	"time"

	"github.com/sumly/backend/internal/models"
	"gorm.io/gorm"
)

// TransactionFilter holds the optional filters supported by the list endpoint.
// Zero-valued fields are ignored.
type TransactionFilter struct {
	Type            models.TransactionType
	CategoryID      uint
	PaymentMethodID uint
	DateFrom        *time.Time
	DateTo          *time.Time
	Page            int
	PageSize        int
}

// Totals holds an income/expense aggregate used to build reports.
type Totals struct {
	Income  float64
	Expense float64
}

// Net returns income minus expense.
func (t Totals) Net() float64 { return t.Income - t.Expense }

// TransactionRepository handles persistence and aggregation for transactions,
// always scoped by user id.
type TransactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository constructs a TransactionRepository.
func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// Create inserts a new transaction.
func (r *TransactionRepository) Create(tx *models.Transaction) error {
	return r.db.Create(tx).Error
}

// FindByID returns a transaction owned by the user with its associations
// preloaded, or ErrNotFound.
func (r *TransactionRepository) FindByID(userID, id uint) (*models.Transaction, error) {
	var tx models.Transaction
	err := r.db.
		Preload("Category").
		Preload("PaymentMethod").
		Where("id = ? AND user_id = ?", id, userID).
		First(&tx).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &tx, err
}

// Update persists changes to an existing transaction.
func (r *TransactionRepository) Update(tx *models.Transaction) error {
	return r.db.Save(tx).Error
}

// Delete removes a transaction owned by the user.
func (r *TransactionRepository) Delete(userID, id uint) error {
	res := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Transaction{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// List returns a filtered, paginated page of transactions and the total count
// matching the filter (ignoring pagination).
func (r *TransactionRepository) List(userID uint, f TransactionFilter) ([]models.Transaction, int64, error) {
	query := r.scopedQuery(userID, f)

	var total int64
	if err := query.Model(&models.Transaction{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (f.Page - 1) * f.PageSize

	var txs []models.Transaction
	err := query.
		Preload("Category").
		Preload("PaymentMethod").
		Order("transaction_date desc, id desc").
		Limit(f.PageSize).
		Offset(offset).
		Find(&txs).Error
	return txs, total, err
}

// ListAll returns every transaction matching the filter (ignoring pagination),
// ordered newest first, with associations preloaded. Used for exports.
func (r *TransactionRepository) ListAll(userID uint, f TransactionFilter) ([]models.Transaction, error) {
	var txs []models.Transaction
	err := r.scopedQuery(userID, f).
		Preload("Category").
		Preload("PaymentMethod").
		Order("transaction_date desc, id desc").
		Find(&txs).Error
	return txs, err
}

// scopedQuery applies the user scope and all active filters to a query.
func (r *TransactionRepository) scopedQuery(userID uint, f TransactionFilter) *gorm.DB {
	query := r.db.Where("user_id = ?", userID)

	if f.Type != "" {
		query = query.Where("type = ?", f.Type)
	}
	if f.CategoryID != 0 {
		query = query.Where("category_id = ?", f.CategoryID)
	}
	if f.PaymentMethodID != 0 {
		query = query.Where("payment_method_id = ?", f.PaymentMethodID)
	}
	if f.DateFrom != nil {
		query = query.Where("transaction_date >= ?", *f.DateFrom)
	}
	if f.DateTo != nil {
		query = query.Where("transaction_date <= ?", *f.DateTo)
	}
	return query
}

// TopAmounts returns the user's most frequently used transaction amounts,
// optionally filtered by type, ordered by how often each amount appears. Used to
// suggest quick-amount chips on the entry form.
func (r *TransactionRepository) TopAmounts(userID uint, txType models.TransactionType, currency string, limit int) ([]float64, error) {
	query := r.db.Model(&models.Transaction{}).Where("user_id = ?", userID)
	if txType != "" {
		query = query.Where("type = ?", txType)
	}
	if currency != "" {
		query = query.Where("currency = ?", currency)
	}

	var amounts []float64
	err := query.
		Select("amount").
		Group("amount").
		Order("COUNT(*) DESC, amount DESC").
		Limit(limit).
		Pluck("amount", &amounts).Error
	return amounts, err
}

// TotalsBetween aggregates income and expense for the user across the inclusive
// date range [from, to].
func (r *TransactionRepository) TotalsBetween(userID uint, from, to time.Time) (Totals, error) {
	return r.totals(r.db.
		Where("user_id = ? AND transaction_date >= ? AND transaction_date <= ?", userID, from, to))
}

// TotalsAll aggregates income and expense for the user across all time. Used
// for the running total balance.
func (r *TransactionRepository) TotalsAll(userID uint) (Totals, error) {
	return r.totals(r.db.Where("user_id = ?", userID))
}

// CategoryBreakdown is a single category's total (in base currency) within a
// period, used to build the AI advisor's spending summary.
type CategoryBreakdown struct {
	CategoryName string
	Total        float64
}

// DescriptionBreakdown is a single description's total and frequency, used to
// surface recurring spending ("you spend most on …") in the advisor.
type DescriptionBreakdown struct {
	Description string
	Total      float64
	Count      int
}

// DescriptionTotals groups non-empty descriptions for the given type within
// [from, to], largest total first. Useful for spotting recurring items.
func (r *TransactionRepository) DescriptionTotals(userID uint, txType models.TransactionType, from, to time.Time, limit int) ([]DescriptionBreakdown, error) {
	var rows []DescriptionBreakdown
	err := r.db.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND transaction_date >= ? AND transaction_date <= ? AND TRIM(description) <> ''",
			userID, txType, from, to).
		Select("description, COALESCE(SUM(amount_base), 0) AS total, COUNT(*) AS count").
		Group("description").
		Order("total DESC").
		Limit(limit).
		Scan(&rows).Error
	return rows, err
}

// CategoryTotals returns per-category totals for the given transaction type
// within the inclusive range [from, to], largest first.
func (r *TransactionRepository) CategoryTotals(userID uint, txType models.TransactionType, from, to time.Time) ([]CategoryBreakdown, error) {
	var rows []CategoryBreakdown
	err := r.db.Model(&models.Transaction{}).
		Joins("JOIN categories ON categories.id = transactions.category_id").
		Where("transactions.user_id = ? AND transactions.type = ? AND transactions.transaction_date >= ? AND transactions.transaction_date <= ?",
			userID, txType, from, to).
		Select("categories.name AS category_name, COALESCE(SUM(transactions.amount_base), 0) AS total").
		Group("categories.name").
		Order("total DESC").
		Scan(&rows).Error
	return rows, err
}

// totals runs a single grouped aggregation and folds the rows into a Totals.
func (r *TransactionRepository) totals(query *gorm.DB) (Totals, error) {
	type row struct {
		Type  models.TransactionType
		Total float64
	}
	var rows []row
	// Sum the base-currency amount so income/expense totals are consistent even
	// when transactions are recorded in different currencies.
	err := query.
		Model(&models.Transaction{}).
		Select("type, COALESCE(SUM(amount_base), 0) AS total").
		Group("type").
		Scan(&rows).Error
	if err != nil {
		return Totals{}, err
	}

	var totals Totals
	for _, rw := range rows {
		switch rw.Type {
		case models.Income:
			totals.Income = rw.Total
		case models.Expense:
			totals.Expense = rw.Total
		}
	}
	return totals, nil
}
