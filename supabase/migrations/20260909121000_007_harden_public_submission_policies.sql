/*
# Harden anonymous submission policies

Public visitors may submit new messages, but cannot set moderation or admin fields.
*/

DROP POLICY IF EXISTS "fan_messages_insert" ON public.fan_messages;
CREATE POLICY "fan_messages_insert" ON public.fan_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND is_featured = false
  );

DROP POLICY IF EXISTS "newsletter_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert" ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'active');

DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_insert" ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    is_read = false
    AND is_archived = false
  );
