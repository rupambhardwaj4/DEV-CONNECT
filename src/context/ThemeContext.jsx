import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadPrefs, savePrefs } from '../lib/storage.js';

const ThemeContext = createContext(null);

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Theme + motion preferences, persisted in the shared prefs record so Settings can own
 * every user preference in one place.
 */
export function ThemeProvider({ children }) {
  const [prefs, setPrefs] = useState(() => ({
    theme: 'system',
    reduceMotion: false,
    ...loadPrefs({ theme: 'system', reduceMotion: false }),
  }));

  const resolved = prefs.theme === 'system' ? systemTheme() : prefs.theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute(
      'data-reduce-motion',
      prefs.reduceMotion ? 'true' : 'false',
    );
  }, [resolved, prefs.reduceMotion]);

  // Follow the OS while the user has not made an explicit choice.
  useEffect(() => {
    if (prefs.theme !== 'system') return undefined;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setPrefs((p) => ({ ...p }));
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [prefs.theme]);

  const update = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme: prefs.theme,
      resolvedTheme: resolved,
      isDark: resolved === 'dark',
      reduceMotion: prefs.reduceMotion,
      setTheme: (theme) => update({ theme }),
      toggleTheme: () => update({ theme: resolved === 'dark' ? 'light' : 'dark' }),
      setReduceMotion: (reduceMotion) => update({ reduceMotion }),
      prefs,
    }),
    [prefs, resolved, update],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
