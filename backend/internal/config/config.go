// Package config loads and exposes application configuration sourced from
// environment variables. Keeping configuration in one place makes it easy to
// add new settings as the application grows.
package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application.
type Config struct {
	AppEnv string
	Port   string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret    string
	JWTExpiresIn time.Duration

	CORSAllowOrigins string
}

// Load reads configuration from the environment. It optionally loads a .env
// file first (useful for local development); in production the variables are
// expected to be set by the host environment.
func Load() *Config {
	// Best-effort load of .env. Missing file is not an error.
	_ = godotenv.Load()

	jwtExpiresHours := getEnvAsInt("JWT_EXPIRES_HOURS", 72)

	return &Config{
		AppEnv: getEnv("APP_ENV", "development"),
		Port:   getEnv("PORT", "8080"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "sumly"),
		DBPassword: getEnv("DB_PASSWORD", "sumly"),
		DBName:     getEnv("DB_NAME", "sumly"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret:    getEnv("JWT_SECRET", "change-me-in-production"),
		JWTExpiresIn: time.Duration(jwtExpiresHours) * time.Hour,

		CORSAllowOrigins: getEnv("CORS_ALLOW_ORIGINS", "http://localhost:5173"),
	}
}

// DSN builds the PostgreSQL connection string from the configuration.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=UTC",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

// getEnv returns the value of an environment variable or a fallback default.
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}

// getEnvAsInt returns an integer environment variable or a fallback default.
func getEnvAsInt(key string, fallback int) int {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		var parsed int
		if _, err := fmt.Sscanf(value, "%d", &parsed); err == nil {
			return parsed
		}
	}
	return fallback
}
