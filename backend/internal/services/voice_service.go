package services

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// VoiceParseResult is the structured transaction draft extracted from a spoken
// sentence. The user reviews it in the Add form before saving.
type VoiceParseResult struct {
	Type        models.TransactionType `json:"type"`
	Amount      float64                `json:"amount"`
	Currency    string                 `json:"currency"`
	CategoryID  uint                   `json:"category_id"`
	Description string                 `json:"description"`
	// Source indicates how it was parsed: "rules" (instant, offline) or "ai".
	Source string `json:"source"`
	// Transcript echoes the recognized text.
	Transcript string `json:"transcript"`
}

// VoiceService turns a transcribed sentence into a transaction draft. It first
// tries a fast, offline rule-based parser; only when that is not confident
// (and Ollama is configured) does it ask the local LLM.
type VoiceService struct {
	categories *repositories.CategoryRepository
	ollama     *OllamaService
}

// NewVoiceService constructs a VoiceService.
func NewVoiceService(categories *repositories.CategoryRepository, ollama *OllamaService) *VoiceService {
	return &VoiceService{categories: categories, ollama: ollama}
}

// expenseKeywords / incomeKeywords drive type detection across uz/ru/en.
var (
	expenseKeywords = []string{
		// English
		"spent", "spend", "paid", "pay", "bought", "buy", "purchase", "cost", "expense",
		// Russian
		"потратил", "потратила", "потрачено", "купил", "купила", "заплатил", "оплатил", "расход",
		// Uzbek
		"sarfladim", "sarf", "xarajat", "harajat", "to'ladim", "toladim", "sotib oldim", "chiqim", "xarid",
	}
	incomeKeywords = []string{
		// English
		"earned", "earn", "received", "receive", "got", "income", "salary", "sold", "sale", "revenue",
		// Russian
		"заработал", "заработала", "получил", "получила", "доход", "зарплата", "продал", "продала", "выручка",
		// Uzbek
		"ishladim", "daromad", "maosh", "kirim", "sotdim", "sotuv", "tushdi", "oldim",
	}
)

// multipliers maps scale words (uz/ru/en) to their numeric factor.
var multipliers = map[string]float64{
	"ming": 1000, "min": 1000, "thousand": 1000, "k": 1000,
	"тысяч": 1000, "тысяча": 1000, "тыс": 1000,
	"million": 1_000_000, "mln": 1_000_000, "млн": 1_000_000, "m": 1_000_000, "million.": 1_000_000,
	"milliard": 1_000_000_000, "mlrd": 1_000_000_000, "млрд": 1_000_000_000, "billion": 1_000_000_000,
}

var (
	groupSpaceRe = regexp.MustCompile(`(\d)[\s\x{00a0}](\d{3})(?:\b|$)`)
	groupCommaRe = regexp.MustCompile(`(\d),(\d{3})(?:\b|$)`)
	numberRe     = regexp.MustCompile(`\d+(?:\.\d+)?`)
)

// Parse extracts a transaction draft from the transcript in the given language.
func (s *VoiceService) Parse(ctx context.Context, userID uint, transcript, lang string) (*VoiceParseResult, error) {
	transcript = strings.TrimSpace(transcript)
	if transcript == "" {
		return nil, fmt.Errorf("%w: nothing was said", ErrValidation)
	}

	cats, err := s.categories.ListByUser(userID)
	if err != nil {
		return nil, err
	}

	result := s.ruleParse(transcript, cats)
	result.Transcript = transcript

	confident := result.Amount > 0 && result.typeDetected
	if confident || !s.ollama.Enabled() {
		if result.Amount <= 0 && !s.ollama.Enabled() {
			return nil, fmt.Errorf("%w: couldn't detect an amount in \"%s\"", ErrValidation, transcript)
		}
		return result.toPublic("rules"), nil
	}

	// Not confident and Ollama available: ask the local model to fill the gaps.
	if ai, err := s.aiParse(ctx, transcript, lang, cats); err == nil && ai.Amount > 0 {
		// Prefer rule-detected values where present (they're deterministic).
		if result.Amount > 0 {
			ai.Amount = result.Amount
		}
		if result.typeDetected {
			ai.Type = result.Type
		}
		if result.CategoryID != 0 {
			ai.CategoryID = result.CategoryID
		}
		if result.Currency != "" {
			ai.Currency = result.Currency
		}
		ai.Transcript = transcript
		return ai.toPublic("ai"), nil
	}

	if result.Amount <= 0 {
		return nil, fmt.Errorf("%w: couldn't detect an amount in \"%s\"", ErrValidation, transcript)
	}
	return result.toPublic("rules"), nil
}

