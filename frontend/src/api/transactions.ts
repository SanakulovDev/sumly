import { api } from './client';
import type {
  PaginationMeta,
  Transaction,
  TransactionFilters,
  TransactionPayload,
  TransactionType,
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

export const transactionsApi = {
  list: (filters: TransactionFilters = {}) =>
    api
      .get<{ data: Transaction[]; meta: PaginationMeta }>('/api/transactions', {
        params: toParams(filters),
      })
      .then((r) => ({ items: r.data.data ?? [], meta: r.data.meta })),

  get: (id: number) =>
    api.get<{ data: Transaction }>(`/api/transactions/${id}`).then((r) => r.data.data),

  // The user's most frequently used amounts (for quick-entry chips), optionally
  // scoped to a transaction type and currency.
  topAmounts: (type?: TransactionType, currency?: string) => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (currency) params.currency = currency;
    return api
      .get<{ data: number[] }>('/api/transactions/top-amounts', { params })
      .then((r) => r.data.data ?? []);
  },

  create: (payload: TransactionPayload) =>
    api.post<{ data: Transaction }>('/api/transactions', payload).then((r) => r.data.data),

  update: (id: number, payload: TransactionPayload) =>
    api.put<{ data: Transaction }>(`/api/transactions/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => api.delete(`/api/transactions/${id}`).then(() => undefined),
};
