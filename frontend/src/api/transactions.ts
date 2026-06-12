import { api } from './client';
import type {
  PaginationMeta,
  Transaction,
  TransactionFilters,
  TransactionPayload,
} from '../types';

// Builds a query string from filters, omitting empty values.
function toParams(filters: TransactionFilters): Record<string, string> {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });
  return params;
}

// Expense data extracted from a scanned receipt photo.
export interface ReceiptScan {
  amount: number;
  date: string;
  merchant: string;
  description: string;
  category_id: number;
}

export const transactionsApi = {
  // Scans a receipt photo and returns the extracted expense data. The model
  // writes the description in the given UI language.
  scanReceipt: (file: File, lang: string) => {
    const form = new FormData();
    form.append('image', file);
    form.append('lang', lang);
    return api
      .post<{ data: ReceiptScan }>('/api/transactions/scan-receipt', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      .then((r) => r.data.data);
  },

  list: (filters: TransactionFilters = {}) =>
    api
      .get<{ data: Transaction[]; meta: PaginationMeta }>('/api/transactions', {
        params: toParams(filters),
      })
      .then((r) => ({ items: r.data.data ?? [], meta: r.data.meta })),

  get: (id: number) =>
    api.get<{ data: Transaction }>(`/api/transactions/${id}`).then((r) => r.data.data),

  create: (payload: TransactionPayload) =>
    api.post<{ data: Transaction }>('/api/transactions', payload).then((r) => r.data.data),

  update: (id: number, payload: TransactionPayload) =>
    api.put<{ data: Transaction }>(`/api/transactions/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => api.delete(`/api/transactions/${id}`).then(() => undefined),
};
