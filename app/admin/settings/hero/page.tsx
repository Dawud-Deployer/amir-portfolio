'use client';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Select, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import { triggerRevalidation } from '@/lib/services/revalidation';
import type { HeroSettings } from '@/lib/types/database';
import { Save, Loader2, ImagePlus, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function HeroSettingsPage() {
  const supabase = createClient();
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [form, setForm] = useState({
    artist_name_en: 'Amir Hussen',
    headline: 'Ethiopian Menzuma Artist',
    highlighted_phrase: '',
    description: '',
    eyebrow_text: '',
    primary_cta_label: '',
    primary_cta_url: '',
    secondary_cta_label: '',
    secondary_cta_url: '',
    visual_mode: 'portrait',
    text_alignment: 'center',
    hero_height: 'full',
    overlay_intensity: '40',
    show_scroll_indicator: true,
  });

  const [portraitMediaId, setPortraitMediaId] = useState<string | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [videoMediaId, setVideoMediaId] = useState<string | null>(null);
  const [posterMediaId, setPosterMediaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadHero = async () => {
      const { data } = await supabase.from('hero_settings').select('*').maybeSingle();
      if (data) {
        setHero(data as HeroSettings);
        setForm({
          artist_name_en: data.artist_name_en || 'Amir Hussen',
          headline: data.headline || '',
          highlighted_phrase: data.highlighted_phrase || '',
          description: data.description || '',
          eyebrow_text: data.eyebrow_text || '',
          primary_cta_label: data.primary_cta_label || '',
          primary_cta_url: data.primary_cta_url || '',
          secondary_cta_label: data.secondary_cta_label || '',
          secondary_cta_url: data.secondary_cta_url || '',
          visual_mode: data.visual_mode || 'portrait',
          text_alignment: data.text_alignment || 'center',
          hero_height: data.hero_height || 'full',
          overlay_intensity: String(data.overlay_intensity || 40),
          show_scroll_indicator: data.show_scroll_indicator ?? true,
        });
        setPortraitMediaId(data.portrait_media_id);
        setVideoMediaId(data.hero_video_media_id);
        setPosterMediaId(data.video_poster_media_id);
      }
      setLoading(false);
    };
    loadHero();
  }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePortraitUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    setMessage('Uploading portrait...');
    try {
      const media = await uploadMedia(file, {
        category: 'hero',
        title: 'Hero Portrait',
      });
      setPortraitMediaId(media.id);
      setPortraitPreview(media.public_url);
      setMessage('✓ Portrait uploaded.');
      toast.success('Portrait uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.headline.trim()) {
      setMessage('Headline is required.');
      toast.error('Missing headline');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = {
      artist_name_en: form.artist_name_en.trim(),
      headline: form.headline.trim(),
      highlighted_phrase: form.highlighted_phrase.trim() || null,
      description: form.description.trim() || null,
      eyebrow_text: form.eyebrow_text.trim() || null,
      primary_cta_label: form.primary_cta_label.trim() || null,
      primary_cta_url: form.primary_cta_url.trim() || null,
      secondary_cta_label: form.secondary_cta_label.trim() || null,
      secondary_cta_url: form.secondary_cta_url.trim() || null,
      portrait_media_id: portraitMediaId,
      visual_mode: form.visual_mode,
      text_alignment: form.text_alignment,
      hero_height: form.hero_height,
      overlay_intensity: Number(form.overlay_intensity),
      show_scroll_indicator: form.show_scroll_indicator,
      updated_at: new Date().toISOString(),
    };

    try {
      if (hero?.id) {
        const { error } = await supabase
          .from('hero_settings')
          .update(payload)
          .eq('id', hero.id);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ Hero settings saved.');
          toast.success('Saved');
          await triggerRevalidation();
        }
      } else {
        const { error } = await supabase.from('hero_settings').insert(payload);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ Hero settings created.');
          toast.success('Created');
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
      <AdminLayout title="Hero Settings" backHref="/admin">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hero Settings" subtitle="Configure homepage hero section" backHref="/admin" previewHref="/">
      <form onSubmit={saveSettings} className="max-w-2xl space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
        {/* Info banner */}
        <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground">
            These settings control the homepage hero section appearance. Upload a portrait image to display on the right side.
          </p>
        </div>

        {/* Headlines */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Headline</p>
          <TextInput
            id="artist_name_en"
            label="Artist Name"
            value={form.artist_name_en}
            onChange={(e) => updateField('artist_name_en', e.target.value)}
            required
          />
          <TextInput
            id="eyebrow_text"
            label="Eyebrow Text (above headline)"
            value={form.eyebrow_text}
            onChange={(e) => updateField('eyebrow_text', e.target.value)}
            placeholder="e.g., Official Website"
          />
          <TextInput
            id="headline"
            label="Main Headline *"
            value={form.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            required
            placeholder="e.g., Ethiopian Menzuma Artist"
          />
          <TextInput
            id="highlighted_phrase"
            label="Highlighted Phrase"
            value={form.highlighted_phrase}
            onChange={(e) => updateField('highlighted_phrase', e.target.value)}
            placeholder="Words to emphasize in accent color"
          />
          <TextArea
            id="description"
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            placeholder="Short description below headline"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Call-to-Action Buttons</p>
          <TextInput
            id="primary_cta_label"
            label="Primary Button Label"
            value={form.primary_cta_label}
            onChange={(e) => updateField('primary_cta_label', e.target.value)}
            placeholder="e.g., Listen Now"
          />
          <TextInput
            id="primary_cta_url"
            label="Primary Button URL"
            type="text"
            value={form.primary_cta_url}
            onChange={(e) => updateField('primary_cta_url', e.target.value)}
            placeholder="/menzuma or https://..."
            help="Relative path like /menzuma or full URL"
          />
          <TextInput
            id="secondary_cta_label"
            label="Secondary Button Label"
            value={form.secondary_cta_label}
            onChange={(e) => updateField('secondary_cta_label', e.target.value)}
            placeholder="e.g., Explore Events"
          />
          <TextInput
            id="secondary_cta_url"
            label="Secondary Button URL"
            type="text"
            value={form.secondary_cta_url}
            onChange={(e) => updateField('secondary_cta_url', e.target.value)}
            placeholder="/videos or https://..."
            help="Relative path like /videos or full URL"
          />
        </div>

        {/* Visual settings */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Visual Settings</p>

          {/* Portrait upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Portrait Image (Right side)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              {portraitPreview ? 'Replace image' : 'Upload portrait'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePortraitUpload(file);
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">Displays on right side of hero (portrait orientation recommended)</p>
            {portraitPreview && (
              <img src={portraitPreview} alt="Portrait" className="aspect-[4/5] w-48 rounded-md object-cover border border-border" />
            )}
          </div>

          <Select
            id="visual_mode"
            label="Visual Mode"
            value={form.visual_mode}
            onChange={(e) => updateField('visual_mode', e.target.value)}
            options={[
              { value: 'portrait', label: 'Portrait Image' },
              { value: 'video', label: 'Background Video' },
            ]}
          />

          <Select
            id="text_alignment"
            label="Text Alignment"
            value={form.text_alignment}
            onChange={(e) => updateField('text_alignment', e.target.value)}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />

          <Select
            id="hero_height"
            label="Hero Height"
            value={form.hero_height}
            onChange={(e) => updateField('hero_height', e.target.value)}
            options={[
              { value: 'full', label: 'Full Screen (Full Height)' },
              { value: 'tall', label: 'Tall (85% Height)' },
              { value: 'medium', label: 'Medium (70% Height)' },
            ]}
          />

          <TextInput
            id="overlay_intensity"
            label="Overlay Darkness (0-100)"
            type="number"
            min="0"
            max="100"
            value={form.overlay_intensity}
            onChange={(e) => updateField('overlay_intensity', e.target.value)}
            help="Darker overlay makes text more readable"
          />

          <Checkbox
            label="Show scroll indicator (↓ arrow)"
            checked={form.show_scroll_indicator}
            onChange={(e) => updateField('show_scroll_indicator', e.target.checked)}
          />
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
              Save Hero Settings
            </>
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
