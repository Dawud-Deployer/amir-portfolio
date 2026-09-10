'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Music2, Video, CalendarDays, FileText, Image, Map,
  MessageCircleHeart, Inbox, Mail, HardDrive, Sparkles, User, Navigation,
  LayoutPanelTop, PanelBottom, Share2, Settings, Search, Palette, Leaf,
  ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarNavItem } from './sidebar-nav-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

interface AdminSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  logoUrl?: string | null
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    label: 'Content',
    items: [
      { label: 'Menzuma', href: '/admin/music', icon: Music2 },
      { label: 'Videos', href: '/admin/videos', icon: Video },
      { label: 'Events', href: '/admin/events', icon: CalendarDays },
      { label: 'Blog', href: '/admin/blog', icon: FileText },
      { label: 'Gallery', href: '/admin/gallery', icon: Image },
      { label: 'Journey', href: '/admin/journey', icon: Map }
    ]
  },
  {
    label: 'Community',
    items: [
      { label: 'Fan Messages', href: '/admin/fan-messages', icon: MessageCircleHeart },
      { label: 'Contact Inbox', href: '/admin/contact', icon: Inbox },
      { label: 'Newsletter', href: '/admin/newsletter', icon: Mail }
    ]
  },
  {
    label: 'Media',
    items: [
      { label: 'Media Library', href: '/admin/media', icon: HardDrive }
    ]
  },
  {
    label: 'Settings',
    items: [
      { label: 'Hero', href: '/admin/settings/hero', icon: Sparkles },
      { label: 'About', href: '/admin/settings/about', icon: User },
      { label: 'Navigation', href: '/admin/settings/navigation', icon: Navigation },
      { label: 'Homepage Sections', href: '/admin/settings/homepage-sections', icon: LayoutPanelTop },
      { label: 'Footer', href: '/admin/settings/footer', icon: PanelBottom },
      { label: 'Social Links', href: '/admin/settings/social', icon: Share2 },
      { label: 'Site', href: '/admin/settings/site', icon: Settings },
      { label: 'SEO', href: '/admin/settings/seo', icon: Search },
      { label: 'Theme Studio', href: '/admin/settings/theme', icon: Palette }
    ]
  }
]

function NavGroup({ group, collapsed }: { group: typeof navGroups[0], collapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={cn("space-y-1", collapsed ? "" : "py-2")}>
      {!collapsed ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1 mb-1 text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold hover:text-muted-foreground transition-colors">
            {group.label}
            <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen ? "" : "-rotate-90")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {group.items.map((item, j) => (
              <SidebarNavItem
                key={j}
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="space-y-1">
          {group.items.map((item, j) => (
            <SidebarNavItem
              key={j}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminSidebar({ collapsed, onToggleCollapse, logoUrl }: AdminSidebarProps) {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : ''

  return (
    <aside
      className={cn(
        "flex flex-col h-screen z-40 bg-[#0A0F2C]/95 backdrop-blur-lg border-r border-border transition-all duration-200 text-slate-200",
        collapsed ? "w-16" : "w-full md:w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-4 overflow-hidden">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-primary/10 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Leaf className="h-5 w-5 text-primary" />
            )}
          </div>
          {!collapsed && (
            <span className="ml-3 font-semibold text-sm tracking-tight text-white whitespace-nowrap">
              AMIR HUSSEN
            </span>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.setItem('admin-sidebar-collapsed', 'true')
              onToggleCollapse()
            }}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-4 flex flex-col gap-2">
          {navGroups.map((group, i) => (
            <div key={i} className={cn("w-full", i > 0 && "border-t border-border/40")}>
              <NavGroup group={group} collapsed={collapsed} />
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/40 p-3">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.setItem('admin-sidebar-collapsed', 'false')
              onToggleCollapse()
            }}
            className="w-full h-10 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-12 px-2 hover:bg-slate-800 transition-colors">
                <Avatar className="h-8 w-8 border border-border">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'Admin'} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {initials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex flex-col items-start overflow-hidden text-left">
                  <span className="text-sm font-medium text-white truncate w-full">
                    {profile?.full_name || 'Administrator'}
                  </span>
                  <span className="text-xs text-slate-400 truncate w-full">
                    {profile?.email || 'admin@amirhussen.com'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="cursor-pointer flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  )
}
