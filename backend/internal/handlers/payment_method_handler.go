package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// PaymentMethodHandler exposes payment method management endpoints.
type PaymentMethodHandler struct {
	payments *services.PaymentMethodService
}

// NewPaymentMethodHandler constructs a PaymentMethodHandler.
func NewPaymentMethodHandler(payments *services.PaymentMethodService) *PaymentMethodHandler {
	return &PaymentMethodHandler{payments: payments}
}

// paymentMethodRequest is the JSON body for create/update.
type paymentMethodRequest struct {
	Name   string `json:"name" binding:"required,max=120"`
	IsCard bool   `json:"is_card"`
}

// List handles GET /api/payment-methods.
func (h *PaymentMethodHandler) List(c *gin.Context) {
	pms, err := h.payments.List(middleware.UserID(c))
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, pms)
}

// Create handles POST /api/payment-methods.
func (h *PaymentMethodHandler) Create(c *gin.Context) {
	var req paymentMethodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	pm, err := h.payments.Create(middleware.UserID(c), services.PaymentMethodInput{Name: req.Name, IsCard: req.IsCard})
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.Created(c, pm)
}

// Update handles PUT /api/payment-methods/:id.
func (h *PaymentMethodHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req paymentMethodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	pm, err := h.payments.Update(middleware.UserID(c), id, services.PaymentMethodInput{Name: req.Name, IsCard: req.IsCard})
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, pm)
}

// Delete handles DELETE /api/payment-methods/:id.
func (h *PaymentMethodHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	if err := h.payments.Delete(middleware.UserID(c), id); err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, gin.H{"deleted": true})
}
