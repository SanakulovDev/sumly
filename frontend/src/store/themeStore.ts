import { create } from 'zustand';

// Three user-facing choices. "auto" follows the operating system preference and
// updates live when the OS switches between light and dark.
export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'sumly_theme';

const media = window.matchMedia('(prefers-color-scheme: dark)');

// Reads the saved mode, defaulting to "auto" so first-time users match their OS.
function initialMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  return 'auto';
}

// Resolves a mode to the concrete theme actually shown.
function resolve(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') return media.matches ? 'dark' : 'light';
  return mode;
}

// Applies the resolved theme by toggling the `dark` class on <html>.
function apply(mode: ThemeMode) {
  const resolved = resolve(mode);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.style.colorScheme = resolved;
}

interface ThemeState {
  mode: ThemeMode;
  // The concrete theme currently displayed (for UI that needs to know).
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const mode = initialMode();
  apply(mode);

  // When in "auto", react to OS theme changes immediately.
  media.addEventListener('change', () => {
    if (get().mode === 'auto') {
      apply('auto');
      set({ resolved: resolve('auto') });
    }
  });

  return {
    mode,
    resolved: resolve(mode),
    setMode: (next) => {
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
      set({ mode: next, resolved: resolve(next) });
    },
  };
});
