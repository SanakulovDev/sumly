import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { ProductDemo } from './ProductDemo';

export function Hero({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative overflow-hidden">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-600/20" />
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-600/20" />
        <div className="absolute inset-0 text-brand-900/[0.04] bg-grid dark:text-white/[0.04]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 lg:grid-cols-2 lg:gap-8 lg:pt-24">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            {copy.hero.badge}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-gray-50 sm:text-5xl lg:text-6xl">
            {copy.hero.titleA}
            <span className="text-gradient">{copy.hero.titleAccent}</span>
            {copy.hero.titleB}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 dark:text-gray-300 sm:text-lg lg:mx-0">
            {copy.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/register" className="btn-primary px-7 py-3.5 text-base shadow-lifted">
              {copy.hero.cta} →
            </Link>
            <Link to="/login" className="btn-secondary px-7 py-3.5 text-base">
              {copy.hero.secondary}
            </Link>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-gray-400">{copy.hero.note}</p>
        </div>

        {/* Live demo */}
        <div>
          <ProductDemo copy={copy} />
        </div>
      </div>
    </section>
  );
}
