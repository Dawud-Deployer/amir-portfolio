'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import type { BlogPost } from '@/lib/types/database';

type Props = {
  posts: (BlogPost & { cover_url: string | null; category_name: string | null })[];
};

export function BlogSection({ posts }: Props) {
  const reduceMotion = useReducedMotion();
  const recent = posts.slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section className="section-py">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Blog</span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2">Stories & Reflections</h2>
          </div>
          <Link href="/blog" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recent.map((post, i) => (
            <motion.div
              key={post.id}
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block rounded-lg overflow-hidden border border-border/50 bg-card hover:border-primary/40 transition-all">
                <div className="relative aspect-[2/1] overflow-hidden">
                  {post.cover_url ? (
                    <Image src={post.cover_url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
                  )}
                </div>
                <div className="p-5">
                  {post.category_name && (
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{post.category_name}</span>
                  )}
                  <h3 className="heading-serif text-lg font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                  )}
                  {post.published_at && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
