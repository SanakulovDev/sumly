import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { voiceApi } from '../api/voice';
import { getErrorMessage } from '../api/client';
import { toast } from '../store/toastStore';
import { useT } from '../i18n/useT';
import { MicIcon } from './icons';
import { Spinner } from './Spinner';

// One-tap voice entry: records a sentence, parses it into a transaction draft on
// the backend, then opens the Add form pre-filled for the user to confirm.
export function VoiceButton({ className = '' }: { className?: string }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { supported, listening, start } = useSpeechRecognition();
  const [processing, setProcessing] = useState(false);

  const handleClick = () => {
    if (!supported) {
      toast.error(t('voice.notSupported'));
      return;
    }
    start(
      lang,
      async (text) => {
        if (!text) {
          toast.error(t('voice.noSpeech'));
          return;
        }
        setProcessing(true);
        try {
          const draft = await voiceApi.parse(text, lang);
          // Hand the parsed values to the Add form via query params.
          const params = new URLSearchParams({
            type: draft.type,
            amount: String(draft.amount),
            currency: draft.currency,
          });
          if (draft.category_id) params.set('category_id', String(draft.category_id));
          if (draft.description) params.set('description', draft.description);
          navigate(`/transactions/new?${params.toString()}`);
        } catch (err) {
          toast.error(getErrorMessage(err) || t('voice.failed'));
        } finally {
          setProcessing(false);
        }
      },
      (errCode) => {
        if (errCode === 'no-speech') toast.error(t('voice.noSpeech'));
        else if (errCode === 'unsupported') toast.error(t('voice.notSupported'));
        // Other errors (aborted/not-allowed) stay silent to avoid noise.
      },
    );
  };

  const busy = listening || processing;
  const label = processing ? t('voice.processing') : listening ? t('voice.listening') : t('voice.button');

  return (
    <button
      onClick={handleClick}
      disabled={processing}
      title={t('voice.hint')}
      className={`btn ${
        listening
          ? 'bg-red-600 text-white'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
      } ${className}`}
    >
      {busy ? (
        listening ? (
          // Pulsing mic while listening.
          <MicIcon className="h-5 w-5 animate-pulse" />
        ) : (
          <Spinner className="h-4 w-4" />
        )
      ) : (
        <MicIcon className="h-5 w-5" />
      )}
      <span className="ml-2">{label}</span>
    </button>
  );
}
