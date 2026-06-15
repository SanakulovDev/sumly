import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

const EMOJIS = ['⚡', '📷', '💳', '📊', '🔍', '📁'];

export function Features({ copy }: { copy: LandingCopy }) {
  return (
    <section id="features" className="relative scroll-mt-20 overflow-hidden bg-slate-50/70 py-20 dark:bg-white/[0.02] sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{copy.nav.features}</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
            {copy.featuresTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-gray-300">{copy.featuresSubtitle}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-500/30">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl ring-1 ring-brand-100 transition group-hover:scale-110 dark:bg-brand-500/10 dark:ring-brand-500/20">
                  {EMOJIS[i]}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-gray-50">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-gray-300">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
