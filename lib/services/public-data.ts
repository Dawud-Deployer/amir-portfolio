import { createClient } from '@/lib/supabase/server';
import type {
  SiteSettings, HeroSettings, AboutContent, HomepageSection,
  NavigationItem, FooterSettings, SocialLink, ThemeSettings,
  SeoSettings, MediaRecord, Music, Video, EventItem, JourneyItem,
  GalleryItem, BlogPost, BlogCategory, FanMessage
} from '@/lib/types/database';

const BUCKET = 'media';

function mediaUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  const supabase = createClient();
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function getMediaMap(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const supabase = createClient();
  const { data } = await supabase
    .from('media')
    .select('id, storage_path')
    .in('id', ids);
  const map: Record<string, string> = {};
  for (const m of data || []) {
    map[m.id] = mediaUrl(m.storage_path) || '';
  }
  return map;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('*').maybeSingle();
  return data as SiteSettings | null;
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('hero_settings').select('*').maybeSingle();
  return data as HeroSettings | null;
}

export async function getAboutContent(): Promise<AboutContent | null> {
  const supabase = createClient();
  const { data } = await supabase.from('about_content').select('*').maybeSingle();
  return data as AboutContent | null;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order');
  return (data || []) as HomepageSection[];
}

export async function getNavigationItems(): Promise<NavigationItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('navigation_items')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order');
  return (data || []) as NavigationItem[];
}

export async function getFooterSettings(): Promise<FooterSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('footer_settings').select('*').maybeSingle();
  return data as FooterSettings | null;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('social_links')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order');
  return (data || []) as SocialLink[];
}

export async function getThemeSettings(): Promise<ThemeSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('theme_settings').select('*').maybeSingle();
  return data as ThemeSettings | null;
}

export async function getSeoSettings(): Promise<SeoSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('seo_settings').select('*').maybeSingle();
  return data as SeoSettings | null;
}

export async function getPublishedMusic(): Promise<(Music & { cover_url: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('music')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');
  if (!data) return [];
  const coverIds = data.map(d => d.cover_media_id).filter(Boolean) as string[];
  const mediaMap = await getMediaMap(coverIds);
  return data.map(m => ({ ...m, cover_url: m.cover_media_id ? mediaMap[m.cover_media_id] || null : null }));
}

export async function getFeaturedMusic(): Promise<(Music & { cover_url: string | null }) | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('music')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('sort_order')
    .maybeSingle();
  if (!data) return null;
  const mediaMap = await getMediaMap(data.cover_media_id ? [data.cover_media_id] : []);
  return { ...data, cover_url: data.cover_media_id ? mediaMap[data.cover_media_id] || null : null };
}

export async function getMusicBySlug(slug: string): Promise<(Music & { cover_url: string | null }) | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('music')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (!data) return null;
  const mediaMap = await getMediaMap(data.cover_media_id ? [data.cover_media_id] : []);
  return { ...data, cover_url: data.cover_media_id ? mediaMap[data.cover_media_id] || null : null };
}

export async function getPublishedVideos(): Promise<(Video & { thumbnail_url: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');
  if (!data) return [];
  const thumbIds = data.map(d => d.thumbnail_media_id).filter(Boolean) as string[];
  const mediaMap = await getMediaMap(thumbIds);
  return data.map(v => ({ ...v, thumbnail_url: v.thumbnail_media_id ? mediaMap[v.thumbnail_media_id] || null : null }));
}

export async function getFeaturedVideo(): Promise<(Video & { thumbnail_url: string | null }) | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('sort_order')
    .maybeSingle();
  if (!data) return null;
  const mediaMap = await getMediaMap(data.thumbnail_media_id ? [data.thumbnail_media_id] : []);
  return { ...data, thumbnail_url: data.thumbnail_media_id ? mediaMap[data.thumbnail_media_id] || null : null };
}

