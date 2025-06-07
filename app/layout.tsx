import type { Metadata } from 'next'
import React from 'react'
import { Cherry_Cream_Soda, Roboto, Oswald } from 'next/font/google'
import './globals.css'

// Font configurations with CSS variables
const cherryCreamSoda = Cherry_Cream_Soda({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const oswald = Oswald({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-button',
  display: 'swap',
})

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
    <html 
      lang="en" 
      className={`scroll-smooth ${cherryCreamSoda.variable} ${roboto.variable} ${oswald.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  )
} 