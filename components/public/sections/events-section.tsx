'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import type { EventItem } from '@/lib/types/database';

type Props = {
  events: (EventItem & { poster_url: string | null; cover_url: string | null })[];
};

export function EventsSection({ events }: Props) {
  const reduceMotion = useReducedMotion();
  const upcoming = events.slice(0, 3);
  if (upcoming.length === 0) return null;

  return (
    <section className="section-py bg-[hsl(145_20%_97%)]">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="eyebrow">Events</span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-foreground">Upcoming Events</h2>
          </div>
          <Link href="/events" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {upcoming.map((event, i) => (
            <motion.div
              key={event.id}
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/events/${event.slug}`} className="group block rounded-lg overflow-hidden border border-border/50 bg-card hover:border-primary/40 transition-all">
                <div className="relative aspect-[3/2] overflow-hidden">
                  {event.cover_url || event.poster_url ? (
                    <Image src={event.cover_url || event.poster_url || ''} alt={event.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-md px-3 py-1.5">
                    <span className="text-xs font-semibold text-primary uppercase tracking-eyebrow">{event.status}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="heading-serif text-lg font-semibold group-hover:text-primary transition-colors">{event.title}</h3>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    {event.start_time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary/60" />
                        <span>{event.start_time}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary/60" />
                        <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
