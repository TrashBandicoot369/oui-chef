'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

type Event = {
  id: number
  image: string
  alt: string
  description: string
}

const events: Event[] = [
  {
    id: 1,
    image: '/images/optimized/IMG_8262.webp',
    alt: 'Intimate dining event with guests enjoying conversation',
    description: 'A cozy gathering featuring warm hospitality and seasonal flavors.'
  },
  {
    id: 2,
    image: '/images/optimized/IMG_8301.webp',
    alt: 'Elegantly plated dish with artistic presentation',
    description: 'Guests enjoyed an artistic menu inspired by the best local farms.'
  },
  {
    id: 3,
    image: '/images/optimized/IMG_8355.webp',
    alt: 'Gourmet dish with green sauce in artisan bowl',
    description: 'Our team served a vibrant tasting menu bursting with fresh herbs.'
  },
  {
    id: 4,
    image: '/images/optimized/IMG_8386.webp',
    alt: 'Artistic plated dish with creative garnish',
    description: 'An intimate supper club highlighted playful plating and bold colors.'
  },
  {
    id: 5,
    image: '/images/optimized/IMG_8436-Edit.webp',
    alt: 'Premium meat dish with colorful vegetable garnish',
    description: 'Slow-cooked meats stole the show at this rustic celebration.'
  },
  {
    id: 6,
    image: '/images/optimized/IMG_8223.webp',
    alt: 'Additional culinary creation',
    description: 'The evening closed with comfort classics reinvented for the crowd.'
  }
]

export default function EventHighlights() {
  const [openId, setOpenId] = useState<number | null>(null)

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
      {events.map((event) => (
        <motion.div
          key={event.id}
          className="cursor-pointer rounded-md overflow-hidden"
          whileHover={{ scale: 1.03 }}
          onClick={() => toggle(event.id)}
          layout
        >
          <img
            src={event.image}
            alt={event.alt}
            className="w-full h-80 object-cover"
            style={{
              outline: '4px solid var(--color-stroke)',
              outlineOffset: '-2px',
              boxShadow: '8px 8px 0 var(--color-accent2)'
            }}
          />
          <motion.div
            initial={false}
            animate={{ height: openId === event.id ? 'auto' : 0, opacity: openId === event.id ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-accent1 text-sm p-4 overflow-hidden"
          >
            {event.description}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
