import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/services/public-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.seo_title || post.title} — Amir Hussen`,
    description: post.seo_description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = (await getPublishedBlogPosts()).filter(p => p.id !== post.id).slice(0, 3);

  return (
    <article className="pt-24 pb-20">
      <div className="container-px mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {post.category_name && (
          <span className="text-xs font-medium text-primary uppercase tracking-wider">{post.category_name}</span>
        )}
        <h1 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
          {post.author && <span>By {post.author}</span>}
          {post.published_at && (
            <>
              {post.author && <span>•</span>}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </>
          )}
        </div>

        {post.cover_url && (
          <div className="relative aspect-[2/1] rounded-lg overflow-hidden border border-border/50 mb-8">
            <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.excerpt && (
          <p className="text-lg text-foreground/90 leading-relaxed mb-8 italic border-l-2 border-primary/40 pl-4">{post.excerpt}</p>
        )}

        {post.content && (
          <div
            className="prose prose-invert max-w-none text-foreground/80 leading-relaxed
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_h2]:heading-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:heading-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
              [&_img]:rounded-lg [&_img]:border [&_img]:border-border/50
              [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
              [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_code]:bg-secondary [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <h2 className="heading-serif text-xl font-bold mb-6">Related Stories</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group block">
                  <div className="relative aspect-[2/1] rounded-lg overflow-hidden border border-border/50 mb-2">
                    {r.cover_url ? (
                      <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
