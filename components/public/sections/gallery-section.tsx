'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { GalleryItem } from '@/lib/types/database';

type Props = {
  items: (GalleryItem & { image_url: string | null })[];
};

export function GallerySection({ items }: Props) {
  const reduceMotion = useReducedMotion();
  const featured = items.filter(i => i.is_featured).slice(0, 6);
  const display = featured.length > 0 ? featured : items.slice(0, 6);
  if (display.length === 0) return null;

  return (
    <section className="section-py gradient-emerald">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Gallery</span>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">Visual Moments</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {display.map((item, i) => (
            <motion.div
              key={item.id}
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`relative rounded-lg overflow-hidden border border-border/50 group ${
                i === 0 ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1' : ''
              }`}
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.alt_text || item.title || 'Gallery image'} className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full aspect-square bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No image</span>
                </div>
              )}
              {(item.title || item.caption) && (
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div>
                    {item.title && <p className="text-sm font-medium text-foreground">{item.title}</p>}
                    {item.caption && <p className="text-xs text-muted-foreground">{item.caption}</p>}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
