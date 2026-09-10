'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AlertCircle, Loader2, LogOut } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/admin/login');
      return;
    }

    if (user && profile && !isAdmin) {
      router.push('/admin/login');
      return;
    }
  }, [user, profile, isLoading, isAdmin, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(145_20%_97%)]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(145_20%_97%)] px-4">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-brand-md">
          <AlertCircle className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="heading-serif mt-4 text-2xl font-bold text-foreground">Administrator profile missing</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your Supabase Auth account is valid, but it has no matching row in the public profiles table. Run the setup query below in Supabase SQL Editor, then sign in again.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-[hsl(145_20%_97%)] border border-border p-3 text-xs text-foreground font-mono">
{`insert into public.profiles (id, email, full_name, is_admin)
select id, email, 'Amir Hussen', true
from auth.users
where email = '${user.email || 'your-email@example.com'}'
on conflict (id) do update
set is_admin = true, updated_at = now();`}
          </pre>
          <button
            onClick={signOut}
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-all"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(145_20%_97%)] px-4">
        <div className="w-full max-w-lg rounded-lg border border-border/40 bg-white p-6 shadow-brand-md">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          <h1 className="heading-serif mt-4 text-2xl font-bold text-foreground">Administrator access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">This account is not marked as an administrator.</p>
          <button
            onClick={signOut}
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-all"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
