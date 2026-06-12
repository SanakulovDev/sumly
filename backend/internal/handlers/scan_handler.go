package handlers

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// maxReceiptImageBytes caps uploaded receipt photos (10 MB).
const maxReceiptImageBytes = 10 << 20

// allowedReceiptTypes are the image formats the vision model accepts.
var allowedReceiptTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

// ScanHandler exposes the receipt-scanning endpoint.
type ScanHandler struct {
	scanner *services.ReceiptScannerService
}

// NewScanHandler constructs a ScanHandler.
func NewScanHandler(scanner *services.ReceiptScannerService) *ScanHandler {
	return &ScanHandler{scanner: scanner}
}

// Receipt handles POST /api/transactions/scan-receipt. It accepts a multipart
// "image" file plus an optional "lang" field, and returns the extracted
// expense data for the user to confirm in the form.
func (h *ScanHandler) Receipt(c *gin.Context) {
	if !h.scanner.Enabled() {
		utils.Error(c, http.StatusServiceUnavailable, "receipt scanning is not configured")
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "image file is required")
		return
	}
	defer file.Close()

	if header.Size > maxReceiptImageBytes {
		utils.Error(c, http.StatusBadRequest, "image is too large (max 10MB)")
		return
	}

	data, err := io.ReadAll(io.LimitReader(file, maxReceiptImageBytes+1))
	if err != nil || int64(len(data)) > maxReceiptImageBytes {
		utils.Error(c, http.StatusBadRequest, "could not read the image")
		return
	}

	mediaType := http.DetectContentType(data)
	if !allowedReceiptTypes[mediaType] {
		utils.Error(c, http.StatusBadRequest, "unsupported image format (use JPEG, PNG, WebP or GIF)")
		return
	}

	userID := middleware.UserID(c)
	result, err := h.scanner.Scan(c.Request.Context(), userID, data, mediaType, c.PostForm("lang"))
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, result)
}
