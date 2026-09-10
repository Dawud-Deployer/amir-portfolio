'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import type { FooterSettings } from '@/lib/types/database';
import { Save, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function FooterSettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    artist_name: 'Amir Hussen',
    short_description: '',
    copyright_text: '',
    attribution: '',
    show_newsletter: true,
    show_social: true,
    show_navigation: true,
    show_contact_cta: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('footer_settings').select('*').maybeSingle();
      if (data) {
        setSettings(data as FooterSettings);
        setForm({
          artist_name: data.artist_name || 'Amir Hussen',
          short_description: data.short_description || '',
          copyright_text: data.copyright_text || '',
          attribution: data.attribution || '',
          show_newsletter: data.show_newsletter ?? true,
          show_social: data.show_social ?? true,
          show_navigation: data.show_navigation ?? true,
          show_contact_cta: data.show_contact_cta ?? true,
        });
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.artist_name.trim()) {
      toast.error('Artist name is required');
      return;
    }

    setSaving(true);

    const payload = {
      artist_name: form.artist_name.trim(),
      short_description: form.short_description.trim() || null,
      copyright_text: form.copyright_text.trim() || null,
      attribution: form.attribution.trim() || null,
      show_newsletter: form.show_newsletter,
      show_social: form.show_social,
      show_navigation: form.show_navigation,
      show_contact_cta: form.show_contact_cta,
      updated_at: new Date().toISOString(),
    };

    try {
      if (settings?.id) {
        const { error } = await supabase
          .from('footer_settings')
          .update(payload)
          .eq('id', settings.id);
        if (error) throw error;
        toast.success('Footer settings saved');
          await triggerRevalidation();
      } else {
        const { error, data } = await supabase.from('footer_settings').insert(payload).select().single();
        if (error) throw error;
        setSettings(data as FooterSettings);
        toast.success('Footer settings created');
          await triggerRevalidation();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Footer" subtitle="Customize the site footer">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Footer" subtitle="Customize the site footer">
      <form onSubmit={saveSettings} className="max-w-2xl space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
        <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground">
            Configure the content and sections displayed in the site footer.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">General Info</p>
          <TextInput
            label="Artist / Brand Name *"
            value={form.artist_name}
            onChange={(e) => updateField('artist_name', e.target.value)}
            required
          />
          <TextArea
            label="Short Description"
            value={form.short_description}
            onChange={(e) => updateField('short_description', e.target.value)}
            rows={3}
            placeholder="A short sentence or two for the footer..."
          />
          <TextInput
            label="Copyright Text"
            value={form.copyright_text}
            onChange={(e) => updateField('copyright_text', e.target.value)}
            placeholder="e.g. All rights reserved."
          />
          <TextInput
            label="Attribution / Credits"
            value={form.attribution}
            onChange={(e) => updateField('attribution', e.target.value)}
            placeholder="e.g. Designed by..."
          />
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Visibility Toggles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox
              label="Show Navigation Links"
              checked={form.show_navigation}
              onChange={(e) => updateField('show_navigation', e.target.checked)}
            />
            <Checkbox
              label="Show Social Links"
              checked={form.show_social}
              onChange={(e) => updateField('show_social', e.target.checked)}
            />
            <Checkbox
              label="Show Newsletter Form"
              checked={form.show_newsletter}
              onChange={(e) => updateField('show_newsletter', e.target.checked)}
            />
            <Checkbox
              label="Show Contact CTA"
              checked={form.show_contact_cta}
              onChange={(e) => updateField('show_contact_cta', e.target.checked)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Footer Settings
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
