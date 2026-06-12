import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { Spinner } from '../components/Spinner';
import { useT } from '../i18n/useT';
import { AuthShell } from './LoginPage';

// Forgot-password: ask for the account email and trigger a reset link. The
// response is identical whether or not the email exists. In development the
/**
 * Render the forgot-password page that collects an email, requests a password reset, and displays a confirmation view with an optional development "continue" link when a reset token is returned.
 *
 * The component shows a form for entering an email, disables the submit button and shows a spinner while the request is in progress, displays a user-facing error message on failure, and shows a confirmation screen on success with links to continue (when a token is available) and to go back to login.
 *
 * @returns The JSX element for the Forgot Password page.
 */
export function ForgotPasswordPage() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      setDevToken(res.reset_token ?? '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="rounded-xl bg-brand-50 px-3 py-3 text-sm text-brand-800">
            {t('auth.resetSent')}
          </p>
          {devToken && (
            <Link
              to={`/reset-password?token=${devToken}`}
              className="btn-secondary w-full"
            >
              {t('auth.continueReset')}
            </Link>
          )}
          <Link to="/login" className="block text-sm font-medium text-brand-600 hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
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
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('auth.sendResetLink')}
          </button>
          <Link to="/login" className="block text-center text-sm font-medium text-brand-600 hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
