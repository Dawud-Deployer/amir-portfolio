import { getAboutContent, getAboutPortrait } from '@/lib/services/public-data';
import { Music2, BookOpen, Heart } from 'lucide-react';

export const metadata = { title: 'About — Amir Hussen' };

export default async function AboutPage() {
  const about = await getAboutContent();
  const portraitUrl = about ? await getAboutPortrait(about) : null;

  if (!about) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-muted-foreground">About content not available.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">About</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">{about.title}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border/50 sticky top-24">
              {portraitUrl ? (
                <img src={portraitUrl} alt="Amir Hussen" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Portrait will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {about.short_intro && (
              <div>
                <p className="text-lg text-foreground/90 leading-relaxed">{about.short_intro}</p>
              </div>
            )}

            {about.biography && (
              <div>
                <h2 className="heading-serif text-xl font-semibold mb-3">Biography</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{about.biography}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {about.artistic_philosophy && (
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Music2 className="w-5 h-5 text-primary" />
                <h2 className="heading-serif text-lg font-semibold">Artistic Philosophy</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">{about.artistic_philosophy}</p>
            </div>
          )}

          {about.menzuma_approach && (
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="heading-serif text-lg font-semibold">Menzuma Approach</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">{about.menzuma_approach}</p>
            </div>
          )}
        </div>

        {about.press_kit_url && (
          <div className="mt-12 text-center">
            <a
              href={about.press_kit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-primary/40 text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Download Press Kit
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
