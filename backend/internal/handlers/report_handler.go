package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// ReportHandler exposes dashboard and report endpoints.
type ReportHandler struct {
	reports *services.ReportService
}

// NewReportHandler constructs a ReportHandler.
func NewReportHandler(reports *services.ReportService) *ReportHandler {
	return &ReportHandler{reports: reports}
}

// Dashboard handles GET /api/reports/dashboard.
func (h *ReportHandler) Dashboard(c *gin.Context) {
	summary, err := h.reports.Dashboard(middleware.UserID(c))
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, summary)
}

// Daily handles GET /api/reports/daily?date=YYYY-MM-DD. Defaults to today.
func (h *ReportHandler) Daily(c *gin.Context) {
	date := time.Now().UTC()
	if v := c.Query("date"); v != "" {
		parsed, err := time.Parse(dateLayout, v)
		if err != nil {
			utils.Error(c, http.StatusBadRequest, "date must be YYYY-MM-DD")
			return
		}
		date = parsed
	}

	report, err := h.reports.Daily(middleware.UserID(c), date)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, report)
}

// Monthly handles GET /api/reports/monthly?month=YYYY-MM. Defaults to this month.
func (h *ReportHandler) Monthly(c *gin.Context) {
	month := time.Now().UTC()
	if v := c.Query("month"); v != "" {
		parsed, err := time.Parse("2006-01", v)
		if err != nil {
			utils.Error(c, http.StatusBadRequest, "month must be YYYY-MM")
			return
		}
		month = parsed
	}

	report, err := h.reports.Monthly(middleware.UserID(c), month)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, report)
}
