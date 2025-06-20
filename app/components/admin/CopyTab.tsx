'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';

interface SiteCopyData {
  id: string;
  section: string;
  content: string;
}

export default function CopyTab() {
  const [copyData, setCopyData] = useState<SiteCopyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<SiteCopyData | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isNewSection, setIsNewSection] = useState(false);
  const [newSection, setNewSection] = useState('');
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
      setCopyData(data);
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
    setIsNewSection(false);
  };

  const handleNewSection = () => {
    setIsNewSection(true);
    setNewSection('');
    setEditContent('');
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      if (isNewSection) {
        // Create new section
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: newSection,
            content: editContent
          })
        });

        if (!response.ok) throw new Error('Failed to create section');
        
        setToast({ message: 'Section created successfully', type: 'success' });
        setIsNewSection(false);
        setNewSection('');
        setEditContent('');
        await fetchCopyData();
      } else if (editingItem) {
        // Update existing section
        const response = await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, content: editContent })
        });

        if (!response.ok) throw new Error('Failed to update content');
        
        setToast({ message: 'Content updated successfully', type: 'success' });
        setEditingItem(null);
        setEditContent('');
        await fetchCopyData();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setToast({ message: 'Failed to save content', type: 'error' });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsNewSection(false);
    setNewSection('');
    setEditContent('');
  };

  const truncateContent = (content: string, maxLength: number = 60) => {
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

      {/* New Section Button */}
      <div className="mb-4">
        <Button onClick={handleNewSection}>New Section</Button>
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
                Snippet
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
                  {item.section}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {truncateContent(item.content)}
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

      {/* Edit/Create Dialog */}
      <Dialog.Root open={!!editingItem || isNewSection} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isNewSection ? 'Create New Section' : `Edit ${editingItem?.section}`}
            </Dialog.Title>
            
            {isNewSection && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., hero, about, footer"
                />
              </div>
            )}

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