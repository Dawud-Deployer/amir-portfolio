'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { AboutContent } from '@/lib/types/database';

type Props = {
  about: AboutContent | null;
  portraitUrl: string | null;
};

export function AboutSection({ about, portraitUrl }: Props) {
  const reduceMotion = useReducedMotion();
  if (!about) return null;

  return (
    <section className="section-py bg-secondary/30">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border/50">
              {portraitUrl ? (
                <img src={portraitUrl} alt="Amir Hussen" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Portrait will appear here</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-3"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wider">About the Artist</span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-6">{about.title}</h2>
            {about.short_intro && (
              <p className="text-lg text-foreground/90 leading-relaxed mb-4">{about.short_intro}</p>
            )}
            {about.biography && (
              <p className="text-muted-foreground leading-relaxed line-clamp-4">{about.biography}</p>
            )}
            <Link href="/about" className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-primary hover:gap-3 transition-all">
              Read More <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
