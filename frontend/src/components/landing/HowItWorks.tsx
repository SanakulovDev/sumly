import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

export function HowItWorks({ copy }: { copy: LandingCopy }) {
  return (
    <section id="how" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="text-center">
          <span className="eyebrow">{copy.nav.how}</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
            {copy.howTitle}
          </h2>
        </Reveal>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* Connecting line on desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent dark:via-brand-500/40 md:block"
          />
          {copy.how.map((s, i) => (
            <Reveal key={s.title} delay={i * 140}>
              <div className="relative h-full rounded-3xl border border-slate-200/70 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 font-display text-xl font-bold text-white shadow-lifted">
                  {i + 1}
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-gray-50">{s.title}</h3>
                <p className="mt-2 text-slate-600 dark:text-gray-300">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
