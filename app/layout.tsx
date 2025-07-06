import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chef Alex J — Private Dining & Events',
  description: 'From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you celebrate.',
  icons: {
    icon: '/images/logo-white.png',
    shortcut: '/images/logo-white.png',
    apple: '/images/logo-white.png',
  },
  openGraph: {
    title: 'Chef Alex J — Private Dining & Events',
    description: 'From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you celebrate.',
    images: ['/images/logo-white.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chef Alex J — Private Dining & Events',
    description: 'From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you celebrate.',
    images: ['/images/logo-white.png'],
  },
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
        {children}
      </body>
    </html>
  )
} 