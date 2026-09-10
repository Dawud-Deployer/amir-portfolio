import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { getThemeSettings } from '@/lib/services/public-data';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Amir Hussen — Ethiopian Menzuma Artist',
    template: '%s | Amir Hussen',
  },
  description:
    'Official website of Amir Hussen (አሚር ሁሴን), Ethiopian Muslim Menzuma and Nasheed artist. Explore spiritual music, events, gallery, and stories.',
  keywords: [
    'Amir Hussen',
    'Ethiopian Menzuma',
    'Nasheed',
    'Ethiopian Muslim artist',
    'Menzuma artist',
    'Islamic music Ethiopia',
  ],
  authors: [{ name: 'Amir Hussen' }],
  creator: 'Amir Hussen',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Amir Hussen',
    title: 'Amir Hussen — Ethiopian Menzuma Artist',
    description:
      'Official website of Amir Hussen, Ethiopian Muslim Menzuma and Nasheed artist.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir Hussen — Ethiopian Menzuma Artist',
    description:
      'Official website of Amir Hussen, Ethiopian Muslim Menzuma and Nasheed artist.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch theme settings server-side to prevent FOUC
  const themeSettings = await getThemeSettings();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider initialTheme={themeSettings}>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast:
                    'bg-card border border-border text-foreground shadow-brand-md',
                  title: 'text-foreground font-semibold text-sm',
                  description: 'text-muted-foreground text-sm',
                  success:
                    'border-primary/40 [&_[data-icon]]:text-primary',
                  error:
                    'border-destructive/40 [&_[data-icon]]:text-destructive',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
