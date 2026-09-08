import { getHomepageSections, getHeroSettings, getAboutContent, getPublishedMusic, getFeaturedMusic, getPublishedVideos, getFeaturedVideo, getUpcomingEvents, getJourneyItems, getGalleryItems, getApprovedFanMessages, getPublishedBlogPosts, getSocialLinks, getHeroMediaUrls, getAboutPortrait } from '@/lib/services/public-data';
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

export default async function HomePage() {
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

  const heroMedia = hero ? await getHeroMediaUrls(hero) : { portrait: null, video: null, poster: null };
  const aboutPortrait = about ? await getAboutPortrait(about) : null;

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

  return (
    <div>
      {sections.map((section) => sectionMap[section.section_key] || null)}
    </div>
  );
}
