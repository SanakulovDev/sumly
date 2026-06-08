import { useLanguageStore } from '../store/languageStore';
import { dictionaries, type Language } from './translations';

// Resolves a dotted key path (e.g. "dashboard.totalBalance") against an object.
function resolve(obj: unknown, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : path; // fall back to the key
}

// Replaces {placeholders} in a string with provided params.
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`,
  );
}

export interface Translator {
  // Translate a key, with optional interpolation params.
  t: (key: string, params?: Record<string, string | number>) => string;
  // Translate a seeded category name, falling back to the raw name if custom.
  tCategory: (name: string) => string;
  // Translate a seeded payment method name, falling back to the raw name.
  tPayment: (name: string) => string;
  lang: Language;
}

// Primary translation hook used throughout the app. Re-renders components when
// the language changes (via the Zustand subscription).
export function useT(): Translator {
  const lang = useLanguageStore((s) => s.lang);
  const dict = dictionaries[lang];

  return {
    lang,
    t: (key, params) => interpolate(resolve(dict, key), params),
    tCategory: (name) =>
      (dict.categoryNames as Record<string, string>)[name] ?? name,
    tPayment: (name) =>
      (dict.paymentNames as Record<string, string>)[name] ?? name,
  };
}
