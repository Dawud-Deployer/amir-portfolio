/*
# Storage Bucket for Media Uploads

Creates the 'media' storage bucket for all artist media uploads.
Sets up RLS policies so:
- Anyone can read published media (needed for public website)
- Only authenticated admins can upload, update, delete files
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "media_bucket_read" ON storage.objects;
CREATE POLICY "media_bucket_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_insert" ON storage.objects;
CREATE POLICY "media_bucket_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_bucket_update" ON storage.objects;
CREATE POLICY "media_bucket_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_bucket_delete" ON storage.objects;
CREATE POLICY "media_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
