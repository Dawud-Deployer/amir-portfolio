'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import type { Music } from '@/lib/types/database';

type Props = {
  music: (Music & { cover_url: string | null })[];
};

export function LatestMusicSection({ music }: Props) {
  const reduceMotion = useReducedMotion();
  const latest = music.slice(0, 6);
  if (latest.length === 0) return null;

  return (
    <section className="section-py">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Menzuma</span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">Latest Music</h2>
          </div>
          <Link href="/menzuma" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {latest.map((track, i) => (
            <motion.div
              key={track.id}
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link href={`/menzuma/${track.slug}`} className="group block">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-secondary">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{track.title}</h3>
                {track.title_am && <p className="text-xs text-muted-foreground line-clamp-1">{track.title_am}</p>}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/menzuma" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
