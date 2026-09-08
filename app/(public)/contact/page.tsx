'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

const inquiryTypes = ['Booking', 'Event', 'Collaboration', 'Media', 'General'];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organization: '',
    subject: '', inquiry_type: 'General', event_date: '',
    location: '', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('contact_messages').insert(form);
      if (error) {
        toast.error('Could not send message. Please try again.');
      } else {
        toast.success('Message sent! We will get back to you soon.');
        setForm({ name: '', email: '', phone: '', organization: '', subject: '', inquiry_type: 'General', event_date: '', location: '', message: '' });
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Contact</span>
          <h1 className="heading-serif text-4xl md:text-5xl font-bold mt-2">Get in Touch</h1>
          <p className="text-muted-foreground mt-4">
            For bookings, events, collaborations, media, or general inquiries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border/50 bg-card p-6 md:p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Name *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Organization</label>
              <input name="organization" value={form.organization} onChange={handleChange} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Inquiry Type</label>
              <select name="inquiry_type" value={form.inquiry_type} onChange={handleChange} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors">
                {inquiryTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          {(form.inquiry_type === 'Booking' || form.inquiry_type === 'Event') && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Event Date</label>
                <input name="event_date" value={form.event_date} onChange={handleChange} placeholder="e.g. Dec 15, 2026" className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="City, Country" className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Message *</label>
            <textarea required name="message" value={form.message} onChange={handleChange} rows={5} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-y" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
}
