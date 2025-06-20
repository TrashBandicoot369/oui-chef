'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Switch from '@radix-ui/react-switch';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';

interface MenuItem {
  id: string;
  group: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  visible: boolean;
}

export default function MenuTab() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    group: '',
    name: '',
    description: '',
    price: '',
    tags: ''
  });

  // Fetch menu items on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setToast({ message: 'Failed to load menu items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (item: MenuItem) => {
    // Optimistic update
    const updatedItems = menuItems.map(i => 
      i.id === item.id ? { ...i, visible: !i.visible } : i
    );
    setMenuItems(updatedItems);

    try {
              const response = await fetch('/api/admin/menu', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, visible: !item.visible })
        });

      if (!response.ok) throw new Error('Failed to update visibility');
      
      setToast({ message: 'Visibility updated', type: 'success' });
    } catch (error) {
      // Revert on error
      setMenuItems(menuItems);
      console.error('Error updating visibility:', error);
      setToast({ message: 'Failed to update visibility', type: 'error' });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      group: item.group,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      tags: item.tags.join(', ')
    });
    setIsNewItem(false);
  };

  const handleNewItem = () => {
    setIsNewItem(true);
    setEditingItem(null);
    setFormData({
      group: '',
      name: '',
      description: '',
      price: '',
      tags: ''
    });
  };

  const handleSave = async () => {
    try {
      const menuData = {
        group: formData.group,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        visible: true
      };

      if (isNewItem) {
        // Create new item
        const response = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuData)
        });

        if (!response.ok) throw new Error('Failed to create menu item');
        
        setToast({ message: 'Menu item created successfully', type: 'success' });
      } else if (editingItem) {
        // Update existing item
        const response = await fetch('/api/admin/menu', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, ...menuData })
        });

        if (!response.ok) throw new Error('Failed to update menu item');
        
        setToast({ message: 'Menu item updated successfully', type: 'success' });
      }

      // Reset form and refresh data
      setIsNewItem(false);
      setEditingItem(null);
      setFormData({ group: '', name: '', description: '', price: '', tags: '' });
      await fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      setToast({ message: 'Failed to save menu item', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      });

      if (!response.ok) throw new Error('Failed to delete menu item');
      
      setToast({ message: 'Menu item deleted successfully', type: 'success' });
      setDeleteItem(null);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setToast({ message: 'Failed to delete menu item', type: 'error' });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsNewItem(false);
    setFormData({ group: '', name: '', description: '', price: '', tags: '' });
  };

  // Sort items by group then name
  const sortedItems = [...menuItems].sort((a, b) => {
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading menu items...</div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Management</h2>
        <p className="text-gray-600">Manage your menu items, prices, and visibility</p>
      </div>

      {/* Add New Item Button */}
      <div className="mb-4">
        <Button onClick={handleNewItem}>Add Menu Item</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visible
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.group}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-xs">{item.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Switch.Root
                    checked={item.visible}
                    onCheckedChange={() => handleVisibilityToggle(item)}
                    className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-green-500 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteItem(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog.Root open={!!editingItem || isNewItem} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isNewItem ? 'Add Menu Item' : `Edit ${editingItem?.name}`}
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Appetizers, Mains, Desserts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Menu item name"
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
                  placeholder="Brief description of the dish"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vegetarian, gluten-free, spicy"
                />
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
              Delete Menu Item
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
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