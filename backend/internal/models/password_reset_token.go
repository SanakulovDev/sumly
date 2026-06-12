package models

import "time"

// PasswordResetToken stores a single-use, expiring token for the forgot-password
// flow. Only the SHA-256 hash of the token is persisted — the plain token lives
// solely in the reset link sent to the user, so a database leak cannot be used
// to reset passwords.
type PasswordResetToken struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	UserID    uint       `gorm:"index;not null" json:"user_id"`
	TokenHash string     `gorm:"size:64;uniqueIndex;not null" json:"-"`
	ExpiresAt time.Time  `gorm:"not null" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time  `json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"-"`
}
