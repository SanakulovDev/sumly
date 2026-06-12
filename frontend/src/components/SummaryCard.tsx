import { formatMoney } from '../utils/format';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from './icons';

interface SummaryCardProps {
  label: string;
  amount: number;
  // Visual accent hints at the meaning of the figure.
  tone?: 'neutral' | 'income' | 'expense' | 'net';
}

// Per-tone styling: value color plus a tinted icon chip for an instant read.
const tones = {
  neutral: { value: 'text-slate-900', chip: 'bg-slate-100 text-slate-600', Icon: WalletIcon },
  income: { value: 'text-brand-600', chip: 'bg-brand-100 text-brand-700', Icon: ArrowUpIcon },
  expense: { value: 'text-rose-600', chip: 'bg-rose-100 text-rose-600', Icon: ArrowDownIcon },
  net: { value: 'text-slate-900', chip: 'bg-slate-100 text-slate-600', Icon: WalletIcon },
} as const;

/**
 * Render a compact dashboard metric card that displays a label, a tone-specific icon chip, and a formatted monetary amount.
 *
 * @param label - Short label displayed above the amount
 * @param amount - Numeric value to format and display; used to determine sign-based coloring when `tone` is `"net"`
 * @param tone - Visual tone for the card; one of `"neutral" | "income" | "expense" | "net"` (defaults to `"neutral"`)
 * @returns A JSX element representing the metric card
 */
export function SummaryCard({ label, amount, tone = 'neutral' }: SummaryCardProps) {
  const { chip, Icon } = tones[tone];
  // Net figures are colored by sign for an at-a-glance read.
  const valueClass =
    tone === 'net' ? (amount >= 0 ? 'text-brand-600' : 'text-rose-600') : tones[tone].value;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${chip}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className={`mt-2.5 truncate text-base font-bold sm:text-lg ${valueClass}`}>
        {formatMoney(amount)}
      </p>
    </div>
  );
}
