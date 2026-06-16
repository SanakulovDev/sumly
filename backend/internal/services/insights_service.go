package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// AdviceResult is the advisor's response.
type AdviceResult struct {
	Advice string `json:"advice"`
	// Generated is true when an LLM produced the text, false for the built-in
	// rule-based fallback.
	Generated bool `json:"generated"`
}

// InsightsService produces short financial advice from the user's recent
// activity. It uses the local LLM when available and otherwise falls back to a
// deterministic, rule-based summary so the feature always returns something.
type InsightsService struct {
	transactions *repositories.TransactionRepository
	ollama       *OllamaService
	// useAI enables the LLM-written advice. When false (the default) the
	// deterministic, always-clear advisor is used.
	useAI bool
}

// NewInsightsService constructs an InsightsService. useAI turns on the LLM path
// (recommended only with a capable multilingual model).
func NewInsightsService(transactions *repositories.TransactionRepository, ollama *OllamaService, useAI bool) *InsightsService {
	return &InsightsService{transactions: transactions, ollama: ollama, useAI: useAI}
}

// AIEnabled reports whether the interactive AI chat is available (i.e. an Ollama
// server is configured). The chat is LLM-only, so it cannot fall back to rules.
func (s *InsightsService) AIEnabled() bool {
	return s.ollama.Enabled()
}

// Ask answers a free-form question from the logged-in user, grounded ONLY in
// that user's own financial data and restricted to finance/Sumly topics. It
// requires the LLM; when Ollama is not configured it returns a validation error.
func (s *InsightsService) Ask(ctx context.Context, userID uint, question, lang string) (string, error) {
	if !s.ollama.Enabled() {
		return "", fmt.Errorf("%w: AI chat needs a local model (set OLLAMA_URL)", ErrValidation)
	}
	question = strings.TrimSpace(question)
	if question == "" {
		return "", fmt.Errorf("%w: question is empty", ErrValidation)
	}

	dataCtx, err := s.financeContext(userID)
	if err != nil {
		return "", err
	}

	langName := map[string]string{"uz": "Uzbek", "ru": "Russian", "en": "English"}[lang]
	if langName == "" {
		langName = "Uzbek"
	}
	// Exact sentence the model must echo for off-topic questions, so a small
	// model refuses cleanly instead of answering then apologizing.
	refusal := map[string]string{
		"uz": "Men faqat moliyangizga oid savollarga javob bera olaman.",
		"ru": "Я могу помочь только с вопросами о ваших финансах.",
		"en": "I can only help with questions about your finances.",
	}[lang]
	if refusal == "" {
		refusal = "Men faqat moliyangizga oid savollarga javob bera olaman."
	}

	// Guardrails: only the logged-in user's own data, finance topics only.
	system := "You are Sumly's personal finance assistant. Sumly tracks income and expenses.\n" +
		"RULES:\n" +
		"1. Use ONLY the FINANCE DATA below; it belongs to the logged-in user. You may calculate from it (daily, monthly, yearly rates).\n" +
		"2. You CAN answer anything about this user's money: balance, income, expenses, savings, budgeting, whether they can afford something, spending habits, projections, or how the Sumly app works.\n" +
		"3. ONLY if the question is clearly unrelated to money or Sumly (for example geography, history, jokes, science, programming, news), do NOT answer it — reply with EXACTLY this sentence and nothing else: \"" + refusal + "\"\n" +
		"4. Never invent numbers not in the data. Be concise. Reply only in " + langName + "."

	prompt := fmt.Sprintf("FINANCE DATA (logged-in user, amounts in so'm / UZS):\n%s\nQuestion: %s", dataCtx, question)

	return s.ollama.Generate(ctx, system, prompt, false)
}

