'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Video } from '@/lib/types/database';

type Props = {
  video: (Video & { thumbnail_url: string | null }) | null;
};

export function FeaturedVideoSection({ video }: Props) {
  const reduceMotion = useReducedMotion();
  if (!video) return null;

  const embedUrl = getYouTubeEmbed(video.external_url);

  return (
    <section className="section-py gradient-emerald">
      <div className="container-px mx-auto max-w-5xl">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Featured Video</span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">{video.title}</h2>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 shadow-2xl">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : video.thumbnail_url ? (
              <div className="relative w-full h-full">
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                  <Play className="w-16 h-16 text-primary" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Play className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>

          {video.description && (
            <p className="text-muted-foreground mt-4 text-center max-w-2xl mx-auto leading-relaxed">{video.description}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function getYouTubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}
