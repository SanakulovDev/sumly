package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// InsightsHandler exposes the AI financial advisor.
type InsightsHandler struct {
	insights *services.InsightsService
}

// NewInsightsHandler constructs an InsightsHandler.
func NewInsightsHandler(insights *services.InsightsService) *InsightsHandler {
	return &InsightsHandler{insights: insights}
}

// normalizeLang clamps the language to a supported value, defaulting to Uzbek.
func normalizeLang(lang string) string {
	if lang == "ru" || lang == "en" {
		return lang
	}
	return "uz"
}

// Advice handles GET /api/insights/advice?lang=uz|ru|en.
func (h *InsightsHandler) Advice(c *gin.Context) {
	result, err := h.insights.Advice(c.Request.Context(), middleware.UserID(c), normalizeLang(c.Query("lang")))
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, result)
}

// Status handles GET /api/insights/status. Tells the client whether the
// interactive AI chat is available.
func (h *InsightsHandler) Status(c *gin.Context) {
	utils.OK(c, gin.H{"ai_enabled": h.insights.AIEnabled()})
}

// askRequest is the JSON body for POST /api/insights/ask.
type askRequest struct {
	Question string `json:"question" binding:"required,max=400"`
	Lang     string `json:"lang" binding:"omitempty,oneof=uz ru en"`
}

// Ask handles POST /api/insights/ask — a free-form question answered from the
// logged-in user's own data only.
func (h *InsightsHandler) Ask(c *gin.Context) {
	var req askRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	answer, err := h.insights.Ask(c.Request.Context(), middleware.UserID(c), req.Question, normalizeLang(req.Lang))
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, gin.H{"answer": answer})
}
