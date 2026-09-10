'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Select, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import type { BlogPost, BlogCategory } from '@/lib/types/database';
import { Pencil, Plus, Save, Trash2, Loader2, ImagePlus, FileText } from 'lucide-react';
import { toast } from 'sonner';

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category_id: string;
  status: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  sort_order: string;
};

const emptyForm: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'Amir Hussen',
  category_id: '',
  status: 'draft',
  published_at: '',
  seo_title: '',
  seo_description: '',
  sort_order: '0',
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BlogPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [postsRes, catsRes] = await Promise.all([
      supabase.from('blog_posts').select('*').order('sort_order').order('created_at', { ascending: false }),
      supabase.from('blog_categories').select('*').order('sort_order'),
    ]);
    setPosts((postsRes.data || []) as BlogPost[]);
    setCategories((catsRes.data || []) as BlogCategory[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverMediaId(null);
    setCoverPreview(null);
    setMessage('');
  };

  const editPost = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      author: post.author || 'Amir Hussen',
      category_id: post.category_id || '',
      status: post.status,
      published_at: post.published_at ? post.published_at.slice(0, 16) : '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      sort_order: String(post.sort_order),
    });
    setEditingId(post.id);
    setCoverMediaId(post.cover_media_id);
    setCoverPreview(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof PostForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCover = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { setMessage(error); toast.error('Invalid file'); return; }
    setSaving(true);
    setMessage('Uploading cover image...');
    try {
      const media = await uploadMedia(file, { category: 'blog-covers', title: form.title || file.name });
      setCoverMediaId(media.id);
      setCoverPreview(media.public_url);
      setMessage('✓ Cover image uploaded.');
      toast.success('Cover uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const savePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setMessage('Title and slug are required.');
      toast.error('Missing required fields');
      return;
    }
    setSaving(true);
    setMessage('');

    const isPublished = form.status === 'published';
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_media_id: coverMediaId,
      author: form.author.trim() || null,
      category_id: form.category_id || null,
      status: form.status,
      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : isPublished
        ? new Date().toISOString()
        : null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      og_image_media_id: coverMediaId,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from('blog_posts').update(payload).eq('id', editingId)
        : supabase.from('blog_posts').insert(payload);
      const { error } = await query;
      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Save failed');
      } else {
        setMessage(editingId ? '✓ Post updated.' : '✓ Post created.');
        toast.success(editingId ? 'Updated' : 'Created');
          await triggerRevalidation();
        resetForm();
        await loadData();
      }
    } catch {
      setMessage('✗ An error occurred. Please try again.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const removePost = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted');
          await triggerRevalidation();
      await loadData();
      if (editingId === post.id) resetForm();
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-primary/10 text-primary',
      draft: 'bg-muted text-muted-foreground',
      scheduled: 'bg-amber-50 text-amber-700',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout title="Blog" subtitle="Write and manage articles" backHref="/admin" previewHref="/blog">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ── Posts list ── */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No posts yet. Write the first one using the form on the right.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 hover:border-primary/40 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate font-medium text-foreground">{post.title}</p>
                      {statusBadge(post.status)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      /{post.slug}
                      {post.published_at && ` • ${new Date(post.published_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editPost(post)} className="btn-ghost text-xs">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={() => removePost(post)} className="text-destructive hover:text-destructive/80 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Form sidebar ── */}
        <form onSubmit={savePost} className="h-fit space-y-5 rounded-lg border border-border bg-white p-5 shadow-brand-sm sticky top-20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit' : 'New'} post</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-primary">Clear</button>
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
            placeholder="Post title"
          />

          <TextInput
            id="slug"
            label="Slug *"
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            required
            placeholder="post-slug"
          />

          <TextArea
            id="excerpt"
            label="Excerpt"
            value={form.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            rows={2}
            placeholder="Short summary for listing pages"
          />

          <TextArea
            id="content"
            label="Content"
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            rows={8}
            placeholder="Full post content (Markdown supported)"
          />

          <TextInput
            id="author"
            label="Author"
            value={form.author}
            onChange={(e) => updateField('author', e.target.value)}
            placeholder="Amir Hussen"
          />

          {categories.length > 0 && (
            <Select
              id="category_id"
              label="Category"
              value={form.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          )}

          <Select
            id="status"
            label="Status"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'scheduled', label: 'Scheduled' },
            ]}
          />

          {(form.status === 'published' || form.status === 'scheduled') && (
            <TextInput
              id="published_at"
              label="Publish Date/Time"
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => updateField('published_at', e.target.value)}
            />
          )}

          {/* Cover image */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Cover Image</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              {coverPreview || coverMediaId ? 'Replace' : 'Upload'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f); }} />
            </label>
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="aspect-video w-full rounded-md object-cover border border-border" />
            )}
          </div>

          {/* SEO */}
          <div className="space-y-3 border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">SEO</p>
            <TextInput id="seo_title" label="SEO Title" value={form.seo_title}
              onChange={(e) => updateField('seo_title', e.target.value)} placeholder="Override title for search" />
            <TextArea id="seo_description" label="Meta Description" value={form.seo_description}
              onChange={(e) => updateField('seo_description', e.target.value)} rows={2} placeholder="155 chars max" />
          </div>

          <TextInput id="sort_order" label="Sort Order" type="number" value={form.sort_order}
            onChange={(e) => updateField('sort_order', e.target.value)} />

          {message && (
            <div className={`text-xs p-2 rounded ${message.includes('✗') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={saving || !form.title.trim() || !form.slug.trim()}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              : editingId ? <><Save className="h-4 w-4" /> Save</>
              : <><Plus className="h-4 w-4" /> Create</>}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
