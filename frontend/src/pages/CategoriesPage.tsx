import { FormEvent, useEffect, useState } from 'react';
import { categoriesApi } from '../api/categories';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type { Category, TransactionType } from '../types';
import { PageLoader } from '../components/Spinner';
import { useT } from '../i18n/useT';

export function CategoriesPage() {
  const { t, tCategory } = useT();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New-category form.
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [saving, setSaving] = useState(false);

  const load = () =>
    categoriesApi
      .list()
      .then(setCategories)
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
      await categoriesApi.create(name.trim(), type);
      setName('');
      toast.success(t('categories.added'));
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(t('categories.deleteConfirm', { name: tCategory(cat.name) }))) return;
    try {
      await categoriesApi.remove(cat.id);
      toast.success(t('categories.deleted'));
      setCategories((cs) => cs.filter((c) => c.id !== cat.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('categories.title')}</h1>

      {/* Add form */}
      <form onSubmit={handleCreate} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">{t('auth.name')}</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('categories.addPlaceholder')}
            maxLength={120}
          />
        </div>
        <div className="sm:w-40">
          <label className="label">{t('transactions.type')}</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
            <option value="expense">{t('common.expense')}</option>
            <option value="income">{t('common.income')}</option>
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>{t('common.add')}</button>
      </form>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CategoryColumn title={t('common.income')} items={income} onDelete={handleDelete} tone="income" tName={tCategory} empty={t('categories.none')} deleteLabel={t('common.delete')} />
          <CategoryColumn title={t('common.expense')} items={expense} onDelete={handleDelete} tone="expense" tName={tCategory} empty={t('categories.none')} deleteLabel={t('common.delete')} />
        </div>
      )}
    </div>
  );
}

function CategoryColumn({
  title,
  items,
  onDelete,
  tone,
  tName,
  empty,
  deleteLabel,
}: {
  title: string;
  items: Category[];
  onDelete: (c: Category) => void;
  tone: 'income' | 'expense';
  tName: (name: string) => string;
  empty: string;
  deleteLabel: string;
}) {
  return (
    <div className="card">
      <h2 className={`mb-3 text-sm font-semibold ${tone === 'income' ? 'text-brand-600' : 'text-red-600'}`}>
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-800 dark:text-gray-200">{tName(c.name)}</span>
              <button
                onClick={() => onDelete(c)}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                {deleteLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
