'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';

interface SiteCopyData {
  id: string;
  section: string;
  content: string;
  imageUrl?: string;
  publicId?: string;
}

export default function CopyTab() {
  const [copyData, setCopyData] = useState<SiteCopyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<SiteCopyData | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch site copy data on mount
  useEffect(() => {
    fetchCopyData();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCopyData = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      
      // Migrate data structure if needed (for backward compatibility)
      const migratedData = data.map((item: any) => ({
        ...item,
        section: item.section || 'unknown',
        content: item.content || ''
      }));
      
      setCopyData(migratedData);
    } catch (error) {
      console.error('Error fetching content:', error);
      setToast({ message: 'Failed to load content', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: SiteCopyData) => {
    setEditingItem(item);
    setEditContent(item.content);
    setSelectedFile(null);
    setImagePreview(item.imageUrl || null);
  };


  const handleSave = async () => {
    try {
      if (editingItem) {
        let response;
        
        if (selectedFile && editingItem.section.toLowerCase() === 'about') {
          // Use FormData for file upload
          const formData = new FormData();
          formData.append('id', editingItem.id);
          formData.append('content', editContent);
          formData.append('image', selectedFile);
          
          response = await fetch('/api/admin/content', {
            method: 'PATCH',
            body: formData
          });
        } else {
          // Use JSON for text-only updates
          response = await fetch('/api/admin/content', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingItem.id, content: editContent })
          });
        }

        if (!response.ok) throw new Error('Failed to update content');
        
        setToast({ message: 'Content updated successfully', type: 'success' });
        setEditingItem(null);
        setEditContent('');
        setSelectedFile(null);
        setImagePreview(null);
        await fetchCopyData();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setToast({ message: 'Failed to save content', type: 'error' });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditContent('');
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };


  const truncateContent = (content: string | undefined | null, maxLength: number = 60) => {
  if (!content) return 'No content';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading content...</div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Site Copy Management</h2>
        <p className="text-gray-600">Manage hero, about, footer, and SEO copy</p>
      </div>


      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {copyData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.section || 'Unnamed Section'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {truncateContent(item.content)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={`${item.section} image`}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog.Root open={!!editingItem} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Edit {editingItem?.section}
            </Dialog.Title>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                placeholder="Enter your content here..."
              />
            </div>

            {editingItem?.section.toLowerCase() === 'about' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Section Image
                </label>
                
                {imagePreview && (
                  <div className="mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a new image to replace the current about section image
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
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
    </div>
  );
} 