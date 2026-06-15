import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

function Check() {
  return (
    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
      ✓
    </span>
  );
}

function Cross() {
  return (
    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400 dark:bg-white/5 dark:text-gray-600">
      —
    </span>
  );
}

export function Comparison({ copy }: { copy: LandingCopy }) {
  const c = copy.comparison;
  return (
    <section className="bg-slate-50/70 py-20 dark:bg-white/[0.02] sm:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
            {c.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-gray-300">{c.subtitle}</p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-200/70 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
              <span className="text-sm font-semibold text-slate-400 dark:text-gray-500">&nbsp;</span>
              <span className="w-20 text-center font-display text-sm font-bold text-brand-700 dark:text-brand-300">{c.sumly}</span>
              <span className="w-20 text-center text-xs font-semibold text-slate-400 dark:text-gray-500">{c.other}</span>
            </div>
            {c.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-100 px-5 py-3.5 last:border-0 dark:border-white/5"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{row.label}</span>
                <span className="w-20">{row.sumly ? <Check /> : <Cross />}</span>
                <span className="w-20">{row.other ? <Check /> : <Cross />}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
