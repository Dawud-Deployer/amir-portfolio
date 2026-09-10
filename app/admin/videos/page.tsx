'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile, validateVideoFile } from '@/lib/services/media-service';
import type { Video } from '@/lib/types/database';
import { Pencil, Plus, Save, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

type VideoForm = {
  title: string;
  slug: string;
  description: string;
  external_url: string;
  category: string;
  sort_order: string;
  is_featured: boolean;
  is_published: boolean;
};

const emptyForm: VideoForm = {
  title: '',
  slug: '',
  description: '',
  external_url: '',
  category: '',
  sort_order: '0',
  is_featured: false,
  is_published: false,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function VideosPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    setVideos((data || []) as Video[]);
    setLoading(false);
  };

  useEffect(() => { loadVideos(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setThumbnailMediaId(null);
    setThumbnailPreview(null);
    setMessage('');
  };

  const editVideo = (video: Video) => {
    setForm({
      title: video.title,
      slug: video.slug,
      description: video.description || '',
      external_url: video.external_url || '',
      category: video.category || '',
      sort_order: String(video.sort_order),
      is_featured: video.is_featured,
      is_published: video.is_published,
    });
    setEditingId(video.id);
    setThumbnailMediaId(video.thumbnail_media_id);
    setThumbnailPreview(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof VideoForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleThumbnail = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setMessage(error);
      toast.error('Invalid file');
      return;
    }
    setSaving(true);
    setMessage('Uploading thumbnail...');
    try {
      const media = await uploadMedia(file, {
        category: 'video-thumbnails',
        title: form.title || file.name,
      });
      setThumbnailMediaId(media.id);
      setThumbnailPreview(media.public_url);
      setMessage('✓ Thumbnail uploaded.');
      toast.success('Thumbnail uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setMessage('Title and slug are required.');
      toast.error('Missing required fields');
      return;
    }
    if (!form.external_url.trim() && !thumbnailMediaId) {
      setMessage('Provide either an external URL or upload a video file.');
      toast.error('No video source provided');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      description: form.description.trim() || null,
      external_url: form.external_url.trim() || null,
      video_media_id: null,
      thumbnail_media_id: thumbnailMediaId,
      category: form.category.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from('videos').update(payload).eq('id', editingId)
        : supabase.from('videos').insert(payload);

      const { error } = await query;

      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Save failed');
      } else {
        setMessage(editingId ? '✓ Video updated.' : '✓ Video created.');
        toast.success(editingId ? 'Updated' : 'Created');
          await triggerRevalidation();
        resetForm();
        await loadVideos();
      }
    } catch (err) {
      setMessage('✗ An error occurred. Please try again.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const removeVideo = async (video: Video) => {
    if (!window.confirm(`Delete "${video.title}"?`)) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', video.id);
      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Delete failed');
      } else {
        setMessage('✓ Video deleted.');
        toast.success('Deleted');
          await triggerRevalidation();
        await loadVideos();
        if (editingId === video.id) resetForm();
      }
    } catch (err) {
      setMessage('✗ Delete failed. Please try again.');
      toast.error('Error');
    }
  };

  return (
    <AdminLayout title="Videos" subtitle="Manage video library" backHref="/admin" previewHref="/videos">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Videos list ── */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
              <p className="text-sm text-muted-foreground">No videos yet. Create the first one using the form on the right.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{video.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      /{video.slug} • {video.is_published ? 'Published' : 'Draft'}
                      {video.is_featured ? ' • Featured' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editVideo(video)}
                      className="btn-ghost text-xs"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVideo(video)}
                      className="text-destructive hover:text-destructive/80 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Form sidebar ── */}
        <form
          onSubmit={saveVideo}
          className="h-fit space-y-5 rounded-lg border border-border bg-white p-5 shadow-brand-sm sticky top-20"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit' : 'New'} video</h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Clear
              </button>
            )}
          </div>

          <TextInput
            id="title"
            label="Title *"
            value={form.title}
            onChange={(e) => {
              updateField('title', e.target.value);
              if (!editingId && !form.slug) updateField('slug', slugify(e.target.value));
            }}
            required
            placeholder="e.g., Latest Performance"
          />

          <TextInput
            id="slug"
            label="Slug *"
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            required
            placeholder="latest-performance"
          />

          <TextArea
            id="description"
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
          />

          <TextInput
            id="external_url"
            label="YouTube or External Video Link"
            type="url"
            value={form.external_url}
            onChange={(e) => updateField('external_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=... or direct video URL"
            help="Paste YouTube URL or link to hosted video file (MP4, WebM)"
          />

          <TextInput
            id="category"
            label="Category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            placeholder="e.g., nasheed, performance"
          />

          <TextInput
            id="sort_order"
            label="Sort Order"
            type="number"
            value={form.sort_order}
            onChange={(e) => updateField('sort_order', e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Thumbnail Image</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              Upload Image (JPG, PNG, WebP)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnail(file);
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">Show preview of video on listing pages</p>
            {thumbnailPreview && (
              <img src={thumbnailPreview} alt="Thumbnail" className="aspect-video w-full rounded-md object-cover border border-border" />
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <Checkbox
              label="Published (visible on website)"
              checked={form.is_published}
              onChange={(e) => updateField('is_published', e.target.checked)}
            />
            <Checkbox
              label="Featured (show at top)"
              checked={form.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
            />
          </div>

          {message && (
            <div className={`text-xs p-2 rounded ${message.includes('✗') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !form.title.trim() || !form.slug.trim()}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : editingId ? (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create
              </>
            )}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
