import { getJourneyItems } from '@/lib/services/public-data';

export const metadata = { title: 'Journey — Amir Hussen' };

export default async function JourneyPage() {
  const items = await getJourneyItems();

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Journey</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Artist Journey</h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Milestones and moments in the path of Amir Hussen.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Journey entries will appear here once published.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`relative flex gap-6 mb-8 md:mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10" />
                <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                  <div className="rounded-lg border border-border/50 bg-card p-5">
                    {item.image_url && (
                      <div className="mb-4 rounded-md overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-primary">{item.year_label}</span>
                    <h2 className="heading-serif text-lg font-semibold mt-1">{item.title}</h2>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
