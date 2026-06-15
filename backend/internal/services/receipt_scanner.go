package services

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

const (
	defaultGeminiReceiptModel = "gemini-3.5-flash"
	geminiGenerateBaseURL     = "https://generativelanguage.googleapis.com/v1beta/models"
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
// Gemini API free-tier Flash models (vision + structured outputs).
type ReceiptScannerService struct {
	categories *repositories.CategoryRepository
	apiKey     string
	model      string
	httpClient *http.Client
}

// NewReceiptScannerService creates a ReceiptScannerService using the provided
// category repository, Gemini API key, and model. If model is empty, it
// defaults to a Gemini Flash model available on the free tier. If apiKey is
// empty, scanning is disabled via Enabled().
func NewReceiptScannerService(categories *repositories.CategoryRepository, apiKey, model string) *ReceiptScannerService {
	if model == "" {
		model = defaultGeminiReceiptModel
	}
	return &ReceiptScannerService{
		categories: categories,
		apiKey:     apiKey,
		model:      strings.TrimSpace(model),
		httpClient: &http.Client{Timeout: 90 * time.Second},
	}
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
		return nil, fmt.Errorf("%w: receipt scanning is not configured (set GEMINI_API_KEY)", ErrValidation)
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

	text, err := s.generateReceiptJSON(ctx, imageData, mediaType, prompt, false)
	if apiErr, ok := err.(*geminiAPIError); ok && apiErr.statusCode == http.StatusBadRequest {
		// Some older Gemini API deployments use response_mime_type/response_schema
		// instead of the current responseFormat shape. Retry once for compatibility.
		text, err = s.generateReceiptJSON(ctx, imageData, mediaType, prompt, true)
	}
	if err != nil {
		return nil, fmt.Errorf("receipt scan request: %w", err)
	}
	if text == "" {
		return nil, fmt.Errorf("%w: no data could be read from the image", ErrValidation)
	}

	var result ReceiptScanResult
	if err := json.Unmarshal([]byte(extractJSONObject(text)), &result); err != nil {
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

type geminiGenerateRequest struct {
	Contents         []geminiContent        `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text       string            `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inline_data,omitempty"`
}

type geminiInlineData struct {
	MimeType string `json:"mime_type"`
	Data     string `json:"data"`
}

type geminiGenerationConfig struct {
	MaxOutputTokens  int                   `json:"maxOutputTokens,omitempty"`
	ResponseFormat   *geminiResponseFormat `json:"responseFormat,omitempty"`
	ResponseMIMEType string                `json:"response_mime_type,omitempty"`
	ResponseSchema   map[string]any        `json:"response_schema,omitempty"`
}

type geminiResponseFormat struct {
	Text geminiResponseTextFormat `json:"text"`
}

type geminiResponseTextFormat struct {
	MimeType string         `json:"mimeType"`
	Schema   map[string]any `json:"schema"`
}

type geminiGenerateResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
		FinishReason string `json:"finishReason"`
	} `json:"candidates"`
	PromptFeedback struct {
		BlockReason string `json:"blockReason"`
	} `json:"promptFeedback"`
}

type geminiErrorResponse struct {
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error"`
}

type geminiAPIError struct {
	statusCode int
	message    string
}

func (e *geminiAPIError) Error() string {
	if e.message == "" {
		return fmt.Sprintf("Gemini API returned HTTP %d", e.statusCode)
	}
	return fmt.Sprintf("Gemini API returned HTTP %d: %s", e.statusCode, e.message)
}

func (s *ReceiptScannerService) generateReceiptJSON(ctx context.Context, imageData []byte, mediaType, prompt string, legacySchema bool) (string, error) {
	config := geminiGenerationConfig{MaxOutputTokens: 1024}
	if legacySchema {
		config.ResponseMIMEType = "application/json"
		config.ResponseSchema = receiptSchema
	} else {
		config.ResponseFormat = &geminiResponseFormat{
			Text: geminiResponseTextFormat{
				MimeType: "application/json",
				Schema:   receiptSchema,
			},
		}
	}

	payload := geminiGenerateRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{
						InlineData: &geminiInlineData{
							MimeType: mediaType,
							Data:     base64.StdEncoding.EncodeToString(imageData),
						},
					},
					{Text: prompt},
				},
			},
		},
		GenerationConfig: config,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	endpoint := fmt.Sprintf("%s/%s:generateContent", geminiGenerateBaseURL, url.PathEscape(normalizeGeminiModel(s.model)))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", s.apiKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return "", err
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		var apiErr geminiErrorResponse
		_ = json.Unmarshal(responseBody, &apiErr)
		return "", &geminiAPIError{statusCode: resp.StatusCode, message: apiErr.Error.Message}
	}

	var decoded geminiGenerateResponse
	if err := json.Unmarshal(responseBody, &decoded); err != nil {
		return "", fmt.Errorf("decode Gemini response: %w", err)
	}
	if decoded.PromptFeedback.BlockReason != "" {
		return "", fmt.Errorf("%w: the image could not be processed", ErrValidation)
	}
	if len(decoded.Candidates) == 0 {
		return "", fmt.Errorf("%w: no data could be read from the image", ErrValidation)
	}
	for _, part := range decoded.Candidates[0].Content.Parts {
		if strings.TrimSpace(part.Text) != "" {
			return part.Text, nil
		}
	}
	return "", fmt.Errorf("%w: no data could be read from the image", ErrValidation)
}

func normalizeGeminiModel(model string) string {
	model = strings.TrimSpace(model)
	model = strings.TrimPrefix(model, "models/")
	if model == "" {
		return defaultGeminiReceiptModel
	}
	return model
}

func extractJSONObject(text string) string {
	text = strings.TrimSpace(text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)
	if strings.HasPrefix(text, "{") {
		return text
	}
	start := strings.IndexByte(text, '{')
	end := strings.LastIndexByte(text, '}')
	if start >= 0 && end > start {
		return text[start : end+1]
	}
	return text
}
