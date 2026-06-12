import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import { Spinner } from '../components/Spinner';
import { useT } from '../i18n/useT';
import { AuthShell } from './LoginPage';

// Set a new password using the single-use token from the emailed reset link
// (?token=...). On success the user is sent back to the login page.
export function ResetPasswordPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success(t('auth.resetSuccess'));
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div>
          <label className="label" htmlFor="password">{t('auth.newPassword')}</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-slate-400">{t('auth.passwordHint')}</p>
        </div>
        <div>
          <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
          <input
            id="confirm"
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('auth.resetBtn')}
        </button>
        <Link to="/login" className="block text-center text-sm font-medium text-brand-600 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </form>
    </AuthShell>
  );
}
