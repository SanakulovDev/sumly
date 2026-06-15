import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

const ICONS = ['🔎', '⚡', '🇺🇿'];

export function ValueProps({ copy }: { copy: LandingCopy }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
          {copy.valueProps.title}
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-gray-300">{copy.valueProps.subtitle}</p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {copy.valueProps.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 120}>
            <div className="group h-full rounded-3xl border border-slate-200/70 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-2xl shadow-lifted">
                {ICONS[i]}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-gray-50">{item.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-gray-300">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
