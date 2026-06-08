// Command server is the entrypoint for the Sumly backend API.
package main

import (
	"log"

	"github.com/sumly/backend/internal/config"
	"github.com/sumly/backend/internal/database"
	"github.com/sumly/backend/internal/routes"
)

func main() {
	cfg := config.Load()

	// Connect to PostgreSQL (with retries for container startup ordering).
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Apply schema migrations.
	if err := database.Migrate(db); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Build the router with all dependencies wired up.
	router := routes.Setup(db, cfg)

	addr := ":" + cfg.Port
	log.Printf("Sumly API listening on %s (env=%s)", addr, cfg.AppEnv)
	if err := router.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
