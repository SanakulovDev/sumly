package services

import (
	"bytes"
	"fmt"
	"time"

	"github.com/sumly/backend/internal/models"
	"github.com/sumly/backend/internal/repositories"
	"github.com/xuri/excelize/v2"
)

// ExportService builds Excel (.xlsx) files for transactions and reports. It
// reuses the existing repositories so export logic stays in the business layer
// and handlers only stream the resulting bytes.
type ExportService struct {
	transactions *repositories.TransactionRepository
}

// NewExportService constructs an ExportService.
func NewExportService(transactions *repositories.TransactionRepository) *ExportService {
	return &ExportService{transactions: transactions}
}

// transactionColumns is the shared header row for transaction sheets.
var transactionColumns = []string{
	"Date", "Type", "Category", "Payment Method", "Card Last 4", "Amount", "Description",
}

// TransactionsXLSX returns an .xlsx file of all transactions matching the
// filter (pagination is ignored — the full filtered set is exported).
func (s *ExportService) TransactionsXLSX(userID uint, f repositories.TransactionFilter) ([]byte, error) {
	txs, err := s.transactions.ListAll(userID, f)
	if err != nil {
		return nil, err
	}

	file := excelize.NewFile()
	defer file.Close()

	const sheet = "Transactions"
	file.SetSheetName(file.GetSheetName(0), sheet)
	s.writeTransactionSheet(file, sheet, txs)

	return toBytes(file)
}

// MonthlyXLSX returns an .xlsx workbook for a month with three sheets:
// Summary (income/expense/net), Daily breakdown, and the month's Transactions.
func (s *ExportService) MonthlyXLSX(userID uint, month time.Time) ([]byte, error) {
	monthStart := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, -1)

	totals, err := s.transactions.TotalsBetween(userID, monthStart, monthEnd)
	if err != nil {
		return nil, err
	}
	txs, err := s.transactions.ListAll(userID, repositories.TransactionFilter{
		DateFrom: &monthStart,
		DateTo:   &monthEnd,
	})
	if err != nil {
		return nil, err
	}

	file := excelize.NewFile()
	defer file.Close()

	// --- Summary sheet ---
	const summary = "Summary"
	file.SetSheetName(file.GetSheetName(0), summary)
	bold, _ := file.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true}})
	file.SetCellStyle(summary, "A1", "A4", bold)
	file.SetColWidth(summary, "A", "A", 18)
	file.SetColWidth(summary, "B", "B", 18)
	file.SetCellValue(summary, "A1", "Month")
	file.SetCellValue(summary, "B1", monthStart.Format("2006-01"))
	file.SetCellValue(summary, "A2", "Income")
	file.SetCellValue(summary, "B2", totals.Income)
	file.SetCellValue(summary, "A3", "Expense")
	file.SetCellValue(summary, "B3", totals.Expense)
	file.SetCellValue(summary, "A4", "Net")
	file.SetCellValue(summary, "B4", totals.Net())

	// --- Daily breakdown sheet ---
	daily, _ := file.NewSheet("Daily")
	file.SetSheetRow("Daily", "A1", &[]string{"Date", "Income", "Expense", "Net"})
	headerStyle, _ := file.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true}})
	file.SetCellStyle("Daily", "A1", "D1", headerStyle)
	file.SetColWidth("Daily", "A", "D", 16)
	rowIdx := 2
	for d := monthStart; !d.After(monthEnd); d = d.AddDate(0, 0, 1) {
		dayTotals, err := s.transactions.TotalsBetween(userID, d, d)
		if err != nil {
			return nil, err
		}
		if dayTotals.Income == 0 && dayTotals.Expense == 0 {
			continue
		}
		file.SetSheetRow("Daily", fmt.Sprintf("A%d", rowIdx), &[]interface{}{
			d.Format("2006-01-02"), dayTotals.Income, dayTotals.Expense, dayTotals.Net(),
		})
		rowIdx++
	}

	// --- Transactions sheet ---
	file.NewSheet("Transactions")
	s.writeTransactionSheet(file, "Transactions", txs)

	// Open the workbook on the Summary sheet.
	_ = daily
	file.SetActiveSheet(0)

	return toBytes(file)
}

// writeTransactionSheet renders a header row plus one row per transaction.
func (s *ExportService) writeTransactionSheet(file *excelize.File, sheet string, txs []models.Transaction) {
	headerStyle, _ := file.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"059669"}, Pattern: 1},
	})

	header := make([]interface{}, len(transactionColumns))
	for i, c := range transactionColumns {
		header[i] = c
	}
	file.SetSheetRow(sheet, "A1", &header)
	file.SetCellStyle(sheet, "A1", "G1", headerStyle)
	file.SetColWidth(sheet, "A", "G", 16)
	file.SetColWidth(sheet, "G", "G", 30)

	for i, tx := range txs {
		row := i + 2
		categoryName := ""
		if tx.Category != nil {
			categoryName = tx.Category.Name
		}
		paymentName := ""
		if tx.PaymentMethod != nil {
			paymentName = tx.PaymentMethod.Name
		}
		file.SetSheetRow(sheet, fmt.Sprintf("A%d", row), &[]interface{}{
			tx.TransactionDate.Format("2006-01-02"),
			string(tx.Type),
			categoryName,
			paymentName,
			tx.CardLast4,
			tx.Amount,
			tx.Description,
		})
	}
}

// toBytes serializes the workbook into a byte slice.
func toBytes(file *excelize.File) ([]byte, error) {
	var buf bytes.Buffer
	if err := file.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
