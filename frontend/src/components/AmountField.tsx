import { useEffect, useState } from 'react';
import type { Currency, CurrencyRates, TransactionType } from '../types';
import { CURRENCIES } from '../types';
import { transactionsApi } from '../api/transactions';
import { currencyApi } from '../api/currency';
import { formatMoney, formatAmountShort } from '../utils/format';
import { useT } from '../i18n/useT';

interface AmountFieldProps {
  amount: string;
  setAmount: (value: string) => void;
  type: TransactionType;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

// Preset quick amounts tuned per currency (so'm uses larger round numbers).
const PRESETS: Record<Currency, number[]> = {
  UZS: [5000, 10000, 20000, 50000, 100000, 500000],
  USD: [5, 10, 20, 50, 100, 500],
  EUR: [5, 10, 20, 50, 100, 500],
  RUB: [100, 500, 1000, 2000, 5000, 10000],
};

// A rich amount input: currency selector, a big live preview (with conversion to
// so'm when foreign), the numeric field, and quick-tap chips combining presets
// with the user's most-used amounts for that currency.
export function AmountField({ amount, setAmount, type, currency, setCurrency }: AmountFieldProps) {
  const { t } = useT();
  const [frequent, setFrequent] = useState<number[]>([]);
  const [rates, setRates] = useState<CurrencyRates | null>(null);

  // Load exchange rates once (for the live "≈ so'm" preview).
  useEffect(() => {
    let active = true;
    currencyApi
      .rates()
      .then((r) => active && setRates(r))
      .catch(() => active && setRates(null));
    return () => {
      active = false;
    };
  }, []);

  // Load the user's most-used amounts for this type + currency.
  useEffect(() => {
    let active = true;
    transactionsApi
      .topAmounts(type, currency)
      .then((amounts) => active && setFrequent(amounts))
      .catch(() => active && setFrequent([]));
    return () => {
      active = false;
    };
  }, [type, currency]);

  const numeric = Number(amount) || 0;
  const isIncome = type === 'income';

  // Converted value in the base currency (so'm), shown for foreign currencies.
  const baseValue = rates ? numeric * (rates.rates[currency] ?? 1) : null;
  const showConversion = currency !== 'UZS' && baseValue !== null;

  // Merge presets with the user's frequent amounts, de-duplicated, capped at 8.
  const chips = Array.from(new Set([...frequent, ...PRESETS[currency]]))
    .filter((n) => n > 0)
    .sort((a, b) => a - b)
    .slice(0, 8);

  return (
    <div>
      {/* Currency selector */}
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{t('common.amount')}</label>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                currency === c
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Big live preview — makes entry feel tangible and "real". */}
      <div
        className={`mb-3 rounded-xl border p-4 text-center transition-colors ${
          isIncome
            ? 'border-brand-200 bg-brand-50 dark:border-brand-600/40 dark:bg-brand-600/10'
            : 'border-red-200 bg-red-50 dark:border-red-600/40 dark:bg-red-600/10'
        }`}
      >
        <span
          className={`text-3xl font-extrabold tracking-tight ${
            isIncome ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isIncome ? '+' : '−'} {formatMoney(numeric, currency)}
        </span>
        {showConversion && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ≈ {formatMoney(baseValue!, 'UZS')}
          </p>
        )}
      </div>

      <input
        id="amount"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        className="input text-lg"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        placeholder="0"
      />

      {/* Quick-amount chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((value) => {
          const active = numeric === value;
          const isFrequent = frequent.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(value))}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-95 ${
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-brand-500'
              }`}
            >
              {isFrequent && <span className="mr-1 text-amber-400">★</span>}
              {formatAmountShort(value)}
            </button>
          );
        })}
        {numeric > 0 && (
          <button
            type="button"
            onClick={() => setAmount('')}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {t('form.clear')}
          </button>
        )}
      </div>
    </div>
  );
}
