'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import type { SiteSettings } from '@/lib/types/database';
import { Save, Loader2, ImagePlus, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function SiteSettingsPage() {
  const supabase = createClient();
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({
    site_name: 'Amir Hussen',
    tagline: '',
    description: '',
    primary_email: '',
    primary_phone: '',
    address: '',
    announcement_text: '',
    announcement_enabled: false,
    logo_url: '',
    favicon_url: '',
  });

  const [logoMediaId, setLogoMediaId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconMediaId, setFaviconMediaId] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSite = async () => {
      const { data } = await supabase.from('site_settings').select('*').maybeSingle();
      if (data) {
        setSite(data as SiteSettings);
        setForm({
          site_name: data.site_name || 'Amir Hussen',
          tagline: data.tagline || '',
          description: data.description || '',
          primary_email: data.primary_email || '',
          primary_phone: data.primary_phone || '',
          address: data.address || '',
          announcement_text: data.announcement_text || '',
          announcement_enabled: data.announcement_enabled ?? false,
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
        });
        setLogoPreview(data.logo_url || null);
        setFaviconPreview(data.favicon_url || null);
      }
      setLoading(false);
    };
    loadSite();
  }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    setMessage('Uploading logo...');
    try {
      const media = await uploadMedia(file, {
        category: 'branding',
        title: 'Site Logo',
      });
      setLogoMediaId(media.id);
      setLogoPreview(media.public_url);
      // Store the public URL, not the media ID
      setForm((prev) => ({ ...prev, logo_url: media.public_url }));
      setMessage('✓ Logo uploaded.');
      toast.success('Logo uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    setMessage('Uploading favicon...');
    try {
      const media = await uploadMedia(file, {
        category: 'branding',
        title: 'Site Favicon',
      });
      setFaviconMediaId(media.id);
      setFaviconPreview(media.public_url);
      // Store the public URL, not the media ID
      setForm((prev) => ({ ...prev, favicon_url: media.public_url }));
      setMessage('✓ Favicon uploaded.');
      toast.success('Favicon uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.site_name.trim()) {
      setMessage('Site name is required.');
      toast.error('Missing site name');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = {
      site_name: form.site_name.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      primary_email: form.primary_email.trim() || null,
      primary_phone: form.primary_phone.trim() || null,
      address: form.address.trim() || null,
      announcement_text: form.announcement_text.trim() || null,
      announcement_enabled: form.announcement_enabled,
      logo_url: form.logo_url || null,
      favicon_url: form.favicon_url || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (site?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('id', site.id);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ Site settings saved.');
          toast.success('Saved');
          await triggerRevalidation();
        }
      } else {
        const { error } = await supabase.from('site_settings').insert(payload);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ Site settings created.');
          toast.success('Created');
          await triggerRevalidation();
        }
      }
    } catch (err) {
      setMessage('✗ An error occurred.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Site Settings" backHref="/admin">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Settings" subtitle="Configure general site information" backHref="/admin" previewHref="/">
      <form onSubmit={saveSettings} className="max-w-2xl space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
        {/* Info banner */}
        <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground">
            Set your site name, contact info, logo, and favicon.
          </p>
        </div>

        {/* Basic info */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Basic Information</p>
          <TextInput
            id="site_name"
            label="Site Name *"
            value={form.site_name}
            onChange={(e) => updateField('site_name', e.target.value)}
            required
            placeholder="Amir Hussen"
          />
          <TextInput
            id="tagline"
            label="Tagline"
            value={form.tagline}
            onChange={(e) => updateField('tagline', e.target.value)}
            placeholder="e.g., Ethiopian Menzuma Artist"
          />
          <TextArea
            id="description"
            label="Site Description (for search engines)"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            placeholder="Brief description of your site..."
          />
        </div>

        {/* Contact info */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Contact Information</p>
          <TextInput
            id="primary_email"
            label="Email"
            type="email"
            value={form.primary_email}
            onChange={(e) => updateField('primary_email', e.target.value)}
            placeholder="contact@example.com"
          />
          <TextInput
            id="primary_phone"
            label="Phone"
            value={form.primary_phone}
            onChange={(e) => updateField('primary_phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <TextInput
            id="address"
            label="Address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="City, Country"
          />
        </div>

        {/* Branding */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Branding</p>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Logo</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              {logoPreview ? 'Replace logo' : 'Upload logo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">Logo displayed in header</p>
            {logoPreview && (
              <img src={logoPreview} alt="Logo" className="h-12 rounded border border-border" />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Favicon</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              {faviconPreview ? 'Replace favicon' : 'Upload favicon'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFaviconUpload(file);
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">Small icon displayed in browser tab (ideally square/PNG)</p>
            {faviconPreview && (
              <img src={faviconPreview} alt="Favicon" className="h-8 rounded border border-border" />
            )}
          </div>
        </div>

        {/* Announcement */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Announcement</p>
          <Checkbox
            label="Show announcement banner"
            checked={form.announcement_enabled}
            onChange={(e) => updateField('announcement_enabled', e.target.checked)}
          />
          {form.announcement_enabled && (
            <TextArea
              id="announcement_text"
              label="Announcement Text"
              value={form.announcement_text}
              onChange={(e) => updateField('announcement_text', e.target.value)}
              rows={3}
              placeholder="e.g., New album coming soon!"
            />
          )}
        </div>

        {message && (
          <div className={`text-xs p-3 rounded ${message.includes('✗') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Site Settings
            </>
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
