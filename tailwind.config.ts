import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Brand color tokens — map to CSS vars ── */
      colors: {
        /* shadcn/ui semantic tokens */
        background:   'hsl(var(--background))',
        foreground:   'hsl(var(--foreground))',

        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },

        /* ── Direct brand palette tokens ── */
        brand: {
          primary:       'hsl(var(--color-primary))',
          'primary-dark':'hsl(var(--color-primary-dark))',
          'primary-light':'hsl(var(--color-primary-light))',
          accent:        'hsl(var(--color-accent))',
          surface:       'hsl(var(--color-surface))',
          'surface-alt': 'hsl(var(--color-surface-alt))',
          text:          'hsl(var(--color-text))',
          'text-muted':  'hsl(var(--color-text-muted))',
          border:        'hsl(var(--color-border))',
        },
      },

      /* ── Typography ── */
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
      },

      /* ── Spacing ── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      /* ── Border radius — tied to --radius ── */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      /* ── Shadows — green-tinted ── */
      boxShadow: {
        'brand-sm': '0 1px 4px hsl(152 55% 22% / 0.08), 0 1px 2px hsl(152 55% 22% / 0.06)',
        'brand-md': '0 4px 16px hsl(152 55% 22% / 0.12), 0 2px 6px hsl(152 55% 22% / 0.08)',
        'brand-lg': '0 8px 32px hsl(152 55% 22% / 0.16), 0 4px 12px hsl(152 55% 22% / 0.10)',
        'brand-xl': '0 16px 48px hsl(152 55% 22% / 0.20), 0 8px 20px hsl(152 55% 22% / 0.12)',
        'inner-sm': 'inset 0 1px 3px hsl(152 55% 22% / 0.10)',
      },

      /* ── Background images ── */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand':  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
      },

      /* ── Animations ── */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':        'fade-up 0.6s ease-out both',
        'fade-in':        'fade-in 0.4s ease-out both',
        shimmer:          'shimmer 2s infinite linear',
        pulse:            'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      /* ── Typography line heights ── */
      lineHeight: {
        'display': '1.1',
        'heading': '1.2',
        'prose':   '1.85',
      },

      /* ── Letter spacing ── */
      letterSpacing: {
        'tighter-display': '-0.03em',
        'eyebrow':         '0.18em',
      },

      /* ── Max widths ── */
      maxWidth: {
        'prose-narrow':  '60ch',
        'prose':         '70ch',
        'prose-wide':    '80ch',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
