'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function BounceArrow() {
  const ref = useRef(null)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0]) // Adjust '300' as needed

  return (
    <motion.div
      ref={ref}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-accent1"
      style={{ opacity }}
      animate={{ y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 text-accent1 drop-shadow-md"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </motion.div>
  )
}
