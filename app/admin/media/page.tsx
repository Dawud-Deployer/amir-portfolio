'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { listMedia, deleteMedia, uploadMedia, validateImageFile, formatFileSize } from '@/lib/services/media-service';
import type { MediaWithUrl } from '@/lib/types/database';
import { Loader2, Trash2, ImagePlus, Search, Copy, Check, Upload } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'all',
  'gallery',
  'blog-covers',
  'event-posters',
  'video-thumbnails',
  'music-covers',
  'journey',
  'hero',
  'other',
] as const;

export default function MediaPage() {
  const [items, setItems] = useState<MediaWithUrl[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const PAGE_SIZE = 24;

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listMedia(category, search || undefined, page, PAGE_SIZE);
    setItems(result.items);
    setTotal(result.total);
    setLoading(false);
  }, [category, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleUpload = async (files: FileList) => {
    const fileArr = Array.from(files);
    const invalid = fileArr.find((f) => validateImageFile(f) !== null);
    if (invalid) {
      toast.error(validateImageFile(invalid) || 'Invalid file');
      return;
    }
    setUploading(true);
    try {
      await Promise.all(
        fileArr.map((file) =>
          uploadMedia(file, { category: category !== 'all' ? category : 'other' })
        )
      );
      toast.success(`${fileArr.length} file${fileArr.length > 1 ? 's' : ''} uploaded`);
      setPage(1);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaWithUrl) => {
    if (!window.confirm(`Delete "${item.display_name || item.original_filename}"?`)) return;
    try {
      await deleteMedia(item.id);
      toast.success('Deleted');
          await triggerRevalidation();
      await load();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('URL copied');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Could not copy');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout title="Media Library" subtitle={`${total} file${total !== 1 ? 's' : ''}`} backHref="/admin">
      {/* ── Toolbar ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + Upload */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search files..."
                className="pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 w-40"
              />
            </div>
            <button type="submit" className="btn-ghost text-xs">Search</button>
          </form>
          <label className={`btn-primary text-xs cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }}
            />
          </label>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
          <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No files found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg border border-border bg-white overflow-hidden hover:border-primary/50 transition-all"
              >
                {item.mime_type.startsWith('image/') ? (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.display_name || ''}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground uppercase">{item.mime_type.split('/')[1]}</span>
                  </div>
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-foreground">{item.display_name || item.original_filename}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(item.file_size)}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.public_url, item.id)}
                    className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-foreground w-full justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    {copiedId === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedId === item.id ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-destructive w-full justify-center hover:bg-destructive hover:text-white transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
