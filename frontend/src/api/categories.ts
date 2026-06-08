import { api } from './client';
import type { Category, TransactionType } from '../types';

export const categoriesApi = {
  list: () => api.get<{ data: Category[] }>('/api/categories').then((r) => r.data.data ?? []),

  create: (name: string, type: TransactionType) =>
    api.post<{ data: Category }>('/api/categories', { name, type }).then((r) => r.data.data),

  update: (id: number, name: string, type: TransactionType) =>
    api.put<{ data: Category }>(`/api/categories/${id}`, { name, type }).then((r) => r.data.data),

  remove: (id: number) => api.delete(`/api/categories/${id}`).then(() => undefined),
};
