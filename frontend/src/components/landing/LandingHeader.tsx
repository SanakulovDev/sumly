import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import type { LandingCopy, LandingLang } from '../../i18n/landing';

const LANG_LINKS: { lang: LandingLang; label: string; href: string }[] = [
  { lang: 'en', label: 'EN', href: '/' },
  { lang: 'ru', label: 'RU', href: '/ru' },
  { lang: 'uz', label: 'UZ', href: '/uz' },
];

export function LandingHeader({ copy, lang }: { copy: LandingCopy; lang: LandingLang }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/90'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={lang === 'en' ? '/' : `/${lang}`} className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-gray-100">Sumly</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 dark:text-gray-300 md:flex">
          <a href="#features" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.features}</a>
          <a href="#how" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.how}</a>
          <a href="#languages" className="transition hover:text-brand-700 dark:hover:text-brand-300">{copy.nav.languages}</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/60 p-0.5 backdrop-blur dark:border-white/10 dark:bg-white/5 sm:flex">
            {LANG_LINKS.map((l) => (
              <Link
                key={l.lang}
                to={l.href}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  l.lang === lang ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-brand-700 dark:text-gray-400'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link to="/login" className="btn-secondary hidden sm:inline-flex">{copy.nav.login}</Link>
          <Link to="/register" className="btn-primary">{copy.nav.signup}</Link>
        </div>
      </div>
    </header>
  );
}
