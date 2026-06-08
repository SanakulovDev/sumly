import { Link } from 'react-router-dom';
import type { Transaction } from '../types';
import { formatMoney, formatDate } from '../utils/format';

interface TransactionRowProps {
  tx: Transaction;
  // When provided, edit/delete actions are shown (used on the Transactions page).
  onDelete?: (tx: Transaction) => void;
}

// A single transaction line: category, payment method, date, and a signed,
// color-coded amount. Optionally renders edit/delete actions.
export function TransactionRow({ tx, onDelete }: TransactionRowProps) {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          {tx.category?.name || 'Uncategorized'}
        </p>
        <p className="truncate text-xs text-gray-500">
          {formatDate(tx.transaction_date)} · {tx.payment_method?.name || '—'}
          {tx.description ? ` · ${tx.description}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`whitespace-nowrap text-sm font-semibold ${isIncome ? 'text-brand-600' : 'text-red-600'}`}>
          {isIncome ? '+' : '−'}
          {formatMoney(tx.amount)}
        </span>
        {onDelete && (
          <div className="flex items-center gap-1">
            <Link
              to={`/transactions/${tx.id}/edit`}
              className="rounded p-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(tx)}
              className="rounded p-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
