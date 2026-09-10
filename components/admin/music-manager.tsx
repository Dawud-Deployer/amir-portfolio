'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, ImagePlus, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import type { Music } from '@/lib/types/database';
import { toast } from 'sonner';

type MusicForm = {
  title: string; title_am: string; title_ar: string; slug: string; description: string;
  release_date: string; category: string; tags: string; youtube_url: string; spotify_url: string;
  apple_music_url: string; lyrics: string; sort_order: string; is_featured: boolean; is_published: boolean;
};

const emptyForm: MusicForm = {
  title: '', title_am: '', title_ar: '', slug: '', description: '', release_date: '', category: '', tags: '',
  youtube_url: '', spotify_url: '', apple_music_url: '', lyrics: '', sort_order: '0', is_featured: false, is_published: false,
};

function toForm(track: Music): MusicForm {
  return {
    title: track.title, title_am: track.title_am || '', title_ar: track.title_ar || '', slug: track.slug,
    description: track.description || '', release_date: track.release_date || '', category: track.category || '',
    tags: track.tags.join(', '), youtube_url: track.youtube_url || '', spotify_url: track.spotify_url || '',
    apple_music_url: track.apple_music_url || '', lyrics: track.lyrics || '', sort_order: String(track.sort_order),
    is_featured: track.is_featured, is_published: track.is_published,
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function MusicManager() {
  const supabase = createClient();
  const [tracks, setTracks] = useState<Music[]>([]);
  const [form, setForm] = useState<MusicForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadTracks = async () => {
    const { data } = await supabase
      .from('music')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    setTracks((data || []) as Music[]);
    setLoading(false);
  };

  useEffect(() => { loadTracks(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverMediaId(null);
    setCoverPreview(null);
    setMessage('');
  };

  const editTrack = (track: Music) => {
    setForm(toForm(track));
    setEditingId(track.id);
    setCoverMediaId(track.cover_media_id);
    setCoverPreview(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof MusicForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCover = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setMessage(error);
      return;
    }
    setSaving(true);
    setMessage('Uploading cover image...');
    try {
      const media = await uploadMedia(file, {
        category: 'music-covers',
        title: form.title || file.name,
        altText: form.title,
      });
      setCoverMediaId(media.id);
      setCoverPreview(media.public_url);
      setMessage('✓ Cover uploaded. Save the track to apply it.');
      toast.success('Cover image uploaded');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cover upload failed.');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveTrack = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setMessage('Title and slug are required.');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload = {
      title: form.title.trim(),
      title_am: form.title_am.trim() || null,
      title_ar: form.title_ar.trim() || null,
      slug: slugify(form.slug),
      description: form.description.trim() || null,
      release_date: form.release_date || null,
      category: form.category.trim() || null,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      youtube_url: form.youtube_url.trim() || null,
      spotify_url: form.spotify_url.trim() || null,
      apple_music_url: form.apple_music_url.trim() || null,
      lyrics: form.lyrics.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
      is_published: form.is_published,
      cover_media_id: coverMediaId,
      published_at: form.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from('music').update(payload).eq('id', editingId)
        : supabase.from('music').insert(payload);

      const { error } = await query;

      if (error) {
        if (error.message.includes('music_slug_key')) {
          setMessage('✗ That slug is already in use.');
        } else {
          setMessage(`✗ ${error.message}`);
        }
        toast.error('Save failed');
      } else {
        setMessage(editingId ? '✓ Track updated.' : '✓ Track created.');
        toast.success(editingId ? 'Track updated' : 'Track created');
        resetForm();
        await loadTracks();
      }
    } catch (err) {
      setMessage('✗ An error occurred. Please try again.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const removeTrack = async (track: Music) => {
    if (!window.confirm(`Delete "${track.title}"? This cannot be undone.`)) return;
    
    try {
      const { error } = await supabase.from('music').delete().eq('id', track.id);
      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Delete failed');
      } else {
        setMessage('✓ Track deleted.');
        toast.success('Track deleted');
        await loadTracks();
        if (editingId === track.id) resetForm();
      }
    } catch (err) {
      setMessage('✗ Delete failed. Please try again.');
      toast.error('Error');
    }
  };

  return (
    <main className="min-h-screen bg-[hsl(145_20%_97%)]">
      {/* ── Header ── */}
      <header className="border-b border-border bg-white sticky top-0 z-40 shadow-brand-sm">
        <div className="container-px mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to CMS
          </Link>
          <Link
            href="/menzuma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            View public page <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="container-px mx-auto grid max-w-7xl gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Tracks list ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow">Music Library</p>
            <h1 className="heading-serif mt-2 text-4xl font-bold text-foreground">Menzuma Collection</h1>
            <p className="mt-2 text-muted-foreground">Create, publish, and curate the public music catalogue.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
              <p className="text-sm text-muted-foreground">No tracks yet. Create the first one using the form on the right.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 hover:border-primary/40 transition-colors shadow-brand-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{track.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      /{track.slug} • {track.is_published ? 'Published' : 'Draft'}
                      {track.is_featured ? ' • Featured' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editTrack(track)}
                      className="btn-ghost text-xs"
                      aria-label={`Edit ${track.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTrack(track)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-2"
                      aria-label={`Delete ${track.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Form sidebar ── */}
        <form
          onSubmit={saveTrack}
          className="h-fit space-y-5 rounded-lg border border-border bg-white p-5 shadow-brand-sm sticky top-20"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit' : 'New'} track</h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(event) => {
                updateField('title', event.target.value);
                if (!editingId && !form.slug) updateField('slug', slugify(event.target.value));
              }}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g., Seyedi..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="slug" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Slug *
            </label>
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={(event) => updateField('slug', event.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
              placeholder="seyedi"
            />
          </div>

          {/* Multilingual titles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label htmlFor="title_am" className="text-xs font-semibold text-foreground">
                Amharic
              </label>
              <input
                id="title_am"
                type="text"
                value={form.title_am}
                onChange={(event) => updateField('title_am', event.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-amharic"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="title_ar" className="text-xs font-semibold text-foreground">
                Arabic
              </label>
              <input
                id="title_ar"
                type="text"
                dir="rtl"
                value={form.title_ar}
                onChange={(event) => updateField('title_ar', event.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Release date */}
          <div className="space-y-2">
            <label htmlFor="release_date" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Release Date
            </label>
            <input
              id="release_date"
              type="date"
              value={form.release_date}
              onChange={(event) => updateField('release_date', event.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              placeholder="nasheed, spiritual"
              value={form.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Cover */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Cover</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              {coverPreview ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleCover(file);
                }}
              />
            </label>
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="aspect-square w-full rounded-md object-cover border border-border" />
            )}
          </div>

          {/* YouTube */}
          <div className="space-y-2">
            <label htmlFor="youtube_url" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              YouTube
            </label>
            <input
              id="youtube_url"
              type="url"
              value={form.youtube_url}
              onChange={(event) => updateField('youtube_url', event.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              placeholder="https://..."
            />
          </div>

          {/* Spotify */}
          <div className="space-y-2">
            <label htmlFor="spotify_url" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Spotify
            </label>
            <input
              id="spotify_url"
              type="url"
              value={form.spotify_url}
              onChange={(event) => updateField('spotify_url', event.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              placeholder="https://..."
            />
          </div>

          {/* Apple Music */}
          <div className="space-y-2">
            <label htmlFor="apple_music_url" className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Apple Music
            </label>
            <input
              id="apple_music_url"
              type="url"
              value={form.apple_music_url}
              onChange={(event) => updateField('apple_music_url', event.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              placeholder="https://..."
            />
          </div>

          {/* Flags */}
          <div className="space-y-2 border-t border-border pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => updateField('is_published', event.target.checked)}
                className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => updateField('is_featured', event.target.checked)}
                className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Featured</span>
            </label>
          </div>

          {/* Feedback */}
          {message && (
            <div
              className={`text-xs p-2 rounded ${
                message.includes('✗')
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !form.title.trim() || !form.slug.trim()}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : editingId ? (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
