import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Keep original type but alt & image optional for safety */
type Event = {
  id: number
  image?: string
  alt?: string
  description: string
}

interface Props {
  events: Event[]
}

export default function EventHighlights({ events }: Props) {
  // 📌 EARLY SANITY CHECK – prevents build crash
  const safeEvents = events.filter(
    (e): e is Required<Pick<Event, 'image' | 'alt'>> & Event =>
      !!e && typeof e.image === 'string' && typeof e.alt === 'string'
  )
  if (!safeEvents.length) return null            // no UI rendered if data bad

  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.eh-image', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative">
      {safeEvents.map(e => (
        <div key={e.id} className="eh-card">
          <img
            src={e.image}
            alt={e.alt ?? 'Event image'}
            className="eh-image w-full h-auto object-cover"
          />
          <p className="sr-only">{e.description}</p>
        </div>
      ))}
    </section>
  )
}
