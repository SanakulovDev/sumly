import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { paymentMethodsApi } from '../api/paymentMethods';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import type { Category, Currency, PaymentMethod, TransactionPayload, TransactionType } from '../types';
import { CURRENCIES } from '../types';
import { PageLoader, Spinner } from '../components/Spinner';
import { AmountField } from '../components/AmountField';
import { CameraIcon, CardIcon } from '../components/icons';
import { todayISO, yesterdayISO } from '../utils/format';
import { useT } from '../i18n/useT';

// The last used category/payment per type is remembered locally so repeat
// entries (the common case) need zero extra taps.
const lastChoiceKey = (type: TransactionType) => `sumly:lastChoice:${type}`;

/**
 * Retrieves the remembered category and payment method IDs for the given transaction type from localStorage.
 *
 * @param type - The transaction type whose remembered selection to load
 * @returns An object containing `categoryId` and/or `paymentMethodId` when present; returns an empty object if no remembered selection exists or the stored value cannot be parsed
 */
function loadLastChoice(type: TransactionType): { categoryId?: number; paymentMethodId?: number } {
  try {
    return JSON.parse(localStorage.getItem(lastChoiceKey(type)) || '{}');
  } catch {
    return {};
  }
}

/**
 * Persist the last selected category and payment method for a transaction type in localStorage.
 *
 * @param type - The transaction type (e.g., 'expense' or 'income') for which to remember the selection
 * @param categoryId - The selected category's numeric ID
 * @param paymentMethodId - The selected payment method's numeric ID
 */
function saveLastChoice(type: TransactionType, categoryId: number, paymentMethodId: number) {
  localStorage.setItem(lastChoiceKey(type), JSON.stringify({ categoryId, paymentMethodId }));
}

// Shared form for creating and editing a transaction. Edit mode is detected by
// the presence of an :id route param. When the selected payment method is a
// card, a "last 4 digits" field appears and becomes required. Categories and
/**
 * Page component for creating and editing transactions with quick-entry UX and remembered defaults.
 *
 * Renders a form that supports add and edit modes (edit when an `:id` route param is present), including:
 * - type toggle (expense/income) with per-type remembered category/payment defaults,
 * - amount entry with quick-add chips and live formatted preview,
 * - category and payment method selection via one-tap chips (card methods prompt for last 4 digits),
 * - optional receipt scanning (add-mode expenses) that pre-fills amount/date/description/category,
 * - date picker with Today/Yesterday shortcuts, and
 * - save flows for create/update (with optional "Save and New" behavior).
 *
 * @returns A JSX element rendering the transaction form page.
 */
