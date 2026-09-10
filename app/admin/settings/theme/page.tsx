'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, Select } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import type { ThemeSettings } from '@/lib/types/database';
import { Save, Loader2, Palette, Type, Layout, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ThemeSettingsPage() {
  const supabase = createClient();
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [form, setForm] = useState({
    preset: 'default',
    primary_bg: '#ffffff',
    secondary_bg: '#f8fafc',
    accent: '#10b981',
    text_color: '#0f172a',
    muted_text: '#64748b',
    heading_font: 'Playfair Display',
    body_font: 'Inter',
    border_radius: 'medium/0.5rem',
    button_style: 'solid',
    section_spacing: 'normal',
    animation_intensity: 'moderate',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadTheme = async () => {
      const { data } = await supabase.from('theme_settings').select('*').maybeSingle();
      if (data) {
        setTheme(data as ThemeSettings);
        setForm({
          preset: data.preset || 'default',
          primary_bg: data.primary_bg || '#ffffff',
          secondary_bg: data.secondary_bg || '#f8fafc',
          accent: data.accent || '#10b981',
          text_color: data.text_color || '#0f172a',
          muted_text: data.muted_text || '#64748b',
          heading_font: data.heading_font || 'Playfair Display',
          body_font: data.body_font || 'Inter',
          border_radius: data.border_radius || 'medium/0.5rem',
          button_style: data.button_style || 'solid',
          section_spacing: data.section_spacing || 'normal',
          animation_intensity: data.animation_intensity || 'moderate',
        });
      }
      setLoading(false);
    };
    loadTheme();
  }, [supabase]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setMessage('');

    const payload = {
      preset: form.preset,
      primary_bg: form.primary_bg,
      secondary_bg: form.secondary_bg,
      accent: form.accent,
      text_color: form.text_color,
      muted_text: form.muted_text,
      heading_font: form.heading_font,
      body_font: form.body_font,
      border_radius: form.border_radius,
      button_style: form.button_style,
      section_spacing: form.section_spacing,
      animation_intensity: form.animation_intensity,
      updated_at: new Date().toISOString(),
    };

    try {
      if (theme?.id) {
        const { error } = await supabase
          .from('theme_settings')
          .update(payload)
          .eq('id', theme.id);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ Theme settings saved.');
          toast.success('Saved');
          await triggerRevalidation();
        }
      } else {
        const { error } = await supabase.from('theme_settings').insert(payload);
        if (error) {
          setMessage(`✗ ${error.message}`);
          toast.error('Save failed');
        } else {
          setMessage('✓ Theme settings created.');
          toast.success('Created');
          await triggerRevalidation();
          const { data } = await supabase.from('theme_settings').select('*').maybeSingle();
          if (data) setTheme(data as ThemeSettings);
        }
      }
    } catch (err) {
      setMessage('✗ An error occurred.');
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const ColorField = ({ id, label, value }: { id: string, label: string, value: string }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          id={`${id}-color`}
          value={value}
          onChange={(e) => updateField(id, e.target.value)}
          className="h-9 w-14 cursor-pointer rounded border border-border p-0.5 bg-background"
        />
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => updateField(id, e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all uppercase"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Theme Studio" subtitle="Customize the site's visual appearance">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  // Parse radius for preview
  const previewRadius = form.border_radius.includes('/') 
    ? form.border_radius.split('/')[1] 
    : '0.5rem';

  return (
    <AdminLayout title="Theme Studio" subtitle="Customize the site's visual appearance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Form */}
        <form onSubmit={saveSettings} className="lg:col-span-2 space-y-6 rounded-lg border border-border bg-white p-6 shadow-brand-sm">
          <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-foreground">
              Define the visual identity of your portfolio. Changes applied here will reflect across the public site.
            </p>
          </div>

          <Select
            id="preset"
            label="Theme Preset"
            value={form.preset}
            onChange={(e) => updateField('preset', e.target.value)}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'bold', label: 'Bold' },
              { value: 'warm', label: 'Warm' },
              { value: 'cool', label: 'Cool' },
            ]}
          />

          {/* Colors */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground pb-2 border-b border-border">
              <Palette className="h-4 w-4" />
              <span>Colors</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorField id="primary_bg" label="Primary Background" value={form.primary_bg} />
              <ColorField id="secondary_bg" label="Secondary Background" value={form.secondary_bg} />
              <ColorField id="accent" label="Accent Color" value={form.accent} />
              <ColorField id="text_color" label="Text Color" value={form.text_color} />
              <ColorField id="muted_text" label="Muted Text" value={form.muted_text} />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground pb-2 border-b border-border">
              <Type className="h-4 w-4" />
              <span>Typography</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="heading_font"
                label="Heading Font"
                value={form.heading_font}
                onChange={(e) => updateField('heading_font', e.target.value)}
                options={[
                  { value: 'Playfair Display', label: 'Playfair Display' },
                  { value: 'Georgia', label: 'Georgia' },
                  { value: 'Merriweather', label: 'Merriweather' },
                  { value: 'Lora', label: 'Lora' },
                  { value: 'serif', label: 'Serif (System)' },
                ]}
              />
              <Select
                id="body_font"
                label="Body Font"
                value={form.body_font}
                onChange={(e) => updateField('body_font', e.target.value)}
                options={[
                  { value: 'Inter', label: 'Inter' },
                  { value: 'system-ui', label: 'System UI' },
                  { value: 'Open Sans', label: 'Open Sans' },
                  { value: 'Roboto', label: 'Roboto' },
                  { value: 'sans-serif', label: 'Sans-serif' },
                ]}
              />
            </div>
          </div>

          {/* Layout & UI */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground pb-2 border-b border-border">
              <Layout className="h-4 w-4" />
              <span>Layout & Elements</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="border_radius"
                label="Border Radius"
                value={form.border_radius}
                onChange={(e) => updateField('border_radius', e.target.value)}
                options={[
                  { value: 'none/0', label: 'None (Square)' },
                  { value: 'subtle/0.25rem', label: 'Subtle' },
                  { value: 'medium/0.5rem', label: 'Medium' },
                  { value: 'rounded/0.75rem', label: 'Rounded' },
                  { value: 'pill/9999px', label: 'Pill / Fully Rounded' },
                ]}
              />
              <Select
                id="button_style"
                label="Button Style"
                value={form.button_style}
                onChange={(e) => updateField('button_style', e.target.value)}
                options={[
                  { value: 'solid', label: 'Solid' },
                  { value: 'outline', label: 'Outline' },
                  { value: 'ghost', label: 'Ghost' },
                ]}
              />
              <Select
                id="section_spacing"
                label="Section Spacing"
                value={form.section_spacing}
                onChange={(e) => updateField('section_spacing', e.target.value)}
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'spacious', label: 'Spacious' },
                ]}
              />
              <Select
                id="animation_intensity"
                label="Animation Intensity"
                value={form.animation_intensity}
                onChange={(e) => updateField('animation_intensity', e.target.value)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'subtle', label: 'Subtle' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'full', label: 'Full' },
                ]}
              />
            </div>
          </div>

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
                Save Theme Settings
              </>
            )}
          </button>
        </form>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg border border-border shadow-brand-sm overflow-hidden" style={{ backgroundColor: form.primary_bg }}>
            <div className="p-4 border-b border-border bg-black/5">
              <h3 className="text-sm font-semibold uppercase tracking-eyebrow text-foreground">Live Preview</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div 
                className="p-4 border shadow-sm" 
                style={{ 
                  backgroundColor: form.secondary_bg,
                  borderRadius: previewRadius,
                  borderColor: form.accent + '20'
                }}
              >
                <h4 
                  style={{ 
                    fontFamily: form.heading_font,
                    color: form.text_color
                  }} 
                  className="text-xl font-bold mb-2"
                >
                  {form.heading_font} Heading
                </h4>
                <p 
                  style={{ 
                    fontFamily: form.body_font,
                    color: form.muted_text
                  }} 
                  className="text-sm leading-relaxed mb-4"
                >
                  This is how your text will look. The background contrasts slightly with the primary background color.
                </p>
                <button
                  style={{
                    backgroundColor: form.button_style === 'solid' ? form.accent : 'transparent',
                    color: form.button_style === 'solid' ? '#ffffff' : form.accent,
                    borderColor: form.accent,
                    borderWidth: form.button_style === 'ghost' ? '0' : '1px',
                    borderRadius: previewRadius,
                    fontFamily: form.body_font
                  }}
                  className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                >
                  Action Button
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-3 text-center text-xs shadow-sm border" style={{ backgroundColor: form.primary_bg, color: form.text_color, borderRadius: previewRadius }}>Primary</div>
                <div className="flex-1 p-3 text-center text-xs shadow-sm border" style={{ backgroundColor: form.secondary_bg, color: form.text_color, borderRadius: previewRadius }}>Secondary</div>
                <div className="flex-1 p-3 text-center text-xs shadow-sm" style={{ backgroundColor: form.accent, color: '#ffffff', borderRadius: previewRadius }}>Accent</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
