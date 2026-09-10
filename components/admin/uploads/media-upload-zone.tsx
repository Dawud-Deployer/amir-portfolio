'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, FileImage, FileVideo, FileText, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  uploadMedia,
  validateImageFile,
  validateVideoFile,
  formatFileSize,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '@/lib/services/media-service';
import type { MediaWithUrl } from '@/lib/types/database';
import Image from 'next/image';

type UploadMode = 'image' | 'video' | 'audio' | 'document' | 'any';

type MediaUploadZoneProps = {
  /** What type of file this uploader accepts */
  mode?: UploadMode;
  /** Supabase storage category (e.g., 'gallery', 'avatars', 'blog') */
  category?: string;
  /** Callback when upload completes successfully */
  onUpload: (media: MediaWithUrl) => void;
  /** Currently set media URL (for preview) */
  currentUrl?: string | null;
  /** Called when the user removes the current media */
  onRemove?: () => void;
  /** Alt text for the preview image */
  alt?: string;
  /** Additional className for the container */
  className?: string;
  /** Aspect ratio for image preview container */
  aspectRatio?: string;
  /** Whether to allow multiple files (for bulk upload) */
  multiple?: boolean;
  /** Callback for multiple uploads */
  onMultiUpload?: (media: MediaWithUrl[]) => void;
  /** Compact mode (smaller UI) */
  compact?: boolean;
};

const modeConfig: Record<UploadMode, {
  accept: string;
  label: string;
  maxSize: number;
  validate: ((file: File) => string | null) | null;
}> = {
  image: {
    accept: 'image/jpeg,image/png,image/webp',
    label: 'JPG, PNG or WebP • up to 10 MB',
    maxSize: MAX_IMAGE_SIZE,
    validate: validateImageFile,
  },
  video: {
    accept: 'video/mp4,video/webm',
    label: 'MP4 or WebM • up to 100 MB',
    maxSize: MAX_VIDEO_SIZE,
    validate: validateVideoFile,
  },
  audio: {
    accept: 'audio/mpeg,audio/wav,audio/ogg,audio/mp4',
    label: 'MP3, WAV, OGG or M4A • up to 100 MB',
    maxSize: MAX_VIDEO_SIZE,
    validate: null,
  },
  document: {
    accept: '.pdf,.doc,.docx',
    label: 'PDF or DOC • up to 10 MB',
    maxSize: MAX_IMAGE_SIZE,
    validate: null,
  },
  any: {
    accept: '*',
    label: 'Any file • up to 100 MB',
    maxSize: MAX_VIDEO_SIZE,
    validate: null,
  },
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('doc')) return FileText;
  return File;
}

export function MediaUploadZone({
  mode = 'image',
  category,
  onUpload,
  currentUrl,
  onRemove,
  alt = 'Uploaded media',
  className,
  aspectRatio = 'aspect-video',
  multiple = false,
  onMultiUpload,
  compact = false,
}: MediaUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaWithUrl | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = modeConfig[mode];

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setError(null);

      // Validate each file
      for (const file of fileArray) {
        if (config.validate) {
          const validationError = config.validate(file);
          if (validationError) {
            setError(validationError);
            return;
          }
        }
        if (file.size > config.maxSize) {
          setError(`File is too large. Maximum size is ${formatFileSize(config.maxSize)}.`);
          return;
        }
      }

      setUploading(true);
      setProgress(0);

      try {
        if (multiple && fileArray.length > 1 && onMultiUpload) {
          // Bulk upload
          const results: MediaWithUrl[] = [];
          for (let i = 0; i < fileArray.length; i++) {
            const media = await uploadMedia(fileArray[i], {
              category: category || 'other',
              onProgress: (p) => {
                const overallProgress = ((i + p / 100) / fileArray.length) * 100;
                setProgress(Math.round(overallProgress));
              },
            });
            results.push(media);
          }
          onMultiUpload(results);
          setProgress(100);
        } else {
          // Single upload
          const file = fileArray[0];
          const media = await uploadMedia(file, {
            category: category || 'other',
            onProgress: setProgress,
          });
          setUploadedMedia(media);
          onUpload(media);
          setProgress(100);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
        // Reset progress after a delay
        setTimeout(() => setProgress(0), 2000);
      }
    },
    [config, category, multiple, onUpload, onMultiUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFiles]
  );

  const showPreview = currentUrl || uploadedMedia?.public_url;
  const previewUrl = currentUrl || uploadedMedia?.public_url;

  // Compact mode: smaller inline uploader
  if (compact) {
    return (
      <div className={cn('relative', className)}>
        {showPreview && mode === 'image' && previewUrl ? (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-md overflow-hidden border border-border bg-muted flex-shrink-0">
              <Image
                src={previewUrl}
                alt={alt}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload file'}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading && (
          <Progress value={progress} className="mt-2 h-1" />
        )}

        {error && (
          <p className="mt-1 text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Preview or Upload Zone */}
      {showPreview && mode === 'image' && previewUrl ? (
        <div className={cn('relative rounded-lg overflow-hidden border border-border bg-muted', aspectRatio)}>
          <Image
            src={previewUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-white transition-colors"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md bg-destructive/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-destructive transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : showPreview && mode === 'video' && previewUrl ? (
        <div className={cn('relative rounded-lg overflow-hidden border border-border bg-muted', aspectRatio)}>
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium shadow-sm hover:bg-white"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md bg-destructive/90 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ) : showPreview && mode === 'audio' && previewUrl ? (
        <div className="rounded-lg border border-border bg-muted p-4">
          <audio src={previewUrl} controls className="w-full" preload="metadata" />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary hover:underline"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5',
            uploading && 'pointer-events-none opacity-60',
            aspectRatio !== 'aspect-video' && aspectRatio,
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Uploading...</p>
              <Progress value={progress} className="mt-3 w-48 h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{progress}%</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/8 border border-primary/15 mb-3">
                <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{config.label}</p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        aria-label={`Upload ${mode}`}
      />

      {/* Upload progress (for when preview is showing) */}
      {uploading && showPreview && (
        <div className="mt-2">
          <Progress value={progress} className="h-1.5" />
          <p className="mt-1 text-xs text-muted-foreground text-right">{progress}%</p>
        </div>
      )}

      {/* Success indicator */}
      {progress === 100 && !uploading && !error && uploadedMedia && (
        <p className="mt-2 text-xs text-primary flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Uploaded successfully
        </p>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                inputRef.current?.click();
              }}
              className="text-xs text-primary hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
