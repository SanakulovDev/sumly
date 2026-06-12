// Package database wires up the GORM connection and schema migration.
package database

import (
	"fmt"
	"log"
	"time"

	"github.com/sumly/backend/internal/config"
	"github.com/sumly/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect opens a PostgreSQL connection using GORM and verifies it is reachable.
// It retries for a short period so the backend can start alongside the database
// container (which may not be ready immediately).
func Connect(cfg *config.Config) (*gorm.DB, error) {
	gormLogLevel := logger.Warn
	if cfg.AppEnv == "development" {
		gormLogLevel = logger.Info
	}

	var db *gorm.DB
	var err error

	// Retry loop: containers start in parallel, so the DB may not accept
	// connections on the first attempt.
	for attempt := 1; attempt <= 10; attempt++ {
		db, err = gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
			Logger: logger.Default.LogMode(gormLogLevel),
		})
		if err == nil {
			break
		}
		log.Printf("database not ready (attempt %d/10): %v", attempt, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		return nil, fmt.Errorf("connect database: %w", err)
	}

	return db, nil
}

// Migrate creates or updates the database schema to match the Go models.
// Migrate runs GORM automatic schema migration for the application's models.
// It applies AutoMigrate for models.User, models.PasswordResetToken, models.Category,
// models.PaymentMethod, and models.Transaction; the operation is idempotent and safe
// to run on every boot.
// It returns an error if the migration fails.
func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&models.User{},
		&models.PasswordResetToken{},
		&models.Category{},
		&models.PaymentMethod{},
		&models.Transaction{},
	); err != nil {
		return fmt.Errorf("auto migrate: %w", err)
	}
	return nil
}
