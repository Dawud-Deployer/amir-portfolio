'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { 
  Music2, Video, FileText, CalendarDays, Image as ImageIcon, 
  Mail, Inbox, MessageCircleHeart, Plus, ArrowRight 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

type ContactMessage = {
  id: string;
  name: string;
  subject: string | null;
  created_at: string;
  is_read: boolean;
};

type FanMessage = {
  id: string;
  name: string;
  message: string;
  created_at: string;
  status: string;
};

export default function AdminDashboardPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [stats, setStats] = useState({
    music: 0,
    videos: 0,
    blogPosts: 0,
    events: 0,
    gallery: 0,
    subscribers: 0,
    unreadMessages: 0,
    pendingFans: 0
  });

  const [recentContacts, setRecentContacts] = useState<ContactMessage[]>([]);
  const [recentFans, setRecentFans] = useState<FanMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchDashboardData() {
      setIsLoading(true);
      
      const getCount = async (table: string, filters: Record<string, any> = {}) => {
        let query = supabase.from(table).select('*', { count: 'exact', head: true });
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
        const { count, error } = await query;
        if (error) console.error(`Error counting ${table}:`, error);
        return count || 0;
      };

      try {
        const [
          music, videos, blogPosts, events, gallery, subscribers, unreadMessages, pendingFans,
          contactsRes, fansRes
        ] = await Promise.all([
          getCount('music', { is_published: true }),
          getCount('videos', { is_published: true }),
          getCount('blog_posts', { status: 'published' }),
          getCount('events', { is_published: true }),
          getCount('gallery_items', { is_published: true }),
          getCount('newsletter_subscribers', { status: 'active' }),
          getCount('contact_messages', { is_read: false }),
          getCount('fan_messages', { status: 'pending' }),
          supabase.from('contact_messages')
            .select('id, name, subject, created_at, is_read')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('fan_messages')
            .select('id, name, message, created_at, status')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        if (isMounted) {
          setStats({
            music, videos, blogPosts, events, gallery, subscribers, unreadMessages, pendingFans
          });
          setRecentContacts(contactsRes.data as ContactMessage[] || []);
          setRecentFans(fansRes.data as FanMessage[] || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const statCards = [
    { label: 'Menzuma Tracks', count: stats.music, icon: Music2, href: '/admin/music' },
    { label: 'Videos', count: stats.videos, icon: Video, href: '/admin/videos' },
    { label: 'Blog Posts', count: stats.blogPosts, icon: FileText, href: '/admin/blog' },
    { label: 'Events', count: stats.events, icon: CalendarDays, href: '/admin/events' },
    { label: 'Gallery Images', count: stats.gallery, icon: ImageIcon, href: '/admin/gallery' },
    { label: 'Newsletter Subs', count: stats.subscribers, icon: Mail, href: '/admin/newsletter' },
    { 
      label: 'Unread Messages', count: stats.unreadMessages, icon: Inbox, href: '/admin/contact',
      highlight: stats.unreadMessages > 0
    },
    { 
      label: 'Pending Fans', count: stats.pendingFans, icon: MessageCircleHeart, href: '/admin/fan-messages',
      highlight: stats.pendingFans > 0
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Welcome Banner ── */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Here's what's happening with your site today.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/music" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium hover:border-primary/50 hover:shadow-brand-sm transition-all text-foreground">
            <Plus className="h-4 w-4" /> New Menzuma
          </Link>
          <Link href="/admin/blog" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium hover:border-primary/50 hover:shadow-brand-sm transition-all text-foreground">
            <Plus className="h-4 w-4" /> New Blog Post
          </Link>
          <Link href="/admin/events" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium hover:border-primary/50 hover:shadow-brand-sm transition-all text-foreground">
            <Plus className="h-4 w-4" /> New Event
          </Link>
          <Link href="/admin/gallery" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium hover:border-primary/50 hover:shadow-brand-sm transition-all text-foreground">
            <Plus className="h-4 w-4" /> Upload to Gallery
          </Link>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-lg" />
              ))
            : statCards.map((card, idx) => (
                <Link key={idx} href={card.href} className="block group">
                  <div className={`h-full rounded-lg border shadow-brand-sm p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-brand-md ${
                    card.highlight 
                      ? 'border-amber-200 bg-amber-50 group-hover:border-amber-300' 
                      : 'border-border bg-white group-hover:border-primary/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        card.highlight 
                          ? 'bg-amber-100 border-amber-200 text-amber-600'
                          : 'bg-primary/8 border-primary/15 text-primary'
                      }`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className={`text-sm font-medium ${card.highlight ? 'text-amber-800' : 'text-muted-foreground'}`}>
                        {card.label}
                      </p>
                      <h3 className={`text-3xl font-bold mt-1 ${card.highlight ? 'text-amber-900' : 'text-foreground'}`}>
                        {card.count}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))
          }
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contact Messages */}
        <div className="rounded-lg border border-border bg-white shadow-brand-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="border-b border-border p-5 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Contact Messages</h2>
          </div>
          <div className="p-0 flex-1">
            {isLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : recentContacts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Inbox className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No contact messages found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentContacts.map((msg) => (
                  <li key={msg.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <Link href={`/admin/contact/${msg.id}`} className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground truncate">{msg.name}</span>
                          {!msg.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Unread" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{msg.subject || 'No subject'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-border p-3 bg-muted/10 mt-auto">
            <Link href="/admin/contact" className="flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 gap-1 transition-colors">
              View all messages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Pending Fan Messages */}
        <div className="rounded-lg border border-border bg-white shadow-brand-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="border-b border-border p-5 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pending Fan Messages</h2>
            {stats.pendingFans > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                {stats.pendingFans} pending
              </span>
            )}
          </div>
          <div className="p-0 flex-1">
            {isLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : recentFans.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <MessageCircleHeart className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No pending fan messages to review.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentFans.map((fan) => (
                  <li key={fan.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <Link href={`/admin/fan-messages?id=${fan.id}`} className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate mb-1">{fan.name}</div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{fan.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(fan.created_at), { addSuffix: true })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-border p-3 bg-muted/10 mt-auto">
            <Link href="/admin/fan-messages" className="flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 gap-1 transition-colors">
              Review all pending <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
