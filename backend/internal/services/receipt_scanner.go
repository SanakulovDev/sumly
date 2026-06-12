package services

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// ReceiptScanResult is the structured data extracted from a receipt photo.
// The user reviews these values in the expense form before saving.
type ReceiptScanResult struct {
	// Total amount paid, in so'm.
	Amount float64 `json:"amount"`
	// Purchase date as YYYY-MM-DD; empty when not visible on the receipt.
	Date string `json:"date"`
	// Merchant / store name; empty when not readable.
	Merchant string `json:"merchant"`
	// Short human description of what was bought (main items).
	Description string `json:"description"`
	// ID of the user's expense category that best matches, 0 when unsure.
	CategoryID uint `json:"category_id"`
}

// ReceiptScannerService extracts expense data from receipt photos using the
// Claude API (vision + structured outputs).
type ReceiptScannerService struct {
	categories *repositories.CategoryRepository
	apiKey     string
	model      string
}

// NewReceiptScannerService constructs a ReceiptScannerService. An empty apiKey
// disables scanning (the handler reports it as unconfigured).
func NewReceiptScannerService(categories *repositories.CategoryRepository, apiKey, model string) *ReceiptScannerService {
	if model == "" {
		model = string(anthropic.ModelClaudeOpus4_8)
	}
	return &ReceiptScannerService{categories: categories, apiKey: apiKey, model: model}
}

// Enabled reports whether an API key is configured.
func (s *ReceiptScannerService) Enabled() bool {
	return s.apiKey != ""
}

// receiptSchema constrains the model's response to exactly the fields the
// expense form needs, so the output is always parseable JSON.
var receiptSchema = map[string]any{
	"type": "object",
	"properties": map[string]any{
		"amount":      map[string]any{"type": "number", "description": "Total amount paid on the receipt"},
		"date":        map[string]any{"type": "string", "description": "Purchase date as YYYY-MM-DD, or empty string if not visible"},
		"merchant":    map[string]any{"type": "string", "description": "Store or merchant name, or empty string"},
		"description": map[string]any{"type": "string", "description": "Short summary of what was purchased (main items)"},
		"category_id": map[string]any{"type": "integer", "description": "ID of the best-matching expense category from the provided list, or 0 if none fits"},
	},
	"required":             []string{"amount", "date", "merchant", "description", "category_id"},
	"additionalProperties": false,
}

// Scan extracts the total amount, date, merchant, item summary and a suggested
// category from a receipt image. lang selects the language of the description
// ("uz", "ru" or "en").
func (s *ReceiptScannerService) Scan(ctx context.Context, userID uint, imageData []byte, mediaType, lang string) (*ReceiptScanResult, error) {
	if !s.Enabled() {
		return nil, fmt.Errorf("%w: receipt scanning is not configured (set ANTHROPIC_API_KEY)", ErrValidation)
	}

	// Offer the user's own expense categories so the suggestion maps to a real ID.
	cats, err := s.categories.ListByUser(userID)
	if err != nil {
		return nil, err
	}
	var catList strings.Builder
	for _, c := range cats {
		if c.Type == models.Expense {
			fmt.Fprintf(&catList, "- id=%d: %s\n", c.ID, c.Name)
		}
	}

	langName := map[string]string{"uz": "Uzbek", "ru": "Russian", "en": "English"}[lang]
	if langName == "" {
		langName = "Uzbek"
	}

	prompt := fmt.Sprintf(`This is a photo of a payment receipt (most likely from Uzbekistan, amounts in so'm/UZS).
Extract the expense data for a personal finance tracker:
- amount: the TOTAL amount actually paid (numbers like "12 500,00" mean 12500).
- date: the purchase date as YYYY-MM-DD (today is %s); empty string if not visible.
- merchant: the store/merchant name; empty string if unreadable.
- description: a short (max 80 chars) summary of the main purchased items, written in %s.
- category_id: pick the best matching category id from this list of the user's expense categories, or 0 if none fits:
%s
If the image is not a receipt, return amount 0 and empty strings.`,
		time.Now().Format("2006-01-02"), langName, catList.String())

	client := anthropic.NewClient(option.WithAPIKey(s.apiKey))

	resp, err := client.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.Model(s.model),
		MaxTokens: 2048,
		OutputConfig: anthropic.OutputConfigParam{
			Format: anthropic.JSONOutputFormatParam{Schema: receiptSchema},
		},
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(
				anthropic.NewImageBlockBase64(mediaType, base64.StdEncoding.EncodeToString(imageData)),
				anthropic.NewTextBlock(prompt),
			),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("receipt scan request: %w", err)
	}
	if resp.StopReason == anthropic.StopReasonRefusal {
		return nil, fmt.Errorf("%w: the image could not be processed", ErrValidation)
	}

	var text string
	for _, block := range resp.Content {
		if b, ok := block.AsAny().(anthropic.TextBlock); ok {
			text = b.Text
			break
		}
	}
	if text == "" {
		return nil, fmt.Errorf("%w: no data could be read from the image", ErrValidation)
	}

	var result ReceiptScanResult
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		return nil, fmt.Errorf("parse receipt scan result: %w", err)
	}
	if result.Amount <= 0 {
		return nil, fmt.Errorf("%w: could not detect an amount on the receipt", ErrValidation)
	}

	// Never suggest a category the user doesn't own.
	if result.CategoryID != 0 {
		valid := false
		for _, c := range cats {
			if c.ID == result.CategoryID && c.Type == models.Expense {
				valid = true
				break
			}
		}
		if !valid {
			result.CategoryID = 0
		}
	}

	return &result, nil
}
