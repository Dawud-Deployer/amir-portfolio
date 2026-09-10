import { getEventBySlug, getPublishedEvents } from '@/lib/services/public-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Ticket, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Not Found' };
  return { title: `${event.title} — Amir Hussen`, description: event.description || undefined };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const related = (await getPublishedEvents()).filter(e => e.id !== event.id && e.status === 'upcoming').slice(0, 3);

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <div className="relative aspect-[2/1] rounded-lg overflow-hidden border border-border/50 shadow-xl mb-8">
          {event.cover_url || event.poster_url ? (
            <img src={event.cover_url || event.poster_url || undefined} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
          )}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-md px-4 py-2">
            <span className="text-sm font-medium text-primary uppercase">{event.status}</span>
          </div>
        </div>

        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-6">{event.title}</h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          {event.start_time && (
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">{event.start_time}{event.end_time ? ` — ${event.end_time}` : ''}</p>
              </div>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-medium">{event.venue}</p>
                <p className="text-xs text-muted-foreground">{[event.city, event.country].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-wrap">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {event.ticket_url && (
            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Ticket className="w-4 h-4" /> Get Tickets
            </a>
          )}
          {event.booking_url && (
            <a href={event.booking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border text-sm font-medium hover:border-primary transition-colors">
              <ExternalLink className="w-4 h-4" /> Book Now
            </a>
          )}
          {event.map_url && (
            <a href={event.map_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border text-sm font-medium hover:border-primary transition-colors">
              <MapPin className="w-4 h-4" /> View Map
            </a>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <h2 className="heading-serif text-xl font-bold mb-4">More Events</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/events/${r.slug}`} className="group block rounded-lg overflow-hidden border border-border/50">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    {r.cover_url || r.poster_url ? (
                      <img src={r.cover_url || r.poster_url || undefined} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{r.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
