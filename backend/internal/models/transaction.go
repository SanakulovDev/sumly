package models

import "time"

// Transaction is a single income or expense entry. Amount is stored as a
// numeric value; transaction_date is the business date chosen by the user
// (which may differ from created_at).
//
// The Category and PaymentMethod associations are loaded on demand so the API
// can return human-friendly names alongside the foreign keys.
type Transaction struct {
	ID              uint            `gorm:"primaryKey" json:"id"`
	UserID          uint            `gorm:"index;not null" json:"user_id"`
	Type            TransactionType `gorm:"size:10;not null;index" json:"type"`
	Amount          float64         `gorm:"type:numeric(14,2);not null" json:"amount"`
	CategoryID      uint            `gorm:"index;not null" json:"category_id"`
	PaymentMethodID uint            `gorm:"index;not null" json:"payment_method_id"`
	Description     string          `gorm:"size:500" json:"description"`
	TransactionDate time.Time       `gorm:"type:date;not null;index" json:"transaction_date"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`

	// Associations (populated when explicitly preloaded).
	Category      *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	PaymentMethod *PaymentMethod `gorm:"foreignKey:PaymentMethodID" json:"payment_method,omitempty"`
}
