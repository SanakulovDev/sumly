import { create } from 'zustand';
import type { Language } from '../i18n/translations';

const STORAGE_KEY = 'sumly_lang';

// Reads the saved language, falling back to Uzbek (the default market language).
function initialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved;
  return 'uz';
}

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
}

// Global language selection, persisted to localStorage so it survives reloads.
export const useLanguageStore = create<LanguageState>((set) => ({
  lang: initialLanguage(),
  setLang: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
}));
