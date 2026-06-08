package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// xlsxContentType is the MIME type for modern Excel files.
const xlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// ExportHandler exposes Excel export endpoints.
type ExportHandler struct {
	export *services.ExportService
}

// NewExportHandler constructs an ExportHandler.
func NewExportHandler(export *services.ExportService) *ExportHandler {
	return &ExportHandler{export: export}
}

// Transactions handles GET /api/transactions/export. It accepts the same query
// filters as the list endpoint and streams an .xlsx of the full filtered set.
func (h *ExportHandler) Transactions(c *gin.Context) {
	filter, err := parseTransactionFilter(c)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	data, err := h.export.TransactionsXLSX(middleware.UserID(c), filter)
	if err != nil {
		respondServiceError(c, err)
		return
	}

	filename := fmt.Sprintf("sumly-transactions-%s.xlsx", time.Now().Format("2006-01-02"))
	streamFile(c, filename, data)
}

// Monthly handles GET /api/reports/monthly/export?month=YYYY-MM.
func (h *ExportHandler) Monthly(c *gin.Context) {
	month := time.Now().UTC()
	if v := c.Query("month"); v != "" {
		parsed, err := time.Parse("2006-01", v)
		if err != nil {
			utils.Error(c, http.StatusBadRequest, "month must be YYYY-MM")
			return
		}
		month = parsed
	}

	data, err := h.export.MonthlyXLSX(middleware.UserID(c), month)
	if err != nil {
		respondServiceError(c, err)
		return
	}

	filename := fmt.Sprintf("sumly-monthly-%s.xlsx", month.Format("2006-01"))
	streamFile(c, filename, data)
}

// streamFile writes an xlsx byte slice as a downloadable attachment.
func streamFile(c *gin.Context, filename string, data []byte) {
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, xlsxContentType, data)
}
