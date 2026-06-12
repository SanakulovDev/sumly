import { Link } from 'react-router-dom';
import type { Transaction } from '../types';
import { formatMoney, formatDate } from '../utils/format';
import { useT } from '../i18n/useT';
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from './icons';

interface TransactionRowProps {
  tx: Transaction;
  // When provided, edit/delete actions are shown (used on the Transactions page).
  onDelete?: (tx: Transaction) => void;
}

// A single transaction line: a direction badge, category, payment method (with
/**
 * Render a single transaction row showing direction, category, payment method (with optional card last‑4), date, optional description, a signed color-coded amount, and optional edit/delete actions.
 *
 * @param tx - The transaction to display
 * @param onDelete - Optional callback invoked with `tx` when the delete action is triggered; when provided, edit and delete controls are shown
 * @returns A JSX element representing the transaction row
 */
export function TransactionRow({ tx, onDelete }: TransactionRowProps) {
  const { t, tCategory, tPayment } = useT();
  const isIncome = tx.type === 'income';

  // Render payment as "Card ••4242" when the transaction carries card digits.
  const paymentLabel = tx.payment_method
    ? tPayment(tx.payment_method.name) + (tx.card_last4 ? ` ••${tx.card_last4}` : '')
    : '—';

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isIncome ? 'bg-brand-100 text-brand-700' : 'bg-rose-100 text-rose-600'
          }`}
        >
          {isIncome ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {tx.category ? tCategory(tx.category.name) : '—'}
          </p>
          <p className="truncate text-xs text-slate-500">
            {formatDate(tx.transaction_date)} · {paymentLabel}
            {tx.description ? ` · ${tx.description}` : ''}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`whitespace-nowrap text-sm font-bold ${isIncome ? 'text-brand-600' : 'text-rose-600'}`}>
          {isIncome ? '+' : '−'}
          {formatMoney(tx.amount)}
        </span>
        {onDelete && (
          <div className="flex items-center">
            <Link
              to={`/transactions/${tx.id}/edit`}
              aria-label={t('common.edit')}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(tx)}
              aria-label={t('common.delete')}
              className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
