import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';

export const metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(145_20%_97%)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-6">
          <Search className="w-8 h-8 text-primary" aria-hidden="true" />
        </div>

        <h1 className="heading-serif text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-accent transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" /> Go home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-white text-sm font-semibold rounded-md hover:border-primary transition-colors"
          >
            Browse blog <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
