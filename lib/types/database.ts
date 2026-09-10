export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MediaRecord = {
  id: string;
  storage_path: string;
  original_filename: string;
  display_name: string | null;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt_text: string | null;
  caption: string | null;
  title: string | null;
  category: string;
  uploader_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  site_name: string;
  site_name_am: string | null;
  site_name_ar: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  default_og_image: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  address: string | null;
  default_language: string;
  announcement_text: string | null;
  announcement_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type HeroSettings = {
  id: string;
  artist_name_en: string;
  artist_name_am: string | null;
  artist_name_ar: string | null;
  eyebrow_text: string | null;
  headline: string;
  highlighted_phrase: string | null;
  description: string | null;
  primary_cta_label: string | null;
  primary_cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_url: string | null;
  portrait_media_id: string | null;
  hero_video_media_id: string | null;
  video_poster_media_id: string | null;
  visual_mode: string;
  overlay_intensity: number;
  text_alignment: string;
  hero_height: string;
  show_scroll_indicator: boolean;
  metadata_line: string | null;
  featured_menzuma_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AboutContent = {
  id: string;
  title: string;
  short_intro: string | null;
  biography: string | null;
  artistic_philosophy: string | null;
  menzuma_approach: string | null;
  portrait_media_id: string | null;
  press_kit_url: string | null;
  milestones: Json;
  created_at: string;
  updated_at: string;
};

export type HomepageSection = {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  is_enabled: boolean;
  sort_order: number;
  config: Json;
  created_at: string;
  updated_at: string;
};

export type NavigationItem = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  is_enabled: boolean;
  sort_order: number;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
};

export type FooterSettings = {
  id: string;
  artist_name: string;
  short_description: string | null;
  show_newsletter: boolean;
  show_social: boolean;
  show_navigation: boolean;
  show_contact_cta: boolean;
  copyright_text: string | null;
  attribution: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ThemeSettings = {
  id: string;
  preset: string;
  primary_bg: string;
  secondary_bg: string;
  accent: string;
  text_color: string;
  muted_text: string;
  heading_font: string;
  body_font: string;
  border_radius: string;
  button_style: string;
  section_spacing: string;
  animation_intensity: string;
  created_at: string;
  updated_at: string;
};

export type SeoSettings = {
  id: string;
  default_title: string;
  default_description: string | null;
  default_keywords: string | null;
  og_image_url: string | null;
  twitter_card_type: string;
  google_analytics_id: string | null;
  google_site_verification: string | null;
  created_at: string;
  updated_at: string;
};

export type Music = {
  id: string;
  title: string;
  title_am: string | null;
  title_ar: string | null;
  slug: string;
  description: string | null;
  cover_media_id: string | null;
  release_date: string | null;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  youtube_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  audio_media_id: string | null;
  video_media_id: string | null;
  lyrics: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type Video = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  thumbnail_media_id: string | null;
  video_media_id: string | null;
  external_url: string | null;
  category: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  map_url: string | null;
  ticket_url: string | null;
  booking_url: string | null;
  poster_media_id: string | null;
  cover_media_id: string | null;
  promo_video_media_id: string | null;
  status: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type JourneyItem = {
  id: string;
  year_label: string;
  title: string;
  description: string | null;
  image_media_id: string | null;
  category: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: string;
  media_id: string | null;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_media_id: string | null;
  author: string | null;
  category_id: string | null;
  status: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_media_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type FanMessage = {
  id: string;
  name: string;
  message: string;
  country: string | null;
  city: string | null;
  social_handle: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  subject: string | null;
  inquiry_type: string;
  event_date: string | null;
  location: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaWithUrl = MediaRecord & {
  public_url: string;
};
