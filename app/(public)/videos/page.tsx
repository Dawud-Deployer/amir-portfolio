import { getPublishedVideos } from '@/lib/services/public-data';
import Link from 'next/link';
import { Play } from 'lucide-react';

export const metadata = { title: 'Videos — Amir Hussen' };

function getYouTubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

export default async function VideosPage() {
  const videos = await getPublishedVideos();

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Videos</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Watch & Listen</h1>
        </div>

        {videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No videos published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const embed = getYouTubeEmbed(video.external_url);
              return (
                <Link
                  key={video.id}
                  href={`/videos/${video.slug}`}
                  className="group rounded-lg overflow-hidden border border-border/50 bg-card hover:border-primary/40 transition-all"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {embed ? (
                      <iframe
                        src={embed}
                        title={video.title}
                        className="w-full h-full pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Play className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">{video.title}</h3>
                    {video.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
