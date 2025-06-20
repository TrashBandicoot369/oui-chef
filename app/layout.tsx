import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { SiteDataProvider } from './context/SiteDataContext'
import { db } from '@/lib/firebase-admin'

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await db.collection('siteCopy').get()
  const copy = snapshot.docs[0]?.data() as any || {}
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
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
        <SiteDataProvider>
          {children}
        </SiteDataProvider>
      </body>
    </html>
  )
} 