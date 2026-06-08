import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { LanguageSegmented } from '../components/LanguageSwitcher';
import { TagIcon, CardIcon } from '../components/icons';

// Settings hub — the entry point on mobile for everything that isn't a daily
// action: managing categories & payment methods, switching language, account.
export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { t } = useT();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>

      {/* Language */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">{t('settings.language')}</h2>
        <LanguageSegmented />
      </section>

      {/* Management links */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('settings.manage')}
        </h2>
        <Link to="/categories" className="card flex items-center gap-4 hover:bg-gray-50">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <TagIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-gray-900">{t('nav.categories')}</span>
            <span className="block text-sm text-gray-500">{t('settings.categoriesDesc')}</span>
          </span>
        </Link>
        <Link to="/payment-methods" className="card flex items-center gap-4 hover:bg-gray-50">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <CardIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-gray-900">{t('nav.paymentMethods')}</span>
            <span className="block text-sm text-gray-500">{t('settings.paymentsDesc')}</span>
          </span>
        </Link>
      </section>

      {/* Account */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">{t('settings.account')}</h2>
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">{user?.name}</p>
          <p>{user?.email}</p>
        </div>
        <button className="btn-danger w-full sm:w-auto" onClick={handleLogout}>
          {t('common.logout')}
        </button>
      </section>
    </div>
  );
}
