'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { createClient } from '@/lib/supabase/client';
import type { HomepageSection } from '@/lib/types/database';
import { Save, Loader2, GripVertical, Layout } from 'lucide-react';
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

function SortableSectionItem({ 
  item, 
  onToggle 
}: { 
  item: HomepageSection; 
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
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 bg-white border border-border rounded-md shadow-sm mb-3">
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1.5 rounded text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-none bg-primary/10 p-2 rounded text-primary">
        <Layout className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground capitalize">{item.section_key.replace(/_/g, ' ')}</div>
        <div className="text-xs text-muted-foreground">Order: {item.sort_order}</div>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input 
            type="checkbox" 
            checked={item.is_enabled} 
            onChange={(e) => onToggle(item.id, e.target.checked)}
            className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
          />
          <span className={`text-sm font-medium ${item.is_enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
            {item.is_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>
    </div>
  );
}

export default function HomepageSectionsPage() {
  const supabase = createClient();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast.error('Failed to load sections');
    } else {
      setSections(data as HomepageSection[]);
    }
    setLoading(false);
    setHasChanges(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update sort_order locally
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort_order: index + 1
        }));
        
        setHasChanges(true);
        return updatedItems;
      });
    }
  };

  const toggleEnabled = (id: string, is_enabled: boolean) => {
    setSections(sections.map(sec => sec.id === id ? { ...sec, is_enabled } : sec));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setSaving(true);
    
    try {
      // Process sequentially
      for (const section of sections) {
        await supabase
          .from('homepage_sections')
          .update({ 
            sort_order: section.sort_order,
            is_enabled: section.is_enabled
          })
          .eq('id', section.id);
      }
      toast.success('Sections updated successfully');
          await triggerRevalidation();
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Homepage Sections" subtitle="Control which sections appear and in what order">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Homepage Sections" subtitle="Control which sections appear and in what order">
      <div className="max-w-2xl space-y-6">
        
        <div className="bg-background rounded-lg">
          {sections.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
              No sections found in the database.
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {sections.map(section => (
                    <SortableSectionItem 
                      key={section.id} 
                      item={section} 
                      onToggle={toggleEnabled}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {sections.length > 0 && (
          <div className="flex justify-end pt-4">
            <button
              onClick={saveChanges}
              disabled={!hasChanges || saving}
              className="btn-primary w-full sm:w-auto min-w-[150px] justify-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
