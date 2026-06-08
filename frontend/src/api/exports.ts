import { api } from './client';
import type { TransactionFilters } from '../types';

// Strips empty filter values, mirroring the transactions list query builder.
function toParams(filters: TransactionFilters): Record<string, string> {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });
  return params;
}

// Triggers a browser download for a binary blob response.
function downloadBlob(data: Blob, filename: string) {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportsApi = {
  // Downloads the filtered transactions as an .xlsx file.
  transactions: async (filters: TransactionFilters = {}) => {
    const res = await api.get('/api/transactions/export', {
      params: toParams(filters),
      responseType: 'blob',
    });
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob(res.data as Blob, `sumly-transactions-${today}.xlsx`);
  },

  // Downloads the monthly report (summary + daily + transactions) as .xlsx.
  monthly: async (month: string) => {
    const res = await api.get('/api/reports/monthly/export', {
      params: { month },
      responseType: 'blob',
    });
    downloadBlob(res.data as Blob, `sumly-monthly-${month}.xlsx`);
  },
};
