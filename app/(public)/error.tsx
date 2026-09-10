'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(145_20%_97%)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>

        <h1 className="heading-serif text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-accent transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-white text-sm font-semibold rounded-md hover:border-primary transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" /> Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
