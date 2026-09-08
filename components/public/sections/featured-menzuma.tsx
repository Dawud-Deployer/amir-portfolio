'use client';

import Link from 'next/link';
import { Play, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Music } from '@/lib/types/database';

type Props = {
  music: (Music & { cover_url: string | null }) | null;
};

export function FeaturedMenzumaSection({ music }: Props) {
  const reduceMotion = useReducedMotion();
  if (!music) return null;

  return (
    <section className="section-py gradient-emerald relative overflow-hidden">
      <div className="container-px mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50 shadow-2xl">
            {music.cover_url ? (
              <img
                src={music.cover_url}
                alt={music.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Play className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>

          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Featured Menzuma</span>
            {music.title_ar && <p className="text-xl text-primary/80 mt-2" dir="rtl">{music.title_ar}</p>}
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">{music.title}</h2>
            {music.title_am && <p className="text-lg text-muted-foreground mt-1">{music.title_am}</p>}
            {music.description && (
              <p className="text-muted-foreground mt-4 leading-relaxed">{music.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              {music.youtube_url && (
                <a href={music.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Play className="w-4 h-4" /> Listen on YouTube
                </a>
              )}
              {music.spotify_url && (
                <a href={music.spotify_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:border-primary transition-colors">
                  <ExternalLink className="w-4 h-4" /> Spotify
                </a>
              )}
              {music.apple_music_url && (
                <a href={music.apple_music_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:border-primary transition-colors">
                  <ExternalLink className="w-4 h-4" /> Apple Music
                </a>
              )}
              <Link href={`/menzuma/${music.slug}`} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:border-primary transition-colors">
                Details
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
