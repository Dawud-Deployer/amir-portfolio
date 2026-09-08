import { getPublishedBlogPosts } from '@/lib/services/public-data';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Blog — Amir Hussen' };

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Blog</span>
          <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-bold mt-2">Stories & Reflections</h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No blog posts published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-lg overflow-hidden border border-border/50 bg-card hover:border-primary/40 transition-all"
              >
                <div className="relative aspect-[2/1] overflow-hidden">
                  {post.cover_url ? (
                    <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
                  )}
                </div>
                <div className="p-5">
                  {post.category_name && (
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{post.category_name}</span>
                  )}
                  <h2 className="heading-serif text-lg font-semibold mt-1 group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>}
                  {post.published_at && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
