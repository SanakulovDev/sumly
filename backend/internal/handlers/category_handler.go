package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sumly/backend/internal/middleware"
	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/services"
	"github.com/sumly/backend/internal/utils"
)

// CategoryHandler exposes category management endpoints.
type CategoryHandler struct {
	categories *services.CategoryService
}

// NewCategoryHandler constructs a CategoryHandler.
func NewCategoryHandler(categories *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{categories: categories}
}

// categoryRequest is the JSON body for create/update.
type categoryRequest struct {
	Name string                 `json:"name" binding:"required,max=120"`
	Type models.TransactionType `json:"type" binding:"required,oneof=income expense"`
}

// List handles GET /api/categories.
func (h *CategoryHandler) List(c *gin.Context) {
	categories, err := h.categories.List(middleware.UserID(c))
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, categories)
}

// Create handles POST /api/categories.
func (h *CategoryHandler) Create(c *gin.Context) {
	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	category, err := h.categories.Create(middleware.UserID(c), services.CategoryInput{
		Name: req.Name,
		Type: req.Type,
	})
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.Created(c, category)
}

// Update handles PUT /api/categories/:id.
func (h *CategoryHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	category, err := h.categories.Update(middleware.UserID(c), id, services.CategoryInput{
		Name: req.Name,
		Type: req.Type,
	})
	if err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, category)
}

// Delete handles DELETE /api/categories/:id.
func (h *CategoryHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	if err := h.categories.Delete(middleware.UserID(c), id); err != nil {
		respondServiceError(c, err)
		return
	}
	utils.OK(c, gin.H{"deleted": true})
}

// parseIDParam parses the :id path parameter as an unsigned integer, writing a
// 400 response and returning false on failure.
func parseIDParam(c *gin.Context) (uint, bool) {
	raw := c.Param("id")
	id, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || id == 0 {
		utils.Error(c, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return uint(id), true
}
