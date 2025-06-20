'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Switch from '@radix-ui/react-switch';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';
import { Eye, EyeOff, Edit, Trash2, Plus, GripVertical } from 'lucide-react';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GalleryItem {
  id: string;
  image: string;
  alt: string;
  description: string;
  visible: boolean;
  order: number;
  publicId?: string;
}

// Placeholder ImageUploader component
// Replace this with the actual ImageUploader component when available
function ImageUploader({ onUpload }: { onUpload: (data: { url: string; publicId: string }) => void }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    // Simulate upload - replace with actual upload logic
    setTimeout(() => {
      // For now, use a local URL
      const url = URL.createObjectURL(file);
      onUpload({ url, publicId: `temp-${Date.now()}` });
      setUploading(false);
    }, 1000);
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer inline-flex flex-col items-center"
      >
        <Plus className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-600">
          {uploading ? 'Uploading...' : 'Click to upload image'}
        </span>
      </label>
    </div>
  );
}

// Sortable Gallery Card Component
function SortableCard({ item, onEdit, onDelete, onToggleVisibility }: {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
  onToggleVisibility: (item: GalleryItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white rounded-lg shadow-sm overflow-hidden"
    >
      {/* Drag Handle */}
      <button
        className="absolute top-2 left-2 z-20 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </button>

      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.alt}
          className={`w-full h-full object-cover ${!item.visible ? 'opacity-50' : ''}`}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">{item.alt}</h3>
          <p className="text-white/80 text-xs line-clamp-2">{item.description}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleVisibility(item)}
          className="p-1.5 bg-white/80 rounded hover:bg-white transition-colors"
          title={item.visible ? 'Hide' : 'Show'}
        >
          {item.visible ? (
            <Eye className="w-4 h-4 text-gray-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-600" />
          )}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 bg-white/80 rounded hover:bg-white transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 bg-white/80 rounded hover:bg-white transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}

export default function GalleryTab() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    image: '',
    publicId: '',
    alt: '',
    description: '',
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch gallery items on mount
  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      if (!response.ok) throw new Error('Failed to fetch gallery items');
      const data = await response.json();
      // Sort by order
      const sorted = data.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order);
      setGalleryItems(sorted);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setToast({ message: 'Failed to load gallery', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = galleryItems.findIndex((item) => item.id === active.id);
      const newIndex = galleryItems.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(galleryItems, oldIndex, newIndex);
      
      // Update local state immediately
      setGalleryItems(newOrder);

      // Update order values
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        order: index
      }));

      try {
        // Send order updates to server
        for (const update of updates) {
          if (galleryItems.find(g => g.id === update.id)?.order !== update.order) {
                    await fetch('/api/admin/gallery', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: update.id, order: update.order })
        });
          }
        }
        
        setToast({ message: 'Order updated successfully', type: 'success' });
      } catch (error) {
        console.error('Error updating order:', error);
        setToast({ message: 'Failed to update order', type: 'error' });
        // Revert on error
        await fetchGalleryItems();
      }
    }
  };

  const handleToggleVisibility = async (item: GalleryItem) => {
    // Optimistic update
    const updatedItems = galleryItems.map(g => 
      g.id === item.id ? { ...g, visible: !g.visible } : g
    );
    setGalleryItems(updatedItems);

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, visible: !item.visible })
      });

      if (!response.ok) throw new Error('Failed to update visibility');
      
      setToast({ message: 'Visibility updated', type: 'success' });
    } catch (error) {
      // Revert on error
      setGalleryItems(galleryItems);
      console.error('Error updating visibility:', error);
      setToast({ message: 'Failed to update visibility', type: 'error' });
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      image: item.image,
      publicId: item.publicId || '',
      alt: item.alt,
      description: item.description,
    });
    setIsNewItem(false);
  };

  const handleNewItem = () => {
    setIsNewItem(true);
    setEditingItem(null);
    setFormData({
      image: '',
      publicId: '',
      alt: '',
      description: '',
    });
  };

  const handleImageUpload = (data: { url: string; publicId: string }) => {
    setFormData({
      ...formData,
      image: data.url,
      publicId: data.publicId,
    });
  };

  const handleSave = async () => {
    try {
      const galleryData = {
        image: formData.image,
        publicId: formData.publicId,
        alt: formData.alt,
        description: formData.description,
        visible: true,
        order: isNewItem ? galleryItems.length : undefined
      };

      if (isNewItem) {
        // Create new item
        const response = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(galleryData)
        });

        if (!response.ok) throw new Error('Failed to create gallery item');
        
        setToast({ message: 'Gallery item created successfully', type: 'success' });
      } else if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: formData.image,
            publicId: formData.publicId,
            alt: formData.alt,
            description: formData.description
          })
        });

        if (!response.ok) throw new Error('Failed to update gallery item');
        
        setToast({ message: 'Gallery item updated successfully', type: 'success' });
      }

      // Reset form and refresh data
      setIsNewItem(false);
      setEditingItem(null);
      setFormData({ image: '', publicId: '', alt: '', description: '' });
      await fetchGalleryItems();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      setToast({ message: 'Failed to save gallery item', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      });

      if (!response.ok) throw new Error('Failed to delete gallery item');
      
      setToast({ message: 'Gallery item deleted successfully', type: 'success' });
      setDeleteItem(null);
      await fetchGalleryItems();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      setToast({ message: 'Failed to delete gallery item', type: 'error' });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsNewItem(false);
    setFormData({ image: '', publicId: '', alt: '', description: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <Alert variant={toast.type === 'error' ? 'destructive' : 'default'}>
            <p className="text-sm">{toast.message}</p>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery Management</h2>
        <p className="text-gray-600">Manage event photos and gallery images</p>
      </div>

      {/* Add New Button */}
      <div className="mb-6">
        <Button onClick={handleNewItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Gallery Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={galleryItems.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={(item) => setDeleteItem(item)}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit/Create Dialog */}
      <Dialog.Root open={!!editingItem || isNewItem} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95 overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isNewItem ? 'Add Gallery Item' : 'Edit Gallery Item'}
            </Dialog.Title>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, image: '', publicId: '' })}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <ImageUploader onUpload={handleImageUpload} />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Detailed description of the event or image"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Dialog.Close asChild>
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleSave} disabled={!formData.image}>
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={!!deleteItem} onOpenChange={(open: boolean) => !open && setDeleteItem(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <AlertDialog.Title className="text-lg font-semibold mb-2">
              Delete Gallery Item
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialog.Description>
            
            {deleteItem && (
              <div className="mb-4">
                <img
                  src={deleteItem.image}
                  alt={deleteItem.alt}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
} 