/*
# Blog & Community Tables — Blog, Fan Messages, Newsletter, Contact

Creates:
- blog_posts: full editorial CMS with rich text, SEO, drafts, scheduling
- blog_categories: post categories
- blog_tags: post tags
- blog_post_tags: many-to-many join table
- fan_messages: fan-submitted messages with moderation workflow
- newsletter_subscribers: email subscriptions
- contact_messages: contact/booking form submissions

Security:
- blog_posts: public read for published, admin-only writes
- blog_categories, blog_tags, blog_post_tags: public read, admin write
- fan_messages: public can INSERT (submit), admin-only SELECT/UPDATE/DELETE
- newsletter_subscribers: public can INSERT (subscribe), admin-only SELECT/DELETE
- contact_messages: public can INSERT (submit), admin-only SELECT/DELETE
*/

-- Blog categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_cat_slug ON public.blog_categories(slug);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_categories_select" ON public.blog_categories;
CREATE POLICY "blog_categories_select" ON public.blog_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blog_categories_write" ON public.blog_categories;
CREATE POLICY "blog_categories_write" ON public.blog_categories FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog tags
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON public.blog_tags(slug);

ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_tags_select" ON public.blog_tags;
CREATE POLICY "blog_tags_select" ON public.blog_tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blog_tags_write" ON public.blog_tags;
CREATE POLICY "blog_tags_write" ON public.blog_tags FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  author text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_select" ON public.blog_posts;
CREATE POLICY "blog_posts_select" ON public.blog_posts FOR SELECT
  TO anon, authenticated USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "blog_posts_write" ON public.blog_posts;
CREATE POLICY "blog_posts_write" ON public.blog_posts FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog post tags (many-to-many)
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON public.blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON public.blog_post_tags(tag_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_post_tags_unique ON public.blog_post_tags(post_id, tag_id);

ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_post_tags_select" ON public.blog_post_tags;
CREATE POLICY "blog_post_tags_select" ON public.blog_post_tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blog_post_tags_write" ON public.blog_post_tags;
CREATE POLICY "blog_post_tags_write" ON public.blog_post_tags FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Fan messages
CREATE TABLE IF NOT EXISTS public.fan_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  country text,
  city text,
  social_handle text,
  status text NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fan_messages_status ON public.fan_messages(status);
CREATE INDEX IF NOT EXISTS idx_fan_messages_created ON public.fan_messages(created_at DESC);

ALTER TABLE public.fan_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fan_messages_select" ON public.fan_messages;
CREATE POLICY "fan_messages_select" ON public.fan_messages FOR SELECT
  TO anon, authenticated USING (status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "fan_messages_insert" ON public.fan_messages;
CREATE POLICY "fan_messages_insert" ON public.fan_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "fan_messages_update" ON public.fan_messages;
CREATE POLICY "fan_messages_update" ON public.fan_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fan_messages_delete" ON public.fan_messages;
CREATE POLICY "fan_messages_delete" ON public.fan_messages FOR DELETE
  TO authenticated USING (public.is_admin());

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscribers(status);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_select" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_select" ON public.newsletter_subscribers FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "newsletter_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert" ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_update" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_update" ON public.newsletter_subscribers FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "newsletter_delete" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_delete" ON public.newsletter_subscribers FOR DELETE
  TO authenticated USING (public.is_admin());

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  organization text,
  subject text,
  inquiry_type text NOT NULL DEFAULT 'general',
  event_date text,
  location text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_type ON public.contact_messages(inquiry_type);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_messages_select" ON public.contact_messages;
CREATE POLICY "contact_messages_select" ON public.contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_insert" ON public.contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_update" ON public.contact_messages;
CREATE POLICY "contact_messages_update" ON public.contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_delete" ON public.contact_messages;
CREATE POLICY "contact_messages_delete" ON public.contact_messages FOR DELETE
  TO authenticated USING (public.is_admin());
