'use client'
import { useEffect, useState } from 'react'

export default function usePublicCollection<T = any>(collectionName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/public/content?collection=${collectionName}&t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${collectionName}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch data')
        }
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionName])

  return { data, loading, error }
} 