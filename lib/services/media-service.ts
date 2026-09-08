'use client';

import { createClient } from '@/lib/supabase/client';
import type { MediaRecord, MediaWithUrl } from '@/lib/types/database';

const BUCKET = 'media';

function getPublicUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function addPublicUrl(media: MediaRecord): MediaWithUrl {
  return { ...media, public_url: getPublicUrl(media.storage_path) };
}

type UploadOptions = {
  category?: string;
  altText?: string;
  caption?: string;
  title?: string;
  onProgress?: (progress: number) => void;
};

export async function uploadMedia(
  file: File,
  options: UploadOptions = {}
): Promise<MediaWithUrl> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to upload files.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'file';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const timestamp = Date.now();
  const storagePath = `${options.category || 'other'}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error('Upload failed. Please try again or check your file.');
  }

  let width: number | null = null;
  let height: number | null = null;
  let duration: number | null = null;

  if (file.type.startsWith('image/')) {
    const dims = await getImageDimensions(file).catch(() => null);
    if (dims) {
      width = dims.width;
      height = dims.height;
    }
  }

  if (file.type.startsWith('video/')) {
    duration = await getVideoDuration(file).catch(() => null);
    const dims = await getVideoDimensions(file).catch(() => null);
    if (dims) {
      width = dims.width;
      height = dims.height;
    }
  }

  const { data: mediaRow, error: dbError } = await supabase
    .from('media')
    .insert({
      storage_path: storagePath,
      original_filename: file.name,
      display_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      width,
      height,
      duration,
      alt_text: options.altText || null,
      caption: options.caption || null,
      title: options.title || null,
      category: options.category || 'other',
      uploader_id: user.id,
    })
    .select()
    .single();

  if (dbError || !mediaRow) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error('Failed to save file information. Please try again.');
  }

  return addPublicUrl(mediaRow);
}

export async function deleteMedia(mediaId: string): Promise<void> {
  const supabase = createClient();
  const { data: media } = await supabase
    .from('media')
    .select('storage_path')
    .eq('id', mediaId)
    .maybeSingle();

  if (!media) return;

  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);

  if (dbError) {
    throw new Error('Failed to remove file. Please try again.');
  }

  await supabase.storage.from(BUCKET).remove([media.storage_path]);
}

export async function listMedia(
  category?: string,
  search?: string,
  page = 1,
  pageSize = 24
): Promise<{ items: MediaWithUrl[]; total: number }> {
  const supabase = createClient();
  let query = supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,original_filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return { items: [], total: 0 };
  }

  return {
    items: (data || []).map(addPublicUrl),
    total: count || 0,
  };
}

export async function getMediaById(id: string): Promise<MediaWithUrl | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;
  return addPublicUrl(data);
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

function getVideoDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () =>
      resolve({ width: video.videoWidth, height: video.videoHeight });
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'This image is too large. Please choose an image under 10 MB.';
  }
  return null;
}

export function validateVideoFile(file: File): string | null {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return 'Please choose an MP4 or WebM video.';
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return 'This video is too large. Please choose a video under 100 MB.';
  }
  return null;
}
