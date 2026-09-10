'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Menu, 
  Search, 
  ExternalLink, 
  Bell, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type AdminTopbarProps = {
  title?: string;
  onMobileMenuToggle: () => void;
  onSearchOpen: () => void;
  unreadCount?: number;
  logoUrl?: string | null;
};

export function AdminTopbar({
  title,
  onMobileMenuToggle,
  onSearchOpen,
  unreadCount = 0,
  logoUrl,
}: AdminTopbarProps) {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white/80 backdrop-blur-lg border-b border-border shadow-brand-sm px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-8 w-auto md:hidden object-contain" />
        )}

        {title && (
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onSearchOpen}
          className="hidden sm:flex items-center gap-2 border border-border rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/50 bg-muted/30 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <button
          onClick={onSearchOpen}
          className="sm:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Live Site</span>
        </Link>

        <Link
          href="/admin/contact"
          className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Link>
      </div>
    </header>
  );
}
