'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { createClient } from '@/lib/supabase/client';
import type { FanMessage } from '@/lib/types/database';
import { Check, X, Star, StarOff, Trash2, Loader2, MessageCircleHeart, Filter } from 'lucide-react';
import { toast } from 'sonner';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function FanMessagesPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    let query = supabase
      .from('fan_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setMessages((data || []) as FanMessage[]);
    setLoading(false);
  };

  useEffect(() => { loadMessages(); }, [filter]);

  const update = async (id: string, changes: Partial<FanMessage>) => {
    setActionId(id);
    const { error } = await supabase
      .from('fan_messages')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('Action failed');
    } else {
      toast.success('Updated');
          await triggerRevalidation();
      await loadMessages();
    }
    setActionId(null);
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete message from ${name}?`)) return;
    setActionId(id);
    const { error } = await supabase.from('fan_messages').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted');
          await triggerRevalidation();
      await loadMessages();
    }
    setActionId(null);
  };

  const counts = {
    pending: messages.filter((m) => m.status === 'pending').length,
  };

  return (
    <AdminLayout title="Fan Messages" subtitle="Moderate messages from fans" backHref="/admin" previewHref="/fan-messages">
      {/* ── Filter tabs ── */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit shadow-brand-sm">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((tab) => (
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
            {tab === 'pending' && counts.pending > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-destructive text-white text-xs w-5 h-5">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
          <MessageCircleHeart className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === 'pending' ? 'No messages awaiting review.' : `No ${filter} messages.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg border bg-white p-5 transition-all ${
                msg.status === 'pending'
                  ? 'border-amber-200 bg-amber-50/30'
                  : msg.status === 'approved'
                  ? 'border-primary/20'
                  : 'border-border opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">{msg.name}</span>
                    {(msg.city || msg.country) && (
                      <span className="text-xs text-muted-foreground">
                        {[msg.city, msg.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {msg.social_handle && (
                      <span className="text-xs text-primary">@{msg.social_handle}</span>
                    )}
                    <span
                      className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        msg.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : msg.status === 'approved'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {msg.status}
                    </span>
                    {msg.is_featured && (
                      <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* Message body */}
                  <p className="text-sm text-foreground leading-relaxed">{msg.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {msg.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={actionId === msg.id}
                    onClick={() => update(msg.id, { status: 'approved' })}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {msg.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={actionId === msg.id}
                    onClick={() => update(msg.id, { status: 'rejected' })}
                    className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
                <button
                  type="button"
                  disabled={actionId === msg.id}
                  onClick={() => update(msg.id, { is_featured: !msg.is_featured })}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-yellow-50 hover:text-yellow-700 transition-colors disabled:opacity-50"
                >
                  {msg.is_featured
                    ? <><StarOff className="h-3.5 w-3.5" /> Unfeature</>
                    : <><Star className="h-3.5 w-3.5" /> Feature</>}
                </button>
                <button
                  type="button"
                  disabled={actionId === msg.id}
                  onClick={() => remove(msg.id, msg.name)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
