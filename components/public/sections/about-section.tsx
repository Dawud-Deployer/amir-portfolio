'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <section className="section-py bg-background">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border">
              {portraitUrl ? (
                <Image src={portraitUrl} alt="Amir Hussen" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-[hsl(145_20%_97%)] flex flex-col items-center justify-center gap-2 p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary heading-serif">A</span>
                  </div>
                  <p className="text-muted-foreground text-xs text-center">Portrait will appear here after upload</p>
                </div>
              )}
              {/* Green accent line on portrait */}
              <div className="absolute bottom-0 left-0 right-0 h-1 accent-line-left opacity-60" />
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-3"
          >
            <span className="eyebrow">About the Artist</span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-6 text-foreground">
              {about.title}
            </h2>
            {about.short_intro && (
              <p className="text-lg text-foreground/90 leading-prose mb-4">{about.short_intro}</p>
            )}
            {about.biography && (
              <p className="text-muted-foreground leading-prose line-clamp-4">{about.biography}</p>
            )}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary hover:text-accent hover:gap-3 transition-all duration-200"
            >
              Read More <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