// financeContext builds a compact, factual summary of the user's finances for
// the AI to reason over: today, this month, all-time, category and recurring
// breakdowns, plus daily averages and a yearly projection.
func (s *InsightsService) financeContext(userID uint) (string, error) {
	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, -1)

	all, err := s.transactions.TotalsAll(userID)
	if err != nil {
		return "", err
	}
	todayT, err := s.transactions.TotalsBetween(userID, today, today)
	if err != nil {
		return "", err
	}
	month, err := s.transactions.TotalsBetween(userID, monthStart, monthEnd)
	if err != nil {
		return "", err
	}
	byCat, err := s.transactions.CategoryTotals(userID, models.Expense, monthStart, monthEnd)
	if err != nil {
		return "", err
	}
	byDesc, err := s.transactions.DescriptionTotals(userID, models.Expense, monthStart, monthEnd, 5)
	if err != nil {
		return "", err
	}

	daysElapsed := float64(now.Day())
	avgDailyExpense := month.Expense / daysElapsed
	avgDailyIncome := month.Income / daysElapsed

	var b strings.Builder
	fmt.Fprintf(&b, "- Total balance (all time): %.0f\n", all.Net())
	fmt.Fprintf(&b, "- Today: income %.0f, expense %.0f\n", todayT.Income, todayT.Expense)
	fmt.Fprintf(&b, "- This month (%d days so far): income %.0f, expense %.0f, net savings %.0f\n",
		now.Day(), month.Income, month.Expense, month.Net())
	fmt.Fprintf(&b, "- Average per day this month: income %.0f, expense %.0f\n", avgDailyIncome, avgDailyExpense)
	fmt.Fprintf(&b, "- Projected this year at current rate: net savings %.0f\n", month.Net()*12)
	if len(byCat) > 0 {
		b.WriteString("- Expense categories this month:\n")
		for i, c := range byCat {
			if i >= 6 {
				break
			}
			fmt.Fprintf(&b, "    %s: %.0f\n", c.CategoryName, c.Total)
		}
	}
	if len(byDesc) > 0 {
		b.WriteString("- Recurring expenses (from descriptions):\n")
		for i, d := range byDesc {
			if i >= 5 {
				break
			}
			fmt.Fprintf(&b, "    \"%s\": %.0f (%d times)\n", d.Description, d.Total, d.Count)
		}
	}
	return b.String(), nil
}

// Advice analyzes the current month's income and expenses and returns tips in
// the requested language ("uz", "ru" or "en").
func (s *InsightsService) Advice(ctx context.Context, userID uint, lang string) (*AdviceResult, error) {
	now := time.Now().UTC()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, -1)

	totals, err := s.transactions.TotalsBetween(userID, monthStart, monthEnd)
	if err != nil {
		return nil, err
	}
	expenseByCat, err := s.transactions.CategoryTotals(userID, models.Expense, monthStart, monthEnd)
	if err != nil {
		return nil, err
	}
	// Recurring expenses read from the description text.
	expenseByDesc, err := s.transactions.DescriptionTotals(userID, models.Expense, monthStart, monthEnd, 5)
	if err != nil {
		return nil, err
	}

	// Nothing to analyze yet.
	if totals.Income == 0 && totals.Expense == 0 {
		return &AdviceResult{Advice: noDataAdvice(lang), Generated: false}, nil
	}

	// The deterministic advice already contains every correct figure, clearly
	// worded. It is both our AI input and our fallback.
	base := ruleAdvice(lang, totals, expenseByCat, expenseByDesc)

	// When AI is enabled, let the model re-express the SAME facts more naturally.
	// We give it the finished numbers so it only has to write language, not do
	// math — keeping numbers exact even on a small model.
	if s.useAI && s.ollama.Enabled() {
		if advice, err := s.aiAdvice(ctx, lang, base); err == nil && looksCoherent(advice) {
			return &AdviceResult{Advice: advice, Generated: true}, nil
		}
	}
	return &AdviceResult{Advice: base, Generated: false}, nil
}

// aiAdvice asks the local model to rewrite the (already correct) advice text in
// a warmer, clearer way, preserving every number.
func (s *InsightsService) aiAdvice(ctx context.Context, lang, base string) (string, error) {
	langName := map[string]string{"uz": "Uzbek", "ru": "Russian", "en": "English"}[lang]
	if langName == "" {
		langName = "Uzbek"
	}

	system := "You are Sumly's friendly finance assistant. You will be given a correct financial summary. " +
		"Rewrite it as clear, warm, encouraging advice for the user. " +
		"Keep EVERY number and category name EXACTLY as given — do not change, add, or remove any figure. " +
		"Write only in " + langName + ". Use 3-5 short bullet points, each starting with \"• \". Output only the bullets."
	prompt := "Financial summary to rewrite:\n" + base

	return s.ollama.Generate(ctx, system, prompt, false)
}

