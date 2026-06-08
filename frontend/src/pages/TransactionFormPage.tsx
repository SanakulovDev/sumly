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
import { useT } from '../i18n/useT';

// Shared form for creating and editing a transaction. Edit mode is detected by
// the presence of an :id route param. When the selected payment method is a
// card, a "last 4 digits" field appears and becomes required.
export function TransactionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t, tCategory, tPayment } = useT();

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
  const [cardLast4, setCardLast4] = useState('');
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
          setCardLast4(tx.card_last4 || '');
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

  // The currently selected payment method (to know whether to ask for card digits).
  const selectedPayment = useMemo(
    () => paymentMethods.find((p) => p.id === paymentMethodId),
    [paymentMethods, paymentMethodId],
  );
  const isCard = Boolean(selectedPayment?.is_card);

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
      setError(t('form.chooseCatPay'));
      return;
    }
    if (isCard && !/^\d{4}$/.test(cardLast4)) {
      setError(t('form.last4Required'));
      return;
    }

    const payload: TransactionPayload = {
      type,
      amount: Number(amount),
      category_id: Number(categoryId),
      payment_method_id: Number(paymentMethodId),
      description: description.trim(),
      card_last4: isCard ? cardLast4 : '',
      transaction_date: date,
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await transactionsApi.update(Number(id), payload);
        toast.success(t('form.updated'));
      } else {
        await transactionsApi.create(payload);
        toast.success(t('form.added'));
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
        {isEdit ? t('form.editTitle') : t('form.addTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {/* Type toggle */}
        <div>
          <label className="label">{t('transactions.type')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`btn ${type === 'expense' ? 'bg-red-600 text-white' : 'btn-secondary'}`}
            >
              {t('common.expense')}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`btn ${type === 'income' ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            >
              {t('common.income')}
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="amount">{t('common.amount')}</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className="input text-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0"
          />
        </div>

        <div>
          <label className="label" htmlFor="category">{t('transactions.category')}</label>
          <select
            id="category"
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">{t('form.selectCategory')}</option>
            {typeCategories.map((c) => (
              <option key={c.id} value={c.id}>{tCategory(c.name)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="payment">{t('nav.paymentMethods')}</label>
          <select
            id="payment"
            className="input"
            value={paymentMethodId}
            onChange={(e) => {
              setPaymentMethodId(e.target.value ? Number(e.target.value) : '');
              setCardLast4('');
            }}
            required
          >
            <option value="">{t('form.selectPayment')}</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>{tPayment(p.name)}</option>
            ))}
          </select>
        </div>

        {/* Card last-4 — only for card payment methods. */}
        {isCard && (
          <div>
            <label className="label" htmlFor="cardLast4">{t('form.cardLast4')}</label>
            <input
              id="cardLast4"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              className="input tracking-widest"
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              required
            />
            <p className="mt-1 text-xs text-gray-400">{t('form.cardLast4Hint')}</p>
          </div>
        )}

        <div>
          <label className="label" htmlFor="date">{t('common.date')}</label>
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
          <label className="label" htmlFor="description">
            {t('common.description')} ({t('common.optional')})
          </label>
          <input
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder={t('form.descriptionPlaceholder')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('common.save')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
