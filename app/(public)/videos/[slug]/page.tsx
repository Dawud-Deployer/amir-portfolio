import { getPublishedVideos, getMediaById } from '@/lib/services/public-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient());
  const { data } = await supabase.from('videos').select('title, description').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!data) return { title: 'Not Found' };
  return { title: `${data.title} — Amir Hussen`, description: data.description || undefined };
}

function getYouTubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

export default async function VideoDetailPage({ params }: Props) {
  const { slug } = await params;
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const { data: video } = await supabase.from('videos').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!video) notFound();

  let thumbnailUrl: string | null = null;
  if (video.thumbnail_media_id) {
    const media = await getMediaById(video.thumbnail_media_id);
    thumbnailUrl = media?.public_url || null;
  }
  let videoUrl: string | null = null;
  if (video.video_media_id) {
    const media = await getMediaById(video.video_media_id);
    videoUrl = media?.public_url || null;
  }

  const embed = getYouTubeEmbed(video.external_url);
  const related = (await getPublishedVideos()).filter(v => v.id !== video.id).slice(0, 3);

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <Link href="/videos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Videos
        </Link>

        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-6">{video.title}</h1>

        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 shadow-xl mb-6">
          {embed ? (
            <iframe src={embed} title={video.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : videoUrl ? (
            <video controls poster={thumbnailUrl || undefined} className="w-full h-full">
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : thumbnailUrl ? (
            <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Play className="w-16 h-16 text-primary/20" />
            </div>
          )}
        </div>

        {video.description && (
          <p className="text-muted-foreground leading-relaxed">{video.description}</p>
        )}

        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/50">
            <h2 className="heading-serif text-xl font-bold mb-4">More Videos</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/videos/${r.slug}`} className="group block">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50">
                    {r.thumbnail_url ? (
                      <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
