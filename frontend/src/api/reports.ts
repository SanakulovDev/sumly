import { api } from './client';
import type { DashboardSummary, DailyReport, MonthlyReport } from '../types';

export const reportsApi = {
  dashboard: () =>
    api.get<{ data: DashboardSummary }>('/api/reports/dashboard').then((r) => r.data.data),

  daily: (date?: string) =>
    api
      .get<{ data: DailyReport }>('/api/reports/daily', { params: date ? { date } : {} })
      .then((r) => r.data.data),

  monthly: (month?: string) =>
    api
      .get<{ data: MonthlyReport }>('/api/reports/monthly', { params: month ? { month } : {} })
      .then((r) => r.data.data),
};
