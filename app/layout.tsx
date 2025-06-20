import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { SiteDataProvider } from './context/SiteDataContext'

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const res = await fetch(`${base}/api/public/copy`)
  const data: { id: string; content: string }[] = await res.json()
  const find = (key: string) => data.find(d => d.id === key)?.content || ''
  return {
    title: find('seo-title'),
    description: find('seo-description')
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preload critical fonts to prevent FOUC */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton:wght@400&family=Bitter:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteDataProvider>{children}</SiteDataProvider>
      </body>
    </html>
  )
}
