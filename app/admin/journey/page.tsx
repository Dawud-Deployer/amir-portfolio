'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import type { JourneyItem } from '@/lib/types/database';
import { Pencil, Plus, Save, Trash2, Loader2, ImagePlus, MapPin } from 'lucide-react';
import { toast } from 'sonner';

type JourneyForm = {
  year_label: string;
  title: string;
  description: string;
  category: string;
  sort_order: string;
  is_published: boolean;
};

const emptyForm: JourneyForm = {
  year_label: '',
  title: '',
  description: '',
  category: '',
  sort_order: '0',
  is_published: false,
};

export default function JourneyPage() {
  const supabase = createClient();
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [form, setForm] = useState<JourneyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageMediaId, setImageMediaId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadItems = async () => {
    const { data } = await supabase
      .from('journey_items')
      .select('*')
      .order('sort_order')
      .order('year_label');
    setItems((data || []) as JourneyItem[]);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageMediaId(null);
    setImagePreview(null);
    setMessage('');
  };

  const editItem = (item: JourneyItem) => {
    setForm({
      year_label: item.year_label,
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      sort_order: String(item.sort_order),
      is_published: item.is_published,
    });
    setEditingId(item.id);
    setImageMediaId(item.image_media_id);
    setImagePreview(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof JourneyForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImage = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { setMessage(error); toast.error('Invalid file'); return; }
    setSaving(true);
    setMessage('Uploading image...');
    try {
      const media = await uploadMedia(file, { category: 'journey', title: form.title || file.name });
      setImageMediaId(media.id);
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
    if (!form.year_label.trim() || !form.title.trim()) {
      setMessage('Year label and title are required.');
      toast.error('Missing required fields');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload = {
      year_label: form.year_label.trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_media_id: imageMediaId,
      category: form.category.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from('journey_items').update(payload).eq('id', editingId)
        : supabase.from('journey_items').insert(payload);
      const { error } = await query;
      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Save failed');
      } else {
        setMessage(editingId ? '✓ Updated.' : '✓ Milestone created.');
        toast.success(editingId ? 'Updated' : 'Created');
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

  const removeItem = async (item: JourneyItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from('journey_items').delete().eq('id', item.id);
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
    <AdminLayout title="Journey" subtitle="Manage artistic milestones and timeline" backHref="/admin" previewHref="/journey">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Items list ── */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No milestones yet. Add the first one using the form on the right.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 hover:border-primary/40 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary font-mono">
                        {item.year_label}
                      </span>
                      <p className="truncate font-medium text-foreground">{item.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.category && `${item.category} • `}
                      {item.is_published ? 'Published' : 'Hidden'}
                      {' • Sort: '}{item.sort_order}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editItem(item)} className="btn-ghost text-xs">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={() => removeItem(item)} className="text-destructive hover:text-destructive/80 p-2">
                      <Trash2 className="h-4 w-4" />
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
            <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit' : 'Add'} milestone</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-primary">Clear</button>
            )}
          </div>

          <TextInput id="year_label" label="Year / Label *" value={form.year_label}
            onChange={(e) => updateField('year_label', e.target.value)}
            required placeholder="e.g., 2018 or 'Early Career'" />

          <TextInput id="title" label="Title *" value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required placeholder="Milestone title" />

          <TextArea id="description" label="Description" value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3} placeholder="Details about this milestone" />

          <TextInput id="category" label="Category" value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            placeholder="e.g., performance, recording, award" />

          <TextInput id="sort_order" label="Sort Order" type="number" value={form.sort_order}
            onChange={(e) => updateField('sort_order', e.target.value)} />

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Image</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              {imagePreview ? 'Replace' : 'Upload'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Milestone" className="aspect-video w-full rounded-md object-cover border border-border" />
            )}
          </div>

          <div className="border-t border-border pt-3">
            <Checkbox label="Published" checked={form.is_published}
              onChange={(e) => updateField('is_published', e.target.checked)} />
          </div>

          {message && (
            <div className={`text-xs p-2 rounded ${message.includes('✗') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={saving || !form.year_label.trim() || !form.title.trim()}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              : editingId ? <><Save className="h-4 w-4" /> Save</>
              : <><Plus className="h-4 w-4" /> Add milestone</>}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
