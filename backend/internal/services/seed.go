package services

import "github.com/sumly/backend/internal/models"

// Default seed data created for every new user so they can start recording
// transactions immediately. These mirror common categories for the Uzbek
// small-business market.
var (
	defaultIncomeCategories = []string{
		"Sales", "Service", "Debt Returned", "Bonus", "Other",
	}
	defaultExpenseCategories = []string{
		"Food", "Transport", "Rent", "Salary", "Product Purchase",
		"Utilities", "Marketing", "Other",
	}
	defaultPaymentMethods = []string{
		"Cash", "Card", "Bank", "Click", "Payme", "Debt",
	}
)

// buildSeedCategories returns the default category models for a user.
func buildSeedCategories(userID uint) []models.Category {
	categories := make([]models.Category, 0, len(defaultIncomeCategories)+len(defaultExpenseCategories))
	for _, name := range defaultIncomeCategories {
		categories = append(categories, models.Category{UserID: userID, Name: name, Type: models.Income})
	}
	for _, name := range defaultExpenseCategories {
		categories = append(categories, models.Category{UserID: userID, Name: name, Type: models.Expense})
	}
	return categories
}

// buildSeedPaymentMethods returns the default payment method models for a user.
func buildSeedPaymentMethods(userID uint) []models.PaymentMethod {
	pms := make([]models.PaymentMethod, 0, len(defaultPaymentMethods))
	for _, name := range defaultPaymentMethods {
		pms = append(pms, models.PaymentMethod{UserID: userID, Name: name})
	}
	return pms
}
