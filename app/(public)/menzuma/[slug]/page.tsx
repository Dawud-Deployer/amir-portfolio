import { getMusicBySlug, getPublishedMusic, getMediaById } from '@/lib/services/public-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Play, ExternalLink, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getMusicBySlug(slug);
  if (!track) return { title: 'Not Found' };
  return { title: `${track.title} — Amir Hussen`, description: track.description || undefined };
}

export default async function MusicDetailPage({ params }: Props) {
  const { slug } = await params;
  const track = await getMusicBySlug(slug);
  if (!track) notFound();

  const related = (await getPublishedMusic()).filter(m => m.id !== track.id).slice(0, 4);

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-5xl">
        <Link href="/menzuma" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Menzuma
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50 shadow-xl">
            {track.cover_url ? (
              <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                <Play className="w-16 h-16 text-primary/20" />
              </div>
            )}
          </div>

          <div>
            {track.title_ar && <p className="text-xl text-primary/80 mb-2" dir="rtl">{track.title_ar}</p>}
            <h1 className="heading-serif text-3xl md:text-4xl font-bold">{track.title}</h1>
            {track.title_am && <p className="text-lg text-muted-foreground mt-1">{track.title_am}</p>}
            {track.release_date && (
              <p className="text-sm text-muted-foreground mt-3">
                Released {new Date(track.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            )}
            {track.description && (
              <p className="text-foreground/80 mt-4 leading-relaxed">{track.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              {track.youtube_url && (
                <a href={track.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Play className="w-4 h-4" /> YouTube
                </a>
              )}
              {track.spotify_url && (
                <a href={track.spotify_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:border-primary transition-colors">
                  <ExternalLink className="w-4 h-4" /> Spotify
                </a>
              )}
              {track.apple_music_url && (
                <a href={track.apple_music_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:border-primary transition-colors">
                  <ExternalLink className="w-4 h-4" /> Apple Music
                </a>
              )}
            </div>

            {track.lyrics && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Lyrics</h2>
                <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed text-sm">{track.lyrics}</div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border/50">
            <h2 className="heading-serif text-2xl font-bold mb-6">More Menzuma</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/menzuma/${r.slug}`} className="group block">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50">
                    {r.cover_url ? (
                      <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
