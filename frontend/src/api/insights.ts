import { api } from './client';
import type { AdviceResult } from '../types';

export const insightsApi = {
  // Fetches AI/rule-based financial advice for the current month.
  advice: (lang: string) =>
    api
      .get<{ data: AdviceResult }>('/api/insights/advice', { params: { lang } })
      .then((r) => r.data.data),

  // Reports whether the interactive AI chat is available.
  status: () =>
    api
      .get<{ data: { ai_enabled: boolean } }>('/api/insights/status')
      .then((r) => r.data.data.ai_enabled),

  // Asks a free-form question answered from the logged-in user's own data.
  ask: (question: string, lang: string) =>
    api
      .post<{ data: { answer: string } }>('/api/insights/ask', { question, lang })
      .then((r) => r.data.data.answer),
};
