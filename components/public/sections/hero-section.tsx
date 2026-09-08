'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { HeroSettings } from '@/lib/types/database';

type HeroMediaUrls = { portrait: string | null; video: string | null; poster: string | null };

type HeroSectionProps = {
  hero: HeroSettings | null;
  media: HeroMediaUrls;
};

export function HeroSection({ hero, media }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();

  if (!hero) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
        <div className="text-center px-4">
          <h1 className="heading-serif text-4xl md:text-6xl font-bold text-foreground">
            Amir Hussen
          </h1>
          <p className="mt-4 text-muted-foreground">Ethiopian Menzuma Artist</p>
        </div>
      </section>
    );
  }

  const hasVideo = hero.visual_mode === 'video' && media.video;
  const hasPortrait = !!media.portrait;
  const showVideo = hasVideo;
  const showPortrait = hasPortrait && hero.visual_mode !== 'video';

  const heightClass =
    hero.hero_height === 'full' ? 'min-h-screen' :
    hero.hero_height === 'tall' ? 'min-h-[85vh]' :
    'min-h-[70vh]';

  const textAlignClass =
    hero.text_alignment === 'center' ? 'items-center text-center' :
    hero.text_alignment === 'right' ? 'items-end text-right' :
    'items-start text-left';

  return (
    <section className={`relative ${heightClass} flex items-center overflow-hidden`}>
      {/* Background media */}
      {showVideo && (
        <video
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          poster={media.poster || undefined}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={media.video!} type="video/mp4" />
        </video>
      )}

      {showPortrait && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${media.portrait})` }}
          />
        </div>
      )}

      {/* Placeholder when no media */}
      {!showVideo && !showPortrait && (
        <div className="absolute inset-0 gradient-emerald" />
      )}

      {/* Overlays */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30"
        style={{ opacity: hero.overlay_intensity / 100 + 0.2 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: hero.text_alignment === 'right'
            ? 'linear-gradient(to left, rgba(10,31,26,0.7), transparent 70%)'
            : 'linear-gradient(to right, rgba(10,31,26,0.7), transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="container-px mx-auto max-w-7xl relative z-10 w-full">
        <div className={`flex flex-col ${textAlignClass} gap-4 max-w-2xl ${hero.text_alignment === 'center' ? 'mx-auto' : hero.text_alignment === 'right' ? 'ml-auto' : ''}`}>
          {hero.eyebrow_text && (
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {hero.eyebrow_text}
              </span>
            </motion.div>
          )}

          {hero.artist_name_ar && (
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-primary/80 font-medium"
              dir="rtl"
            >
              {hero.artist_name_ar}
            </motion.p>
          )}

          {hero.artist_name_am && (
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-muted-foreground"
            >
              {hero.artist_name_am}
            </motion.p>
          )}

          <motion.h1
            initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="heading-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-shadow-lg"
          >
            {hero.headline}
            {hero.highlighted_phrase && (
              <span className="block text-primary mt-2">{hero.highlighted_phrase}</span>
            )}
          </motion.h1>

          {hero.description && (
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl text-balance"
            >
              {hero.description}
            </motion.p>
          )}

          {hero.metadata_line && (
            <p className="text-xs text-muted-foreground/70 uppercase tracking-widest pt-2">
              {hero.metadata_line}
            </p>
          )}

          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 ${hero.text_alignment === 'center' ? 'sm:justify-center' : ''}`}
          >
            {hero.primary_cta_label && (
              <Link
                href={hero.primary_cta_url || '/menzuma'}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                {hero.primary_cta_label}
              </Link>
            )}
            {hero.secondary_cta_label && (
              <Link
                href={hero.secondary_cta_url || '/videos'}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md border border-primary/40 text-foreground hover:border-primary hover:bg-primary/10 transition-all"
              >
                {hero.secondary_cta_label}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {hero.show_scroll_indicator && (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
