import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { paymentMethodsApi } from '../api/paymentMethods';
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
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const [items, setItems] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Update a single filter and reset to page 1 (except when changing page).
  const setFilter = (patch: Partial<TransactionFilters>) =>
    setFilters((f) => ({ ...f, page: 1, ...patch }));

  const handleDelete = async (tx: Transaction) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionsApi.remove(tx.id);
      toast.success('Transaction deleted');
      // Refresh the current page.
      setFilters((f) => ({ ...f }));
    } catch (err) {
      toast.error(getErrorMessage(err));
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Link to="/transactions/new" className="btn-primary">+ Add</Link>
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-1">
          <label className="label">Type</label>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => setFilter({ type: e.target.value as TransactionFilters['type'], category_id: '' })}
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="lg:col-span-1">
          <label className="label">Category</label>
          <select
            className="input"
            value={filters.category_id}
            onChange={(e) => setFilter({ category_id: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">All</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-1">
          <label className="label">Payment</label>
          <select
            className="input"
            value={filters.payment_method_id}
            onChange={(e) => setFilter({ payment_method_id: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">All</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-1">
          <label className="label">From</label>
          <input
            type="date"
            className="input"
            value={filters.date_from}
            onChange={(e) => setFilter({ date_from: e.target.value })}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="label">To</label>
          <input
            type="date"
            className="input"
            value={filters.date_to}
            onChange={(e) => setFilter({ date_to: e.target.value })}
          />
        </div>
        <div className="flex items-end lg:col-span-1">
          <button className="btn-secondary w-full" onClick={() => setFilters(emptyFilters)}>
            Reset
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* List */}
      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <div className="card text-center text-sm text-gray-500">No transactions match these filters.</div>
      ) : (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {items.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {page} of {totalPages} · {meta.total} total
          </span>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              Previous
            </button>
            <button
              className="btn-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next
            </button>
            {loading && <Spinner className="h-4 w-4" />}
          </div>
        </div>
      )}
    </div>
  );
}
