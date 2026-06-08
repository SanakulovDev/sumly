import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { paymentMethodsApi } from '../api/paymentMethods';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type { Category, PaymentMethod, TransactionPayload, TransactionType } from '../types';
import { PageLoader, Spinner } from '../components/Spinner';
import { todayISO } from '../utils/format';

// Shared form for creating and editing a transaction. Edit mode is detected by
// the presence of an :id route param.
export function TransactionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state.
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | ''>('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');

  // Load option lists, and (in edit mode) the existing transaction.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cats, pms] = await Promise.all([categoriesApi.list(), paymentMethodsApi.list()]);
        if (!active) return;
        setCategories(cats);
        setPaymentMethods(pms);

        if (isEdit && id) {
          const tx = await transactionsApi.get(Number(id));
          if (!active) return;
          setType(tx.type);
          setAmount(String(tx.amount));
          setCategoryId(tx.category_id);
          setPaymentMethodId(tx.payment_method_id);
          setDate(tx.transaction_date.slice(0, 10));
          setDescription(tx.description);
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // Categories relevant to the selected type.
  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  // When the type changes, drop a category selection that no longer applies.
  useEffect(() => {
    if (categoryId !== '' && !typeCategories.some((c) => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [type, typeCategories, categoryId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (categoryId === '' || paymentMethodId === '') {
      setError('Please choose a category and payment method.');
      return;
    }

    const payload: TransactionPayload = {
      type,
      amount: Number(amount),
      category_id: Number(categoryId),
      payment_method_id: Number(paymentMethodId),
      description: description.trim(),
      transaction_date: date,
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await transactionsApi.update(Number(id), payload);
        toast.success('Transaction updated');
      } else {
        await transactionsApi.create(payload);
        toast.success('Transaction added');
      }
      navigate('/transactions');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit transaction' : 'Add transaction'}
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {/* Type toggle */}
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`btn ${type === 'expense' ? 'bg-red-600 text-white' : 'btn-secondary'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`btn ${type === 'income' ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            >
              Income
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0"
          />
        </div>

        <div>
          <label className="label" htmlFor="category">Category</label>
          <select
            id="category"
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Select a category…</option>
            {typeCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="payment">Payment method</label>
          <select
            id="payment"
            className="input"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Select a method…</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <input
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="e.g. Lunch with client"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Save'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
