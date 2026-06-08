import { api } from './client';
import type { PaymentMethod } from '../types';

export const paymentMethodsApi = {
  list: () =>
    api.get<{ data: PaymentMethod[] }>('/api/payment-methods').then((r) => r.data.data ?? []),

  create: (name: string) =>
    api.post<{ data: PaymentMethod }>('/api/payment-methods', { name }).then((r) => r.data.data),

  update: (id: number, name: string) =>
    api
      .put<{ data: PaymentMethod }>(`/api/payment-methods/${id}`, { name })
      .then((r) => r.data.data),

  remove: (id: number) => api.delete(`/api/payment-methods/${id}`).then(() => undefined),
};
