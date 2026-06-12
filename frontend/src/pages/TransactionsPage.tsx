import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { paymentMethodsApi } from '../api/paymentMethods';
import { exportsApi } from '../api/exports';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type {
  Category,
  PaginationMeta,
  PaymentMethod,
  Transaction,
  TransactionFilters,
} from '../types';
import { TransactionRow } from '../components/TransactionRow';
import { PageLoader, Spinner } from '../components/Spinner';
import { useT } from '../i18n/useT';

const emptyFilters: TransactionFilters = {
  type: '',
  category_id: '',
  payment_method_id: '',
  date_from: '',
  date_to: '',
  page: 1,
  page_size: 20,
};

export function TransactionsPage() {
  const { t, tCategory, tPayment } = useT();
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const [items, setItems] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Load filter option lists once.
  useEffect(() => {
    Promise.all([categoriesApi.list(), paymentMethodsApi.list()])
      .then(([cats, pms]) => {
        setCategories(cats);
        setPaymentMethods(pms);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  // Re-fetch whenever filters change.
  useEffect(() => {
    let active = true;
    setLoading(true);
    transactionsApi
      .list(filters)
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setMeta(res.meta);
      })
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters]);

  // Update a single filter and reset to page 1.
  const setFilter = (patch: Partial<TransactionFilters>) =>
    setFilters((f) => ({ ...f, page: 1, ...patch }));

  const handleDelete = async (tx: Transaction) => {
    if (!confirm(t('transactions.deleteConfirm'))) return;
    try {
      await transactionsApi.remove(tx.id);
      toast.success(t('transactions.deleted'));
      setFilters((f) => ({ ...f }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportsApi.transactions(filters);
      toast.success(t('transactions.exported'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const totalPages = meta?.total_pages ?? 1;
  const page = filters.page ?? 1;

  // Categories filtered by the chosen type, so the dropdown stays relevant.
  const visibleCategories = useMemo(
    () => categories.filter((c) => !filters.type || c.type === filters.type),
    [categories, filters.type],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{t('transactions.title')}</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? t('transactions.exporting') : t('transactions.exportExcel')}
          </button>
          <Link to="/transactions/new" className="btn-primary">+ {t('common.add')}</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-2 gap-3 lg:grid-cols-6">
        <div>
          <label className="label">{t('transactions.type')}</label>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => setFilter({ type: e.target.value as TransactionFilters['type'], category_id: '' })}
          >
            <option value="">{t('common.all')}</option>
            <option value="income">{t('common.income')}</option>
            <option value="expense">{t('common.expense')}</option>
          </select>
        </div>
        <div>
          <label className="label">{t('transactions.category')}</label>
          <select
            className="input"
            value={filters.category_id}
            onChange={(e) => setFilter({ category_id: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">{t('common.all')}</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>{tCategory(c.name)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('transactions.payment')}</label>
          <select
            className="input"
            value={filters.payment_method_id}
            onChange={(e) => setFilter({ payment_method_id: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">{t('common.all')}</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>{tPayment(p.name)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('transactions.from')}</label>
          <input
            type="date"
            className="input"
            value={filters.date_from}
            onChange={(e) => setFilter({ date_from: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t('transactions.to')}</label>
          <input
            type="date"
            className="input"
            value={filters.date_to}
            onChange={(e) => setFilter({ date_to: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <button className="btn-secondary w-full" onClick={() => setFilters(emptyFilters)}>
            {t('common.reset')}
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* List */}
      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <div className="card text-center text-sm text-gray-500">{t('transactions.noMatch')}</div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft">
          {items.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{t('transactions.pageInfo', { page, total: totalPages, count: meta.total })}</span>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              {t('common.previous')}
            </button>
            <button
              className="btn-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              {t('common.next')}
            </button>
            {loading && <Spinner className="h-4 w-4" />}
          </div>
        </div>
      )}
    </div>
  );
}
