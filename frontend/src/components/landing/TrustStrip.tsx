import type { LandingCopy } from '../../i18n/landing';

export function TrustStrip({ copy }: { copy: LandingCopy }) {
  return (
    <div className="border-y border-slate-200/70 bg-white dark:border-gray-800 dark:bg-gray-900">
      <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-sm font-medium text-slate-500 dark:text-gray-400">
        {copy.trust.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span className="text-brand-600">✓</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
