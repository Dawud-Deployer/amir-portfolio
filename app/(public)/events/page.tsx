import { getPublishedEvents } from '@/lib/services/public-data';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';

export const metadata = { title: 'Events — Amir Hussen' };

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const upcoming = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  const past = events.filter(e => e.status === 'completed');

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Events</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Events & Appearances</h1>
        </div>

        {upcoming.length > 0 && (
          <div className="mb-16">
            <h2 className="heading-serif text-2xl font-bold mb-6">Upcoming</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="heading-serif text-2xl font-bold mb-6">Past Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No events published yet.</p>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/events/${event.slug}`} className="group rounded-lg overflow-hidden border border-border/50 bg-card hover:border-primary/40 transition-all">
      <div className="relative aspect-[3/2] overflow-hidden">
        {event.cover_url || event.poster_url ? (
          <img src={event.cover_url || event.poster_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary/20" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-md px-3 py-1.5">
          <span className="text-xs font-medium text-primary uppercase">{event.status}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="heading-serif text-lg font-semibold group-hover:text-primary transition-colors">{event.title}</h3>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary/60" />
            <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
  );
}
