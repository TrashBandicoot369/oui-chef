'use client'
import React, { createContext, useContext, useCallback } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type SiteData = {
  copy: any
  menu: any
  testimonials: any
  gallery: any
  theme: any
  refresh: () => void
}

const SiteDataContext = createContext<SiteData | undefined>(undefined)

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const { data: copy, mutate: refreshCopy } = useSWR('/api/public/copy', fetcher)
  const { data: menu, mutate: refreshMenu } = useSWR('/api/public/menu', fetcher)
  const { data: testimonials, mutate: refreshTestimonials } = useSWR('/api/public/testimonials', fetcher)
  const { data: gallery, mutate: refreshGallery } = useSWR('/api/public/gallery', fetcher)
  const { data: theme, mutate: refreshTheme } = useSWR('/api/public/theme', fetcher)

  const refresh = useCallback(() => {
    refreshCopy()
    refreshMenu()
    refreshTestimonials()
    refreshGallery()
    refreshTheme()
  }, [refreshCopy, refreshMenu, refreshTestimonials, refreshGallery, refreshTheme])

  return (
    <SiteDataContext.Provider value={{ copy, menu, testimonials, gallery, theme, refresh }}>
      {children}
    </SiteDataContext.Provider>
  )
}

export const useSiteData = () => {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider')
  return ctx
}
