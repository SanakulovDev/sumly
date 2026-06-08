import { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports';
import { exportsApi } from '../api/exports';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type { DailyReport, MonthlyReport } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionRow } from '../components/TransactionRow';
import { Spinner } from '../components/Spinner';
import { currentMonth, formatDate, formatMoney, todayISO } from '../utils/format';
import { useT } from '../i18n/useT';

type Tab = 'daily' | 'monthly';

export function ReportsPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('daily');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>

      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <TabButton active={tab === 'daily'} onClick={() => setTab('daily')}>{t('reports.daily')}</TabButton>
        <TabButton active={tab === 'monthly'} onClick={() => setTab('monthly')}>{t('reports.monthly')}</TabButton>
      </div>

      {tab === 'daily' ? <DailyReportView /> : <MonthlyReportView />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function DailyReportView() {
  const { t } = useT();
  const [date, setDate] = useState(todayISO());
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    reportsApi
      .daily(date)
      .then((r) => active && setReport(r))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [date]);

  return (
    <div className="space-y-4">
      <div className="card sm:w-64">
        <label className="label">{t('reports.selectDay')}</label>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="h-8 w-8" /></div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label={t('common.income')} amount={report.summary.income} tone="income" />
            <SummaryCard label={t('common.expense')} amount={report.summary.expense} tone="expense" />
            <SummaryCard label={t('common.netProfit')} amount={report.summary.net} tone="net" />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {t('reports.transactionsOn', { date: formatDate(report.date) })}
            </h2>
            {report.transactions.length === 0 ? (
              <div className="card text-center text-sm text-gray-500">{t('reports.noTransactionsDay')}</div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {report.transactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MonthlyReportView() {
  const { t } = useT();
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    reportsApi
      .monthly(month)
      .then((r) => active && setReport(r))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [month]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportsApi.monthly(month);
      toast.success(t('transactions.exported'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="card sm:w-64">
          <label className="label">{t('reports.selectMonth')}</label>
          <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? t('transactions.exporting') : t('reports.exportExcel')}
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="h-8 w-8" /></div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label={t('common.income')} amount={report.summary.income} tone="income" />
            <SummaryCard label={t('common.expense')} amount={report.summary.expense} tone="expense" />
            <SummaryCard label={t('common.netProfit')} amount={report.summary.net} tone="net" />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {t('reports.dailyBreakdown')}
            </h2>
            {report.days.length === 0 ? (
              <div className="card text-center text-sm text-gray-500">{t('reports.noActivity')}</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">{t('common.date')}</th>
                      <th className="px-4 py-2 text-right font-medium">{t('common.income')}</th>
                      <th className="px-4 py-2 text-right font-medium">{t('common.expense')}</th>
                      <th className="px-4 py-2 text-right font-medium">{t('common.net')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.days.map((d) => (
                      <tr key={d.date}>
                        <td className="px-4 py-2 text-gray-700">{formatDate(d.date)}</td>
                        <td className="px-4 py-2 text-right text-brand-600">{formatMoney(d.summary.income)}</td>
                        <td className="px-4 py-2 text-right text-red-600">{formatMoney(d.summary.expense)}</td>
                        <td className={`px-4 py-2 text-right font-medium ${d.summary.net >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                          {formatMoney(d.summary.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
