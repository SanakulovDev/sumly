import { useState, type KeyboardEvent } from 'react';
import type { LandingCopy } from '../../i18n/landing';
import { useInView } from './useReveal';
import { formatSom, useCountUp } from './useCountUp';

type TabKey = 'dashboard' | 'add' | 'receipt';
const TABS: TabKey[] = ['dashboard', 'add', 'receipt'];

// Illustrative figures — kept out of the i18n copy because they're numeric and
// universal. The bar heights are percentages of the chart area.
const BALANCE = 2_450_000;
const BAR_HEIGHTS = [42, 64, 50, 82, 58, 96, 72];
const ADD_AMOUNT = '85 000';

/**
 * The hero centerpiece: a glass "app window" with three switchable tabs that let
 * a visitor see Sumly working — an animated dashboard, the add-transaction flow,
 * and AI receipt scanning. Server-renders the Dashboard tab; all motion and tab
 * switching are progressive enhancement.
 */
export function ProductDemo({ copy }: { copy: LandingCopy }) {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [containerRef, inView] = useInView<HTMLDivElement>(0.25);
  const d = copy.demo;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setTab(TABS[(i + 1) % TABS.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setTab(TABS[(i - 1 + TABS.length) % TABS.length]);
    }
  };

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-md">
      {/* Glow puddle under the window */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-500/30 via-emerald-400/20 to-teal-300/30 blur-2xl"
      />
      <div className="glass overflow-hidden rounded-[1.75rem] shadow-glow">
        {/* App-window chrome + tabs */}
        <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3 dark:border-white/10">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-brand-400" />
          </div>
          <div
            role="tablist"
            aria-label="Sumly preview"
            onKeyDown={onKeyDown}
            className="ml-auto flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10"
          >
            {TABS.map((key) => {
              const selected = tab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    selected
                      ? 'bg-white text-brand-700 shadow-sm dark:bg-brand-500 dark:text-gray-950'
                      : 'text-slate-500 hover:text-brand-700 dark:text-gray-300'
                  }`}
                >
                  {d.tabs[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel — keyed by tab so animations replay on switch */}
        <div role="tabpanel" className="p-4 sm:p-5" key={tab}>
          {tab === 'dashboard' && <DashboardPanel copy={copy} active={inView} />}
          {tab === 'add' && <AddPanel copy={copy} />}
          {tab === 'receipt' && <ReceiptPanel copy={copy} />}
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({ copy, active }: { copy: LandingCopy; active: boolean }) {
  const d = copy.demo;
  const balance = useCountUp(BALANCE, active);

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 p-4 text-white shadow-lifted">
        <p className="text-xs font-medium text-white/80">{d.balanceLabel}</p>
        <p className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight">
          {formatSom(balance)} <span className="text-base font-semibold text-white/80">so‘m</span>
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
          ↑ {d.balanceDelta}
        </span>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl bg-white/60 p-4 dark:bg-white/5" aria-hidden>
        <div className="flex h-24 items-end justify-between gap-1.5">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%`, transformOrigin: 'bottom', animationDelay: `${i * 70}ms` }}
              className={`w-full rounded-t-md bg-gradient-to-t from-brand-500 to-emerald-300 ${
                active ? 'animate-growbar' : ''
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] font-medium text-slate-400 dark:text-gray-500">
          {d.chartCaption}
        </p>
      </div>

      {/* Transactions */}
      <ul className="space-y-1.5">
        {d.rows.map((r, i) => {
          const positive = r.amount.startsWith('+');
          return (
            <li
              key={r.name}
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2 text-sm transition-all duration-500 dark:bg-white/5 ${
                active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                  positive
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                }`}
              >
                {positive ? '↓' : '↑'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-700 dark:text-gray-200">{r.name}</span>
                <span className="block truncate text-[11px] text-slate-400 dark:text-gray-500">{r.method}</span>
              </span>
              <span
                className={`shrink-0 font-semibold tabular-nums ${
                  positive ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {r.amount}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddPanel({ copy }: { copy: LandingCopy }) {
  const a = copy.demo.add;
  return (
    <div className="space-y-4" aria-hidden>
      {/* Income / Expense segmented control */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/10">
        <span className="rounded-lg py-2 text-center text-sm font-semibold text-slate-400 dark:text-gray-500">
          {a.income}
        </span>
        <span className="rounded-lg bg-rose-500 py-2 text-center text-sm font-semibold text-white shadow-sm">
          {a.expense}
        </span>
      </div>

      {/* Amount */}
      <div className="rounded-2xl bg-white/60 p-4 text-center dark:bg-white/5">
        <p className="text-xs font-medium text-slate-400 dark:text-gray-500">{a.amountLabel}</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-800 dark:text-gray-100">
          {ADD_AMOUNT} <span className="text-lg font-semibold text-slate-400">so‘m</span>
          <span className="ml-0.5 inline-block h-7 w-0.5 translate-y-1 animate-pulse bg-brand-500 align-middle" />
        </p>
      </div>

      {/* Category + method */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 dark:bg-white/5">
          <span className="text-slate-400 dark:text-gray-500">{a.categoryLabel}</span>
          <span className="font-semibold text-slate-700 dark:text-gray-200">🛒 {a.category}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 dark:bg-white/5">
          <span className="text-slate-400 dark:text-gray-500">{a.methodLabel}</span>
          <span className="flex gap-1.5">
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-slate-400 dark:bg-white/10 dark:text-gray-500">
              {a.cash}
            </span>
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              {a.card}
            </span>
          </span>
        </div>
      </div>

      <div className="btn-primary w-full justify-center py-3">{a.save}</div>
    </div>
  );
}

function ReceiptPanel({ copy }: { copy: LandingCopy }) {
  const s = copy.demo.scan;
  return (
    <div className="space-y-4" aria-hidden>
      {/* Receipt with scanning sweep */}
      <div className="relative mx-auto w-44 overflow-hidden rounded-xl bg-white p-4 text-slate-700 shadow-lifted">
        <div className="text-center text-[10px] font-bold tracking-widest text-slate-400">{s.merchant.toUpperCase()}</div>
        <div className="mt-2 space-y-1 text-[11px]">
          <div className="flex justify-between"><span>Non</span><span>8 000</span></div>
          <div className="flex justify-between"><span>Sut</span><span>12 000</span></div>
          <div className="flex justify-between"><span>Tuxum</span><span>18 000</span></div>
          <div className="mt-2 flex justify-between border-t border-dashed border-slate-300 pt-2 font-bold">
            <span>{s.totalLabel}</span><span>38 000</span>
          </div>
        </div>
        {/* Sweep line — full-height overlay translated for a cheap GPU sweep */}
        <div className="pointer-events-none absolute inset-0 animate-scan">
          <div className="h-0.5 w-full bg-brand-500 shadow-[0_0_12px_2px_rgba(5,150,105,0.7)]" />
        </div>
      </div>

      <p className="text-center text-xs font-medium text-brand-600 dark:text-brand-400">{s.caption}</p>

      {/* Extracted result */}
      <div className="space-y-2 rounded-2xl bg-white/60 p-3 text-sm dark:bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 dark:text-gray-500">{copy.demo.add.amountLabel}</span>
          <span className="font-extrabold tabular-nums text-slate-800 dark:text-gray-100">38 000 so‘m</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 dark:text-gray-500">{copy.demo.add.categoryLabel}</span>
          <span className="font-semibold text-slate-700 dark:text-gray-200">🛒 {s.category}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 py-1.5 text-center text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <span className="mx-auto flex items-center gap-1">✓ {s.done}</span>
        </div>
      </div>
    </div>
  );
}
