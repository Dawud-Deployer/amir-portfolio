'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { createClient } from '@/lib/supabase/client';
import type { NewsletterSubscriber } from '@/lib/types/database';
import { Mail, Loader2, Download, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'subscribed' | 'unsubscribed';

export default function NewsletterPage() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('subscribed');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setLoading(true);
    let query = supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    setSubscribers((data || []) as NewsletterSubscriber[]);
    setLoading(false);
  };

  useEffect(() => { loadSubscribers(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setActionId(id);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error('Update failed');
    } else {
      toast.success('Updated');
          await triggerRevalidation();
      await loadSubscribers();
    }
    setActionId(null);
  };

  const remove = async (id: string, email: string) => {
    if (!window.confirm(`Delete subscriber ${email}?`)) return;
    setActionId(id);
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted');
          await triggerRevalidation();
      await loadSubscribers();
    }
    setActionId(null);
  };

  const exportCSV = () => {
    const rows = [['Email', 'Status', 'Source', 'Subscribed At']];
    subscribers.forEach((s) => {
      rows.push([s.email, s.status, s.source || '', new Date(s.created_at).toLocaleDateString()]);
    });
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported');
  };

  return (
    <AdminLayout title="Newsletter" subtitle={`${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}`} backHref="/admin">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1 shadow-brand-sm">
          {(['subscribed', 'unsubscribed', 'all'] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all capitalize ${
                filter === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="btn-ghost text-xs disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No {filter !== 'all' ? filter + ' ' : ''}subscribers.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white overflow-hidden shadow-brand-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground hidden sm:table-cell">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{sub.source || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      sub.status === 'subscribed'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {sub.status === 'subscribed' ? (
                        <button
                          type="button"
                          disabled={actionId === sub.id}
                          onClick={() => updateStatus(sub.id, 'unsubscribed')}
                          title="Unsubscribe"
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionId === sub.id}
                          onClick={() => updateStatus(sub.id, 'subscribed')}
                          title="Resubscribe"
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionId === sub.id}
                        onClick={() => remove(sub.id, sub.email)}
                        title="Delete"
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
