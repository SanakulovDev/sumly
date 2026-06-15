import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import type { LandingCopy } from '../../i18n/landing';

export function LandingFooter({ copy }: { copy: LandingCopy }) {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-bold text-slate-900 dark:text-gray-100">Sumly</span>
          <span className="text-sm text-slate-500 dark:text-gray-400">— {copy.footer.tagline}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-gray-400">
          <Link to="/" className="hover:text-brand-700">EN</Link>
          <Link to="/ru" className="hover:text-brand-700">RU</Link>
          <Link to="/uz" className="hover:text-brand-700">UZ</Link>
          <Link to="/login" className="hover:text-brand-700">{copy.nav.login}</Link>
          <Link to="/register" className="hover:text-brand-700">{copy.nav.signup}</Link>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} Sumly. {copy.footer.rights}</p>
    </footer>
  );
}
