import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

export function FinalCTA({ copy }: { copy: LandingCopy }) {
  return (
    <section className="px-4 pb-24 pt-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 px-6 py-16 text-center text-white shadow-glow sm:py-20">
          {/* Static glows */}
          <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
          <div aria-hidden className="absolute inset-0 text-white/10 bg-grid" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {copy.finalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/90">{copy.finalCta.subtitle}</p>
            <Link
              to="/register"
              className="mt-9 inline-flex rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-lifted transition hover:scale-[1.02] hover:bg-brand-50 active:scale-95"
            >
              {copy.finalCta.cta} →
            </Link>
            <p className="mt-4 text-sm text-white/80">{copy.hero.note}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
