'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      <section className="min-h-screen flex items-center justify-center gradient-hero texture-grain">
        <div className="text-center px-4">
          <p className="eyebrow mb-4 text-primary/70">Official Website</p>
          <h1 className="heading-serif text-5xl md:text-7xl font-bold text-white text-shadow-lg">
            Amir Hussen
          </h1>
          <p className="mt-4 text-white/70 text-lg">Ethiopian Menzuma Artist</p>
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
    hero.text_alignment === 'right'  ? 'items-end text-right' :
    'items-start text-left';

  // Overlay base opacity derived from overlay_intensity (0–100)
  const overlayOpacity = Math.min(Math.max((hero.overlay_intensity ?? 40) / 100, 0.15), 0.85);

  return (
    <section className={`relative ${heightClass} flex items-center overflow-hidden`}>

      {/* ── Background media ── */}
      {showVideo && (
        <video
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          poster={media.poster || undefined}
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        >
          <source src={media.video!} type="video/mp4" />
          <source src={media.video!} type="video/webm" />
        </video>
      )}

      {showPortrait && (
        <Image
          src={media.portrait!}
          alt={hero.headline || "Hero Portrait"}
          fill
          priority
          className="absolute inset-0 object-cover"
          style={{
            objectPosition:
              hero.text_alignment === 'left'   ? 'right center' :
              hero.text_alignment === 'right'  ? 'left center'  :
              'center center',
          }}
          aria-hidden="true"
        />
      )}

      {/* Fallback when no media */}
      {!showVideo && !showPortrait && (
        <div className="absolute inset-0 gradient-hero texture-grain" aria-hidden="true" />
      )}

      {/* ── Deep green overlay — always present for text legibility ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            hsl(155 60% 9% / ${(overlayOpacity * 0.5).toFixed(2)}),
            hsl(155 60% 9% / ${(overlayOpacity * 0.8).toFixed(2)}) 60%,
            hsl(155 60% 9% / ${(overlayOpacity).toFixed(2)}) 100%
          )`,
        }}
        aria-hidden="true"
      />

      {/* Side gradient for left/right text alignment */}
      {hero.text_alignment !== 'center' && (
        <div
          className="absolute inset-0"
          style={{
            background:
              hero.text_alignment === 'right'
                ? 'linear-gradient(to left, hsl(155 60% 9% / 0.72) 40%, transparent 80%)'
                : 'linear-gradient(to right, hsl(155 60% 9% / 0.72) 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle geometric motif */}
      <div className="absolute inset-0 geometric-motif opacity-60" aria-hidden="true" />

      {/* ── Content ── */}
      <div className="container-px mx-auto max-w-7xl relative z-10 w-full pt-24 pb-16">
        <div
          className={`flex flex-col ${textAlignClass} gap-4 max-w-2xl ${
            hero.text_alignment === 'center' ? 'mx-auto' :
            hero.text_alignment === 'right'  ? 'ml-auto'  :
            ''
          }`}
        >
          {/* Eyebrow */}
          {hero.eyebrow_text && (
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-eyebrow text-primary">
                {hero.eyebrow_text}
              </span>
            </motion.div>
          )}

          {/* Arabic name */}
          {hero.artist_name_ar && (
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-xl text-white/75 font-medium"
              dir="rtl"
              lang="ar"
            >
              {hero.artist_name_ar}
            </motion.p>
          )}

          {/* Amharic name */}
          {hero.artist_name_am && (
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-base text-white/65 text-amharic"
              lang="am"
            >
              {hero.artist_name_am}
            </motion.p>
          )}

          {/* Main headline */}
          <motion.h1
            initial={reduceMotion ? {} : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="heading-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-display text-shadow-lg"
          >
            {hero.headline}
            {hero.highlighted_phrase && (
              <motion.span
                initial={reduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="block mt-2"
                style={{ color: 'hsl(152 55% 65%)' }}
              >
                {hero.highlighted_phrase}
              </motion.span>
            )}
          </motion.h1>

          {/* Description */}
          {hero.description && (
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="text-base sm:text-lg text-white/75 leading-prose max-w-xl text-balance"
            >
              {hero.description}
            </motion.p>
          )}

          {/* Metadata */}
          {hero.metadata_line && (
            <p className="text-xs text-white/45 uppercase tracking-eyebrow pt-1">
              {hero.metadata_line}
            </p>
          )}

          {/* CTAs */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 ${
              hero.text_alignment === 'center' ? 'sm:justify-center' : ''
            }`}
          >
            {hero.primary_cta_label && (
              <Link
                href={hero.primary_cta_url || '/menzuma'}
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold tracking-wide rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'hsl(152 55% 45%)',
                  color: '#fff',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'hsl(152 65% 38%)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'hsl(152 55% 45%)';
                }}
              >
                {hero.primary_cta_label}
              </Link>
            )}
            {hero.secondary_cta_label && (
              <Link
                href={hero.secondary_cta_url || '/videos'}
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold tracking-wide rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{
                  borderColor: 'hsl(145 30% 88% / 0.45)',
                  color: '#fff',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'hsl(152 55% 22% / 0.4)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(145 30% 88% / 0.7)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(145 30% 88% / 0.45)';
                }}
              >
                {hero.secondary_cta_label}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      {hero.show_scroll_indicator && (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          aria-hidden="true"
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1.5 text-white/50"
          >
            <span className="text-[10px] uppercase tracking-eyebrow">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
