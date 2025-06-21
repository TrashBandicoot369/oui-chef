'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Switch from '@radix-ui/react-switch';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Testimonial {
  id: string;
  clientName: string;
  quote: string;
  rating: number;
  approved: boolean;
  order: number;
}

// Sortable Row Component
function SortableRow({ testimonial, onEdit, onDelete, onToggleApproved }: {
  testimonial: Testimonial;
  onEdit: (item: Testimonial) => void;
  onDelete: (item: Testimonial) => void;
  onToggleApproved: (item: Testimonial) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          {...attributes}
          {...listeners}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {testimonial.clientName}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
        <div className="truncate">{testimonial.quote}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <Switch.Root
          checked={testimonial.approved}
          onCheckedChange={() => onToggleApproved(testimonial)}
          className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-green-500 transition-colors"
        >
          <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
        </Switch.Root>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(testimonial)}
          className="mr-2"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(testimonial)}
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </td>
    </tr>
  );
}

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Testimonial | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    quote: '',
    rating: '5',
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch testimonials on mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/admin/testimonials');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch testimonials: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Sort by order
      const sorted = data.sort((a: Testimonial, b: Testimonial) => a.order - b.order);
      setTestimonials(sorted);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setToast({ message: 'Failed to load testimonials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = testimonials.findIndex((item) => item.id === active.id);
      const newIndex = testimonials.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(testimonials, oldIndex, newIndex);
      
      // Update local state immediately
      setTestimonials(newOrder);

      // Update order values
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        order: index
      }));

      try {
        // Send order updates to server
        for (const update of updates) {
          if (testimonials.find(t => t.id === update.id)?.order !== update.order) {
            await fetch('/api/admin/testimonials', {
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
        await fetchTestimonials();
      }
    }
  };

  const handleToggleApproved = async (item: Testimonial) => {
    // Optimistic update
    const updatedItems = testimonials.map(t => 
      t.id === item.id ? { ...t, approved: !t.approved } : t
    );
    setTestimonials(updatedItems);

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, approved: !item.approved })
      });

      if (!response.ok) throw new Error('Failed to update approval status');
      
      setToast({ message: 'Approval status updated', type: 'success' });
    } catch (error) {
      // Revert on error
      setTestimonials(testimonials);
      console.error('Error updating approval:', error);
      setToast({ message: 'Failed to update approval status', type: 'error' });
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      clientName: item.clientName,
      quote: item.quote,
      rating: item.rating.toString(),
    });
    setIsNewItem(false);
  };

  const handleNewItem = () => {
    setIsNewItem(true);
    setEditingItem(null);
    setFormData({
      clientName: '',
      quote: '',
      rating: '5',
    });
  };

  const handleSave = async () => {
    try {
      const testimonialData = {
        clientName: formData.clientName,
        quote: formData.quote,
        rating: parseInt(formData.rating),
        approved: false,
        order: isNewItem ? testimonials.length : undefined
      };

      if (isNewItem) {
        // Create new item
        console.log('Creating testimonial with data:', testimonialData);
        const response = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testimonialData)
        });
        console.log('Create response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Create testimonial error:', response.status, errorText);
          throw new Error(`Failed to create testimonial: ${response.status} ${errorText}`);
        }
        
        setToast({ message: 'Testimonial created successfully', type: 'success' });
      } else if (editingItem) {
        // Update existing item
        const response = await fetch('/api/admin/testimonials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            clientName: formData.clientName,
            quote: formData.quote,
            rating: parseInt(formData.rating)
          })
        });

        if (!response.ok) throw new Error('Failed to update testimonial');
        
        setToast({ message: 'Testimonial updated successfully', type: 'success' });
      }

      // Reset form and refresh data
      setIsNewItem(false);
      setEditingItem(null);
      setFormData({ clientName: '', quote: '', rating: '5' });
      await fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setToast({ message: 'Failed to save testimonial', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      });

      if (!response.ok) throw new Error('Failed to delete testimonial');
      
      setToast({ message: 'Testimonial deleted successfully', type: 'success' });
      setDeleteItem(null);
      await fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setToast({ message: 'Failed to delete testimonial', type: 'error' });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsNewItem(false);
    setFormData({ clientName: '', quote: '', rating: '5' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading testimonials...</div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Testimonials Management</h2>
        <p className="text-gray-600">Manage client testimonials and reviews</p>
      </div>

      {/* Add New Button */}
      <div className="mb-4">
        <Button onClick={handleNewItem}>Add Testimonial</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  {/* Order */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <SortableContext
                items={testimonials.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {testimonials.map((testimonial) => (
                  <SortableRow
                    key={testimonial.id}
                    testimonial={testimonial}
                    onEdit={handleEdit}
                    onDelete={(item) => setDeleteItem(item)}
                    onToggleApproved={handleToggleApproved}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog.Root open={!!editingItem || isNewItem} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isNewItem ? 'Add Testimonial' : 'Edit Testimonial'}
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote
                </label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="The experience was amazing..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Star{num !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Dialog.Close asChild>
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleSave}>
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
              Delete Testimonial
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the testimonial from "{deleteItem?.clientName}"? This action cannot be undone.
            </AlertDialog.Description>
            
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
