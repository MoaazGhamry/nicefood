'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Default is ALWAYS clean, luminous white mode per client requirement
    const saved = localStorage.getItem('nicefood-theme-v2') as Theme | null;
    const initial = saved === 'dark' ? 'dark' : 'light';
    setThemeState(initial);
    document.documentElement.setAttribute('data-theme', initial);
    if (!saved) {
      localStorage.setItem('nicefood-theme-v2', 'light');
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('nicefood-theme-v2', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
