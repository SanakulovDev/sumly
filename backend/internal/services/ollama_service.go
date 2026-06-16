package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// OllamaService is a thin client for a local Ollama server. It powers the
// optional AI paths (voice-parsing fallback and the financial advisor). When no
// URL is configured, Enabled() reports false and callers fall back to
// rule-based logic, so the app keeps working without any model.
type OllamaService struct {
	baseURL    string
	model      string
	httpClient *http.Client
}

// NewOllamaService constructs an OllamaService. A trailing slash on baseURL is
// trimmed. When model is empty a small, fast default is used.
func NewOllamaService(baseURL, model string) *OllamaService {
	if strings.TrimSpace(model) == "" {
		model = "qwen2.5:3b"
	}
	return &OllamaService{
		baseURL: strings.TrimRight(strings.TrimSpace(baseURL), "/"),
		model:   strings.TrimSpace(model),
		// Generous timeout: a cold model load can take a few seconds.
		httpClient: &http.Client{Timeout: 60 * time.Second},
	}
}

// Enabled reports whether an Ollama URL is configured.
func (s *OllamaService) Enabled() bool {
	return s.baseURL != ""
}

// Model returns the configured model name.
func (s *OllamaService) Model() string { return s.model }

type ollamaGenerateRequest struct {
	Model   string         `json:"model"`
	Prompt  string         `json:"prompt"`
	System  string         `json:"system,omitempty"`
	Stream  bool           `json:"stream"`
	Format  string         `json:"format,omitempty"`
	Options map[string]any `json:"options,omitempty"`
}

type ollamaGenerateResponse struct {
	Response string `json:"response"`
	Done     bool   `json:"done"`
	Error    string `json:"error,omitempty"`
}

// Generate runs a single completion. When jsonMode is true Ollama is asked to
// return strict JSON (format=json), which makes structured extraction reliable.
func (s *OllamaService) Generate(ctx context.Context, system, prompt string, jsonMode bool) (string, error) {
	if !s.Enabled() {
		return "", fmt.Errorf("%w: AI features are not configured (set OLLAMA_URL)", ErrValidation)
	}

	reqBody := ollamaGenerateRequest{
		Model:  s.model,
		Prompt: prompt,
		System: system,
		Stream: false,
		// Low temperature for deterministic, fast extraction/advice.
		Options: map[string]any{"temperature": 0.2},
	}
	if jsonMode {
		reqBody.Format = "json"
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.baseURL+"/api/generate", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("ollama request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return "", err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("ollama returned HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}

	var decoded ollamaGenerateResponse
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return "", fmt.Errorf("decode ollama response: %w", err)
	}
	if decoded.Error != "" {
		return "", fmt.Errorf("ollama error: %s", decoded.Error)
	}
	return strings.TrimSpace(decoded.Response), nil
}