export async function getUpcomingEvents(): Promise<(EventItem & { poster_url: string | null; cover_url: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .in('status', ['upcoming', 'ongoing'])
    .order('event_date');
  if (!data) return [];
  const mediaIds = data.flatMap(d => [d.poster_media_id, d.cover_media_id].filter(Boolean) as string[]);
  const mediaMap = await getMediaMap(mediaIds);
  return data.map(e => ({
    ...e,
    poster_url: e.poster_media_id ? mediaMap[e.poster_media_id] || null : null,
    cover_url: e.cover_media_id ? mediaMap[e.cover_media_id] || null : null,
  }));
}

export async function getPublishedEvents(): Promise<(EventItem & { poster_url: string | null; cover_url: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('event_date', { ascending: false });
  if (!data) return [];
  const mediaIds = data.flatMap(d => [d.poster_media_id, d.cover_media_id].filter(Boolean) as string[]);
  const mediaMap = await getMediaMap(mediaIds);
  return data.map(e => ({
    ...e,
    poster_url: e.poster_media_id ? mediaMap[e.poster_media_id] || null : null,
    cover_url: e.cover_media_id ? mediaMap[e.cover_media_id] || null : null,
  }));
}

export async function getEventBySlug(slug: string): Promise<(EventItem & { poster_url: string | null; cover_url: string | null }) | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (!data) return null;
  const mediaIds = [data.poster_media_id, data.cover_media_id].filter(Boolean) as string[];
  const mediaMap = await getMediaMap(mediaIds);
  return {
    ...data,
    poster_url: data.poster_media_id ? mediaMap[data.poster_media_id] || null : null,
    cover_url: data.cover_media_id ? mediaMap[data.cover_media_id] || null : null,
  };
}

export async function getJourneyItems(): Promise<(JourneyItem & { image_url: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('journey_items')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');
  if (!data) return [];
  const imageIds = data.map(d => d.image_media_id).filter(Boolean) as string[];
  const mediaMap = await getMediaMap(imageIds);
  return data.map(j => ({ ...j, image_url: j.image_media_id ? mediaMap[j.image_media_id] || null : null }));
}

export async function getGalleryItems(): Promise<(GalleryItem & { image_url: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');
  if (!data) return [];
  const mediaIds = data.map(d => d.media_id).filter(Boolean) as string[];
  const mediaMap = await getMediaMap(mediaIds);
  return data.map(g => ({ ...g, image_url: g.media_id ? mediaMap[g.media_id] || null : null }));
}

export async function getPublishedBlogPosts(): Promise<(BlogPost & { cover_url: string | null; category_name: string | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (!data) return [];
  const coverIds = data.map(d => d.cover_media_id).filter(Boolean) as string[];
  const mediaMap = await getMediaMap(coverIds);
  return data.map(p => ({
    ...p,
    cover_url: p.cover_media_id ? mediaMap[p.cover_media_id] || null : null,
    category_name: (p as any).blog_categories?.name || null,
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<(BlogPost & { cover_url: string | null; category_name: string | null }) | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (!data) return null;
  const mediaMap = await getMediaMap(data.cover_media_id ? [data.cover_media_id] : []);
  return {
    ...data,
    cover_url: data.cover_media_id ? mediaMap[data.cover_media_id] || null : null,
    category_name: (data as any).blog_categories?.name || null,
  };
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = createClient();
  const { data } = await supabase.from('blog_categories').select('*').order('sort_order');
  return (data || []) as BlogCategory[];
}

export async function getApprovedFanMessages(): Promise<FanMessage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('fan_messages')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  return (data || []) as FanMessage[];
}

export async function getHeroMediaUrls(hero: HeroSettings): Promise<{ portrait: string | null; video: string | null; poster: string | null }> {
  const ids = [hero.portrait_media_id, hero.hero_video_media_id, hero.video_poster_media_id].filter(Boolean) as string[];
  const mediaMap = await getMediaMap(ids);
  return {
    portrait: hero.portrait_media_id ? mediaMap[hero.portrait_media_id] || null : null,
    video: hero.hero_video_media_id ? mediaMap[hero.hero_video_media_id] || null : null,
    poster: hero.video_poster_media_id ? mediaMap[hero.video_poster_media_id] || null : null,
  };
}

export async function getAboutPortrait(about: AboutContent): Promise<string | null> {
  if (!about.portrait_media_id) return null;
  const mediaMap = await getMediaMap([about.portrait_media_id]);
  return mediaMap[about.portrait_media_id] || null;
}
