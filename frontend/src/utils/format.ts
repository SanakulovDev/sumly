// Formatting helpers shared across pages.

// Formats an amount as Uzbek so'm. Sumly targets the Uzbek market, so amounts
// are whole-so'm with thousands separators and a "so'm" suffix.
export function formatMoney(amount: number): string {
  const formatted = new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} so'm`;
}

// Returns today's date as YYYY-MM-DD (local), used as a default form value.
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Returns yesterday's date as YYYY-MM-DD, used by the quick date chips.
export function yesterdayISO(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Returns the current month as YYYY-MM.
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