// looksCoherent rejects empty, too-short, or obviously broken model output so we
// can fall back to the deterministic text.
func looksCoherent(s string) bool {
	s = strings.TrimSpace(s)
	if len([]rune(s)) < 30 {
		return false
	}
	hasDigit := false
	for _, r := range s {
		if r >= '0' && r <= '9' {
			hasDigit = true
		}
		// Reject stray CJK characters — a tell-tale sign of a small model
		// derailing on non-English prose.
		if r >= 0x3000 && r <= 0x9FFF {
			return false
		}
	}
	return hasDigit
}

// ---- Rule-based fallback (no LLM) ----

func noDataAdvice(lang string) string {
	switch lang {
	case "ru":
		return "Пока нет операций за этот месяц. Добавьте доходы и расходы, чтобы получить советы."
	case "en":
		return "No transactions yet this month. Add some income and expenses to get advice."
	default:
		return "Bu oyda hozircha amallar yo'q. Maslahat olish uchun kirim va chiqim qo'shing."
	}
}

// ruleAdvice builds clear, deterministic tips from the numbers. Every line is
// hand-written per language, so the output is always grammatically correct.
func ruleAdvice(lang string, totals repositories.Totals, byCat []repositories.CategoryBreakdown, byDesc []repositories.DescriptionBreakdown) string {
	var tips []string

	// 1) Income vs expense summary.
	switch lang {
	case "ru":
		tips = append(tips, fmt.Sprintf("За месяц: доход %s, расход %s.", money(totals.Income), money(totals.Expense)))
	case "en":
		tips = append(tips, fmt.Sprintf("This month: income %s, expenses %s.", money(totals.Income), money(totals.Expense)))
	default:
		tips = append(tips, fmt.Sprintf("Bu oy: kirim %s, chiqim %s.", money(totals.Income), money(totals.Expense)))
	}

	// 2) Savings rate / overspending, plus a yearly projection when saving.
	if totals.Income > 0 {
		rate := totals.Net() / totals.Income * 100
		switch {
		case totals.Net() < 0:
			over := money(-totals.Net())
			switch lang {
			case "ru":
				tips = append(tips, fmt.Sprintf("Расходы превышают доход на %s — стоит сократить траты.", over))
			case "en":
				tips = append(tips, fmt.Sprintf("Spending is %s more than income — try to cut back.", over))
			default:
				tips = append(tips, fmt.Sprintf("Chiqim kirimdan %s ko'p — xarajatni kamaytiring.", over))
			}
		default:
			yearly := money(totals.Net() * 12)
			switch lang {
			case "ru":
				tips = append(tips, fmt.Sprintf("Вы сохранили %.0f%% дохода (%s). При таком темпе за год накопите %s.", rate, money(totals.Net()), yearly))
			case "en":
				tips = append(tips, fmt.Sprintf("You saved %.0f%% of income (%s). At this rate that's %s in a year.", rate, money(totals.Net()), yearly))
			default:
				tips = append(tips, fmt.Sprintf("Kirimning %.0f%% ini tejadingiz (%s). Shu sur'atda bir yilda %s jamg'arasiz.", rate, money(totals.Net()), yearly))
			}
		}
	}

	// 3) Top expense categories with their share of total spending.
	if totals.Expense > 0 && len(byCat) > 0 {
		var parts []string
		for i, c := range byCat {
			if i >= 3 || c.Total <= 0 {
				break
			}
			pct := c.Total / totals.Expense * 100
			parts = append(parts, fmt.Sprintf("%s %.0f%%", localizeCategory(c.CategoryName, lang), pct))
		}
		if len(parts) > 0 {
			joined := strings.Join(parts, ", ")
			switch lang {
			case "ru":
				tips = append(tips, fmt.Sprintf("Крупнейшие расходы: %s.", joined))
			case "en":
				tips = append(tips, fmt.Sprintf("Biggest expenses: %s.", joined))
			default:
				tips = append(tips, fmt.Sprintf("Eng katta xarajatlar: %s.", joined))
			}

			// 4) "Earn if you save" — cutting the biggest category 20% projected
			// to a full year, so the benefit is tangible.
			top := localizeCategory(byCat[0].CategoryName, lang)
			topPct := byCat[0].Total / totals.Expense * 100
			if topPct >= 25 {
				saveMonth := byCat[0].Total * 0.20
				saveYear := saveMonth * 12
				switch lang {
				case "ru":
					tips = append(tips, fmt.Sprintf("Сократив «%s» на 20%%, сэкономите %s в месяц — это %s за год.", top, money(saveMonth), money(saveYear)))
				case "en":
					tips = append(tips, fmt.Sprintf("Cut \"%s\" by 20%% to save %s/month — %s a year.", top, money(saveMonth), money(saveYear)))
				default:
					tips = append(tips, fmt.Sprintf("\"%s\" ni 20%% kamaytirsangiz, oyiga %s — yiliga %s tejaysiz.", top, money(saveMonth), money(saveYear)))
				}
			}
		}
	}

	// 5) Recurring item read from transaction descriptions.
	if len(byDesc) > 0 && byDesc[0].Total > 0 {
		d := byDesc[0]
		switch lang {
		case "ru":
			tips = append(tips, fmt.Sprintf("Чаще всего вы тратите на «%s»: %s (%d раз).", d.Description, money(d.Total), d.Count))
		case "en":
			tips = append(tips, fmt.Sprintf("You spend most on \"%s\": %s (%d×).", d.Description, money(d.Total), d.Count))
		default:
			tips = append(tips, fmt.Sprintf("Eng ko'p \"%s\" uchun sarfladingiz: %s (%d marta).", d.Description, money(d.Total), d.Count))
		}
	}

	for i := range tips {
		tips[i] = "• " + tips[i]
	}
	return strings.Join(tips, "\n")
}

