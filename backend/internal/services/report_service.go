package services

import (
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
)

// PeriodSummary captures income, expense and net for a period.
type PeriodSummary struct {
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
	Net     float64 `json:"net"`
}

// DashboardSummary is the payload for the dashboard endpoint.
type DashboardSummary struct {
	TotalBalance float64       `json:"total_balance"`
	Today        PeriodSummary `json:"today"`
	Month        PeriodSummary `json:"month"`
}

// DailyReport is the payload for the daily report endpoint.
type DailyReport struct {
	Date         string                `json:"date"`
	Summary      PeriodSummary         `json:"summary"`
	Transactions []models.Transaction  `json:"transactions"`
}

// MonthlyReport is the payload for the monthly report endpoint.
type MonthlyReport struct {
	Month   string          `json:"month"`
	Summary PeriodSummary   `json:"summary"`
	Days    []DailyBreakdown `json:"days"`
}

// DailyBreakdown is a single day's totals within a monthly report.
type DailyBreakdown struct {
	Date    string        `json:"date"`
	Summary PeriodSummary `json:"summary"`
}

// ReportService computes dashboard and report aggregates.
type ReportService struct {
	transactions *repositories.TransactionRepository
}

// NewReportService constructs a ReportService.
func NewReportService(transactions *repositories.TransactionRepository) *ReportService {
	return &ReportService{transactions: transactions}
}

// Dashboard computes the running balance plus today's and this month's totals.
// Dates are evaluated in UTC, matching how transaction dates are stored.
func (s *ReportService) Dashboard(userID uint) (*DashboardSummary, error) {
	now := time.Now().UTC()
	today := truncateToDay(now)
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, -1)

	allTotals, err := s.transactions.TotalsAll(userID)
	if err != nil {
		return nil, err
	}
	todayTotals, err := s.transactions.TotalsBetween(userID, today, today)
	if err != nil {
		return nil, err
	}
	monthTotals, err := s.transactions.TotalsBetween(userID, monthStart, monthEnd)
	if err != nil {
		return nil, err
	}

	return &DashboardSummary{
		TotalBalance: allTotals.Net(),
		Today:        toPeriodSummary(todayTotals),
		Month:        toPeriodSummary(monthTotals),
	}, nil
}

// Daily computes the summary and lists transactions for a single day.
func (s *ReportService) Daily(userID uint, date time.Time) (*DailyReport, error) {
	day := truncateToDay(date)

	totals, err := s.transactions.TotalsBetween(userID, day, day)
	if err != nil {
		return nil, err
	}

	// Fetch the day's transactions (single day fits comfortably in one page).
	list, _, err := s.transactions.List(userID, repositories.TransactionFilter{
		DateFrom: &day,
		DateTo:   &day,
		Page:     1,
		PageSize: 100,
	})
	if err != nil {
		return nil, err
	}

	return &DailyReport{
		Date:         day.Format("2006-01-02"),
		Summary:      toPeriodSummary(totals),
		Transactions: list,
	}, nil
}

// Monthly computes the summary for a month plus a per-day breakdown.
func (s *ReportService) Monthly(userID uint, month time.Time) (*MonthlyReport, error) {
	monthStart := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, -1)

	totals, err := s.transactions.TotalsBetween(userID, monthStart, monthEnd)
	if err != nil {
		return nil, err
	}

	// Build a per-day breakdown by querying each day. For a month this is at
	// most 31 cheap aggregate queries; acceptable for the MVP and easy to
	// replace with a single grouped query later if needed.
	var days []DailyBreakdown
	for d := monthStart; !d.After(monthEnd); d = d.AddDate(0, 0, 1) {
		dayTotals, err := s.transactions.TotalsBetween(userID, d, d)
		if err != nil {
			return nil, err
		}
		// Only include days that had activity to keep the response compact.
		if dayTotals.Income == 0 && dayTotals.Expense == 0 {
			continue
		}
		days = append(days, DailyBreakdown{
			Date:    d.Format("2006-01-02"),
			Summary: toPeriodSummary(dayTotals),
		})
	}

	return &MonthlyReport{
		Month:   monthStart.Format("2006-01"),
		Summary: toPeriodSummary(totals),
		Days:    days,
	}, nil
}

// toPeriodSummary converts repository Totals into the API-facing summary.
func toPeriodSummary(t repositories.Totals) PeriodSummary {
	return PeriodSummary{Income: t.Income, Expense: t.Expense, Net: t.Net()}
}

// truncateToDay zeroes the time-of-day, keeping the date in UTC.
func truncateToDay(t time.Time) time.Time {
	t = t.UTC()
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}
