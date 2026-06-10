// Package routes wires together repositories, services and handlers, and
// registers them on the Gin router. This is the application's composition root:
// it is the single place where dependencies are constructed and injected.
package routes

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/config"
	"github.com/sumly/backend/internal/handlers"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/repositories"
	"github.com/sumly/backend/internal/services"
	"gorm.io/gorm"
)

// Setup constructs the dependency graph and returns a configured Gin engine.
func Setup(db *gorm.DB, cfg *config.Config) *gin.Engine {
	// Repositories (data-access layer).
	userRepo := repositories.NewUserRepository(db)
	categoryRepo := repositories.NewCategoryRepository(db)
	paymentRepo := repositories.NewPaymentMethodRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)

	// Services (business logic).
	currencyService := services.NewCurrencyService()
	authService := services.NewAuthService(db, userRepo, categoryRepo, paymentRepo, cfg.JWTSecret, cfg.JWTExpiresIn)
	categoryService := services.NewCategoryService(categoryRepo)
	paymentService := services.NewPaymentMethodService(paymentRepo)
	transactionService := services.NewTransactionService(transactionRepo, categoryRepo, paymentRepo, currencyService)
	reportService := services.NewReportService(transactionRepo)
	exportService := services.NewExportService(transactionRepo)

	// Handlers (HTTP layer).
	authHandler := handlers.NewAuthHandler(authService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	paymentHandler := handlers.NewPaymentMethodHandler(paymentService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	reportHandler := handlers.NewReportHandler(reportService)
	exportHandler := handlers.NewExportHandler(exportService)
	currencyHandler := handlers.NewCurrencyHandler(currencyService)

	// Router.
	if cfg.AppEnv != "development" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// CORS for the React frontend.
	router.Use(cors.New(cors.Config{
		AllowOrigins:     splitAndTrim(cfg.CORSAllowOrigins),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check (useful for Docker / load balancers).
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api")

	// Public auth routes.
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes (require a valid JWT).
	protected := api.Group("")
	protected.Use(middleware.Auth(cfg.JWTSecret))
	{
		protected.GET("/auth/me", authHandler.Me)

		transactions := protected.Group("/transactions")
		{
			transactions.GET("", transactionHandler.List)
			// Static sub-paths must be registered before the "/:id" param route.
			transactions.GET("/export", exportHandler.Transactions)
			transactions.GET("/top-amounts", transactionHandler.TopAmounts)
			transactions.POST("", transactionHandler.Create)
			transactions.GET("/:id", transactionHandler.Get)
			transactions.PUT("/:id", transactionHandler.Update)
			transactions.DELETE("/:id", transactionHandler.Delete)
		}

		categories := protected.Group("/categories")
		{
			categories.GET("", categoryHandler.List)
			categories.POST("", categoryHandler.Create)
			categories.PUT("/:id", categoryHandler.Update)
			categories.DELETE("/:id", categoryHandler.Delete)
		}

		paymentMethods := protected.Group("/payment-methods")
		{
			paymentMethods.GET("", paymentHandler.List)
			paymentMethods.POST("", paymentHandler.Create)
			paymentMethods.PUT("/:id", paymentHandler.Update)
			paymentMethods.DELETE("/:id", paymentHandler.Delete)
		}

		protected.GET("/currency/rates", currencyHandler.Rates)

		reports := protected.Group("/reports")
		{
			reports.GET("/dashboard", reportHandler.Dashboard)
			reports.GET("/daily", reportHandler.Daily)
			reports.GET("/monthly", reportHandler.Monthly)
			reports.GET("/monthly/export", exportHandler.Monthly)
		}
	}

	return router
}

// splitAndTrim splits a comma-separated origins string into a clean slice.
func splitAndTrim(s string) []string {
	var out []string
	start := 0
	for i := 0; i <= len(s); i++ {
		if i == len(s) || s[i] == ',' {
			part := trimSpaces(s[start:i])
			if part != "" {
				out = append(out, part)
			}
			start = i + 1
		}
	}
	if len(out) == 0 {
		return []string{"*"}
	}
	return out
}

// trimSpaces trims leading/trailing ASCII spaces.
func trimSpaces(s string) string {
	i, j := 0, len(s)
	for i < j && s[i] == ' ' {
		i++
	}
	for j > i && s[j-1] == ' ' {
		j--
	}
	return s[i:j]
}
