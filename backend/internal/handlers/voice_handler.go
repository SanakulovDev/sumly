package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// VoiceHandler parses transcribed speech into a transaction draft.
type VoiceHandler struct {
	voice *services.VoiceService
}

// NewVoiceHandler constructs a VoiceHandler.
func NewVoiceHandler(voice *services.VoiceService) *VoiceHandler {
	return &VoiceHandler{voice: voice}
}

// voiceParseRequest is the JSON body for POST /api/voice/parse. The transcript
// is produced client-side by the browser's speech recognition.
type voiceParseRequest struct {
	Text string `json:"text" binding:"required,max=500"`
	Lang string `json:"lang" binding:"omitempty,oneof=uz ru en"`
}

// Parse handles POST /api/voice/parse.
func (h *VoiceHandler) Parse(c *gin.Context) {
	var req voiceParseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if req.Lang == "" {
		req.Lang = "uz"
	}

	result, err := h.voice.Parse(c.Request.Context(), middleware.UserID(c), req.Text, req.Lang)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, result)
}
