import { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports';
import { getErrorMessage } from '../api/client';
import type { DailyReport, MonthlyReport } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionRow } from '../components/TransactionRow';
import { Spinner } from '../components/Spinner';
import { currentMonth, formatDate, formatMoney, todayISO } from '../utils/format';

type Tab = 'daily' | 'monthly';

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>('daily');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <TabButton active={tab === 'daily'} onClick={() => setTab('daily')}>Daily</TabButton>
        <TabButton active={tab === 'monthly'} onClick={() => setTab('monthly')}>Monthly</TabButton>
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
        <label className="label">Select day</label>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="h-8 w-8" /></div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label="Income" amount={report.summary.income} tone="income" />
            <SummaryCard label="Expense" amount={report.summary.expense} tone="expense" />
            <SummaryCard label="Net profit" amount={report.summary.net} tone="net" />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Transactions on {formatDate(report.date)}
            </h2>
            {report.transactions.length === 0 ? (
              <div className="card text-center text-sm text-gray-500">No transactions on this day.</div>
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
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-4">
      <div className="card sm:w-64">
        <label className="label">Select month</label>
        <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="h-8 w-8" /></div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label="Income" amount={report.summary.income} tone="income" />
            <SummaryCard label="Expense" amount={report.summary.expense} tone="expense" />
            <SummaryCard label="Net profit" amount={report.summary.net} tone="net" />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Daily breakdown
            </h2>
            {report.days.length === 0 ? (
              <div className="card text-center text-sm text-gray-500">No activity this month.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 text-right font-medium">Income</th>
                      <th className="px-4 py-2 text-right font-medium">Expense</th>
                      <th className="px-4 py-2 text-right font-medium">Net</th>
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
