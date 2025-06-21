'use client'
import { useState, useEffect } from 'react'

export default function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T[] | null>(null)

  useEffect(() => {
    let isMounted = true
    console.log(`🌐 [useApi] Fetching: /api/${endpoint}`)
    fetch(`/api/${endpoint}`)
      .then(res => {
        console.log(`📡 [useApi] Response status: ${res.status} for /api/${endpoint}`)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then(json => { 
        console.log(`📦 [useApi] Data received for /api/${endpoint}:`, json)
        console.log(`📊 [useApi] Data type: ${Array.isArray(json) ? 'array' : typeof json}, length: ${Array.isArray(json) ? json.length : 'N/A'}`)
        if (Array.isArray(json) && json.length > 0) {
          console.log(`🔍 [useApi] First item structure:`, Object.keys(json[0]))
          console.log(`🖼️ [useApi] First item image info:`, {
            hasImageUrl: !!json[0].imageUrl,
            hasImage: !!json[0].image,
            hasUrl: !!json[0].url,
            imageValue: json[0].imageUrl || json[0].image || json[0].url
          })
        }
        if (isMounted) setData(json) 
      })
      .catch(err => { 
        console.error(`❌ [useApi] Fetch error for /api/${endpoint}:`, err)
        if (isMounted) setData([]) 
      })
    return () => { isMounted = false }
  }, [endpoint])

  return data
} 