export function TransactionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, tCategory, tPayment, lang } = useT();

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Form state. The dashboard quick buttons preset the type via ?type=.
  const paramType = searchParams.get('type');
  const initialType: TransactionType = paramType === 'income' ? 'income' : 'expense';
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | ''>('');
  const [cardLast4, setCardLast4] = useState('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');

  useEffect(() => {
    return () => {
      if (scanPreview) URL.revokeObjectURL(scanPreview.url);
    };
  }, [scanPreview]);

  // Apply remembered/default selections for the given type (add mode only).
  const applyDefaults = (forType: TransactionType, cats: Category[], pms: PaymentMethod[]) => {
    const last = loadLastChoice(forType);
    const typeCats = cats.filter((c) => c.type === forType);
    const cat = typeCats.find((c) => c.id === last.categoryId);
    setCategoryId(cat ? cat.id : '');
    const pm = pms.find((p) => p.id === last.paymentMethodId) ?? (pms.length === 1 ? pms[0] : undefined);
    setPaymentMethodId(pm ? pm.id : '');
    setCardLast4('');
  };

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
          setCurrency(tx.currency);
          setCategoryId(tx.category_id);
          setPaymentMethodId(tx.payment_method_id);
          setCardLast4(tx.card_last4 || '');
          setDate(tx.transaction_date.slice(0, 10));
          setDescription(tx.description);
        } else {
          applyDefaults(initialType, cats, pms);

          // Voice / quick-entry prefill via query params (amount, currency,
          // category_id, description). Type comes from ?type= above.
          const pAmount = searchParams.get('amount');
          const pCurrency = searchParams.get('currency') as Currency | null;
          const pCat = searchParams.get('category_id');
          const pDesc = searchParams.get('description');
          if (pAmount && Number(pAmount) > 0) setAmount(pAmount);
          if (pCurrency && CURRENCIES.includes(pCurrency)) setCurrency(pCurrency);
          if (pCat) {
            const cid = Number(pCat);
            if (cats.some((c) => c.id === cid && c.type === initialType)) setCategoryId(cid);
          }
          if (pDesc) setDescription(pDesc);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  // Switching the type swaps in that type's remembered selections (add mode).
  const handleTypeChange = (next: TransactionType) => {
    if (next === type) return;
    setType(next);
    if (!isEdit) applyDefaults(next, categories, paymentMethods);
  };

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

  // In edit mode a type change can leave a stale category selection behind.
  useEffect(() => {
    if (categoryId !== '' && !typeCategories.some((c) => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [type, typeCategories, categoryId]);

  // Receipt scanner: extract amount/date/description/category from a photo and
  // pre-fill the form. Nothing is saved until the user confirms with Save.
  const handleScanFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setScanPreview({ url: URL.createObjectURL(file), name: file.name });
    setScanning(true);
    setError('');
    try {
      const scan = await transactionsApi.scanReceipt(file, lang);
      setAmount(String(scan.amount));
      setCurrency('UZS');
      if (scan.date) setDate(scan.date);
      const desc = [scan.merchant, scan.description].filter(Boolean).join(' — ');
      if (desc) setDescription(desc.slice(0, 500));
      if (scan.category_id && categories.some((c) => c.id === scan.category_id)) {
        setCategoryId(scan.category_id);
      }
      toast.success(t('form.scanned'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setScanning(false);
    }
  };

  const save = async (stay: boolean) => {
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
      currency,
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
        saveLastChoice(type, Number(categoryId), Number(paymentMethodId));
        toast.success(t('form.added'));
      }
      if (stay) {
        // Keep category/payment/date for fast repeat entry; clear the rest.
        setAmount('');
        setDescription('');
        setCardLast4('');
      } else {
        navigate('/transactions');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save(false);
  };

  if (loading) return <PageLoader />;

  const isExpense = type === 'expense';
  const showScanner = !isEdit && isExpense;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`text-sm font-semibold ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-brand-600 dark:text-brand-400'}`}>
            {isExpense ? t('common.expense') : t('common.income')}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
            {isEdit ? t('form.editTitle') : t('form.addTitle')}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`grid gap-5 ${showScanner ? 'lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start' : ''}`}
      >
        {showScanner && (
          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-20">
            <div className="card space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <CameraIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                    {t('form.scanReceipt')}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-gray-400">
                    {scanning ? t('form.scanning') : t('form.scanHint')}
                  </p>
                </div>
              </div>

              {scanPreview && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-gray-700 dark:bg-gray-900/40">
                  <img
                    src={scanPreview.url}
                    alt=""
                    className="h-16 w-12 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-gray-100">
                      {scanPreview.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                      {scanning ? t('form.scanning') : t('form.scanned')}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <input
                  ref={scanInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleScanFile}
                />
                <button
                  type="button"
                  onClick={() => scanInputRef.current?.click()}
                  disabled={scanning}
                  className="btn-secondary w-full border-brand-200 text-brand-700 hover:border-brand-300 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-300 dark:hover:bg-brand-500/10"
                >
                  {scanning ? (
                    <Spinner className="h-4 w-4 border-brand-300 border-t-brand-600" />
                  ) : (
                    <CameraIcon className="h-5 w-5" />
                  )}
                  {scanning ? t('form.scanning') : t('form.scanReceipt')}
                </button>
              </div>
            </div>
          </aside>
        )}

        <section className={`card space-y-5 ${showScanner ? 'order-2 lg:order-1' : 'mx-auto w-full max-w-lg'}`}>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}

          <div>
            <label className="label">{t('transactions.type')}</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-gray-700/40">
              <button
                type="button"
                aria-pressed={isExpense}
                onClick={() => handleTypeChange('expense')}
                className={`rounded-md py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 ${
                  isExpense
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('common.expense')}
              </button>
              <button
                type="button"
                aria-pressed={!isExpense}
                onClick={() => handleTypeChange('income')}
                className={`rounded-md py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 ${
                  !isExpense
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('common.income')}
              </button>
            </div>
          </div>

          {/* Amount with currency, live preview + quick-amount chips. */}
          <AmountField
            amount={amount}
            setAmount={setAmount}
            type={type}
            currency={currency}
            setCurrency={setCurrency}
          />

          {/* Category chips — one tap instead of a dropdown. */}
          <div>
            <span className="label">{t('transactions.category')}</span>
            <div className="flex flex-wrap gap-2">
              {typeCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`chip ${categoryId === c.id ? 'chip-active' : ''}`}
                >
                  {tCategory(c.name)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method chips; card methods get a small card icon. */}
          <div>
            <span className="label">{t('nav.paymentMethods')}</span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethodId(p.id);
                    if (p.id !== paymentMethodId) setCardLast4('');
                  }}
                  className={`chip ${paymentMethodId === p.id ? 'chip-active' : ''}`}
                >
                  {p.is_card && <CardIcon className="h-3.5 w-3.5" />}
                  {tPayment(p.name)}
                </button>
              ))}
            </div>
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
              <p className="mt-1 text-xs text-slate-400">{t('form.cardLast4Hint')}</p>
            </div>
          )}

          {/* Date with Today/Yesterday quick chips. */}
          <div>
            <label className="label" htmlFor="date">{t('common.date')}</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`chip ${date === todayISO() ? 'chip-active' : ''}`}
                onClick={() => setDate(todayISO())}
              >
                {t('common.today')}
              </button>
              <button
                type="button"
                className={`chip ${date === yesterdayISO() ? 'chip-active' : ''}`}
                onClick={() => setDate(yesterdayISO())}
              >
                {t('common.yesterday')}
              </button>
              <input
                id="date"
                type="date"
                className="input min-w-[9rem] flex-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
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

          <div className="space-y-2 pt-1">
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" className="btn-secondary sm:w-auto" onClick={() => navigate(-1)}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                {submitting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('common.save')}
              </button>
            </div>
            {!isEdit && (
              <button
                type="button"
                className="btn w-full text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
                disabled={submitting}
                onClick={() => void save(true)}
              >
                {t('form.saveAndNew')}
              </button>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}
