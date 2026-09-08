'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function NewsletterSection() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'website' });

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed.');
        } else {
          toast.error('Could not subscribe. Please try again.');
        }
      } else {
        setSuccess(true);
        toast.success('Thank you for subscribing!');
        setEmail('');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-py gradient-emerald">
      <div className="container-px mx-auto max-w-3xl text-center">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-primary/30 mb-6">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl font-bold">Stay Connected</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Subscribe to receive updates on new Menzuma releases, events, and stories from Amir Hussen.
          </p>

          {success ? (
            <div className="mt-8 inline-flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={subscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-md bg-background/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
