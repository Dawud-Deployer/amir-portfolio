'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import type { AboutContent } from '@/lib/types/database';
import { Save, Loader2, ImagePlus, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AboutSettingsPage() {
  const supabase = createClient();
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [form, setForm] = useState({
    title: 'About Amir Hussen',
    short_intro: '',
    biography: '',
    artistic_philosophy: '',
    menzuma_approach: '',
    press_kit_url: '',
  });

  const [portraitMediaId, setPortraitMediaId] = useState<string | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadAbout = async () => {
      const { data } = await supabase.from('about_content').select('*').maybeSingle();
      if (data) {
        setAbout(data as AboutContent);
        setForm({
          title: data.title || 'About Amir Hussen',
          short_intro: data.short_intro || '',
          biography: data.biography || '',
          artistic_philosophy: data.artistic_philosophy || '',
          menzuma_approach: data.menzuma_approach || '',
          press_kit_url: data.press_kit_url || '',
        });
        setPortraitMediaId(data.portrait_media_id);
      }
      setLoading(false);
    };
    loadAbout();
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
        category: 'about',
        title: 'About Portrait',
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
    if (!form.title.trim()) {
      setMessage('Title is required.');
      toast.error('Missing title');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = {
      title: form.title.trim(),
      short_intro: form.short_intro.trim() || null,
      biography: form.biography.trim() || null,
      artistic_philosophy: form.artistic_philosophy.trim() || null,
      menzuma_approach: form.menzuma_approach.trim() || null,
      portrait_media_id: portraitMediaId,
      press_kit_url: form.press_kit_url.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (about?.id) {
        const { error } = await supabase
          .from('about_content')
          .update(payload)
          .eq('id', about.id);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ About settings saved.');
          toast.success('Saved');
          await triggerRevalidation();
        }
      } else {
        const { error } = await supabase.from('about_content').insert(payload);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ About settings created.');
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
      <AdminLayout title="About Settings" backHref="/admin">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="About Settings" subtitle="Configure about page" backHref="/admin" previewHref="/about">
      <form onSubmit={saveSettings} className="max-w-2xl space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
        {/* Info banner */}
        <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground">
            Configure the about page with biography, artistic philosophy, and a portrait image.
          </p>
        </div>

        {/* Headlines */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Content</p>
          <TextInput
            id="title"
            label="Page Title *"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            placeholder="About Amir Hussen"
          />
          <TextArea
            id="short_intro"
            label="Short Introduction (1-2 sentences)"
            value={form.short_intro}
            onChange={(e) => updateField('short_intro', e.target.value)}
            rows={2}
            placeholder="Brief intro displayed at top of page"
          />
          <TextArea
            id="biography"
            label="Full Biography"
            value={form.biography}
            onChange={(e) => updateField('biography', e.target.value)}
            rows={5}
            placeholder="Detailed biography and background..."
          />
        </div>

        {/* Philosophy & Menzuma */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Artistic Approach</p>
          <TextArea
            id="artistic_philosophy"
            label="Artistic Philosophy"
            value={form.artistic_philosophy}
            onChange={(e) => updateField('artistic_philosophy', e.target.value)}
            rows={3}
            placeholder="Your artistic beliefs and approach to music..."
          />
          <TextArea
            id="menzuma_approach"
            label="Menzuma Approach"
            value={form.menzuma_approach}
            onChange={(e) => updateField('menzuma_approach', e.target.value)}
            rows={3}
            placeholder="How you approach and perform Menzuma..."
          />
        </div>

        {/* Press Kit */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Press Kit</p>
          <TextInput
            id="press_kit_url"
            label="Press Kit URL"
            type="text"
            value={form.press_kit_url}
            onChange={(e) => updateField('press_kit_url', e.target.value)}
            placeholder="https://example.com/press-kit.pdf"
            help="Link to downloadable press kit (PDF recommended)"
          />
        </div>

        {/* Portrait */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Portrait</p>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Portrait Image</label>
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
            <p className="text-xs text-muted-foreground">Portrait image displayed on about page</p>
            {portraitPreview && (
              <img src={portraitPreview} alt="Portrait" className="aspect-[4/5] w-48 rounded-md object-cover border border-border" />
            )}
          </div>
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
              Save About Settings
            </>
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
