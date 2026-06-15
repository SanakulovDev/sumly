import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import type { LandingCopy } from '../../i18n/landing';

export function LandingFooter({ copy }: { copy: LandingCopy }) {
  return (
    <footer className="border-t border-slate-200/70 bg-white dark:border-white/10 dark:bg-gray-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-slate-900 dark:text-gray-100">Sumly</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-gray-400">{copy.footer.tagline}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 dark:text-brand-300">
            🇺🇿 {copy.footer.madeIn}
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600 dark:text-gray-300">
            <a href="#features" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.features}</a>
            <a href="#how" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.how}</a>
            <a href="#languages" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.languages}</a>
            <Link to="/login" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.login}</Link>
            <Link to="/register" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.signup}</Link>
          </nav>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5">
            <Link to="/" className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:text-brand-700 dark:text-gray-400">EN</Link>
            <Link to="/ru" className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:text-brand-700 dark:text-gray-400">RU</Link>
            <Link to="/uz" className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:text-brand-700 dark:text-gray-400">UZ</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-white/5">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-slate-400 dark:text-gray-500">
          © {new Date().getFullYear()} Sumly. {copy.footer.rights}
        </p>
      </div>
    </footer>
  );
}
