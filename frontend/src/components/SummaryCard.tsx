import { formatMoney } from '../utils/format';

interface SummaryCardProps {
  label: string;
  amount: number;
  // Visual accent hints at the meaning of the figure.
  tone?: 'neutral' | 'income' | 'expense' | 'net';
}

const toneClasses: Record<NonNullable<SummaryCardProps['tone']>, string> = {
  neutral: 'text-gray-900 dark:text-gray-100',
  income: 'text-brand-600 dark:text-brand-400',
  expense: 'text-red-600 dark:text-red-400',
  net: 'text-gray-900 dark:text-gray-100',
};

// A single dashboard metric card.
export function SummaryCard({ label, amount, tone = 'neutral' }: SummaryCardProps) {
  // Net figures are colored by sign for an at-a-glance read.
  const netTone = amount >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400';
  const valueClass = tone === 'net' ? netTone : toneClasses[tone];

  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${valueClass}`}>{formatMoney(amount)}</p>
    </div>
  );
}
