'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/app/components/ui/button'
import { Alert } from '@/app/components/ui/alert'
import { Eye, EyeOff, Edit, Trash2, Plus, GripVertical, Star } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/* ──────────────────────────── Types ──────────────────────────── */
interface GalleryItem {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
  featured: boolean
  visible: boolean
  order: number
  publicId?: string
}

interface FormDataState {
  image: string
  publicId: string
  alt: string
  description: string
  /* extras used in handleEdit */
  title: string
  category: string
  featured: boolean
}

/* ─────────────────────── Placeholder uploader ─────────────────────── */
function ImageUploader({
  onUpload
}: {
  onUpload: (data: { url: string; publicId: string }) => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    // fake upload
    setTimeout(() => {
      const url = URL.createObjectURL(file)
      onUpload({ url, publicId: `temp-${Date.now()}` })
      setUploading(false)
    }, 1000)
  }

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
  )
}

/* ─────────────────────── Sortable gallery card ─────────────────────── */
function SortableCard({
  item,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured
}: {
  item: GalleryItem
  onEdit: (item: GalleryItem) => void
  onDelete: (item: GalleryItem) => void
  onToggleVisibility: (item: GalleryItem) => void
  onToggleFeatured: (item: GalleryItem) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white rounded-lg shadow-sm overflow-hidden"
    >
      {/* drag handle */}
      <button
        className="absolute top-2 left-2 z-20 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </button>

      {/* image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className={`w-full h-full object-cover ${
            !item.visible ? 'opacity-50' : ''
          }`}
        />

        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
            {item.title}
          </h3>
          <p className="text-white/80 text-xs line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* controls */}
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
          onClick={() => onToggleFeatured(item)}
          className="p-1.5 bg-white/80 rounded hover:bg-white transition-colors"
          title={item.featured ? 'Remove from Event Highlights' : 'Add to Event Highlights'}
        >
          <Star className={`w-4 h-4 ${item.featured ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
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
      
      {/* Featured badge */}
      {item.featured && (
        <div className="absolute bottom-2 left-2 z-20 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
          FEATURED
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── Main tab ─────────────────────────── */
export default function GalleryTab() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [isNewItem, setIsNewItem] = useState(false)
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null)
  const [toast, setToast] = useState<
    { message: string; type: 'success' | 'error' } | null
  >(null)

  const [formData, setFormData] = useState<FormDataState>({
    image: '',
    publicId: '',
    alt: '',
    description: '',
    title: '',
    category: '',
    featured: false
  })

  /* dnd sensors */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchGalleryItems = async () => {
    try {
      const res = await fetch('/api/admin/gallery')
      if (!res.ok) throw new Error('Failed to fetch gallery')
      const data = await res.json()
      setGalleryItems(data.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order))
    } catch (err) {
      console.error(err)
      setToast({ message: 'Failed to load gallery', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (evt: DragEndEvent) => {
    const { active, over } = evt
    if (!over || active.id === over.id) return

    const oldIndex = galleryItems.findIndex(i => i.id === active.id)
    const newIndex = galleryItems.findIndex(i => i.id === over.id)
    const reordered = arrayMove(galleryItems, oldIndex, newIndex)
    setGalleryItems(reordered)

    const updates = reordered.map((item, idx) => ({ id: item.id, order: idx }))

    try {
      for (const u of updates) {
        if (galleryItems.find(g => g.id === u.id)?.order !== u.order) {
          await fetch('/api/admin/gallery', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
          })
        }
      }
      setToast({ message: 'Order updated successfully', type: 'success' })
    } catch (err) {
      console.error(err)
      setToast({ message: 'Failed to update order', type: 'error' })
      await fetchGalleryItems()
    }
  }

  const handleToggleVisibility = async (item: GalleryItem) => {
    const updated = galleryItems.map(g =>
      g.id === item.id ? { ...g, visible: !g.visible } : g
    )
    setGalleryItems(updated)

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, visible: !item.visible })
      })
      if (!res.ok) throw new Error()
      setToast({ message: 'Visibility updated', type: 'success' })
    } catch {
      setGalleryItems(galleryItems)
      setToast({ message: 'Failed to update visibility', type: 'error' })
    }
  }

  const handleToggleFeatured = async (item: GalleryItem) => {
    const updated = galleryItems.map(g =>
      g.id === item.id ? { ...g, featured: !g.featured } : g
    )
    setGalleryItems(updated)

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, featured: !item.featured })
      })
      if (!res.ok) throw new Error()
      setToast({ message: 'Featured status updated', type: 'success' })
    } catch {
      setGalleryItems(galleryItems)
      setToast({ message: 'Failed to update featured status', type: 'error' })
    }
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      image: item.imageUrl,
      publicId: item.publicId || '',
      alt: '',
      description: item.description,
      title: item.title,
      category: item.category,
      featured: item.featured
    })
    setIsNewItem(false)
  }

  const handleNewItem = () => {
    setIsNewItem(true)
    setEditingItem(null)
    setFormData({
      image: '',
      publicId: '',
      alt: '',
      description: '',
      title: '',
      category: '',
      featured: false
    })
  }

  const handleImageUpload = (d: { url: string; publicId: string }) =>
    setFormData({ ...formData, image: d.url, publicId: d.publicId })

  const handleSave = async () => {
    try {
      const payload = {
        image: formData.image,
        publicId: formData.publicId,
        alt: formData.alt,
        description: formData.description,
        visible: true,
        order: isNewItem ? galleryItems.length : undefined
      }

      if (isNewItem) {
        const r = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!r.ok) throw new Error()
        setToast({ message: 'Gallery item created', type: 'success' })
      } else if (editingItem) {
        const r = await fetch('/api/admin/gallery', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, ...payload })
        })
        if (!r.ok) throw new Error()
        setToast({ message: 'Gallery item updated', type: 'success' })
      }

      setIsNewItem(false)
      setEditingItem(null)
      setFormData({
        image: '',
        publicId: '',
        alt: '',
        description: '',
        title: '',
        category: '',
        featured: false
      })
      await fetchGalleryItems()
    } catch {
      setToast({ message: 'Failed to save gallery item', type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const r = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      })
      if (!r.ok) throw new Error()
      setToast({ message: 'Gallery item deleted', type: 'success' })
      setDeleteItem(null)
      await fetchGalleryItems()
    } catch {
      setToast({ message: 'Failed to delete gallery item', type: 'error' })
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsNewItem(false)
    setFormData({
      image: '',
      publicId: '',
      alt: '',
      description: '',
      title: '',
      category: '',
      featured: false
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading gallery...</div>
      </div>
    )
  }

  /* ───────────────────────── Render ───────────────────────── */
  return (
    <div className="p-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <Alert variant={toast.type === 'error' ? 'destructive' : 'default'}>
            <p className="text-sm">{toast.message}</p>
          </Alert>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gallery Management
        </h2>
        <p className="text-gray-600">Manage event photos and gallery images</p>
      </div>

      <div className="mb-6">
        <Button onClick={handleNewItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={galleryItems.map(i => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map(i => (
              <SortableCard
                key={i.id}
                item={i}
                onEdit={handleEdit}
                onDelete={i => setDeleteItem(i)}
                onToggleVisibility={handleToggleVisibility}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* dialogs */}
      <Dialog.Root
        open={!!editingItem || isNewItem}
        onOpenChange={o => !o && handleCancel()}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95 overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isNewItem ? 'Add Gallery Item' : 'Edit Gallery Item'}
            </Dialog.Title>

            <div className="space-y-4">
              {/* image */}
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
                      onClick={() =>
                        setFormData({
                          ...formData,
                          image: '',
                          publicId: ''
                        })
                      }
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
                  onChange={e =>
                    setFormData({ ...formData, alt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Detailed description"
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

      <AlertDialog.Root
        open={!!deleteItem}
        onOpenChange={o => !o && setDeleteItem(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <AlertDialog.Title className="text-lg font-semibold mb-2">
              Delete Gallery Item
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialog.Description>

            {deleteItem && (
              <div className="mb-4">
                <img
                  src={deleteItem.imageUrl}
                  alt={deleteItem.title}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost">Cancel</Button>
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
  )
}
