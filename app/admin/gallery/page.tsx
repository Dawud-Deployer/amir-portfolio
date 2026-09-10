'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile, addPublicUrl } from '@/lib/services/media-service';
import type { GalleryItem } from '@/lib/types/database';
import { Pencil, Plus, Save, Trash2, Loader2, ImagePlus, Images } from 'lucide-react';
import { toast } from 'sonner';

type GalleryForm = {
  title: string;
  caption: string;
  alt_text: string;
  category: string;
  tags: string;
  sort_order: string;
  is_featured: boolean;
  is_published: boolean;
};

const emptyForm: GalleryForm = {
  title: '',
  caption: '',
  alt_text: '',
  category: '',
  tags: '',
  sort_order: '0',
  is_featured: false,
  is_published: false,
};

type GalleryItemWithUrl = GalleryItem & { public_url?: string };

export default function GalleryPage() {
  const supabase = createClient();
  const [items, setItems] = useState<GalleryItemWithUrl[]>([]);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadItems = async () => {
    const { data } = await supabase
      .from('gallery_items')
      .select('*, media(storage_path)')
      .order('sort_order')
      .order('created_at', { ascending: false });

    if (!data) { setLoading(false); return; }

    // Attach public_url using storage paths from joined media
    const enriched: GalleryItemWithUrl[] = data.map((row: any) => {
      const storagePath = row.media?.storage_path;
      const public_url = storagePath
        ? supabase.storage.from('media').getPublicUrl(storagePath).data.publicUrl
        : undefined;
      return { ...row, public_url } as GalleryItemWithUrl;
    });

    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMediaId(null);
    setImagePreview(null);
    setMessage('');
  };

  const editItem = (item: GalleryItemWithUrl) => {
    setForm({
      title: item.title || '',
      caption: item.caption || '',
      alt_text: item.alt_text || '',
      category: item.category || '',
      tags: item.tags?.join(', ') || '',
      sort_order: String(item.sort_order),
      is_featured: item.is_featured,
      is_published: item.is_published,
    });
    setEditingId(item.id);
    setMediaId(item.media_id);
    setImagePreview(item.public_url || null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof GalleryForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImage = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { setMessage(error); toast.error('Invalid file'); return; }
    setSaving(true);
    setMessage('Uploading image...');
    try {
      const media = await uploadMedia(file, {
        category: 'gallery',
        title: form.title || file.name,
        altText: form.alt_text || undefined,
        caption: form.caption || undefined,
      });
      setMediaId(media.id);
      setImagePreview(media.public_url);
      setMessage('✓ Image uploaded.');
      toast.success('Image uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!mediaId) {
      setMessage('Please upload an image first.');
      toast.error('No image selected');
      return;
    }
    setSaving(true);
    setMessage('');

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      media_id: mediaId,
      title: form.title.trim() || null,
      caption: form.caption.trim() || null,
      alt_text: form.alt_text.trim() || null,
      category: form.category.trim() || null,
      tags: tagsArray,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from('gallery_items').update(payload).eq('id', editingId)
        : supabase.from('gallery_items').insert(payload);
      const { error } = await query;
      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Save failed');
      } else {
        setMessage(editingId ? '✓ Item updated.' : '✓ Item added to gallery.');
        toast.success(editingId ? 'Updated' : 'Added');
          await triggerRevalidation();
        resetForm();
        await loadItems();
      }
    } catch {
      setMessage('✗ An error occurred. Please try again.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item: GalleryItemWithUrl) => {
    if (!window.confirm('Delete this gallery item?')) return;
    const { error } = await supabase.from('gallery_items').delete().eq('id', item.id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted');
          await triggerRevalidation();
      await loadItems();
      if (editingId === item.id) resetForm();
    }
  };

  return (
    <AdminLayout title="Gallery" subtitle="Manage photo gallery" backHref="/admin" previewHref="/gallery">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Gallery grid ── */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
              <Images className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No gallery items yet. Upload the first image using the form on the right.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="group relative rounded-lg border border-border bg-white overflow-hidden hover:border-primary/40 transition-colors">
                  {item.public_url ? (
                    <img src={item.public_url} alt={item.alt_text || item.title || 'Gallery'} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <Images className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-2">
                    {item.title && <p className="truncate text-xs font-medium text-foreground">{item.title}</p>}
                    <p className="text-xs text-muted-foreground">
                      {item.is_published ? 'Published' : 'Hidden'}
                      {item.is_featured ? ' • Featured' : ''}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => editItem(item)}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow hover:bg-primary hover:text-white transition-colors">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeItem(item)}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-destructive shadow hover:bg-destructive hover:text-white transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Form sidebar ── */}
        <form onSubmit={saveItem} className="h-fit space-y-5 rounded-lg border border-border bg-white p-5 shadow-brand-sm sticky top-20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit' : 'Add'} photo</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-primary">Clear</button>
            )}
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
              Image * {!mediaId && <span className="text-destructive">required</span>}
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background px-3 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-5 w-5" />
              {imagePreview ? 'Replace image' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="aspect-square w-full rounded-md object-cover border border-border" />
            )}
          </div>

          <TextInput id="title" label="Title" value={form.title}
            onChange={(e) => updateField('title', e.target.value)} placeholder="Optional caption title" />

          <TextArea id="caption" label="Caption" value={form.caption}
            onChange={(e) => updateField('caption', e.target.value)} rows={2} placeholder="Description for this photo" />

          <TextInput id="alt_text" label="Alt Text" value={form.alt_text}
            onChange={(e) => updateField('alt_text', e.target.value)} placeholder="Accessibility description" />

          <TextInput id="category" label="Category" value={form.category}
            onChange={(e) => updateField('category', e.target.value)} placeholder="e.g., performance, travel" />

          <TextInput id="tags" label="Tags" value={form.tags}
            onChange={(e) => updateField('tags', e.target.value)} placeholder="tag1, tag2, tag3" />

          <TextInput id="sort_order" label="Sort Order" type="number" value={form.sort_order}
            onChange={(e) => updateField('sort_order', e.target.value)} />

          <div className="space-y-2 border-t border-border pt-3">
            <Checkbox label="Published" checked={form.is_published}
              onChange={(e) => updateField('is_published', e.target.checked)} />
            <Checkbox label="Featured" checked={form.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)} />
          </div>

          {message && (
            <div className={`text-xs p-2 rounded ${message.includes('✗') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={saving || !mediaId}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              : editingId ? <><Save className="h-4 w-4" /> Save</>
              : <><Plus className="h-4 w-4" /> Add to gallery</>}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
