import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { LanguageSegmented } from '../components/LanguageSwitcher';
import { Spinner } from '../components/Spinner';
import { TagIcon, CardIcon } from '../components/icons';

// Settings hub — the entry point on mobile for everything that isn't a daily
/**
 * Renders the user settings hub including language selection, management links,
 * a password change section, and account information with logout.
 *
 * @returns A JSX element containing the settings page UI
 */
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

      {/* Security: change password */}
      <ChangePasswordSection />

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

/**
 * Renders the account security section that lets the signed-in user change their password.
 *
 * Submits the current and new password to the authentication API, shows a success or error toast,
 * clears the inputs on success, and disables the submit button while the request is in progress.
 *
 * @returns A JSX element containing the change-password form and controls
 */
function ChangePasswordSection() {
  const { t } = useT();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.changePassword(current, next);
      toast.success(t('settings.passwordChanged'));
      setCurrent('');
      setNext('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">{t('settings.security')}</h2>
      <form onSubmit={handleSubmit} className="space-y-3 sm:max-w-sm">
        <div>
          <label className="label" htmlFor="currentPassword">{t('settings.currentPassword')}</label>
          <input
            id="currentPassword"
            type="password"
            className="input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="label" htmlFor="newPassword">{t('auth.newPassword')}</label>
          <input
            id="newPassword"
            type="password"
            className="input"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-slate-400">{t('auth.passwordHint')}</p>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('settings.changePassword')}
        </button>
      </form>
    </section>
  );
}
