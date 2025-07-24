'use client'
import { useState, useEffect } from 'react'

type ThemeDoc = {
  colors?: Record<string, string>
  fonts?: Record<string, string>
}

export default function useTheme() {
  const [theme, setTheme] = useState<ThemeDoc | null>(null)

  useEffect(() => {
    let isMounted = true
    fetch('/api/public/content?collection=theme', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        const item = Array.isArray(json.data) ? json.data[0] : null
        if (isMounted) setTheme(item || null)
      })
      .catch(err => {
        console.error('Failed to fetch theme:', err)
        if (isMounted) setTheme(null)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return theme
}
