import { FormEvent, useEffect, useState } from 'react';
import { insightsApi } from '../api/insights';
import { getErrorMessage } from '../api/client';
import { useT } from '../i18n/useT';
import { SparkleIcon } from './icons';
import { Spinner } from './Spinner';

// Dashboard card that (1) shows month advice and (2) — when a local model is
// available — lets the user ask free-form questions answered only from their
// own data.
export function AdviceCard() {
  const { t, lang } = useT();
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');

  // Chat state.
  const [aiEnabled, setAiEnabled] = useState(false);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  // Find out whether the interactive chat is available.
  useEffect(() => {
    insightsApi.status().then(setAiEnabled).catch(() => setAiEnabled(false));
  }, []);

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await insightsApi.advice(lang);
      setAdvice(res.advice);
      setGenerated(res.generated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError('');
    setAnswer(null);
    try {
      const res = await insightsApi.ask(q, lang);
      setAnswer(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/20 dark:text-brand-400">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{t('advice.title')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('advice.subtitle')}</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={fetchAdvice} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : advice ? t('advice.refresh') : t('advice.button')}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>
      )}

      {loading && !advice && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('advice.loading')}</p>
      )}

      {advice && (
        <div className="mt-3">
          <div className="space-y-1 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{advice}</div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {generated ? t('advice.byAI') : t('advice.byRules')}
          </p>
        </div>
      )}

      {/* Interactive chat — only when a local model is configured. */}
      {aiEnabled && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('advice.askPlaceholder')}
              maxLength={400}
            />
            <button type="submit" className="btn-primary shrink-0" disabled={asking || !question.trim()}>
              {asking ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : t('advice.send')}
            </button>
          </form>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('advice.askHint')}</p>

          {asking && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('advice.thinking')}</p>}
          {answer && (
            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-line dark:bg-gray-900/40 dark:text-gray-200">
              {answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
