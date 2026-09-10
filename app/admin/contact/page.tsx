'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { createClient } from '@/lib/supabase/client';
import type { ContactMessage } from '@/lib/types/database';
import { Mail, MailOpen, Archive, Trash2, Loader2, Inbox, Phone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type InboxFilter = 'unread' | 'read' | 'archived' | 'all';

const INQUIRY_LABELS: Record<string, string> = {
  booking: 'Booking',
  collaboration: 'Collaboration',
  press: 'Press / Media',
  general: 'General',
  other: 'Other',
};

export default function ContactPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<InboxFilter>('unread');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'unread') query = query.eq('is_read', false).eq('is_archived', false);
    else if (filter === 'read') query = query.eq('is_read', true).eq('is_archived', false);
    else if (filter === 'archived') query = query.eq('is_archived', true);

    const { data } = await query;
    setMessages((data || []) as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => { loadMessages(); }, [filter]);

  const update = async (id: string, changes: Partial<ContactMessage>) => {
    setActionId(id);
    await supabase
      .from('contact_messages')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id);
    toast.success('Updated');
          await triggerRevalidation();
    await loadMessages();
    setActionId(null);
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete message from ${name}?`)) return;
    setActionId(id);
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted');
          await triggerRevalidation();
      await loadMessages();
    }
    setActionId(null);
  };

  const handleExpand = (id: string, isRead: boolean) => {
    setExpanded((prev) => (prev === id ? null : id));
    if (!isRead) update(id, { is_read: true });
  };

  return (
    <AdminLayout title="Contact Inbox" subtitle="Messages from visitors and bookers" backHref="/admin">
      {/* ── Filter tabs ── */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit shadow-brand-sm">
        {(['unread', 'read', 'archived', 'all'] as InboxFilter[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all capitalize ${
              filter === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === 'unread' ? 'Inbox is clear.' : `No ${filter} messages.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expanded === msg.id;
            return (
              <div
                key={msg.id}
                className={`rounded-lg border bg-white transition-all ${
                  !msg.is_read && !msg.is_archived
                    ? 'border-primary/30 bg-primary/3'
                    : 'border-border'
                } ${msg.is_archived ? 'opacity-60' : ''}`}
              >
                {/* Collapsed header */}
                <button
                  type="button"
                  className="w-full text-left p-4 flex items-start gap-3"
                  onClick={() => handleExpand(msg.id, msg.is_read)}
                >
                  <div className="mt-0.5 shrink-0">
                    {msg.is_read
                      ? <MailOpen className="h-4 w-4 text-muted-foreground" />
                      : <Mail className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-medium ${!msg.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.email}</span>
                      {msg.inquiry_type && (
                        <span className="inline-flex items-center rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                          {INQUIRY_LABELS[msg.inquiry_type] || msg.inquiry_type}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {msg.subject && <p className="mt-0.5 text-sm text-foreground truncate">{msg.subject}</p>}
                    {!isExpanded && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{msg.message}</p>
                    )}
                  </div>
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                    {/* Contact details */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${msg.email}`} className="hover:text-primary underline">
                          {msg.email}
                        </a>
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          {msg.phone}
                        </div>
                      )}
                      {msg.organization && (
                        <div className="col-span-2">Org: {msg.organization}</div>
                      )}
                      {msg.event_date && (
                        <div>Event date: {new Date(msg.event_date).toLocaleDateString()}</div>
                      )}
                      {msg.location && <div>Location: {msg.location}</div>}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Reply via email
                      </a>
                      {!msg.is_archived && (
                        <button type="button" disabled={actionId === msg.id}
                          onClick={() => update(msg.id, { is_archived: true, is_read: true })}
                          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                          <Archive className="h-3.5 w-3.5" /> Archive
                        </button>
                      )}
                      {msg.is_archived && (
                        <button type="button" disabled={actionId === msg.id}
                          onClick={() => update(msg.id, { is_archived: false })}
                          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                          Unarchive
                        </button>
                      )}
                      <button type="button" disabled={actionId === msg.id}
                        onClick={() => remove(msg.id, msg.name)}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