// internal draft carries an extra "typeDetected" flag during parsing.
type voiceDraft struct {
	Type         models.TransactionType
	typeDetected bool
	Amount       float64
	Currency     string
	CategoryID   uint
	Description  string
	Transcript   string
}

func (d voiceDraft) toPublic(source string) *VoiceParseResult {
	t := d.Type
	if t == "" {
		t = models.Expense // most voice entries are expenses
	}
	cur := d.Currency
	if cur == "" {
		cur = BaseCurrency
	}
	return &VoiceParseResult{
		Type:        t,
		Amount:      d.Amount,
		Currency:    cur,
		CategoryID:  d.CategoryID,
		Description: d.Description,
		Source:      source,
		Transcript:  d.Transcript,
	}
}

// ruleParse performs the fast offline extraction.
func (s *VoiceService) ruleParse(transcript string, cats []models.Category) voiceDraft {
	lower := strings.ToLower(transcript)
	var d voiceDraft

	// --- type ---
	if containsAny(lower, expenseKeywords) {
		d.Type, d.typeDetected = models.Expense, true
	}
	if containsAny(lower, incomeKeywords) {
		// "sotib oldim" (bought) contains "oldim"; expense keywords win if both
		// matched, since they are checked with priority below.
		if !d.typeDetected {
			d.Type, d.typeDetected = models.Income, true
		}
	}

	// --- currency ---
	d.Currency = detectCurrency(lower)

	// --- amount ---
	d.Amount = parseAmount(lower)

	// --- category (only ones matching the detected type when known) ---
	d.CategoryID = matchCategory(lower, cats, d.Type, d.typeDetected)

	return d
}

// detectCurrency returns a currency code found in the text, or "" for default.
func detectCurrency(lower string) string {
	switch {
	case strings.Contains(lower, "$") || containsAny(lower, []string{"dollar", "доллар", "usd"}):
		return "USD"
	case strings.Contains(lower, "€") || containsAny(lower, []string{"euro", "евро", "yevro", "eur"}):
		return "EUR"
	case strings.Contains(lower, "₽") || containsAny(lower, []string{"rubl", "рубл", "руб", "rub"}):
		return "RUB"
	case containsAny(lower, []string{"so'm", "so‘m", "som", "sum", "сум", "uzs"}):
		return "UZS"
	}
	return ""
}

// parseAmount extracts the first monetary amount, honoring grouped digits and
// scale words like "ming", "тысяч", "thousand".
func parseAmount(lower string) float64 {
	// Collapse grouped thousands ("50 000" / "50,000" -> "50000"). Apply twice
	// to catch chains like "1 234 567".
	for i := 0; i < 3; i++ {
		lower = groupSpaceRe.ReplaceAllString(lower, "$1$2")
		lower = groupCommaRe.ReplaceAllString(lower, "$1$2")
	}

	loc := numberRe.FindStringIndex(lower)
	if loc == nil {
		return 0
	}
	value, err := strconv.ParseFloat(lower[loc[0]:loc[1]], 64)
	if err != nil {
		return 0
	}

	// Suffix attached directly, e.g. "50k" or "2m".
	rest := lower[loc[1]:]
	if len(rest) > 0 {
		switch rest[0] {
		case 'k':
			return value * 1000
		case 'm':
			// avoid matching "metr" etc.; only bare m or "mln"
			if rest == "m" || strings.HasPrefix(rest, "m ") || strings.HasPrefix(rest, "mln") {
				return value * 1_000_000
			}
		}
	}

	// Following word multiplier, e.g. "50 ming" — only the immediately next word.
	if fields := strings.Fields(rest); len(fields) > 0 {
		w := strings.Trim(fields[0], ".,!?;:")
		if factor, ok := multipliers[w]; ok {
			return value * factor
		}
	}
	return value
}

