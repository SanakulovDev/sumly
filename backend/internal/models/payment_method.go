package models

import "time"

// PaymentMethod describes how money moved (e.g. "Cash", "Card", "Payme").
// Each payment method belongs to a single user.
//
// IsCard marks the method as card-based. When a transaction uses a card method,
// the UI prompts for — and the API stores — the card's last 4 digits.
type PaymentMethod struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Name      string    `gorm:"size:120;not null" json:"name"`
	IsCard    bool      `gorm:"not null;default:false" json:"is_card"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
