'use client'
import TextMarquee from '@/app/components/TextMarquee'
import VerticalMarquee from '@/app/components/VerticalMarquee'
import useApi from '@/lib/useApi'

type Testimonial = { id:string; order:number; quote:string }

export default function TestimonialsSection() {
  const testimonials = useApi<Testimonial>('testimonials')
  if (!testimonials?.length) return null
  const quotes = testimonials.map(t => t.quote)

  return (
    <section id="testimonials" className="relative bg-primary2 text-center text-accent1 py-32">
      <div className="w-full max-w-none">
        <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12 text-accent2">
          Testimonials
        </TextMarquee>
      </div>
      <div className="px-4">
        <VerticalMarquee items={quotes} speed={30} className="max-w-6xl mx-auto" />
      </div>
    </section>
  )
} 