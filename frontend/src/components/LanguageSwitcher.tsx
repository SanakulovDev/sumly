import { useLanguageStore } from '../store/languageStore';
import { LANGUAGES, type Language } from '../i18n/translations';

// Compact language selector used in the desktop header and the Settings page.
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguageStore();
  return (
    <select
      aria-label="Language"
      className={`input w-auto py-1.5 text-sm ${className}`}
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

// Segmented control variant for the Settings page.
export function LanguageSegmented() {
  const { lang, setLang } = useLanguageStore();
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            lang === l.code ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
