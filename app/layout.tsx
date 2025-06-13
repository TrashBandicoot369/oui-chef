import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chef Alex J — Private Dining & Events',
  description: 'From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you celebrate.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        {children}
      </body>
    </html>
  )
} 