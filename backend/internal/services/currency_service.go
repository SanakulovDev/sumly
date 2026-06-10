package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// BaseCurrency is the currency all balances and reports are consolidated into.
const BaseCurrency = "UZS"

// SupportedCurrencies are the currencies a transaction may be recorded in.
var SupportedCurrencies = []string{"UZS", "USD", "EUR", "RUB"}

// fallbackRates are UZS per 1 unit of each currency, used when the live rates
// API is unreachable (e.g. no internet in a locked-down Docker network). They
// are approximate and only a safety net — live rates are preferred.
var fallbackRates = map[string]float64{
	"UZS": 1,
	"USD": 12600,
	"EUR": 13700,
	"RUB": 140,
}

// ratesTTL is how long fetched rates are cached before refreshing.
const ratesTTL = time.Hour

// CurrencyService provides exchange rates (to the base currency) and conversion.
// Rates are fetched from a free, key-less API and cached; on failure it falls
// back to built-in approximate rates so the app always works.
type CurrencyService struct {
	mu        sync.RWMutex
	rates     map[string]float64 // UZS per 1 unit of currency
	fetchedAt time.Time
	client    *http.Client
}

// NewCurrencyService constructs a CurrencyService seeded with fallback rates.
func NewCurrencyService() *CurrencyService {
	// Seed with a copy of the fallbacks so conversion works before the first fetch.
	seed := make(map[string]float64, len(fallbackRates))
	for k, v := range fallbackRates {
		seed[k] = v
	}
	return &CurrencyService{
		rates:  seed,
		client: &http.Client{Timeout: 5 * time.Second},
	}
}

// IsSupported reports whether the (upper-cased) currency code is supported.
func IsSupported(currency string) bool {
	for _, c := range SupportedCurrencies {
		if c == currency {
			return true
		}
	}
	return false
}

// RatesToBase returns a copy of the current "UZS per 1 unit" rate for every
// supported currency, refreshing from the network if the cache is stale.
func (s *CurrencyService) RatesToBase() map[string]float64 {
	s.ensureFresh()
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make(map[string]float64, len(SupportedCurrencies))
	for _, c := range SupportedCurrencies {
		if r, ok := s.rates[c]; ok {
			out[c] = r
		} else {
			out[c] = fallbackRates[c]
		}
	}
	return out
}

// ConvertToBase converts an amount in the given currency into the base currency
// (UZS), rounded to 2 decimals.
func (s *CurrencyService) ConvertToBase(amount float64, currency string) float64 {
	currency = strings.ToUpper(strings.TrimSpace(currency))
	if currency == "" || currency == BaseCurrency {
		return round2(amount)
	}
	s.ensureFresh()
	s.mu.RLock()
	rate, ok := s.rates[currency]
	s.mu.RUnlock()
	if !ok || rate == 0 {
		rate = fallbackRates[currency]
	}
	return round2(amount * rate)
}

// ensureFresh refreshes the rate cache if it is older than the TTL. Failures are
// non-fatal: the previous (or fallback) rates remain in use.
func (s *CurrencyService) ensureFresh() {
	s.mu.RLock()
	fresh := time.Since(s.fetchedAt) < ratesTTL && !s.fetchedAt.IsZero()
	s.mu.RUnlock()
	if fresh {
		return
	}
	if rates, err := s.fetch(); err == nil {
		s.mu.Lock()
		s.rates = rates
		s.fetchedAt = time.Now()
		s.mu.Unlock()
	} else {
		// Mark the attempt so we don't hammer a down API on every request.
		s.mu.Lock()
		s.fetchedAt = time.Now()
		s.mu.Unlock()
	}
}

// fetch pulls live rates (base USD) and derives "UZS per 1 unit" for each
// supported currency. Uses open.er-api.com, which is free and needs no key.
func (s *CurrencyService) fetch() (map[string]float64, error) {
	resp, err := s.client.Get("https://open.er-api.com/v6/latest/USD")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("rates api status %d", resp.StatusCode)
	}

	var payload struct {
		Result string             `json:"result"`
		Rates  map[string]float64 `json:"rates"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}
	if payload.Result != "success" {
		return nil, fmt.Errorf("rates api result %q", payload.Result)
	}

	uzsPerUSD, ok := payload.Rates["UZS"]
	if !ok || uzsPerUSD == 0 {
		return nil, fmt.Errorf("UZS rate missing")
	}

	// rate(C -> UZS) = UZS-per-USD / C-per-USD.
	out := make(map[string]float64, len(SupportedCurrencies))
	for _, c := range SupportedCurrencies {
		if c == "UZS" {
			out[c] = 1
			continue
		}
		perUSD, ok := payload.Rates[c]
		if !ok || perUSD == 0 {
			out[c] = fallbackRates[c]
			continue
		}
		out[c] = uzsPerUSD / perUSD
	}
	return out, nil
}

// round2 rounds to two decimal places.
func round2(v float64) float64 {
	return float64(int64(v*100+0.5)) / 100
}
