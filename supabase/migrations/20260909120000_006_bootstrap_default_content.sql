/*
# Bootstrap default content and the first administrator

Safe to run more than once. Replace the email below if the administrator email changes.
*/

-- Link the existing Supabase Auth user to an administrator profile.
INSERT INTO public.profiles (id, email, full_name, is_admin)
SELECT id, email, 'Amir Hussen', true
FROM auth.users
WHERE email = 'dawud2147@gmail.com'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    is_admin = true,
    updated_at = now();

-- Create the minimum records required for a populated public homepage.
INSERT INTO public.site_settings (site_name, tagline, description, default_language)
SELECT 'Amir Hussen', 'Voice of Spirit', 'Official website of Amir Hussen, Ethiopian Menzuma artist.', 'en'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

INSERT INTO public.hero_settings (artist_name_en, headline, highlighted_phrase, description)
SELECT 'Amir Hussen', 'Voice of Spirit', 'Menzuma and Nasheed', 'A home for spiritual music, stories, and shared moments.'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_settings);

INSERT INTO public.about_content (title, short_intro)
SELECT 'About Amir Hussen', 'Ethiopian Menzuma artist sharing faith, voice, and story.'
WHERE NOT EXISTS (SELECT 1 FROM public.about_content);

INSERT INTO public.footer_settings (artist_name, short_description, copyright_text)
SELECT 'Amir Hussen', 'Ethiopian Menzuma and Nasheed artist.', '© 2026 Amir Hussen'
WHERE NOT EXISTS (SELECT 1 FROM public.footer_settings);

INSERT INTO public.theme_settings (preset)
SELECT 'forest-white'
WHERE NOT EXISTS (SELECT 1 FROM public.theme_settings);

INSERT INTO public.seo_settings (default_title, default_description)
SELECT 'Amir Hussen — Ethiopian Menzuma Artist', 'Official website of Amir Hussen, Ethiopian Menzuma and Nasheed artist.'
WHERE NOT EXISTS (SELECT 1 FROM public.seo_settings);

INSERT INTO public.homepage_sections (section_key, sort_order, is_enabled)
SELECT section_key, sort_order, true
FROM (VALUES
  ('hero', 0),
  ('featured_menzuma', 1),
  ('about', 2),
  ('latest_music', 3),
  ('featured_video', 4),
  ('events', 5),
  ('journey', 6),
  ('gallery', 7),
  ('fan_messages', 8),
  ('blog', 9),
  ('newsletter', 10),
  ('contact_cta', 11)
) AS defaults(section_key, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.homepage_sections existing
  WHERE existing.section_key = defaults.section_key
);

INSERT INTO public.navigation_items (label, url, sort_order)
SELECT label, url, sort_order
FROM (VALUES
  ('About', '/about', 0),
  ('Menzuma', '/menzuma', 1),
  ('Videos', '/videos', 2),
  ('Events', '/events', 3),
  ('Journey', '/journey', 4),
  ('Gallery', '/gallery', 5),
  ('Blog', '/blog', 6),
  ('Contact', '/contact', 7)
) AS defaults(label, url, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.navigation_items existing
  WHERE existing.url = defaults.url
);
