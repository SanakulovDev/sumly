import type { LandingCopy } from '../../i18n/landing';

const EMOJIS = ['⚡', '📷', '💳', '📊', '🔍', '📁'];

export function Features({ copy }: { copy: LandingCopy }) {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-50">{copy.featuresTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-gray-300">{copy.featuresSubtitle}</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {copy.features.map((f, i) => (
          <div key={f.title} className="card">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl dark:bg-brand-900/40">
              {EMOJIS[i]}
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-gray-100">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
