'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { FanMessage } from '@/lib/types/database';

type Props = {
  messages: FanMessage[];
};

export function FanMessagesSection({ messages }: Props) {
  const reduceMotion = useReducedMotion();
  const display = messages.filter(m => m.is_featured).slice(0, 6);
  const toShow = display.length > 0 ? display : messages.slice(0, 6);
  if (toShow.length === 0) return null;

  return (
    <section className="section-py bg-background">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <span className="eyebrow">Fan Messages</span>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">Words from Listeners</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {toShow.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-lg border border-border/50 bg-card p-6"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-3" />
              <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">{msg.message}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{msg.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{msg.name}</p>
                  {(msg.city || msg.country) && (
                    <p className="text-xs text-muted-foreground">{[msg.city, msg.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
