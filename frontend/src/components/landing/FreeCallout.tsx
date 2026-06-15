import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

export function FreeCallout({ copy }: { copy: LandingCopy }) {
  const f = copy.free;
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-200/60 bg-gradient-to-br from-brand-50 via-white to-teal-50 p-8 text-center shadow-soft dark:border-brand-500/20 dark:from-brand-500/10 dark:via-gray-950 dark:to-teal-500/10 sm:p-12">
          <span className="eyebrow">{f.badge}</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
            {f.title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-slate-600 dark:text-gray-300">{f.desc}</p>

          <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700 dark:text-gray-200">
            {f.points.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="text-brand-600 dark:text-brand-400">✓</span>
                {p}
              </li>
            ))}
          </ul>

          <Link to="/register" className="btn-primary mt-8 px-8 py-3.5 text-base shadow-lifted">
            {f.cta} →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
