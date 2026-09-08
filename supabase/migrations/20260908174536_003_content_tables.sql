/*
# Content Tables — Music, Videos, Events, Journey, Gallery

Creates content tables for the artist website:
- music: Menzuma tracks with multilingual titles, streaming links, cover art
- music_links: external streaming links per track
- music_credits: collaborators and credits per track
- videos: video library with local upload and external URL support
- events: event management with posters, statuses, venues
- journey_items: artist timeline/journey entries
- gallery_items: gallery images with categories, tags, ordering

Security: RLS enabled, public read for published content, admin-only writes.
*/

-- Music / Menzuma
CREATE TABLE IF NOT EXISTS public.music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_am text,
  title_ar text,
  slug text NOT NULL UNIQUE,
  description text,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  release_date date,
  category text,
  tags text[] DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  youtube_url text,
  spotify_url text,
  apple_music_url text,
  audio_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  video_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  lyrics text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_music_slug ON public.music(slug);
CREATE INDEX IF NOT EXISTS idx_music_published ON public.music(is_published);
CREATE INDEX IF NOT EXISTS idx_music_featured ON public.music(is_featured);
CREATE INDEX IF NOT EXISTS idx_music_sort ON public.music(sort_order);
CREATE INDEX IF NOT EXISTS idx_music_release ON public.music(release_date DESC);

ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "music_select" ON public.music;
CREATE POLICY "music_select" ON public.music FOR SELECT
  TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "music_write" ON public.music;
CREATE POLICY "music_write" ON public.music FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Music links (multiple external links per track)
CREATE TABLE IF NOT EXISTS public.music_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  music_id uuid NOT NULL REFERENCES public.music(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  label text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_links_music ON public.music_links(music_id);

ALTER TABLE public.music_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "music_links_select" ON public.music_links;
CREATE POLICY "music_links_select" ON public.music_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "music_links_write" ON public.music_links;
CREATE POLICY "music_links_write" ON public.music_links FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Music credits
CREATE TABLE IF NOT EXISTS public.music_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  music_id uuid NOT NULL REFERENCES public.music(id) ON DELETE CASCADE,
  role text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_credits_music ON public.music_credits(music_id);

ALTER TABLE public.music_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "music_credits_select" ON public.music_credits;
CREATE POLICY "music_credits_select" ON public.music_credits FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "music_credits_write" ON public.music_credits;
CREATE POLICY "music_credits_write" ON public.music_credits FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Videos
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  thumbnail_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  video_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  external_url text,
  category text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_videos_slug ON public.videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_published ON public.videos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON public.videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_sort ON public.videos(sort_order);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_select" ON public.videos;
CREATE POLICY "videos_select" ON public.videos FOR SELECT
  TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "videos_write" ON public.videos;
CREATE POLICY "videos_write" ON public.videos FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  venue text,
  city text,
  country text,
  address text,
  map_url text,
  ticket_url text,
  booking_url text,
  poster_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  promo_video_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'upcoming',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events FOR SELECT
  TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "events_write" ON public.events;
CREATE POLICY "events_write" ON public.events FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Journey items (artist timeline)
CREATE TABLE IF NOT EXISTS public.journey_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label text NOT NULL,
  title text NOT NULL,
  description text,
  image_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  category text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journey_sort ON public.journey_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_journey_published ON public.journey_items(is_published);

ALTER TABLE public.journey_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journey_select" ON public.journey_items;
CREATE POLICY "journey_select" ON public.journey_items FOR SELECT
  TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "journey_write" ON public.journey_items;
CREATE POLICY "journey_write" ON public.journey_items FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Gallery items
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  title text,
  caption text,
  alt_text text,
  category text,
  tags text[] DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_sort ON public.gallery_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery_items(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON public.gallery_items(is_featured);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select" ON public.gallery_items;
CREATE POLICY "gallery_select" ON public.gallery_items FOR SELECT
  TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "gallery_write" ON public.gallery_items;
CREATE POLICY "gallery_write" ON public.gallery_items FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
