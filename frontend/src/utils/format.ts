// Formatting helpers shared across pages.

import type { Currency } from '../types';

// Formats an amount in the given currency (defaults to so'm, the base currency).
// So'm uses a grouped number with a "so'm" suffix; foreign currencies use their
// standard symbol via Intl with 2 decimals.
export function formatMoney(amount: number, currency: Currency = 'UZS'): string {
  if (currency === 'UZS') {
    const formatted = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 2 }).format(amount);
    return `${formatted} so'm`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Formats an amount compactly for quick-entry chips: thousands as "k",
// millions as "mln" (e.g. 50000 -> "50k", 1500000 -> "1.5 mln").
export function formatAmountShort(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)} mln`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return String(amount);
}

/**
 * Get the current local date in `YYYY-MM-DD` format.
 *
 * @returns The current date as a string formatted `YYYY-MM-DD`.
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get yesterday's date in YYYY-MM-DD format.
 *
 * @returns The ISO date string for yesterday in `YYYY-MM-DD` form.
 */
export function yesterdayISO(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Get the current month in `YYYY-MM` format.
 *
 * @returns The current month as `YYYY-MM` (year and two-digit month)
 */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// Formats an ISO date string as a short, readable date.
export function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
