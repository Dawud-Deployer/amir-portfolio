'use client';

/**
 * Triggers on-demand ISR revalidation after admin content changes.
 *
 * Call this after any admin save/update action to ensure the public
 * site reflects changes within seconds (instead of waiting for the
 * 60-second ISR timer).
 *
 * @param paths - Specific paths to revalidate. Defaults to homepage.
 * @returns true if revalidation succeeded
 */
export async function triggerRevalidation(paths?: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: paths || ['/'] }),
    });
    return res.ok;
  } catch {
    // Non-critical — worst case, ISR timer catches it in 60s
    console.warn('Revalidation request failed — changes will appear after ISR timer.');
    return false;
  }
}
