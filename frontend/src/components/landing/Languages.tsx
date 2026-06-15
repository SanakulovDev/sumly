import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

export function Languages({ copy }: { copy: LandingCopy }) {
  return (
    <section id="languages" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <span className="eyebrow">{copy.nav.languages}</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
            {copy.langs.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-gray-300">{copy.langs.desc}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="chip text-base">🇬🇧 English</Link>
            <Link to="/ru" className="chip text-base">🇷🇺 Русский</Link>
            <Link to="/uz" className="chip text-base">🇺🇿 O‘zbekcha</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