// localizeCategory translates the default seeded category names into the chosen
// language. Custom (user-created) names are returned unchanged.
func localizeCategory(name, lang string) string {
	if lang == "en" {
		return name
	}
	m, ok := categoryTranslations[lang]
	if !ok {
		return name
	}
	if t, ok := m[name]; ok {
		return t
	}
	return name
}

// categoryTranslations maps the default English category names to uz/ru.
var categoryTranslations = map[string]map[string]string{
	"uz": {
		"Sales": "Sotuv", "Service": "Xizmat", "Debt Returned": "Qarz qaytdi", "Bonus": "Bonus",
		"Other": "Boshqa", "Food": "Oziq-ovqat", "Transport": "Transport", "Rent": "Ijara",
		"Salary": "Maosh", "Product Purchase": "Mahsulot xaridi", "Utilities": "Kommunal", "Marketing": "Marketing",
	},
	"ru": {
		"Sales": "Продажи", "Service": "Услуги", "Debt Returned": "Возврат долга", "Bonus": "Бонус",
		"Other": "Другое", "Food": "Еда", "Transport": "Транспорт", "Rent": "Аренда",
		"Salary": "Зарплата", "Product Purchase": "Закуп товара", "Utilities": "Коммунальные", "Marketing": "Маркетинг",
	},
}

// money formats a UZS amount with thousands separators and a suffix.
func money(v float64) string {
	s := fmt.Sprintf("%.0f", v)
	// Insert spaces as thousands separators.
	n := len(s)
	if n <= 3 {
		return s + " so'm"
	}
	var b strings.Builder
	pre := n % 3
	if pre > 0 {
		b.WriteString(s[:pre])
	}
	for i := pre; i < n; i += 3 {
		if b.Len() > 0 {
			b.WriteByte(' ')
		}
		b.WriteString(s[i : i+3])
	}
	return b.String() + " so'm"
}
