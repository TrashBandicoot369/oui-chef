'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import TextMarquee from '@/app/components/TextMarquee'
import useApi from '@/lib/useApi'

// Register the useGSAP hook
gsap.registerPlugin(useGSAP)

type Testimonial = { 
  id: string
  order: number
  quote: string
  clientName: string
  rating: number
  approved: boolean
}

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const testimonials = useApi<Testimonial>('testimonials')
  
  // Debug: Log the raw testimonials data
  useEffect(() => {
    if (testimonials) {
      console.log('🔍 Raw testimonials data:', testimonials)
      testimonials.forEach((t, i) => {
        console.log(`🔍 Testimonial ${i}:`, {
          id: t.id,
          clientName: t.clientName,
          rating: t.rating,
          ratingType: typeof t.rating,
          approved: t.approved,
          order: t.order
        })
      })
    }
  }, [testimonials])
  
  // Filter only approved testimonials and sort by order
  const approvedTestimonials = (testimonials || [])
    .filter(t => t.approved)
    .sort((a, b) => a.order - b.order)
  
  console.log('🔍 Approved testimonials:', approvedTestimonials.length, approvedTestimonials)
  
  const count = approvedTestimonials.length

  // Navigation functions - following EventHighlights pattern exactly
  const next = () => count > 0 && setIndex((i) => (i + 1) % count)
  const prev = () => count > 0 && setIndex((i) => (i - 1 + count) % count)

  // Reset index if it's out of bounds when testimonials change
  useEffect(() => {
    if (approvedTestimonials.length > 0 && index >= approvedTestimonials.length) {
      setIndex(0)
    }
  }, [approvedTestimonials.length, index])

  // GSAP animation for carousel movement
  useGSAP(() => {
    if (carouselRef.current && count > 0) {
      gsap.to(carouselRef.current, {
        xPercent: -index * (100 / count),
        duration: 0.8,
        ease: 'power2.inOut'
      })
      
    }
  }, { dependencies: [index], scope: containerRef })

  // Generate star icons based on rating
  const renderStars = (rating: number) => {
    // Ensure rating is a number and within valid range
    const numRating = Number(rating) || 0
    const validRating = Math.max(0, Math.min(5, numRating))
    
    console.log('Rating debug:', { original: rating, converted: numRating, valid: validRating })
    
    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < validRating
      console.log(`Star ${i + 1}: ${isFilled ? 'FILLED' : 'EMPTY'}`)
      
      return (
        <span
          key={i}
          className={isFilled ? 'text-lg text-accent2' : 'text-lg text-gray-400'}
          style={{ color: isFilled ? 'var(--color-accent2)' : '#9CA3AF' }}
        >
          ⭐
        </span>
      )
    })
  }

  if (!testimonials?.length) return null

  if (count === 0) {
    return (
      <section id="testimonials" className="relative bg-primary2 text-center text-accent1 py-32">
        <div className="w-full max-w-none">
          <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12 text-accent2">
            Testimonials
          </TextMarquee>
        </div>
        <div className="px-4">
          <p className="text-accent2">No approved testimonials to display.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="testimonials" className="relative bg-primary2 text-center text-accent1 py-32">
      <div className="w-full max-w-none">
        <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12 text-accent2">
          Testimonials
        </TextMarquee>
      </div>
      
      <div ref={containerRef} className="relative max-w-6xl mx-auto px-4">
        {/* Navigation Buttons */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-accent2" />
            </button>
            
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6 text-accent2" />
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            ref={carouselRef}
            className="flex"
            style={{ width: `${count * 100}%` }}
          >
            {approvedTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0"
                style={{ width: `${100 / count}%` }}
              >
                <div className="px-8">
                  {/* Testimonial Card - styled like about section image */}
                  <div
                    className="bg-primary1 rounded-lg p-8 mx-auto max-w-lg"
                    style={{
                      outline: '4px solid var(--color-stroke)',
                      outlineOffset: '-2px',
                      boxShadow: '8px 8px 0 var(--color-accent2)'
                    }}
                  >
                    {/* Quote */}
                    <blockquote className="text-accent2 text-lg font-sans leading-relaxed mb-6 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    {/* Client Name */}
                    <div className="text-accent1 font-display text-xl mb-3">
                      {testimonial.clientName}
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex justify-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot Navigation */}
        {count > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {approvedTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === index 
                    ? 'bg-accent2 scale-125' 
                    : 'bg-accent2 bg-opacity-40 hover:bg-opacity-60'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}