import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../i18n/translations';

// Map app languages to BCP-47 codes the browser recognizer understands. Note:
// Uzbek voice support varies by browser/OS; Russian and English are reliable.
const localeFor: Record<Language, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

// The Web Speech API isn't in TS's DOM lib; access it loosely.
function getRecognitionCtor(): any {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  // Begins listening; resolves transcripts/errors via the provided callbacks.
  start: (lang: Language, onResult: (text: string) => void, onError?: (msg: string) => void) => void;
  stop: () => void;
}

// Thin wrapper around the browser SpeechRecognition API for one-shot dictation.
export function useSpeechRecognition(): UseSpeechRecognition {
  const [supported] = useState(() => getRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Clean up any active recognition on unmount.
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const start = useCallback<UseSpeechRecognition['start']>((lang, onResult, onError) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      onError?.('unsupported');
      return;
    }

    const recognition = new Ctor();
    recognition.lang = localeFor[lang];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      onResult(transcript.trim());
    };
    recognition.onerror = (event: any) => {
      onError?.(event?.error || 'error');
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      onError?.('error');
    }
  }, []);

  return { supported, listening, start, stop };
}
