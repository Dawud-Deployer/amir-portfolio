/*
# Core RLS Policies — Amir Hussen CMS

1. Security Changes
- Creates is_admin() helper function (SECURITY DEFINER)
- Adds RLS policies to all core tables from migration 001
- Pattern: public read (anon+authenticated) for content tables, admin-only writes
- profiles: own read/update, admin can read all
- activity_logs: admin-only read, authenticated insert own
*/

-- Helper function (profiles table already exists from migration 001)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$;

-- profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- site_settings policies
DROP POLICY IF EXISTS "site_settings_select" ON public.site_settings;
CREATE POLICY "site_settings_select" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_write" ON public.site_settings;
CREATE POLICY "site_settings_write" ON public.site_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- media policies
DROP POLICY IF EXISTS "media_select" ON public.media;
CREATE POLICY "media_select" ON public.media FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "media_insert" ON public.media;
CREATE POLICY "media_insert" ON public.media FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "media_update" ON public.media;
CREATE POLICY "media_update" ON public.media FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "media_delete" ON public.media;
CREATE POLICY "media_delete" ON public.media FOR DELETE
  TO authenticated USING (public.is_admin());

-- hero_settings policies
DROP POLICY IF EXISTS "hero_settings_select" ON public.hero_settings;
CREATE POLICY "hero_settings_select" ON public.hero_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "hero_settings_write" ON public.hero_settings;
CREATE POLICY "hero_settings_write" ON public.hero_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- about_content policies
DROP POLICY IF EXISTS "about_content_select" ON public.about_content;
CREATE POLICY "about_content_select" ON public.about_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "about_content_write" ON public.about_content;
CREATE POLICY "about_content_write" ON public.about_content FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- homepage_sections policies
DROP POLICY IF EXISTS "homepage_sections_select" ON public.homepage_sections;
CREATE POLICY "homepage_sections_select" ON public.homepage_sections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "homepage_sections_write" ON public.homepage_sections;
CREATE POLICY "homepage_sections_write" ON public.homepage_sections FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- navigation_items policies
DROP POLICY IF EXISTS "navigation_items_select" ON public.navigation_items;
CREATE POLICY "navigation_items_select" ON public.navigation_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "navigation_items_write" ON public.navigation_items;
CREATE POLICY "navigation_items_write" ON public.navigation_items FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- footer_settings policies
DROP POLICY IF EXISTS "footer_settings_select" ON public.footer_settings;
CREATE POLICY "footer_settings_select" ON public.footer_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "footer_settings_write" ON public.footer_settings;
CREATE POLICY "footer_settings_write" ON public.footer_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- social_links policies
DROP POLICY IF EXISTS "social_links_select" ON public.social_links;
CREATE POLICY "social_links_select" ON public.social_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "social_links_write" ON public.social_links;
CREATE POLICY "social_links_write" ON public.social_links FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- theme_settings policies
DROP POLICY IF EXISTS "theme_settings_select" ON public.theme_settings;
CREATE POLICY "theme_settings_select" ON public.theme_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "theme_settings_write" ON public.theme_settings;
CREATE POLICY "theme_settings_write" ON public.theme_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- seo_settings policies
DROP POLICY IF EXISTS "seo_settings_select" ON public.seo_settings;
CREATE POLICY "seo_settings_select" ON public.seo_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "seo_settings_write" ON public.seo_settings;
CREATE POLICY "seo_settings_write" ON public.seo_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- activity_logs policies
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select" ON public.activity_logs FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;
CREATE POLICY "activity_logs_insert" ON public.activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
