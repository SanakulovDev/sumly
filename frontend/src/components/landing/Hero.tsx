import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { DashboardPreview } from './DashboardPreview';

export function Hero({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {copy.hero.badge}
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-gray-50 sm:text-5xl">
          {copy.hero.titleA}
          <span className="text-brand-600">{copy.hero.titleAccent}</span>
          {copy.hero.titleB}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-gray-300 sm:text-lg">{copy.hero.subtitle}</p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">{copy.hero.cta} →</Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">{copy.hero.secondary}</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <DashboardPreview labels={{ balance: 'Total balance', today: 'Today', month: 'Month' }} />
      </div>
    </section>
  );
}
