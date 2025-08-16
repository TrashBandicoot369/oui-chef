'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/app/components/ui/button'
import { Alert } from '@/app/components/ui/alert'
import { Eye, EyeOff, Trash2, Plus, GripVertical, Edit } from 'lucide-react'
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

interface FoodShowcaseItem {
  id: string
  imageUrl: string
  alt: string
  visible: boolean
  order: number
  publicId?: string
}

interface FormDataState {
  image: string
  publicId: string
  alt: string
}

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
    
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      onUpload({ url: result, publicId: `temp-${Date.now()}` })
      setUploading(false)
    }
    reader.readAsDataURL(file)
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
          {uploading ? 'Processing...' : 'Click to upload image'}
        </span>
      </label>
    </div>
  )
}

function SortableCard({
  item,
  onDelete,
  onToggleVisibility,
  onEdit
}: {
  item: FoodShowcaseItem
  onDelete: (item: FoodShowcaseItem) => void
  onToggleVisibility: (item: FoodShowcaseItem) => void
  onEdit: (item: FoodShowcaseItem) => void
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
      <button
        className="absolute top-2 left-2 z-20 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </button>

      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.alt || 'Food showcase item'}
          className={`w-full h-full object-cover ${
            !item.visible ? 'opacity-50' : ''
          }`}
        />
      </div>

      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 bg-white/80 rounded hover:bg-white transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
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
          onClick={() => onDelete(item)}
          className="p-1.5 bg-white/80 rounded hover:bg-white transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  )
}

export default function FoodShowcaseTab() {
  const [foodItems, setFoodItems] = useState<FoodShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewItem, setIsNewItem] = useState(false)
  const [deleteItem, setDeleteItem] = useState<FoodShowcaseItem | null>(null)
  const [editItem, setEditItem] = useState<FoodShowcaseItem | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [toast, setToast] = useState<
    { message: string; type: 'success' | 'error' } | null
  >(null)

  const [formData, setFormData] = useState<FormDataState>({
    image: '',
    publicId: '',
    alt: ''
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchFoodItems()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchFoodItems = async () => {
    try {
      const res = await fetch('/api/admin/food-showcase')
      if (!res.ok) throw new Error('Failed to fetch food showcase items')
      const data = await res.json()
      setFoodItems(data.sort((a: FoodShowcaseItem, b: FoodShowcaseItem) => a.order - b.order))
    } catch (err) {
      console.error(err)
      setToast({ message: 'Failed to load food showcase items', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (evt: DragEndEvent) => {
    const { active, over } = evt
    if (!over || active.id === over.id) return

    const oldIndex = foodItems.findIndex(i => i.id === active.id)
    const newIndex = foodItems.findIndex(i => i.id === over.id)
    const reordered = arrayMove(foodItems, oldIndex, newIndex)
    setFoodItems(reordered)

    const updates = reordered.map((item, idx) => ({ id: item.id, order: idx }))

    try {
      for (const u of updates) {
        if (foodItems.find(f => f.id === u.id)?.order !== u.order) {
          await fetch('/api/admin/food-showcase', {
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
      await fetchFoodItems()
    }
  }

  const handleToggleVisibility = async (item: FoodShowcaseItem) => {
    const updated = foodItems.map(f =>
      f.id === item.id ? { ...f, visible: !f.visible } : f
    )
    setFoodItems(updated)

    try {
      const res = await fetch('/api/admin/food-showcase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, visible: !item.visible })
      })
      if (!res.ok) throw new Error()
      setToast({ message: 'Visibility updated', type: 'success' })
    } catch {
      setFoodItems(foodItems)
      setToast({ message: 'Failed to update visibility', type: 'error' })
    }
  }

  const handleNewItem = () => {
    if (foodItems.length >= 12) {
      setToast({ message: 'Maximum of 12 food showcase items allowed', type: 'error' })
      return
    }
    
    setIsNewItem(true)
    setFormData({
      image: '',
      publicId: '',
      alt: ''
    })
  }

  const handleImageUpload = (d: { url: string; publicId: string }) =>
    setFormData({ ...formData, image: d.url, publicId: d.publicId })

  const handleSave = async () => {
    try {
      const payload = {
        image: formData.image,
        imageUrl: formData.image,
        publicId: formData.publicId,
        alt: formData.alt,
        visible: true,
        order: foodItems.length
      }

      const r = await fetch('/api/admin/food-showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!r.ok) {
        const errorData = await r.json()
        throw new Error(errorData.error || 'Failed to save')
      }
      
      setToast({ message: 'Food showcase item created', type: 'success' })
      setIsNewItem(false)
      setFormData({ image: '', publicId: '', alt: '' })
      await fetchFoodItems()
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save food showcase item', type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const r = await fetch('/api/admin/food-showcase', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      })
      if (!r.ok) throw new Error()
      setToast({ message: 'Food showcase item deleted', type: 'success' })
      setDeleteItem(null)
      await fetchFoodItems()
    } catch {
      setToast({ message: 'Failed to delete food showcase item', type: 'error' })
    }
  }

  const handleEdit = (item: FoodShowcaseItem) => {
    setEditItem(item)
    setEditAlt(item.alt)
  }

  const handleEditSave = async () => {
    if (!editItem) return
    try {
      const res = await fetch('/api/admin/food-showcase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editItem.id, alt: editAlt })
      })
      if (!res.ok) throw new Error()
      setToast({ message: 'Description updated', type: 'success' })
      setEditItem(null)
      setEditAlt('')
      await fetchFoodItems()
    } catch {
      setToast({ message: 'Failed to update description', type: 'error' })
    }
  }

  const handleCancel = () => {
    setIsNewItem(false)
    setFormData({ image: '', publicId: '', alt: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading food showcase...</div>
      </div>
    )
  }

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
          Food Showcase Management
        </h2>
        <p className="text-gray-600">
          Manage food showcase images (max 12 items). Drag to reorder.
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={handleNewItem}
          disabled={foodItems.length >= 12}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Food Image {foodItems.length >= 12 && '(Max Reached)'}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={foodItems.map(i => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {foodItems.map(i => (
              <SortableCard
                key={i.id}
                item={i}
                onDelete={i => setDeleteItem(i)}
                onToggleVisibility={handleToggleVisibility}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog.Root
        open={isNewItem}
        onOpenChange={o => !o && handleCancel()}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95 overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Add Food Showcase Image
            </Dialog.Title>

            <div className="space-y-4">
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
                  Alt Text (Optional)
                </label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={e =>
                    setFormData({ ...formData, alt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the food image"
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
              Delete Food Showcase Item
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialog.Description>

            {deleteItem && (
              <div className="mb-4">
                <img
                  src={deleteItem.imageUrl}
                  alt={deleteItem.alt || 'Food showcase item'}
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

      <Dialog.Root
        open={!!editItem}
        onOpenChange={o => !o && setEditItem(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Edit Description
            </Dialog.Title>

            <div className="space-y-4">
              {editItem && (
                <div className="mb-4">
                  <img
                    src={editItem.imageUrl}
                    alt={editItem.alt || 'Food showcase item'}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={e => setEditAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description for hover display"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Dialog.Close asChild>
                <Button variant="ghost" onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleEditSave}>
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}