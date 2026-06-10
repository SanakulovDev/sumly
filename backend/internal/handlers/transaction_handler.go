package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// dateLayout is the date format accepted for transaction dates and filters.
const dateLayout = "2006-01-02"

// TransactionHandler exposes transaction CRUD and listing endpoints.
type TransactionHandler struct {
	transactions *services.TransactionService
}

// NewTransactionHandler constructs a TransactionHandler.
func NewTransactionHandler(transactions *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactions: transactions}
}

// transactionRequest is the JSON body for create/update. The date is accepted
// as a YYYY-MM-DD string for simplicity on the frontend.
type transactionRequest struct {
	Type            models.TransactionType `json:"type" binding:"required,oneof=income expense"`
	Amount          float64                `json:"amount" binding:"required,gt=0"`
	Currency        string                 `json:"currency" binding:"omitempty,oneof=UZS USD EUR RUB"`
	CategoryID      uint                   `json:"category_id" binding:"required"`
	PaymentMethodID uint                   `json:"payment_method_id" binding:"required"`
	Description     string                 `json:"description" binding:"max=500"`
	// CardLast4 is required only for card payment methods (validated server-side
	// against the method's is_card flag).
	CardLast4       string                 `json:"card_last4" binding:"omitempty,len=4,numeric"`
	TransactionDate string                 `json:"transaction_date" binding:"required"`
}

// toInput converts the request into a service input, parsing the date.
func (r transactionRequest) toInput() (services.TransactionInput, error) {
	date, err := time.Parse(dateLayout, r.TransactionDate)
	if err != nil {
		return services.TransactionInput{}, err
	}
	return services.TransactionInput{
		Type:            r.Type,
		Amount:          r.Amount,
		Currency:        r.Currency,
		CategoryID:      r.CategoryID,
		PaymentMethodID: r.PaymentMethodID,
		Description:     r.Description,
		CardLast4:       r.CardLast4,
		TransactionDate: date.UTC(),
	}, nil
}

// Create handles POST /api/transactions.
func (h *TransactionHandler) Create(c *gin.Context) {
	var req transactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	input, err := req.toInput()
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "transaction_date must be YYYY-MM-DD")
		return
	}
	tx, err := h.transactions.Create(middleware.UserID(c), input)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.Created(c, tx)
}

// Get handles GET /api/transactions/:id.
func (h *TransactionHandler) Get(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	tx, err := h.transactions.Get(middleware.UserID(c), id)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, tx)
}

// Update handles PUT /api/transactions/:id.
func (h *TransactionHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req transactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	input, err := req.toInput()
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "transaction_date must be YYYY-MM-DD")
		return
	}
	tx, err := h.transactions.Update(middleware.UserID(c), id, input)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, tx)
}

// Delete handles DELETE /api/transactions/:id.
func (h *TransactionHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	if err := h.transactions.Delete(middleware.UserID(c), id); err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, gin.H{"deleted": true})
}

// TopAmounts handles GET /api/transactions/top-amounts?type=income|expense.
// Returns the user's most frequently used amounts to power quick-entry chips.
func (h *TransactionHandler) TopAmounts(c *gin.Context) {
	txType := models.TransactionType(c.Query("type"))
	amounts, err := h.transactions.TopAmounts(middleware.UserID(c), txType, c.Query("currency"), 6)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	if amounts == nil {
		amounts = []float64{}
	}
	utils.OK(c, amounts)
}

// List handles GET /api/transactions with filtering and pagination.
func (h *TransactionHandler) List(c *gin.Context) {
	filter, err := parseTransactionFilter(c)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.transactions.List(middleware.UserID(c), filter)
	if err != nil {
		respondServiceError(c, err)
		return
	}

	totalPages := (result.Total + int64(result.PageSize) - 1) / int64(result.PageSize)
	utils.Paginated(c, result.Transactions, gin.H{
		"page":        result.Page,
		"page_size":   result.PageSize,
		"total":       result.Total,
		"total_pages": totalPages,
	})
}

// parseTransactionFilter reads filter and pagination query parameters.
func parseTransactionFilter(c *gin.Context) (repositories.TransactionFilter, error) {
	var f repositories.TransactionFilter

	if t := c.Query("type"); t != "" {
		f.Type = models.TransactionType(t)
		if !f.Type.Valid() {
			return f, errInvalid("type must be 'income' or 'expense'")
		}
	}
	if v := c.Query("category_id"); v != "" {
		id, err := strconv.ParseUint(v, 10, 64)
		if err != nil {
			return f, errInvalid("category_id must be a number")
		}
		f.CategoryID = uint(id)
	}
	if v := c.Query("payment_method_id"); v != "" {
		id, err := strconv.ParseUint(v, 10, 64)
		if err != nil {
			return f, errInvalid("payment_method_id must be a number")
		}
		f.PaymentMethodID = uint(id)
	}
	if v := c.Query("date_from"); v != "" {
		d, err := time.Parse(dateLayout, v)
		if err != nil {
			return f, errInvalid("date_from must be YYYY-MM-DD")
		}
		du := d.UTC()
		f.DateFrom = &du
	}
	if v := c.Query("date_to"); v != "" {
		d, err := time.Parse(dateLayout, v)
		if err != nil {
			return f, errInvalid("date_to must be YYYY-MM-DD")
		}
		du := d.UTC()
		f.DateTo = &du
	}

	f.Page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	f.PageSize, _ = strconv.Atoi(c.DefaultQuery("page_size", "20"))
	return f, nil
}

// errInvalid is a small helper to build a query-validation error.
func errInvalid(msg string) error { return &validationError{msg: msg} }

type validationError struct{ msg string }

func (e *validationError) Error() string { return e.msg }
