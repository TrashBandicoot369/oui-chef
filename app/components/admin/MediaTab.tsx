'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';
import { Upload, Edit, Trash2, RefreshCw, X, Plus } from 'lucide-react';
import { getCloudinaryThumbnailUrl } from '@/lib/cloudinary-client';

interface MediaItem {
  id: string;
  publicId: string;
  url: string;
  name: string;
  tags: string[];
  linkedCount: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
  createdAt?: string;
}

// Lazy Loading Image Component
function LazyThumbnail({ 
  publicId, 
  alt, 
  className = "w-16 h-16 object-cover rounded" 
}: { 
  publicId: string; 
  alt: string; 
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const thumbnailUrl = isInView ? getCloudinaryThumbnailUrl(publicId, {
    width: 64,
    height: 64,
    crop: 'fill',
    quality: 'auto',
  }) : '';

  return (
    <div ref={imgRef} className={`bg-gray-100 ${className}`}>
      {isInView && (
        <img
          src={thumbnailUrl}
          alt={alt}
          className={`${className} transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      )}
      {!isLoaded && isInView && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Tag Editor Component
function TagEditor({ 
  tags, 
  onTagsChange,
  mediaId 
}: { 
  tags: string[]; 
  onTagsChange: (tags: string[]) => void;
  mediaId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState(tags.join(', '));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newTags = editTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags })
      });

      if (!response.ok) throw new Error('Failed to update tags');
      
      onTagsChange(newTags);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tags:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTags(tags.join(', '));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="text"
          value={editTags}
          onChange={(e) => setEditTags(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="tag1, tag2, tag3"
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
          title="Save"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-wrap gap-1 cursor-pointer group min-w-0"
      onClick={() => setIsEditing(true)}
    >
      {tags.length > 0 ? (
        tags.map((tag, index) => (
          <span
            key={index}
            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
          </span>
        ))
      ) : (
        <span className="text-xs text-gray-400 group-hover:text-gray-600">
          Click to add tags
        </span>
      )}
      <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
    </div>
  );
}

export default function MediaTab() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [replaceItem, setReplaceItem] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Fetch media items on mount
  useEffect(() => {
    fetchMediaItems();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/admin/media');
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      setMediaItems(data);
    } catch (error) {
      console.error('Error fetching media:', error);
      setToast({ message: 'Failed to load media', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
      }
      
      setToast({ message: 'Files uploaded successfully', type: 'success' });
      await fetchMediaItems();
    } catch (error) {
      console.error('Error uploading files:', error);
      setToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReplace = (item: MediaItem) => {
    setReplaceItem(item);
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceItem) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('publicId', replaceItem.publicId);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to replace file');
      
      setToast({ message: 'File replaced successfully', type: 'success' });
      await fetchMediaItems();
      setReplaceItem(null);
    } catch (error) {
      console.error('Error replacing file:', error);
      setToast({ message: 'Replace failed', type: 'error' });
    } finally {
      setUploading(false);
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete media');
      }
      
      setToast({ message: 'Media deleted successfully', type: 'success' });
      setDeleteItem(null);
      await fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to delete media', 
        type: 'error' 
      });
    }
  };

  const handleTagsChange = useCallback((itemId: string, newTags: string[]) => {
    setMediaItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, tags: newTags } : item
      )
    );
  }, []);

  const formatFileSize = (bytes: number = 0) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading media...</div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Management</h2>
        <p className="text-gray-600">Upload and manage media assets</p>
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <Button onClick={handleUpload} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleReplaceFileChange}
        className="hidden"
      />

      {/* Media Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Thumb
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Linked To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Size
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mediaItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <LazyThumbnail
                    publicId={item.publicId}
                    alt={item.name}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.format?.toUpperCase()} • {item.resourceType}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <TagEditor
                    tags={item.tags}
                    mediaId={item.id}
                    onTagsChange={(newTags) => handleTagsChange(item.id, newTags)}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.linkedCount > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.linkedCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatFileSize(item.bytes)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReplace(item)}
                      title="Replace"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteItem(item)}
                      className="text-red-600 hover:text-red-700"
                      disabled={item.linkedCount > 0}
                      title={item.linkedCount > 0 ? "Cannot delete - media is linked" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {mediaItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No media files found. Upload some files to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={!!deleteItem} onOpenChange={(open: boolean) => !open && setDeleteItem(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <AlertDialog.Title className="text-lg font-semibold mb-2">
              Delete Media
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone and will remove the file from Cloudinary.
            </AlertDialog.Description>
            
            {deleteItem && (
              <div className="mb-4">
                <LazyThumbnail
                  publicId={deleteItem.publicId}
                  alt={deleteItem.name}
                  className="w-24 h-24 object-cover rounded mx-auto"
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
