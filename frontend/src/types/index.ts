// Shared domain types mirroring the backend API responses.

export type TransactionType = 'income' | 'expense';

// Currencies a transaction can be recorded in. UZS (so'm) is the base currency
// that balances and reports are consolidated into.
export type Currency = 'UZS' | 'USD' | 'EUR' | 'RUB';

export const CURRENCIES: Currency[] = ['UZS', 'USD', 'EUR', 'RUB'];

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: TransactionType;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  user_id: number;
  name: string;
  // Card methods prompt for the card's last 4 digits on each transaction.
  is_card: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: TransactionType;
  amount: number;
  currency: Currency;
  amount_base: number;
  category_id: number;
  payment_method_id: number;
  description: string;
  card_last4: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  payment_method?: PaymentMethod;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PeriodSummary {
  income: number;
  expense: number;
  net: number;
}

export interface DashboardSummary {
  total_balance: number;
  today: PeriodSummary;
  month: PeriodSummary;
}

export interface DailyReport {
  date: string;
  summary: PeriodSummary;
  transactions: Transaction[];
}

export interface MonthlyReport {
  month: string;
  summary: PeriodSummary;
  days: { date: string; summary: PeriodSummary }[];
}

// Payloads sent to the API.
export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  currency: Currency;
  category_id: number;
  payment_method_id: number;
  description: string;
  card_last4?: string;
  transaction_date: string;
}

// Response of GET /api/currency/rates: "base per 1 unit" for each currency.
export interface CurrencyRates {
  base: Currency;
  currencies: Currency[];
  rates: Record<Currency, number>;
}

// Result of parsing a spoken sentence into a transaction draft.
export interface VoiceParseResult {
  type: TransactionType;
  amount: number;
  currency: Currency;
  category_id: number;
  description: string;
  source: 'rules' | 'ai';
  transcript: string;
}

// Result of the AI financial advisor.
export interface AdviceResult {
  advice: string;
  generated: boolean;
}

export interface TransactionFilters {
  type?: TransactionType | '';
  category_id?: number | '';
  payment_method_id?: number | '';
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
