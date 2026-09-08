'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { JourneyItem } from '@/lib/types/database';

type Props = {
  items: (JourneyItem & { image_url: string | null })[];
};

export function JourneySection({ items }: Props) {
  const reduceMotion = useReducedMotion();
  if (items.length === 0) return null;

  return (
    <section className="section-py">
      <div className="container-px mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Journey</span>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">Artist Journey</h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`relative flex gap-6 mb-8 md:mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10" />
              <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                <div className="rounded-lg border border-border/50 bg-card p-5">
                  {item.image_url && (
                    <div className="mb-4 rounded-md overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-primary">{item.year_label}</span>
                  <h3 className="heading-serif text-lg font-semibold mt-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
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
