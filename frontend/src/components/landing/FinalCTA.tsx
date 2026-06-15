import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';

export function FinalCTA({ copy }: { copy: LandingCopy }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">{copy.finalCta.title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-gray-300">{copy.finalCta.subtitle}</p>
      <Link to="/register" className="btn-primary mt-7 px-7 py-3 text-base">{copy.finalCta.cta} →</Link>
    </section>
  );
}
