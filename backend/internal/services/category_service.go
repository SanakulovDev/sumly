package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// CategoryInput is the validated payload for creating/updating a category.
type CategoryInput struct {
	Name string
	Type models.TransactionType
}

// CategoryService implements category management.
type CategoryService struct {
	repo *repositories.CategoryRepository
}

// NewCategoryService constructs a CategoryService.
func NewCategoryService(repo *repositories.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

// List returns all categories for the user.
func (s *CategoryService) List(userID uint) ([]models.Category, error) {
	return s.repo.ListByUser(userID)
}

// Create validates and stores a new category.
func (s *CategoryService) Create(userID uint, in CategoryInput) (*models.Category, error) {
	name := strings.TrimSpace(in.Name)
	if name == "" {
		return nil, fmt.Errorf("%w: name is required", ErrValidation)
	}
	if !in.Type.Valid() {
		return nil, fmt.Errorf("%w: type must be 'income' or 'expense'", ErrValidation)
	}

	category := &models.Category{UserID: userID, Name: name, Type: in.Type}
	if err := s.repo.Create(category); err != nil {
		return nil, err
	}
	return category, nil
}

// Update validates and persists changes to an existing category.
func (s *CategoryService) Update(userID, id uint, in CategoryInput) (*models.Category, error) {
	category, err := s.repo.FindByID(userID, id)
	if err != nil {
		return nil, mapNotFound(err)
	}

	name := strings.TrimSpace(in.Name)
	if name == "" {
		return nil, fmt.Errorf("%w: name is required", ErrValidation)
	}
	if !in.Type.Valid() {
		return nil, fmt.Errorf("%w: type must be 'income' or 'expense'", ErrValidation)
	}

	category.Name = name
	category.Type = in.Type
	if err := s.repo.Update(category); err != nil {
		return nil, err
	}
	return category, nil
}

// Delete removes a category, refusing if it is still referenced by transactions.
func (s *CategoryService) Delete(userID, id uint) error {
	count, err := s.repo.CountTransactions(userID, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("%w: category has transactions", ErrInUse)
	}
	if err := s.repo.Delete(userID, id); err != nil {
		return mapNotFound(err)
	}
	return nil
}

// mapNotFound translates a repository not-found error into the service sentinel.
func mapNotFound(err error) error {
	if errors.Is(err, repositories.ErrNotFound) {
		return ErrNotFound
	}
	return err
}
