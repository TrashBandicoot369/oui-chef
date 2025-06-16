'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const imagesRef = useRef<(HTMLDivElement | null)[]>([])
  const overlaysRef = useRef<(HTMLDivElement | null)[]>([])
  const descriptionsRef = useRef<(HTMLDivElement | null)[]>([])

  const getCurrentPair = () => {
    return [
      events[currentIndex],
      events[(currentIndex + 1) % events.length]
    ]
  }

  const nextSlide = () => {
    const newIndex = (currentIndex + 2) % events.length
    setCurrentIndex(newIndex)
  }

  const prevSlide = () => {
    const newIndex = (currentIndex - 2 + events.length) % events.length
    setCurrentIndex(newIndex)
  }

  const handleMouseEnter = (index: number) => {
    const imageEl = imagesRef.current[index]
    const overlayEl = overlaysRef.current[index]
    const descriptionEl = descriptionsRef.current[index]

    if (imageEl && overlayEl && descriptionEl) {
      // Image expand and blur
      gsap.to(imageEl, {
        scale: 1.1,
        filter: 'blur(2px)',
        duration: 0.4,
        ease: 'power2.out'
      })

      // Overlay fade in
      gsap.to(overlayEl, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      })

      // Description slide up
      gsap.fromTo(descriptionEl, 
        { 
          y: 30,
          opacity: 0 
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: 0.1,
          ease: 'power2.out'
        }
      )
    }
  }

  const handleMouseLeave = (index: number) => {
    const imageEl = imagesRef.current[index]
    const overlayEl = overlaysRef.current[index]
    const descriptionEl = descriptionsRef.current[index]

    if (imageEl && overlayEl && descriptionEl) {
      // Image return to normal
      gsap.to(imageEl, {
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.4,
        ease: 'power2.out'
      })

      // Overlay fade out
      gsap.to(overlayEl, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      })

      // Description fade out
      gsap.to(descriptionEl, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }

  // Slide transition animation
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      gsap.fromTo(container.children,
        { 
          opacity: 0,
          x: 50
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        }
      )
    }
  }, [currentIndex])

  const currentPair = getCurrentPair()

  return (
    <div className="relative py-8">
  <div className="max-w-6xl mx-auto">
      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-10 top-1/2 -translate-y-1/2 z-20 bg-accent2 hover:bg-accent1 text-primary3 p-3 py rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
        aria-label="Previous images"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-accent2 hover:bg-accent1 text-primary3 p-3 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
        aria-label="Next images"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Image container */}
      <div ref={containerRef} className="grid grid-cols-2 gap-6 mx-12">
        {currentPair.map((event, index) => (
          <div
            key={`${event.id}-${currentIndex}`}
            className="relative rounded-lg overflow-hidden cursor-pointer"
            style={{
              outline: '4px solid var(--color-stroke)',
              outlineOffset: '-2px',
              boxShadow: '8px 8px 0 var(--color-accent2)'
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {/* Image */}
            <div
              ref={(el) => { imagesRef.current[index] = el }}
              className="w-full h-80 overflow-hidden"
            >
              <img
                src={event.image}
                alt={event.alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay */}
            <div
              ref={(el) => { overlaysRef.current[index] = el }}
              className="absolute inset-0 bg-black bg-opacity-60 opacity-0 flex items-end justify-center p-6"
            >
              <div
                ref={(el) => { descriptionsRef.current[index] = el }}
                className="text-white text-center opacity-0"
              >
                <p className="text-lg font-medium leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.ceil(events.length / 2) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * 2)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              Math.floor(currentIndex / 2) === index
                ? 'bg-accent2 scale-125'
                : 'bg-accent2 opacity-50 hover:opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
    </div>
  )

}
