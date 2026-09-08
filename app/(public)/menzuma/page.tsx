import { getPublishedMusic } from '@/lib/services/public-data';
import Link from 'next/link';
import { Play, ExternalLink } from 'lucide-react';

export const metadata = { title: 'Menzuma — Amir Hussen' };

export default async function MenzumaPage() {
  const music = await getPublishedMusic();

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Music Library</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Menzuma Collection</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Explore the spiritual Menzuma and Nasheed collection of Amir Hussen.
          </p>
        </div>

        {music.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No music published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {music.map((track) => (
              <Link
                key={track.id}
                href={`/menzuma/${track.slug}`}
                className="group rounded-lg overflow-hidden border border-border/50 bg-card hover:border-primary/40 transition-all"
              >
                <div className="relative aspect-square overflow-hidden">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                      <Play className="w-12 h-12 text-primary/20" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {track.title_ar && <p className="text-sm text-primary/70 mb-1" dir="rtl">{track.title_ar}</p>}
                  <h3 className="heading-serif text-lg font-semibold group-hover:text-primary transition-colors">{track.title}</h3>
                  {track.title_am && <p className="text-sm text-muted-foreground">{track.title_am}</p>}
                  {track.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{track.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {track.youtube_url && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Play className="w-3 h-3" /> YouTube</span>
                    )}
                    {track.spotify_url && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ExternalLink className="w-3 h-3" /> Spotify</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
