'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Select } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import type { SeoSettings } from '@/lib/types/database';
import { Save, Loader2, Search, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function SeoSettingsPage() {
  const supabase = createClient();
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [form, setForm] = useState({
    default_title: '',
    default_description: '',
    default_keywords: '',
    og_image_url: '',
    twitter_card_type: 'summary_large_image',
    google_analytics_id: '',
    google_site_verification: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSeo = async () => {
      const { data } = await supabase.from('seo_settings').select('*').maybeSingle();
      if (data) {
        setSeo(data as SeoSettings);
        setForm({
          default_title: data.default_title || '',
          default_description: data.default_description || '',
          default_keywords: data.default_keywords || '',
          og_image_url: data.og_image_url || '',
          twitter_card_type: data.twitter_card_type || 'summary_large_image',
          google_analytics_id: data.google_analytics_id || '',
          google_site_verification: data.google_site_verification || '',
        });
      }
      setLoading(false);
    };
    loadSeo();
  }, [supabase]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.default_title.trim()) {
      setMessage('Default Title is required.');
      toast.error('Missing default title');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = {
      default_title: form.default_title.trim(),
      default_description: form.default_description.trim() || null,
      default_keywords: form.default_keywords.trim() || null,
      og_image_url: form.og_image_url.trim() || null,
      twitter_card_type: form.twitter_card_type,
      google_analytics_id: form.google_analytics_id.trim() || null,
      google_site_verification: form.google_site_verification.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (seo?.id) {
        const { error } = await supabase
          .from('seo_settings')
          .update(payload)
          .eq('id', seo.id);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ SEO settings saved.');
          toast.success('Saved');
          await triggerRevalidation();
        }
      } else {
        const { error } = await supabase.from('seo_settings').insert(payload);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ SEO settings created.');
          toast.success('Created');
          await triggerRevalidation();
          // Reload to get the new ID
          const { data } = await supabase.from('seo_settings').select('*').maybeSingle();
          if (data) setSeo(data as SeoSettings);
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
      <AdminLayout title="SEO" subtitle="Search engine optimization settings">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SEO" subtitle="Search engine optimization settings">
      <form onSubmit={saveSettings} className="max-w-2xl space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
        {/* Info banner */}
        <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground">
            These settings control how your site appears in search engines and social media platforms.
          </p>
        </div>

        {/* General SEO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground border-b border-border pb-2">
            <Search className="h-4 w-4" />
            <span>General Meta Tags</span>
          </div>
          
          <div>
            <TextInput
              id="default_title"
              label="Default Site Title *"
              value={form.default_title}
              onChange={(e) => updateField('default_title', e.target.value)}
              required
              placeholder="e.g., Amir Hussen - Official Portfolio"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              <span className={form.default_title.length > 60 ? 'text-destructive' : ''}>
                {form.default_title.length}/60 characters
              </span>
            </p>
          </div>

          <div>
            <TextArea
              id="default_description"
              label="Default Meta Description"
              value={form.default_description}
              onChange={(e) => updateField('default_description', e.target.value)}
              rows={3}
              placeholder="Brief description of the site for search results..."
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              <span className={form.default_description.length > 160 ? 'text-destructive' : ''}>
                {form.default_description.length}/160 characters
              </span>
            </p>
          </div>

          <TextArea
            id="default_keywords"
            label="Keywords"
            value={form.default_keywords}
            onChange={(e) => updateField('default_keywords', e.target.value)}
            rows={2}
            placeholder="menzuma, ethiopian artist, nasheed, amir hussen"
            help="Comma-separated list of keywords"
          />
        </div>

        {/* Social Meta */}
        <div className="space-y-4 pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground border-b border-border pb-2">Social Sharing (Open Graph / Twitter)</p>
          
          <TextInput
            id="og_image_url"
            label="Default Open Graph Image URL"
            value={form.og_image_url}
            onChange={(e) => updateField('og_image_url', e.target.value)}
            placeholder="https://example.com/og-image.jpg"
            help="Image displayed when sharing the site on social media (recommended 1200x630px)"
          />

          <Select
            id="twitter_card_type"
            label="Twitter Card Type"
            value={form.twitter_card_type}
            onChange={(e) => updateField('twitter_card_type', e.target.value)}
            options={[
              { value: 'summary', label: 'Summary (Small Image)' },
              { value: 'summary_large_image', label: 'Summary Large Image' },
            ]}
          />
        </div>

        {/* Analytics & Verification */}
        <div className="space-y-4 pt-4">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground border-b border-border pb-2">Tracking & Verification</p>
          
          <TextInput
            id="google_analytics_id"
            label="Google Analytics ID"
            value={form.google_analytics_id}
            onChange={(e) => updateField('google_analytics_id', e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />

          <TextInput
            id="google_site_verification"
            label="Google Site Verification Code"
            value={form.google_site_verification}
            onChange={(e) => updateField('google_site_verification', e.target.value)}
            placeholder="Verification string from Search Console"
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
              Save SEO Settings
            </>
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
