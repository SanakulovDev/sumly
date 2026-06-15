import type { LandingCopy } from '../../i18n/landing';

export function TrustStrip({ copy }: { copy: LandingCopy }) {
  return (
    <div className="border-y border-slate-200/70 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-white/[0.02]">
      <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-sm font-medium text-slate-600 dark:text-gray-300">
        {copy.trust.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              ✓
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
