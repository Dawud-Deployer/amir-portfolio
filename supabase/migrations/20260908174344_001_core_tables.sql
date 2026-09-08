/*
# Core CMS Tables — Amir Hussen Artist Website (Step 1: Tables only)

Creates all foundational tables WITHOUT policies first.
Policies will be added in a separate migration after the is_admin() function exists.

Tables:
- profiles: admin user profiles linked to auth.users
- site_settings: global site configuration
- media: central media library
- hero_settings: hero section configuration
- about_content: about page content
- homepage_sections: reorderable homepage sections
- navigation_items: CMS-managed navigation
- footer_settings: footer configuration
- social_links: social media links
- theme_settings: theme/color customization
- seo_settings: SEO metadata
- activity_logs: audit trail

Security: RLS enabled on all tables (policies added in next migration)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Amir Hussen',
  site_name_am text,
  site_name_ar text,
  tagline text,
  description text,
  logo_url text,
  favicon_url text,
  default_og_image text,
  primary_email text,
  primary_phone text,
  address text,
  default_language text DEFAULT 'en',
  announcement_text text,
  announcement_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Media library
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  display_name text,
  mime_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  width integer,
  height integer,
  duration numeric,
  alt_text text,
  caption text,
  title text,
  category text NOT NULL DEFAULT 'other',
  uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_category ON public.media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Hero settings
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name_en text NOT NULL DEFAULT 'Amir Hussen',
  artist_name_am text,
  artist_name_ar text,
  eyebrow_text text,
  headline text NOT NULL DEFAULT 'Voice of Spirit',
  highlighted_phrase text,
  description text,
  primary_cta_label text DEFAULT 'Explore Menzuma',
  primary_cta_url text DEFAULT '/menzuma',
  secondary_cta_label text DEFAULT 'Watch Videos',
  secondary_cta_url text DEFAULT '/videos',
  portrait_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  hero_video_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  video_poster_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  visual_mode text NOT NULL DEFAULT 'portrait',
  overlay_intensity integer NOT NULL DEFAULT 40,
  text_alignment text NOT NULL DEFAULT 'left',
  hero_height text NOT NULL DEFAULT 'full',
  show_scroll_indicator boolean NOT NULL DEFAULT true,
  metadata_line text,
  featured_menzuma_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- About content
CREATE TABLE IF NOT EXISTS public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'About Amir Hussen',
  short_intro text,
  biography text,
  artistic_philosophy text,
  menzuma_approach text,
  portrait_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  press_kit_url text,
  milestones jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Homepage sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort ON public.homepage_sections(sort_order);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Navigation items
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_navigation_sort ON public.navigation_items(sort_order);

ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Footer settings
CREATE TABLE IF NOT EXISTS public.footer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name text NOT NULL DEFAULT 'Amir Hussen',
  short_description text,
  show_newsletter boolean NOT NULL DEFAULT true,
  show_social boolean NOT NULL DEFAULT true,
  show_navigation boolean NOT NULL DEFAULT true,
  show_contact_cta boolean NOT NULL DEFAULT true,
  copyright_text text,
  attribution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- Social links
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_links_sort ON public.social_links(sort_order);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Theme settings
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preset text NOT NULL DEFAULT 'emerald',
  primary_bg text DEFAULT '#0a1f1a',
  secondary_bg text DEFAULT '#0f2a22',
  accent text DEFAULT '#c9a96e',
  gold_highlight text DEFAULT '#d4af37',
  text_color text DEFAULT '#f5f5f0',
  muted_text text DEFAULT '#9ca3af',
  heading_font text DEFAULT 'Playfair Display',
  body_font text DEFAULT 'Inter',
  border_radius text DEFAULT '0.5rem',
  button_style text DEFAULT 'rounded',
  section_spacing text DEFAULT 'normal',
  animation_intensity text DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- SEO settings
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_title text NOT NULL DEFAULT 'Amir Hussen — Ethiopian Menzuma Artist',
  default_description text,
  default_keywords text,
  og_image_url text,
  twitter_card_type text DEFAULT 'summary_large_image',
  google_analytics_id text,
  google_site_verification text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
