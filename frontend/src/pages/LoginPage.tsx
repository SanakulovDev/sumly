import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import { Spinner } from '../components/Spinner';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeQuickToggle } from '../components/ThemeToggle';
import { Logo } from '../components/Logo';
import { useT } from '../i18n/useT';

/**
 * Renders the sign-in page and manages the authentication flow for users.
 *
 * Renders a controlled email/password form, displays validation/error feedback, disables the submit button while a login attempt is in progress, and redirects to the app root if the user is already signed in. On successful sign-in it shows a success toast and navigates to `/`; on failure it captures and displays the error message.
 *
 * @returns The login page React element.
 */
export function LoginPage() {
  const { user, login } = useAuthStore();
  const { t } = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already signed in? Skip the form.
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success(t('auth.welcomeBack'));
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title={t('auth.signIn')} subtitle={t('auth.signInSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label mb-0" htmlFor="password">{t('auth.password')}</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('auth.signInBtn')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          {t('auth.createOne')}
        </Link>
      </p>
    </AuthShell>
  );
}

/**
 * Centered authentication page layout that displays branding, a language switcher, and page content.
 *
 * @param title - Heading text displayed above the card
 * @param subtitle - Subheading text displayed under the heading
 * @param children - Content rendered inside the centered card (e.g., sign-in form)
 * @returns A React element containing the auth shell with logo, language switcher, title, subtitle, and the provided children
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 via-slate-50 to-slate-100 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-end gap-2">
          <ThemeQuickToggle />
          <LanguageSwitcher />
        </div>
        <div className="mb-6 text-center">
          <Logo className="mx-auto mb-3 h-16 w-16 drop-shadow-lg" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
