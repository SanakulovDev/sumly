import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import { transactionsApi } from '../api/transactions';
import { getErrorMessage } from '../api/client';
import type { DashboardSummary, Transaction } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { PageLoader } from '../components/Spinner';
import { TransactionRow } from '../components/TransactionRow';
import { ArrowDownIcon, ArrowUpIcon } from '../components/icons';
import { VoiceButton } from '../components/VoiceButton';
import { AdviceCard } from '../components/AdviceCard';
import { formatMoney } from '../utils/format';
import { useT } from '../i18n/useT';

/**
 * Renders the dashboard page with the account total, summary cards, and recent transactions.
 *
 * Fetches the dashboard summary and the latest transactions on mount and displays a loader,
 * error message, or the full dashboard UI (hero total balance with quick actions, today and
 * month summaries, and a recent transactions list).
 *
 * @returns The dashboard page JSX element showing loader, error, or the dashboard UI.
 */
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">{t('dashboard.title')}</h1>
        <Link to="/transactions/new" className="btn-primary hidden sm:inline-flex">
          {t('dashboard.addTransaction')}
        </Link>
      </div>

      {/* Hero: total balance + one-tap income/expense entry. */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lifted">
        <p className="text-sm font-medium text-white/75">{t('dashboard.totalBalance')}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">
          {formatMoney(summary.total_balance)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/transactions/new?type=income"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25 active:scale-[0.98]"
          >
            <ArrowUpIcon className="h-4 w-4" />
            {t('common.income')}
          </Link>
          <Link
            to="/transactions/new?type=expense"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25 active:scale-[0.98]"
          >
            <ArrowDownIcon className="h-4 w-4" />
            {t('common.expense')}
          </Link>
        </div>
      </div>

      {/* Voice entry — speak a transaction and confirm it on the next screen. */}
      <VoiceButton className="w-full justify-center py-3 text-base" />

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('dashboard.today')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <SummaryCard label={t('common.income')} amount={summary.today.income} tone="income" />
          <SummaryCard label={t('common.expense')} amount={summary.today.expense} tone="expense" />
          <div className="col-span-2 sm:col-span-1">
            <SummaryCard label={t('common.netProfit')} amount={summary.today.net} tone="net" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('dashboard.thisMonth')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <SummaryCard label={t('common.income')} amount={summary.month.income} tone="income" />
          <SummaryCard label={t('common.expense')} amount={summary.month.expense} tone="expense" />
          <div className="col-span-2 sm:col-span-1">
            <SummaryCard label={t('common.netProfit')} amount={summary.month.net} tone="net" />
          </div>
        </div>
      </section>

      {/* AI financial advisor (local Qwen, with a rule-based fallback). */}
      <AdviceCard />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('dashboard.recentTransactions')}</h2>
          <Link to="/transactions" className="text-sm font-semibold text-brand-600 hover:underline">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">
            {t('dashboard.noTransactions')}{' '}
            <Link to="/transactions/new" className="text-brand-600 hover:underline">{t('dashboard.addFirst')}</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
