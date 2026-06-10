import { FormEvent, useEffect, useState } from 'react';
import { paymentMethodsApi } from '../api/paymentMethods';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type { PaymentMethod } from '../types';
import { PageLoader } from '../components/Spinner';
import { useT } from '../i18n/useT';

export function PaymentMethodsPage() {
  const { t, tPayment } = useT();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [isCard, setIsCard] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    paymentMethodsApi
      .list()
      .then(setMethods)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await paymentMethodsApi.create(name.trim(), isCard);
      setName('');
      setIsCard(false);
      toast.success(t('paymentMethods.added'));
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Toggle the card flag on an existing method inline.
  const toggleCard = async (pm: PaymentMethod) => {
    try {
      const updated = await paymentMethodsApi.update(pm.id, pm.name, !pm.is_card);
      setMethods((ms) => ms.map((m) => (m.id === pm.id ? updated : m)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (pm: PaymentMethod) => {
    if (!confirm(t('paymentMethods.deleteConfirm', { name: tPayment(pm.name) }))) return;
    try {
      await paymentMethodsApi.remove(pm.id);
      toast.success(t('paymentMethods.deleted'));
      setMethods((ms) => ms.filter((m) => m.id !== pm.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('paymentMethods.title')}</h1>

      <form onSubmit={handleCreate} className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">{t('auth.name')}</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('paymentMethods.addPlaceholder')}
              maxLength={120}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {t('common.add')}
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            checked={isCard}
            onChange={(e) => setIsCard(e.target.checked)}
          />
          {t('paymentMethods.isCard')}
        </label>
      </form>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="card">
          {methods.length === 0 ? (
            <p className="text-sm text-gray-400">{t('paymentMethods.none')}</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {methods.map((pm) => (
                <li key={pm.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-gray-800 dark:text-gray-200">{tPayment(pm.name)}</span>
                    {pm.is_card && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {t('paymentMethods.cardBadge')}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        checked={pm.is_card}
                        onChange={() => toggleCard(pm)}
                      />
                      {t('paymentMethods.cardBadge')}
                    </label>
                    <button
                      onClick={() => handleDelete(pm)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      {t('common.delete')}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
