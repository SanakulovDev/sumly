package models

import "time"

// PaymentMethod describes how money moved (e.g. "Cash", "Card", "Payme").
// Each payment method belongs to a single user.
type PaymentMethod struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Name      string    `gorm:"size:120;not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
