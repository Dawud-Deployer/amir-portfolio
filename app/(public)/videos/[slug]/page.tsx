import { getVideoBySlug, getPublishedVideos } from '@/lib/services/public-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) return { title: 'Not Found' };
  return {
    title: `${video.title} — Amir Hussen`,
    description: video.description || undefined,
  };
}

function getYouTubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  return null;
}

export default async function VideoDetailPage({ params }: Props) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const embed = getYouTubeEmbed(video.external_url);
  const related = (await getPublishedVideos()).filter((v) => v.id !== video.id).slice(0, 3);

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Videos
        </Link>

        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-6">{video.title}</h1>

        {/* Video player */}
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 shadow-xl mb-6 bg-black">
          {embed ? (
            <iframe
              src={embed}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.video_url ? (
            <video
              controls
              poster={video.thumbnail_url || undefined}
              className="w-full h-full"
              preload="metadata"
            >
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          ) : video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-16 h-16 text-white/20" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {video.category && (
            <span className="text-xs font-medium text-primary uppercase tracking-wider">{video.category}</span>
          )}
        </div>

        {video.description && (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{video.description}</p>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/50">
            <h2 className="heading-serif text-xl font-bold mb-4">More Videos</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/videos/${r.slug}`} className="group block">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted">
                    {r.thumbnail_url ? (
                      <img
                        src={r.thumbnail_url}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-muted-foreground/30" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="rounded-full bg-white/90 p-2.5 shadow">
                        <Play className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
