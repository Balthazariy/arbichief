import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [storedTheme, setStoredTheme] = useKV<Theme>('app-theme', 'light');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    }
  }, [storedTheme]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme, setTheme: setThemeValue };
}
