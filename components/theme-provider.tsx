'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ThemeSettings } from '@/lib/types/database';

type ThemeContextValue = {
  theme: ThemeSettings | null;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  isLoading: true,
});

const DEFAULT_THEME: Partial<ThemeSettings> = {
  preset: 'emerald',
  primary_bg: '#0a1f1a',
  secondary_bg: '#0f2a22',
  accent: '#c9a96e',
  gold_highlight: '#d4af37',
  text_color: '#f5f5f0',
  muted_text: '#9ca3af',
  border_radius: '0.5rem',
  animation_intensity: 'moderate',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTheme = async () => {
      const { data } = await supabase
        .from('theme_settings')
        .select('*')
        .maybeSingle();
      if (data) {
        setTheme(data as ThemeSettings);
      } else {
        setTheme(DEFAULT_THEME as ThemeSettings);
      }
      setIsLoading(false);
    };
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
