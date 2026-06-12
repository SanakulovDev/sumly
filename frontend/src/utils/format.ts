// Formatting helpers shared across pages.

// Formats an amount as Uzbek so'm. Sumly targets the Uzbek market, so amounts
// are whole-so'm with thousands separators and a "so'm" suffix.
export function formatMoney(amount: number): string {
  const formatted = new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} so'm`;
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
