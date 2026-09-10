'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import type { SocialLink } from '@/lib/types/database';
import { Save, Loader2, Info, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type SocialLinkForm = {
  id?: string;
  platform: string;
  url: string;
  is_active: boolean;
};

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
  { value: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
  { value: 'soundcloud', label: 'SoundCloud', placeholder: 'https://soundcloud.com/...' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
  { value: 'email', label: 'Email', placeholder: 'contact@example.com' },
  { value: 'website', label: 'Personal Website', placeholder: 'https://example.com' },
];

export default function SocialSettingsPage() {
  const supabase = createClient();
  const [links, setLinks] = useState<SocialLinkForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadLinks = async () => {
      const { data } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order');
      setLinks((data || []) as SocialLinkForm[]);
      setLoading(false);
    };
    loadLinks();
  }, []);

  const addLink = () => {
    const newLink: SocialLinkForm = {
      platform: '',
      url: '',
      is_active: true,
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (index: number, field: keyof SocialLinkForm, value: any) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    
    const activeLinks = links.filter(l => l.platform && l.url.trim());
    if (activeLinks.length === 0) {
      setMessage('Add at least one social link.');
      toast.error('No links added');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // Delete all existing links
      const { error: deleteError } = await supabase.from('social_links').delete().neq('id', 'null');
      if (deleteError) throw deleteError;

      // Insert new links
      const newLinks = activeLinks.map((link, idx) => ({
        platform: link.platform,
        url: link.url.trim(),
        is_active: link.is_active,
        sort_order: idx,
      }));

      const { error: insertError } = await supabase.from('social_links').insert(newLinks);
      if (insertError) throw insertError;

      setMessage('✓ Social links saved.');
      toast.success('Saved');
          await triggerRevalidation();
    } catch (err) {
      setMessage(`✗ ${err instanceof Error ? err.message : 'Save failed'}`);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Social Links" backHref="/admin">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Social Links" subtitle="Manage social media profiles" backHref="/admin" previewHref="/">
      <form onSubmit={saveSettings} className="max-w-2xl space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
        {/* Info banner */}
        <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground">
            Add links to your social media profiles. These appear in the footer and header.
          </p>
        </div>

        {/* Links list */}
        <div className="space-y-4">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No social links yet. Click "Add Link" to get started.</p>
          ) : (
            links.map((link, idx) => {
              const platform = PLATFORMS.find(p => p.value === link.platform);
              return (
                <div key={idx} className="space-y-3 p-4 rounded-lg border border-border bg-white/50">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Platform</label>
                      <select
                        value={link.platform}
                        onChange={(e) => updateLink(idx, 'platform', e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm rounded-md border border-border bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="">Select platform...</option>
                        {PLATFORMS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(idx)}
                      className="text-destructive hover:text-destructive/80 p-2.5 rounded-md border border-border"
                      title="Remove link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {platform && (
                    <TextInput
                      id={`url-${idx}`}
                      label="URL"
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(idx, 'url', e.target.value)}
                      placeholder={platform.placeholder}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={addLink}
          className="btn-ghost w-full flex items-center justify-center gap-2 border border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </button>

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
              Save Social Links
            </>
          )}
        </button>
      </form>
    </AdminLayout>
  );
}
