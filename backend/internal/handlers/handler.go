// Package handlers contains the HTTP layer: it parses and validates requests,
// delegates to services, and renders consistent JSON responses. No business
// logic lives here.
package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// respondServiceError maps a service sentinel error to an appropriate HTTP
// status code and message, keeping error handling uniform across handlers.
func respondServiceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrValidation):
		utils.Error(c, http.StatusBadRequest, err.Error())
	case errors.Is(err, services.ErrUnauthorized):
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
	case errors.Is(err, services.ErrNotFound):
		utils.Error(c, http.StatusNotFound, "resource not found")
	case errors.Is(err, services.ErrConflict):
		utils.Error(c, http.StatusConflict, err.Error())
	case errors.Is(err, services.ErrInUse):
		utils.Error(c, http.StatusConflict, err.Error())
	default:
		// Unexpected error: do not leak internals to the client.
		utils.Error(c, http.StatusInternalServerError, "internal server error")
	}
}
