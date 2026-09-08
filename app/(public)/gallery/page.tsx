import { getGalleryItems } from '@/lib/services/public-data';

export const metadata = { title: 'Gallery — Amir Hussen' };

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))] as string[];

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Gallery</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Visual Moments</h1>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Gallery images will appear here once published.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative rounded-lg overflow-hidden border border-border/50">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.alt_text || item.title || 'Gallery image'} className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full aspect-square bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No image</span>
                  </div>
                )}
                {(item.title || item.caption) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      {item.title && <p className="text-sm font-medium text-foreground">{item.title}</p>}
                      {item.caption && <p className="text-xs text-muted-foreground">{item.caption}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
