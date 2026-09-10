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
    <section className="section-py bg-[hsl(155_60%_9%)]">
      <div className="container-px mx-auto max-w-3xl text-center">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style={{ border: '1px solid hsl(145 30% 88% / 0.25)', background: 'hsl(145 30% 88% / 0.08)' }}>
            <Mail className="w-6 h-6" style={{ color: 'hsl(145 30% 75%)' }} />
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl font-bold text-white">Stay Connected</h2>
          <p className="mt-3 max-w-md mx-auto" style={{ color: 'hsl(145 15% 65%)' }}>
            Subscribe to receive updates on new Menzuma releases, events, and stories from Amir Hussen.
          </p>

          {success ? (
            <div className="mt-8 inline-flex items-center gap-2" style={{ color: 'hsl(145 50% 65%)' }}>
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
                aria-label="Email address"
                className="flex-1 px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  background: 'hsl(155 55% 11%)',
                  border: '1px solid hsl(152 20% 22%)',
                  color: 'hsl(145 30% 90%)',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'hsl(152 55% 45%)', color: '#fff' }}
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
