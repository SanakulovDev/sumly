package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// AuthHandler exposes authentication endpoints.
type AuthHandler struct {
	auth *services.AuthService
	// devMode exposes the reset token in forgot-password responses so the flow
	// can be exercised without an SMTP server. Never enabled in production.
	devMode bool
}

// When devMode is true, the handler will expose password reset tokens in forgot-password responses.
func NewAuthHandler(auth *services.AuthService, devMode bool) *AuthHandler {
	return &AuthHandler{auth: auth, devMode: devMode}
}

// registerRequest is the JSON body for POST /api/auth/register.
type registerRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=120"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=72"`
}

// loginRequest is the JSON body for POST /api/auth/login.
type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register handles POST /api/auth/register.
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.auth.Register(services.RegisterInput{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.Created(c, result)
}

// Login handles POST /api/auth/login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.auth.Login(services.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, result)
}

// forgotPasswordRequest is the JSON body for POST /api/auth/forgot-password.
type forgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// resetPasswordRequest is the JSON body for POST /api/auth/reset-password.
type resetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6,max=72"`
}

// changePasswordRequest is the JSON body for POST /api/auth/change-password.
type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6,max=72"`
}

// ForgotPassword handles POST /api/auth/forgot-password. The response is the
// same whether or not the email exists, so accounts cannot be enumerated.
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req forgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.auth.RequestPasswordReset(req.Email)
	if err != nil && !errors.Is(err, services.ErrNotFound) {
		respondServiceError(c, err)
		return
	}

	resp := gin.H{"sent": true}
	if h.devMode && token != "" {
		resp["reset_token"] = token
	}
	utils.OK(c, resp)
}

// ResetPassword handles POST /api/auth/reset-password.
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req resetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.auth.ResetPassword(req.Token, req.Password); err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, gin.H{"reset": true})
}

// ChangePassword handles POST /api/auth/change-password (authenticated).
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := middleware.UserID(c)
	if err := h.auth.ChangePassword(userID, req.CurrentPassword, req.NewPassword); err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, gin.H{"changed": true})
}

// Me handles GET /api/auth/me.
func (h *AuthHandler) Me(c *gin.Context) {
	userID := middleware.UserID(c)
	user, err := h.auth.Me(userID)
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, user)
}
