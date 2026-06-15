import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';

export function Languages({ copy }: { copy: LandingCopy }) {
  return (
    <section id="languages" className="bg-slate-50 dark:bg-gray-800/40">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-50">{copy.langs.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-gray-300">{copy.langs.desc}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="chip">🇬🇧 English</Link>
          <Link to="/ru" className="chip">🇷🇺 Русский</Link>
          <Link to="/uz" className="chip">🇺🇿 O‘zbekcha</Link>
        </div>
      </div>
    </section>
  );
}
