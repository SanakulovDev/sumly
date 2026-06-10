import { useThemeStore, type ThemeMode } from '../store/themeStore';
import { useT } from '../i18n/useT';
import { SunIcon, MoonIcon, AutoThemeIcon } from './icons';

const ICONS: Record<ThemeMode, (p: { className?: string }) => JSX.Element> = {
  light: SunIcon,
  dark: MoonIcon,
  auto: AutoThemeIcon,
};

// Segmented Light / Dark / Auto control for the Settings page.
export function ThemeSegmented() {
  const { mode, setMode } = useThemeStore();
  const { t } = useT();

  const options: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'auto', label: t('settings.themeAuto') },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
      {options.map(({ value, label }) => {
        const Icon = ICONS[value];
        const active = mode === value;
        return (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-brand-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Compact icon button that cycles light → dark → auto, for headers/top bars.
export function ThemeQuickToggle({ className = '' }: { className?: string }) {
  const { mode, resolved, setMode } = useThemeStore();

  const next: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'auto', auto: 'light' };
  // Show the icon of the theme actually displayed (or "auto" badge in auto mode).
  const Icon = mode === 'auto' ? AutoThemeIcon : resolved === 'dark' ? MoonIcon : SunIcon;

  return (
    <button
      onClick={() => setMode(next[mode])}
      aria-label="Toggle theme"
      title={mode}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
