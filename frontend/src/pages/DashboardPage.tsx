import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import { transactionsApi } from '../api/transactions';
import { getErrorMessage } from '../api/client';
import type { DashboardSummary, Transaction } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { PageLoader } from '../components/Spinner';
import { TransactionRow } from '../components/TransactionRow';
import { useT } from '../i18n/useT';

export function DashboardPage() {
  const { t } = useT();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Load the summary and the latest few transactions in parallel.
        const [dashboard, txs] = await Promise.all([
          reportsApi.dashboard(),
          transactionsApi.list({ page: 1, page_size: 5 }),
        ]);
        if (!active) return;
        setSummary(dashboard);
        setRecent(txs.items);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <Link to="/transactions/new" className="btn-primary hidden sm:inline-flex">
          {t('dashboard.addTransaction')}
        </Link>
      </div>

      {/* Total balance highlighted on its own. */}
      <SummaryCard label={t('dashboard.totalBalance')} amount={summary.total_balance} tone="net" />

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.today')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label={t('common.income')} amount={summary.today.income} tone="income" />
          <SummaryCard label={t('common.expense')} amount={summary.today.expense} tone="expense" />
          <SummaryCard label={t('common.netProfit')} amount={summary.today.net} tone="net" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.thisMonth')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label={t('common.income')} amount={summary.month.income} tone="income" />
          <SummaryCard label={t('common.expense')} amount={summary.month.expense} tone="expense" />
          <SummaryCard label={t('common.netProfit')} amount={summary.month.net} tone="net" />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.recentTransactions')}</h2>
          <Link to="/transactions" className="text-sm font-medium text-brand-600 hover:underline">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card text-center text-sm text-gray-500">
            {t('dashboard.noTransactions')}{' '}
            <Link to="/transactions/new" className="text-brand-600 hover:underline">{t('dashboard.addFirst')}</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
