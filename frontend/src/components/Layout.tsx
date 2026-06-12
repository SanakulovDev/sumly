import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeQuickToggle } from './ThemeToggle';
import {
  ChartIcon,
  HomeIcon,
  ListIcon,
  PlusIcon,
  SettingsIcon,
} from './icons';
import { Logo } from './Logo';

// App shell: a sidebar on desktop and a bottom tab bar on mobile. The center
// "+" tab is an elevated Add button for fast, one-tap entry — the primary
/**
 * Renders the application shell with responsive navigation and content areas.
 *
 * The layout provides a desktop sidebar, a mobile header, a shared main content area that renders route children via `<Outlet />`, and a mobile bottom tab bar. It also exposes a logout control that calls the auth store's `logout` and navigates to `/login`.
 *
 * @returns The layout JSX element containing navigation, header, main content, and the mobile tab bar
 */
export function Layout() {
  const { user, logout } = useAuthStore();
  const { t } = useT();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Desktop sidebar items (full set; Settings groups the management screens).
  const sidebarItems = [
    { to: '/', label: t('nav.dashboard'), icon: HomeIcon, end: true },
    { to: '/transactions', label: t('nav.transactions'), icon: ListIcon },
    { to: '/transactions/new', label: t('nav.add'), icon: PlusIcon },
    { to: '/reports', label: t('nav.reports'), icon: ChartIcon },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen md:flex">
      {/* ---- Desktop sidebar ---- */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:block">
        <Brand />
        <nav className="mt-6 space-y-1">
          {sidebarItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ---- Mobile top bar (brand + theme + language) ---- */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90 md:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeQuickToggle />
          <LanguageSwitcher />
        </div>
      </header>

      {/* ---- Main content ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar */}
        <div className="hidden items-center justify-end gap-4 border-b border-slate-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800 md:flex">
          <ThemeQuickToggle />
          <LanguageSwitcher />
          <span className="text-sm text-slate-600 dark:text-gray-300">{user?.name}</span>
          <button className="btn-secondary" onClick={handleLogout}>
            {t('common.logout')}
          </button>
        </div>

        {/* Extra bottom padding on mobile so the tab bar never covers content. */}
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ---- Mobile bottom tab bar ---- */}
      <MobileTabBar />
    </div>
  );
}

/**
 * Render the fixed mobile bottom navigation with tabs for Dashboard, Reports, a central elevated Add action, Transactions, and Settings.
 *
 * The tab labels are localized via the translation hook; the Add button is visually elevated, has an `aria-label`, and the whole bar is hidden on medium and larger viewports.
 *
 * @returns The navigation bar JSX element for mobile bottom-tabs.
 */
function MobileTabBar() {
  const { t } = useT();

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition ${
      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-gray-400'
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-end border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(15,23,42,0.06)] backdrop-blur dark:border-gray-700 dark:bg-gray-800/95 md:hidden">
      <NavLink to="/" end className={tabClass}>
        <HomeIcon className="h-6 w-6" />
        {t('nav.dashboard')}
      </NavLink>
      <NavLink to="/reports" className={tabClass}>
        <ChartIcon className="h-6 w-6" />
        {t('nav.reports')}
      </NavLink>

      {/* Elevated center Add button */}
      <div className="flex flex-1 justify-center">
        <NavLink
          to="/transactions/new"
          aria-label={t('nav.add')}
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-lifted ring-4 ring-white transition active:scale-95"
        >
          <PlusIcon className="h-7 w-7" />
        </NavLink>
      </div>

      <NavLink to="/transactions" className={tabClass}>
        <ListIcon className="h-6 w-6" />
        {t('nav.transactions')}
      </NavLink>
      <NavLink to="/settings" className={tabClass}>
        <SettingsIcon className="h-6 w-6" />
        {t('nav.settings')}
      </NavLink>
    </nav>
  );
}

/**
 * Renders the Sumly wordmark used in the app header and sidebar.
 *
 * @returns A JSX element containing the `Logo` icon and the "Sumly" text
 */
function Brand() {
  return (
    <div className="flex items-center gap-2">
      <Logo className="h-8 w-8" />
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-gray-100">Sumly</span>
    </div>
  );
}
