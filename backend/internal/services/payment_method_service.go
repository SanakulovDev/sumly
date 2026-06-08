package services

import (
	"fmt"
	"strings"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// PaymentMethodInput is the validated payload for creating/updating a payment method.
type PaymentMethodInput struct {
	Name   string
	IsCard bool
}

// PaymentMethodService implements payment method management.
type PaymentMethodService struct {
	repo *repositories.PaymentMethodRepository
}

// NewPaymentMethodService constructs a PaymentMethodService.
func NewPaymentMethodService(repo *repositories.PaymentMethodRepository) *PaymentMethodService {
	return &PaymentMethodService{repo: repo}
}

// List returns all payment methods for the user.
func (s *PaymentMethodService) List(userID uint) ([]models.PaymentMethod, error) {
	return s.repo.ListByUser(userID)
}

// Create validates and stores a new payment method.
func (s *PaymentMethodService) Create(userID uint, in PaymentMethodInput) (*models.PaymentMethod, error) {
	name := strings.TrimSpace(in.Name)
	if name == "" {
		return nil, fmt.Errorf("%w: name is required", ErrValidation)
	}
	pm := &models.PaymentMethod{UserID: userID, Name: name, IsCard: in.IsCard}
	if err := s.repo.Create(pm); err != nil {
		return nil, err
	}
	return pm, nil
}

// Update validates and persists changes to an existing payment method.
func (s *PaymentMethodService) Update(userID, id uint, in PaymentMethodInput) (*models.PaymentMethod, error) {
	pm, err := s.repo.FindByID(userID, id)
	if err != nil {
		return nil, mapNotFound(err)
	}
	name := strings.TrimSpace(in.Name)
	if name == "" {
		return nil, fmt.Errorf("%w: name is required", ErrValidation)
	}
	pm.Name = name
	pm.IsCard = in.IsCard
	if err := s.repo.Update(pm); err != nil {
		return nil, err
	}
	return pm, nil
}

// Delete removes a payment method, refusing if it is still referenced.
func (s *PaymentMethodService) Delete(userID, id uint) error {
	count, err := s.repo.CountTransactions(userID, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("%w: payment method has transactions", ErrInUse)
	}
	if err := s.repo.Delete(userID, id); err != nil {
		return mapNotFound(err)
	}
	return nil
}
