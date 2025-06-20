'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'

export default function SimpleMediaTab() {
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedia = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📱 Fetching media items...')
      const response = await fetch('/api/admin/media')
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Media API Error:', errorText)
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📱 Media data received:', data)
      setMediaItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Media fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch media')
      setMediaItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const addSampleData = async () => {
    try {
      const sampleMedia = {
        filename: 'sample-image.jpg',
        url: '/images/plates/plate-1_0001_DSC_1890_dc30ca82-3f12-49fb-8bc6.png',
        type: 'image/jpeg',
        size: 245760,
        tags: ['sample', 'food'],
        alt: 'Sample food image'
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleMedia)
      })

      if (response.ok) {
        await fetchMedia()
      }
    } catch (err) {
      console.error('Error adding sample data:', err)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading media items...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Media</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={fetchMedia} variant="outline" size="sm">
              Try Again
            </Button>
            <Button onClick={() => window.open('/api/test', '_blank')} variant="outline" size="sm">
              Test API
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Management</h2>
        <p className="text-gray-600">Manage your media files and images</p>
      </div>

      {mediaItems.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <h3 className="text-gray-900 font-medium mb-2">No media items found</h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first media item to the collection.
          </p>
          <div className="space-x-2">
            <Button onClick={addSampleData}>
              Add Sample Data
            </Button>
            <Button onClick={fetchMedia} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Media Items ({mediaItems.length})</h3>
              <Button onClick={fetchMedia} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mediaItems.map((item, index) => (
              <div key={item.id || index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.filename}</h4>
                    <p className="text-sm text-gray-500">{item.type} • {item.size} bytes</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-1">
                        {item.tags.map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.url && (
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 