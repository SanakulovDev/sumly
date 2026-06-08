import { FormEvent, useEffect, useState } from 'react';
import { paymentMethodsApi } from '../api/paymentMethods';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type { PaymentMethod } from '../types';
import { PageLoader } from '../components/Spinner';

export function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
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
      await paymentMethodsApi.create(name.trim());
      setName('');
      toast.success('Payment method added');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pm: PaymentMethod) => {
    if (!confirm(`Delete payment method "${pm.name}"?`)) return;
    try {
      await paymentMethodsApi.remove(pm.id);
      toast.success('Payment method deleted');
      setMethods((ms) => ms.filter((m) => m.id !== pm.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>

      <form onSubmit={handleCreate} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Uzcard"
            maxLength={120}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>Add</button>
      </form>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="card">
          {methods.length === 0 ? (
            <p className="text-sm text-gray-400">No payment methods yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {methods.map((pm) => (
                <li key={pm.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-800">{pm.name}</span>
                  <button
                    onClick={() => handleDelete(pm)}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
