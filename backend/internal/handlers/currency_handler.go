package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// CurrencyHandler exposes exchange-rate information for the frontend.
type CurrencyHandler struct {
	currency *services.CurrencyService
}

// NewCurrencyHandler constructs a CurrencyHandler.
func NewCurrencyHandler(currency *services.CurrencyService) *CurrencyHandler {
	return &CurrencyHandler{currency: currency}
}

// Rates handles GET /api/currency/rates. Returns the base currency, the list of
// supported currencies, and the "base per 1 unit" rate for each — enough for
// the client to preview conversions live as a user types.
func (h *CurrencyHandler) Rates(c *gin.Context) {
	utils.OK(c, gin.H{
		"base":       services.BaseCurrency,
		"currencies": services.SupportedCurrencies,
		"rates":      h.currency.RatesToBase(),
	})
}
