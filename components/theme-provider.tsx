'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ThemeSettings } from '@/lib/types/database';

type ThemeContextValue = {
  theme: ThemeSettings | null;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  isLoading: true,
  refreshTheme: async () => {},
});

/** Apply green/white theme settings as CSS variable overrides on <html>. */
function applyTheme(theme: ThemeSettings) {
  const root = document.documentElement;

  // Font overrides
  if (theme.heading_font) {
    root.style.setProperty('--font-display-override', theme.heading_font);
  }
  if (theme.body_font) {
    root.style.setProperty('--font-body-override', theme.body_font);
  }

  // Border radius
  if (theme.border_radius) {
    root.style.setProperty('--radius', theme.border_radius);
  }

  // Color overrides — only apply if the preset is not the system default.
  if (theme.preset !== 'forest-white' && theme.preset !== 'default') {
    if (theme.primary_bg && theme.primary_bg !== '#1a5c38') {
      root.style.setProperty('--applied-primary-override', '1');
    }
    switch (theme.preset) {
      case 'forest-white':
        break;
      case 'deep-forest':
        root.style.setProperty('--primary', '152 65% 18%');
        root.style.setProperty('--accent', '152 70% 28%');
        break;
      case 'sage-white':
        root.style.setProperty('--primary', '145 40% 30%');
        root.style.setProperty('--accent', '145 50% 38%');
        break;
      case 'emerald-fresh':
        root.style.setProperty('--primary', '158 70% 25%');
        root.style.setProperty('--accent', '158 75% 35%');
        break;
      default:
        break;
    }
  }

  // Animation intensity
  if (theme.animation_intensity) {
    const durationMap: Record<string, string> = {
      subtle: '0.3',
      moderate: '0.6',
      dynamic: '0.9',
      none: '0.01',
    };
    root.style.setProperty(
      '--animation-duration-scale',
      durationMap[theme.animation_intensity] ?? '0.6'
    );
  }

  // Section spacing
  if (theme.section_spacing) {
    const spacingMap: Record<string, string> = {
      compact: '3rem',
      normal: '6rem',
      spacious: '9rem',
    };
    root.style.setProperty(
      '--section-spacing',
      spacingMap[theme.section_spacing] ?? '6rem'
    );
  }
}

type ThemeProviderProps = {
  children: ReactNode;
  /** Server-fetched initial theme — avoids FOUC by not needing a client fetch */
  initialTheme?: ThemeSettings | null;
};

export function ThemeProvider({ children, initialTheme = null }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeSettings | null>(initialTheme);
  const [isLoading, setIsLoading] = useState(!initialTheme);
  const supabase = createClient();

  const fetchTheme = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('theme_settings')
        .select('*')
        .maybeSingle();
      if (data) {
        setTheme(data as ThemeSettings);
        applyTheme(data as ThemeSettings);
      }
    } catch {
      // Non-critical — fall back to CSS defaults
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Apply initial theme on mount (from server-fetched data)
  useEffect(() => {
    if (initialTheme) {
      applyTheme(initialTheme);
      setIsLoading(false);
    } else {
      // Fallback: fetch client-side if no initial data provided
      fetchTheme();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSettings() {
  return useContext(ThemeContext);
}
