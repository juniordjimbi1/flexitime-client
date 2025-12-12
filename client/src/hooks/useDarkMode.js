// client/src/hooks/useDarkMode.js
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'ft_theme'; // 'light' | 'dark' | 'auto' (on garde 2 valeurs pour simplicité)

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'auto' && getSystemPrefersDark());
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export default function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return getSystemPrefersDark() ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Si l’utilisateur change le thème système pendant qu’on est en "auto" (non utilisé ici)
  useEffect(() => {
    const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (!mql || theme !== 'auto') return;
    const onChange = () => applyTheme('auto');
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', onChange) : mql.removeListener(onChange);
    };
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggle, isDark: theme === 'dark' };
}
