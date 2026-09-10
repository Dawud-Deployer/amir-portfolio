'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminSidebar } from '@/components/admin/sidebar/admin-sidebar';
import { AdminTopbar } from '@/components/admin/topbar/admin-topbar';
import { CommandPalette } from '@/components/admin/command-palette';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';

const SIDEBAR_KEY = 'admin-sidebar-collapsed';

function AdminShellContent({ children, logoUrl }: { children: React.ReactNode, logoUrl?: string | null }) {
  const pathname = usePathname();

  // Sidebar collapse state (persisted to localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Restore sidebar preference
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === 'true') setSidebarCollapsed(true);
  }, []);

  // Persist sidebar preference
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch unread counts for notification badge
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const supabase = createClient();
        const [contactRes, fanRes] = await Promise.all([
          supabase
            .from('contact_messages')
            .select('id', { count: 'exact', head: true })
            .eq('is_read', false),
          supabase
            .from('fan_messages')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
        ]);
        setUnreadCount((contactRes.count || 0) + (fanRes.count || 0));
      } catch {
        // Silently fail — notification count is non-critical
      }
    };
    fetchUnread();
    // Refresh every 60 seconds
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(145_20%_97%)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          logoUrl={logoUrl}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <AdminSidebar
            collapsed={false}
            onToggleCollapse={() => setMobileMenuOpen(false)}
            logoUrl={logoUrl}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area — offset by sidebar width */}
      <div
        className={`transition-all duration-200 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Top bar */}
        <AdminTopbar
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          onSearchOpen={() => setCommandOpen(true)}
          unreadCount={unreadCount}
          logoUrl={logoUrl}
        />

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

export default function AdminShell({ children, logoUrl }: { children: React.ReactNode, logoUrl?: string | null }) {
  const pathname = usePathname();

  // Login page gets a bare layout — no sidebar, no topbar, no auth guard
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <AdminShellContent logoUrl={logoUrl}>{children}</AdminShellContent>
    </AdminGuard>
  );
}
