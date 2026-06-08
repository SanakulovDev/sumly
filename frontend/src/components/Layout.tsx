import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Navigation items shared by the desktop sidebar and mobile menu.
const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/transactions/new', label: 'Add' },
  { to: '/reports', label: 'Reports' },
  { to: '/categories', label: 'Categories' },
  { to: '/payment-methods', label: 'Payment Methods' },
];

function navClass({ isActive }: { isActive: boolean }) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
  }`;
}

// App shell: brand header, responsive navigation, and the routed page content.
export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
        <Brand />
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white p-4 md:hidden">
        <Brand />
        <button
          className="btn-secondary"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </header>
      {menuOpen && (
        <nav className="space-y-1 border-b border-gray-200 bg-white p-4 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden items-center justify-end gap-4 border-b border-gray-200 bg-white px-6 py-3 md:flex">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
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
