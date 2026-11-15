import { createThemeContext } from '@shared/contexts/createThemeContext';

const { ThemeProvider, useTheme: useSharedTheme } = createThemeContext('theme');

export { ThemeProvider };

export function useTheme() {
  const ctx = useSharedTheme();
  return {
    ...ctx,
    theme: ctx.isDark ? 'dark' : 'light',
  };
}
