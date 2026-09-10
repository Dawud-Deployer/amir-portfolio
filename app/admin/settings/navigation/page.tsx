'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput, Checkbox } from '@/components/admin/admin-form-field';
import { createClient } from '@/lib/supabase/client';
import type { NavigationItem } from '@/lib/types/database';
import { Save, Loader2, GripVertical, Edit, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableNavItem({ 
  item, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  item: NavigationItem; 
  onEdit: (item: NavigationItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border border-border rounded-md shadow-sm mb-2">
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className="font-medium text-sm truncate w-32">{item.label}</div>
        <div className="text-sm text-muted-foreground truncate w-48">{item.url}</div>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input 
            type="checkbox" 
            checked={item.is_enabled} 
            onChange={(e) => onToggle(item.id, e.target.checked)}
            className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
          />
          <span className="text-xs text-muted-foreground">Enabled</span>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NavigationSettingsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '',
    url: '',
    icon: '',
    open_in_new_tab: false,
    is_enabled: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast.error('Failed to load navigation items');
    } else {
      if (data && data.length === 0) {
        // Seed default items
        seedDefaultItems();
      } else {
        setItems(data as NavigationItem[]);
      }
    }
    setLoading(false);
  };

  const seedDefaultItems = async () => {
    const defaults = [
      { label: 'Home', url: '/', sort_order: 1, is_enabled: true, open_in_new_tab: false },
      { label: 'About', url: '/about', sort_order: 2, is_enabled: true, open_in_new_tab: false },
      { label: 'Menzuma', url: '/menzuma', sort_order: 3, is_enabled: true, open_in_new_tab: false },
      { label: 'Events', url: '/events', sort_order: 4, is_enabled: true, open_in_new_tab: false },
      { label: 'Blog', url: '/blog', sort_order: 5, is_enabled: true, open_in_new_tab: false },
      { label: 'Gallery', url: '/gallery', sort_order: 6, is_enabled: true, open_in_new_tab: false },
      { label: 'Contact', url: '/contact', sort_order: 7, is_enabled: true, open_in_new_tab: false },
    ];
    
    const { data, error } = await supabase.from('navigation_items').insert(defaults).select();
    if (!error && data) {
      setItems(data as NavigationItem[]);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to db
        saveOrder(newItems);
        
        return newItems;
      });
    }
  };

  const saveOrder = async (newItems: NavigationItem[]) => {
    const updates = newItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));
    
    // Process sequentially to avoid conflicts
    for (const update of updates) {
      await supabase.from('navigation_items').update({ sort_order: update.sort_order }).eq('id', update.id);
    }
    toast.success('Order saved');
          await triggerRevalidation();
  };

  const toggleEnabled = async (id: string, is_enabled: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, is_enabled } : item));
    const { error } = await supabase.from('navigation_items').update({ is_enabled }).eq('id', id);
    if (error) {
      toast.error('Failed to update status');
      loadItems(); // revert
    } else {
      toast.success(is_enabled ? 'Item enabled' : 'Item disabled');
          await triggerRevalidation();
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setItems(items.filter(item => item.id !== id));
    const { error } = await supabase.from('navigation_items').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete item');
      loadItems(); // revert
    } else {
      toast.success('Item deleted');
          await triggerRevalidation();
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ label: '', url: '', icon: '', open_in_new_tab: false, is_enabled: true });
    setShowForm(true);
  };

  const openEditForm = (item: NavigationItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      url: item.url,
      icon: item.icon || '',
      open_in_new_tab: item.open_in_new_tab,
      is_enabled: item.is_enabled,
    });
    setShowForm(true);
  };

  const saveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) {
      toast.error('Label and URL are required');
      return;
    }

    setSaving(true);
    
    const payload = {
      label: form.label.trim(),
      url: form.url.trim(),
      icon: form.icon.trim() || null,
      open_in_new_tab: form.open_in_new_tab,
      is_enabled: form.is_enabled,
    };

    if (editingId) {
      const { error } = await supabase.from('navigation_items').update(payload).eq('id', editingId);
      if (error) {
        toast.error('Failed to update item');
      } else {
        toast.success('Item updated');
          await triggerRevalidation();
        setShowForm(false);
        loadItems();
      }
    } else {
      const newOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 1;
      const { error } = await supabase.from('navigation_items').insert({
        ...payload,
        sort_order: newOrder,
      });
      if (error) {
        toast.error('Failed to add item');
      } else {
        toast.success('Item added');
          await triggerRevalidation();
        setShowForm(false);
        loadItems();
      }
    }
    
    setSaving(false);
  };

  if (loading && items.length === 0) {
    return (
      <AdminLayout title="Navigation" subtitle="Manage header navigation links">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Navigation" subtitle="Manage header navigation links">
      <div className="max-w-3xl space-y-6">
        
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Navigation Items</h2>
          {!showForm && (
            <button onClick={openAddForm} className="btn-primary text-sm h-9 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={saveItem} className="rounded-lg border border-border bg-white p-5 shadow-brand-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-foreground">{editingId ? 'Edit Item' : 'Add Item'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Label *"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
                placeholder="e.g. Home"
              />
              <TextInput
                label="URL *"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
                placeholder="e.g. /about or https://..."
              />
            </div>
            
            <TextInput
              label="Icon (optional)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="Lucide icon name, e.g. home"
            />
            
            <div className="flex gap-6 pt-2">
              <Checkbox
                label="Open in new tab"
                checked={form.open_in_new_tab}
                onChange={(e) => setForm({ ...form, open_in_new_tab: e.target.checked })}
              />
              <Checkbox
                label="Enabled"
                checked={form.is_enabled}
                onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })}
              />
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingId ? 'Update' : 'Save'} Item
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-background rounded-lg">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                No navigation items found. Click "Add Item" to create one.
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={items.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {items.map(item => (
                      <SortableNavItem 
                        key={item.id} 
                        item={item} 
                        onEdit={openEditForm}
                        onDelete={deleteItem}
                        onToggle={toggleEnabled}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
