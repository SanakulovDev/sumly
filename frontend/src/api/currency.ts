import { api } from './client';
import type { CurrencyRates } from '../types';

export const currencyApi = {
  // Current exchange rates (base per 1 unit of each supported currency).
  rates: () => api.get<{ data: CurrencyRates }>('/api/currency/rates').then((r) => r.data.data),
};
