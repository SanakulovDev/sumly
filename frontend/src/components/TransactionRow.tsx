import { Link } from 'react-router-dom';
import type { Transaction } from '../types';
import { formatMoney, formatDate } from '../utils/format';
import { useT } from '../i18n/useT';

interface TransactionRowProps {
  tx: Transaction;
  // When provided, edit/delete actions are shown (used on the Transactions page).
  onDelete?: (tx: Transaction) => void;
}

// A single transaction line: category, payment method (with card last-4 when
// present), date, and a signed, color-coded amount. Names are localized.
export function TransactionRow({ tx, onDelete }: TransactionRowProps) {
  const { t, tCategory, tPayment } = useT();
  const isIncome = tx.type === 'income';

  // Render payment as "Card ••4242" when the transaction carries card digits.
  const paymentLabel = tx.payment_method
    ? tPayment(tx.payment_method.name) + (tx.card_last4 ? ` ••${tx.card_last4}` : '')
    : '—';

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {tx.category ? tCategory(tx.category.name) : '—'}
        </p>
        <p className="truncate text-xs text-gray-500">
          {formatDate(tx.transaction_date)} · {paymentLabel}
          {tx.description ? ` · ${tx.description}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-right">
          <span className={`block text-sm font-semibold ${isIncome ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}>
            {isIncome ? '+' : '−'}
            {formatMoney(tx.amount, tx.currency)}
          </span>
          {/* Show the so'm equivalent for foreign-currency transactions. */}
          {tx.currency !== 'UZS' && (
            <span className="block text-xs text-gray-400 dark:text-gray-500">
              ≈ {formatMoney(tx.amount_base, 'UZS')}
            </span>
          )}
        </span>
        {onDelete && (
          <div className="flex items-center gap-1">
            <Link
              to={`/transactions/${tx.id}/edit`}
              className="rounded p-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              {t('common.edit')}
            </Link>
            <button
              onClick={() => onDelete(tx)}
              className="rounded p-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
