'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, Music2, Video, CalendarDays, FileText, Image, Map,
  MessageCircleHeart, Inbox, Mail, HardDrive, Settings, Sparkles,
  User, Navigation, LayoutPanelTop, PanelBottom, Share2, Search,
  Palette, ExternalLink, LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

const navItems = [
  { group: 'Overview', items: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ]},
  { group: 'Content', items: [
    { label: 'Menzuma', href: '/admin/music', icon: Music2 },
    { label: 'Videos', href: '/admin/videos', icon: Video },
    { label: 'Events', href: '/admin/events', icon: CalendarDays },
    { label: 'Blog', href: '/admin/blog', icon: FileText },
    { label: 'Gallery', href: '/admin/gallery', icon: Image },
    { label: 'Journey', href: '/admin/journey', icon: Map },
  ]},
  { group: 'Community', items: [
    { label: 'Fan Messages', href: '/admin/fan-messages', icon: MessageCircleHeart },
    { label: 'Contact Inbox', href: '/admin/contact', icon: Inbox },
    { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  ]},
  { group: 'Media', items: [
    { label: 'Media Library', href: '/admin/media', icon: HardDrive },
  ]},
  { group: 'Settings', items: [
    { label: 'Hero Settings', href: '/admin/settings/hero', icon: Sparkles },
    { label: 'About Settings', href: '/admin/settings/about', icon: User },
    { label: 'Navigation', href: '/admin/settings/navigation', icon: Navigation },
    { label: 'Homepage Sections', href: '/admin/settings/homepage-sections', icon: LayoutPanelTop },
    { label: 'Footer', href: '/admin/settings/footer', icon: PanelBottom },
    { label: 'Social Links', href: '/admin/settings/social', icon: Share2 },
    { label: 'Site Settings', href: '/admin/settings/site', icon: Settings },
    { label: 'SEO', href: '/admin/settings/seo', icon: Search },
    { label: 'Theme Studio', href: '/admin/settings/theme', icon: Palette },
  ]},
];

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search modules, settings, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {navItems.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
                className="gap-3"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => window.open('/', '_blank'))}
            className="gap-3"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>View Live Site</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/admin/profile'))}
            className="gap-3"
          >
            <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>Edit Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(async () => {
                await signOut();
                router.push('/admin/login');
              })
            }
            className="gap-3"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