// matchCategory finds a user category whose name (or a known synonym) appears in
// the text. When a type is known, only categories of that type are considered.
func matchCategory(lower string, cats []models.Category, txType models.TransactionType, typeKnown bool) uint {
	for _, c := range cats {
		if typeKnown && c.Type != txType {
			continue
		}
		name := strings.ToLower(c.Name)
		if strings.Contains(lower, name) {
			return c.ID
		}
		for _, syn := range categorySynonyms[name] {
			if strings.Contains(lower, syn) {
				return c.ID
			}
		}
	}
	return 0
}

// categorySynonyms maps default (English) category names to uz/ru triggers.
var categorySynonyms = map[string][]string{
	"food":             {"oziq", "ovqat", "еда", "продукт", "tushlik", "obed", "lunch", "kafe", "restoran"},
	"transport":        {"transport", "taksi", "taxi", "такси", "yo'l", "benzin", "бензин", "avtobus"},
	"rent":             {"ijara", "аренда", "kvartira", "квартира"},
	"salary":           {"maosh", "зарплата", "oylik"},
	"utilities":        {"kommunal", "коммунал", "svet", "gaz", "suv", "свет", "газ"},
	"product purchase": {"mahsulot", "tovar", "товар", "закуп"},
	"marketing":        {"reklama", "реклама", "marketing"},
	"sales":            {"sotuv", "продажа", "savdo"},
	"service":          {"xizmat", "услуга", "service"},
	"bonus":            {"bonus", "премия", "mukofot"},
}

// aiParse asks the local LLM to extract a structured draft.
func (s *VoiceService) aiParse(ctx context.Context, transcript, lang string, cats []models.Category) (voiceDraft, error) {
	var catList strings.Builder
	for _, c := range cats {
		fmt.Fprintf(&catList, "- id=%d, type=%s, name=%s\n", c.ID, c.Type, c.Name)
	}

	langName := map[string]string{"uz": "Uzbek", "ru": "Russian", "en": "English"}[lang]
	if langName == "" {
		langName = "Uzbek"
	}

	system := "You extract a single personal-finance transaction from a short spoken sentence. " +
		"Respond ONLY with JSON. Amounts are usually in Uzbek so'm (UZS) unless another currency is named."
	prompt := fmt.Sprintf(`Sentence: %q

Categories (pick the best id, or 0):
%s
Return JSON with exactly these keys:
- "type": "income" or "expense"
- "amount": number (no separators)
- "currency": one of "UZS","USD","EUR","RUB"
- "category_id": integer from the list above, or 0
- "description": short text (max 60 chars) in %s describing it

If unsure about type, use "expense". If no amount, use 0.`, transcript, catList.String(), langName)

	raw, err := s.ollama.Generate(ctx, system, prompt, true)
	if err != nil {
		return voiceDraft{}, err
	}

	var parsed struct {
		Type        string  `json:"type"`
		Amount      float64 `json:"amount"`
		Currency    string  `json:"currency"`
		CategoryID  uint    `json:"category_id"`
		Description string  `json:"description"`
	}
	if err := json.Unmarshal([]byte(extractJSONObject(raw)), &parsed); err != nil {
		return voiceDraft{}, err
	}

	d := voiceDraft{
		Amount:      parsed.Amount,
		Currency:    strings.ToUpper(strings.TrimSpace(parsed.Currency)),
		Description: strings.TrimSpace(parsed.Description),
	}
	if strings.EqualFold(parsed.Type, "income") {
		d.Type, d.typeDetected = models.Income, true
	} else {
		d.Type, d.typeDetected = models.Expense, true
	}
	if !IsSupported(d.Currency) {
		d.Currency = ""
	}
	// Only trust a category id the user actually owns.
	if parsed.CategoryID != 0 {
		for _, c := range cats {
			if c.ID == parsed.CategoryID {
				d.CategoryID = parsed.CategoryID
				break
			}
		}
	}
	return d, nil
}

// containsAny reports whether s contains any of the substrings.
func containsAny(s string, subs []string) bool {
	for _, sub := range subs {
		if sub != "" && strings.Contains(s, sub) {
			return true
		}
	}
	return false
}
