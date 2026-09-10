import { getHomepageSections, getHeroSettings, getAboutContent, getPublishedMusic, getFeaturedMusic, getPublishedVideos, getFeaturedVideo, getUpcomingEvents, getJourneyItems, getGalleryItems, getApprovedFanMessages, getPublishedBlogPosts, getSocialLinks, getAllRequiredMedia } from '@/lib/services/public-data';
import { HeroSection } from '@/components/public/sections/hero-section';
import { FeaturedMenzumaSection } from '@/components/public/sections/featured-menzuma';
import { AboutSection } from '@/components/public/sections/about-section';
import { LatestMusicSection } from '@/components/public/sections/latest-music';
import { FeaturedVideoSection } from '@/components/public/sections/featured-video';
import { EventsSection } from '@/components/public/sections/events-section';
import { JourneySection } from '@/components/public/sections/journey-section';
import { GallerySection } from '@/components/public/sections/gallery-section';
import { FanMessagesSection } from '@/components/public/sections/fan-messages';
import { BlogSection } from '@/components/public/sections/blog-section';
import { NewsletterSection } from '@/components/public/sections/newsletter-section';
import { ContactCtaSection } from '@/components/public/sections/contact-cta';
import { Suspense } from 'react';

/** Revalidate every 60s — admin saves trigger instant revalidation via /api/revalidate */
export const revalidate = 60;

export default async function HomePage() {
  // OPTIMIZED: All data fetched in parallel - no waterfalls!
  const [sections, hero, about, music, featuredMusic, videos, featuredVideo, events, journey, gallery, fanMessages, blogPosts] = await Promise.all([
    getHomepageSections(),
    getHeroSettings(),
    getAboutContent(),
    getPublishedMusic(),
    getFeaturedMusic(),
    getPublishedVideos(),
    getFeaturedVideo(),
    getUpcomingEvents(),
    getJourneyItems(),
    getGalleryItems(),
    getApprovedFanMessages(),
    getPublishedBlogPosts(),
  ]);

  // OPTIMIZED: Batch all media fetches together instead of sequential
  const mediaIdsToFetch = [
    hero?.portrait_media_id,
    hero?.hero_video_media_id,
    hero?.video_poster_media_id,
    about?.portrait_media_id,
  ].filter(Boolean) as string[];

  const mediaMap = mediaIdsToFetch.length > 0 
    ? await getAllRequiredMedia(mediaIdsToFetch)
    : {};

  const heroMedia = hero ? {
    portrait: hero.portrait_media_id ? mediaMap[hero.portrait_media_id] || null : null,
    video: hero.hero_video_media_id ? mediaMap[hero.hero_video_media_id] || null : null,
    poster: hero.video_poster_media_id ? mediaMap[hero.video_poster_media_id] || null : null,
  } : { portrait: null, video: null, poster: null };

  const aboutPortrait = about?.portrait_media_id ? mediaMap[about.portrait_media_id] || null : null;

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <HeroSection key="hero" hero={hero} media={heroMedia} />,
    featured_menzuma: <FeaturedMenzumaSection key="fm" music={featuredMusic} />,
    about: <AboutSection key="about" about={about} portraitUrl={aboutPortrait} />,
    latest_music: <LatestMusicSection key="lm" music={music} />,
    featured_video: <FeaturedVideoSection key="fv" video={featuredVideo} />,
    events: <EventsSection key="events" events={events} />,
    journey: <JourneySection key="journey" items={journey} />,
    gallery: <GallerySection key="gallery" items={gallery} />,
    fan_messages: <FanMessagesSection key="fan" messages={fanMessages} />,
    blog: <BlogSection key="blog" posts={blogPosts} />,
    newsletter: <NewsletterSection key="newsletter" />,
    contact_cta: <ContactCtaSection key="contact-cta" />,
  };

  const visibleSections = sections.length > 0
    ? sections
    : [
        'hero', 'featured_menzuma', 'about', 'latest_music', 'featured_video',
        'events', 'journey', 'gallery', 'fan_messages', 'blog', 'newsletter', 'contact_cta',
      ].map((section_key, sort_order) => ({ section_key, sort_order }));

  return (
    <div>
      {visibleSections.map((section) => sectionMap[section.section_key] || null)}
    </div>
  );
}
