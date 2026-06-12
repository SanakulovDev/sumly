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

	// Public URL of the frontend, used to build password reset links.
	AppURL string

	// SMTP settings for transactional email. When SMTPHost is empty the mailer
	// logs messages instead of sending them (handy for local development).
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string

	// Claude API settings for the receipt scanner. An empty key disables it.
	AnthropicAPIKey string
	ClaudeModel     string
}

// Load reads configuration from the environment. It optionally loads a .env
// file first (useful for local development); in production the variables are
// Load loads configuration from environment variables, attempting a best-effort read of a local `.env` file, and constructs a *Config populated with sensible defaults.
// 
// Environment-derived values that are absent or empty fall back to predefined defaults (for example APP_ENV="development", PORT="8080", DB_HOST="localhost", etc.). The `JWT_EXPIRES_HOURS` variable is parsed as hours to set `JWTExpiresIn`; parsing failures fall back to the default of 72 hours. A missing `.env` file is ignored.
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

		AppURL: getEnv("APP_URL", "http://localhost:5173"),

		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "Sumly <no-reply@sumly.uz>"),

		AnthropicAPIKey: getEnv("ANTHROPIC_API_KEY", ""),
		ClaudeModel:     getEnv("CLAUDE_MODEL", "claude-opus-4-8"),
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
