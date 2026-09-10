'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, TextArea, Select, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import type { EventItem } from '@/lib/types/database';
import { Pencil, Plus, Save, Trash2, Loader2, ImagePlus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type EventForm = {
  title: string;
  slug: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  city: string;
  country: string;
  address: string;
  map_url: string;
  ticket_url: string;
  booking_url: string;
  status: string;
  sort_order: string;
  is_featured: boolean;
  is_published: boolean;
};

const emptyForm: EventForm = {
  title: '',
  slug: '',
  description: '',
  event_date: '',
  start_time: '',
  end_time: '',
  venue: '',
  city: '',
  country: '',
  address: '',
  map_url: '',
  ticket_url: '',
  booking_url: '',
  status: 'upcoming',
  sort_order: '0',
  is_featured: false,
  is_published: false,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function EventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [posterMediaId, setPosterMediaId] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    setEvents((data || []) as EventItem[]);
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPosterMediaId(null);
    setPosterPreview(null);
    setMessage('');
  };

  const editEvent = (event: EventItem) => {
    setForm({
      title: event.title,
      slug: event.slug,
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      venue: event.venue || '',
      city: event.city || '',
      country: event.country || '',
      address: event.address || '',
      map_url: event.map_url || '',
      ticket_url: event.ticket_url || '',
      booking_url: event.booking_url || '',
      status: event.status,
      sort_order: String(event.sort_order),
      is_featured: event.is_featured,
      is_published: event.is_published,
    });
    setEditingId(event.id);
    setPosterMediaId(event.poster_media_id);
    setPosterPreview(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof EventForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePoster = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setMessage(error);
      toast.error('Invalid file');
      return;
    }
    setSaving(true);
    setMessage('Uploading poster...');
    try {
      const media = await uploadMedia(file, {
        category: 'event-posters',
        title: form.title || file.name,
      });
      setPosterMediaId(media.id);
      setPosterPreview(media.public_url);
      setMessage('✓ Poster uploaded.');
      toast.success('Poster uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async (event_: FormEvent) => {
    event_.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.event_date) {
      setMessage('Title, slug, and event date are required.');
      toast.error('Missing required fields');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      description: form.description.trim() || null,
      event_date: form.event_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      venue: form.venue.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || null,
      address: form.address.trim() || null,
      map_url: form.map_url.trim() || null,
      ticket_url: form.ticket_url.trim() || null,
      booking_url: form.booking_url.trim() || null,
      poster_media_id: posterMediaId,
      cover_media_id: null,
      promo_video_media_id: null,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from('events').update(payload).eq('id', editingId)
        : supabase.from('events').insert(payload);

      const { error } = await query;

      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Save failed');
      } else {
        setMessage(editingId ? '✓ Event updated.' : '✓ Event created.');
        toast.success(editingId ? 'Updated' : 'Created');
          await triggerRevalidation();
        resetForm();
        await loadEvents();
      }
    } catch (err) {
      setMessage('✗ An error occurred. Please try again.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (event_: EventItem) => {
    if (!window.confirm(`Delete "${event_.title}"?`)) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', event_.id);
      if (error) {
        setMessage(`✗ ${error.message}`);
        toast.error('Delete failed');
      } else {
        setMessage('✓ Event deleted.');
        toast.success('Deleted');
          await triggerRevalidation();
        await loadEvents();
        if (editingId === event_.id) resetForm();
      }
    } catch (err) {
      setMessage('✗ Delete failed. Please try again.');
      toast.error('Error');
    }
  };

  return (
    <AdminLayout title="Events" subtitle="Manage event listings" backHref="/admin" previewHref="/events">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Events list ── */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
              <p className="text-sm text-muted-foreground">No events yet. Create the first one using the form on the right.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event_) => (
                <div
                  key={event_.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{event_.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event_.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {event_.venue && ` • ${event_.venue}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editEvent(event_)}
                      className="btn-ghost text-xs"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEvent(event_)}
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
          onSubmit={saveEvent}
          className="h-fit space-y-5 rounded-lg border border-border bg-white p-5 shadow-brand-sm sticky top-20"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit' : 'New'} event</h2>
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
            placeholder="Event name"
          />

          <TextInput
            id="slug"
            label="Slug *"
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            required
            placeholder="event-name"
          />

          <TextInput
            id="event_date"
            label="Date *"
            type="date"
            value={form.event_date}
            onChange={(e) => updateField('event_date', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <TextInput
              id="start_time"
              label="Start Time"
              type="time"
              value={form.start_time}
              onChange={(e) => updateField('start_time', e.target.value)}
            />
            <TextInput
              id="end_time"
              label="End Time"
              type="time"
              value={form.end_time}
              onChange={(e) => updateField('end_time', e.target.value)}
            />
          </div>

          <TextInput
            id="venue"
            label="Venue"
            value={form.venue}
            onChange={(e) => updateField('venue', e.target.value)}
            placeholder="e.g., Grand Ballroom"
          />

          <div className="grid grid-cols-2 gap-2">
            <TextInput
              id="city"
              label="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
            <TextInput
              id="country"
              label="Country"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>

          <TextInput
            id="address"
            label="Address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Full address"
          />

          <TextInput
            id="map_url"
            label="Map URL"
            type="url"
            value={form.map_url}
            onChange={(e) => updateField('map_url', e.target.value)}
            placeholder="https://maps.google.com/..."
          />

          <TextInput
            id="booking_url"
            label="Booking URL"
            type="url"
            value={form.booking_url}
            onChange={(e) => updateField('booking_url', e.target.value)}
            placeholder="https://..."
          />

          <TextInput
            id="ticket_url"
            label="Ticket URL"
            type="url"
            value={form.ticket_url}
            onChange={(e) => updateField('ticket_url', e.target.value)}
            placeholder="https://..."
          />

          <TextArea
            id="description"
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
          />

          <Select
            id="status"
            label="Status"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">Poster</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="h-4 w-4" />
              {posterPreview ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePoster(file);
                }}
              />
            </label>
            {posterPreview && (
              <img src={posterPreview} alt="Poster" className="aspect-[3/4] w-full rounded-md object-cover border border-border" />
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <Checkbox
              label="Published"
              checked={form.is_published}
              onChange={(e) => updateField('is_published', e.target.checked)}
            />
            <Checkbox
              label="Featured"
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
            disabled={saving || !form.title.trim() || !form.slug.trim() || !form.event_date}
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
