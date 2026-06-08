package models

import "time"

// TransactionType enumerates the two kinds of money movement Sumly tracks.
type TransactionType string

const (
	Income  TransactionType = "income"
	Expense TransactionType = "expense"
)

// Valid reports whether the transaction type is one of the allowed values.
func (t TransactionType) Valid() bool {
	return t == Income || t == Expense
}

// Category groups transactions (e.g. "Food", "Sales"). Each category belongs to
// a single user and is scoped to either income or expense.
type Category struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	UserID    uint            `gorm:"index;not null" json:"user_id"`
	Name      string          `gorm:"size:120;not null" json:"name"`
	Type      TransactionType `gorm:"size:10;not null" json:"type"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}
