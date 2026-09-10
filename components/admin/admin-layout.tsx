'use client';

/**
 * AdminLayout — Lightweight page-level content wrapper.
 *
 * The admin shell (sidebar + topbar + auth guard) is now handled by
 * `app/admin/layout.tsx` via AdminShell. This component provides
 * per-page title/subtitle rendering and consistent content spacing
 * for backwards compatibility with all existing admin pages.
 */

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  /** @deprecated — navigation is now handled by the sidebar. Kept for compat. */
  backHref?: string;
  /** @deprecated — "View Site" is now in the topbar. Kept for compat. */
  previewHref?: string;
};

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      {(title || subtitle) && (
        <div className="mb-8">
          <p className="eyebrow">{title}</p>
          {subtitle && (
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {/* Page content */}
      {children}
    </div>
  );
}
