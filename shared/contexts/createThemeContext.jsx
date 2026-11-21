import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function createThemeContext(storageKey = 'theme') {
  const ThemeContext = createContext();

  function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
      const saved = localStorage.getItem(storageKey);
      return saved ? saved === 'dark' : false;
    });

    useEffect(() => {
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem(storageKey, 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem(storageKey, 'light');
      }
    }, [isDark]);

    const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);
    const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  }

  function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  }

  return { ThemeProvider, useTheme };
}

