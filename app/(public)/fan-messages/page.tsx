'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Quote, Heart, Loader2 } from 'lucide-react';
import type { FanMessage } from '@/lib/types/database';

export default function FanMessagesPage() {
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', message: '', country: '', city: '', social_handle: '' });

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('fan_messages')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      setMessages((data || []) as FanMessage[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('fan_messages').insert({
        ...form,
        status: 'pending',
      });
      if (error) {
        toast.error('Could not submit message. Please try again.');
      } else {
        toast.success('Thank you! Your message will appear after review.');
        setForm({ name: '', message: '', country: '', city: '', social_handle: '' });
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Fan Messages</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Messages from the Heart</h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Share your appreciation and messages of support for Amir Hussen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="heading-serif text-xl font-semibold mb-4">Share Your Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border/50 bg-card p-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name *</label>
                <input required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your Message *</label>
                <textarea required value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} rows={4} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                  <input value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Country</label>
                  <input value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Social Handle (optional)</label>
                <input value={form.social_handle} onChange={(e) => setForm(p => ({ ...p, social_handle: e.target.value }))} placeholder="@username" className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Heart className="w-4 h-4" /> Share Message</>}
              </button>
              <p className="text-xs text-muted-foreground text-center">Messages are reviewed before appearing publicly.</p>
            </form>
          </div>

          <div>
            <h2 className="heading-serif text-xl font-semibold mb-4">Messages from Fans</h2>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center border border-border/30 rounded-lg">
                No messages yet. Be the first to share!
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
                {messages.map((msg) => (
                  <div key={msg.id} className="rounded-lg border border-border/50 bg-card p-5">
                    <Quote className="w-6 h-6 text-primary/30 mb-2" />
                    <p className="text-sm text-foreground/90 leading-relaxed">{msg.message}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{msg.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{msg.name}</p>
                        {(msg.city || msg.country) && (
                          <p className="text-xs text-muted-foreground">{[msg.city, msg.country].filter(Boolean).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
