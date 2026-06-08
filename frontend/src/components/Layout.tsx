import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  ChartIcon,
  HomeIcon,
  ListIcon,
  PlusIcon,
  SettingsIcon,
} from './icons';

// App shell: a sidebar on desktop and a bottom tab bar on mobile. The center
// "+" tab is an elevated Add button for fast, one-tap entry — the primary
// action in a daily-use finance app.
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
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
        <Brand />
        <nav className="mt-6 space-y-1">
          {sidebarItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ---- Mobile top bar (brand + language) ---- */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Brand />
        <LanguageSwitcher />
      </header>

      {/* ---- Main content ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar */}
        <div className="hidden items-center justify-end gap-4 border-b border-gray-200 bg-white px-6 py-3 md:flex">
          <LanguageSwitcher />
          <span className="text-sm text-gray-600">{user?.name}</span>
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

// Bottom navigation for mobile: Dashboard · Reports · (+) Add · Settings.
function MobileTabBar() {
  const { t } = useT();

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
      isActive ? 'text-brand-600' : 'text-gray-500'
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-end border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_8px_rgba(0,0,0,0.04)] md:hidden">
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
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white transition active:scale-95"
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

// Sumly wordmark used in the header/sidebar.
function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        S
      </span>
      <span className="text-lg font-bold tracking-tight text-gray-900">Sumly</span>
    </div>
  );
}
