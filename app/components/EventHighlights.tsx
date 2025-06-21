import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useApi from '@/lib/useApi'

type Event = {
  id: string
  title: string
  description: string
  imageUrl: string
  publicId?: string
  category: string
  featured: boolean
  order: number
}

// SVG clip shapes for morphing animation
const shapes = [
  'M37.3,-54.3C52.4,-48.3,71.4,-44.8,80.1,-34.1C88.7,-23.4,87,-5.6,80.4,8.7C73.8,22.9,62.4,33.6,50.9,40.6C39.3,47.6,27.6,50.9,15,57.5C2.4,64.1,-11.1,74,-22.4,72.4C-33.6,70.8,-42.5,57.7,-46.8,44.9C-51,32.1,-50.5,19.7,-52.8,7.3C-55.1,-5.1,-60.1,-17.4,-58.5,-29.1C-56.9,-40.9,-48.8,-52,-37.9,-59.9C-27.1,-67.8,-13.5,-72.5,-1.2,-70.6C11.1,-68.7,22.2,-60.3,37.3,-54.3Z',
  'M30.4,-45.5C42.4,-39.6,57.4,-36.3,65.9,-27.3C74.4,-18.2,76.6,-3.5,75.3,11.3C73.9,26.1,69.1,40.9,58.5,47.8C48,54.7,31.8,53.9,16.8,59.2C1.8,64.5,-12,76,-20.1,72C-28.2,68,-30.8,48.4,-35.8,35.2C-40.9,21.9,-48.4,15,-49.5,7.1C-50.5,-0.7,-45.2,-9.4,-41.6,-19.7C-38,-29.9,-36.1,-41.6,-29.5,-50C-22.8,-58.4,-11.4,-63.5,-1.1,-61.7C9.2,-60,18.4,-51.4,30.4,-45.5Z',
  'M29.7,-48C41.6,-38.6,56.6,-35.6,60.7,-27.5C64.8,-19.3,58,-6,54.9,7.1C51.7,20.1,52.2,32.9,47.6,45.1C43,57.4,33.4,69.1,21.7,71.4C10,73.7,-3.8,66.6,-15.3,59.8C-26.9,52.9,-36.2,46.2,-44.9,38C-53.6,29.7,-61.5,19.8,-64.9,8.2C-68.4,-3.4,-67.4,-16.9,-60.4,-25.7C-53.5,-34.6,-40.6,-38.9,-29.6,-48.8C-18.5,-58.6,-9.3,-73.9,-0.2,-73.6C8.9,-73.3,17.8,-57.4,29.7,-48Z',
  'M30.8,-49.9C41.5,-41.1,52.8,-35.2,59.7,-25.7C66.5,-16.1,68.8,-2.9,65.1,7.9C61.3,18.8,51.4,27.4,43.8,40.1C36.1,52.7,30.7,69.5,21.6,70.9C12.5,72.3,-0.2,58.3,-13.6,51.8C-26.9,45.3,-40.7,46.3,-49.7,40.5C-58.8,34.7,-63,22.2,-61.9,10.7C-60.8,-0.9,-54.3,-11.4,-51.8,-26.5C-49.3,-41.6,-50.6,-61.2,-42.7,-71.3C-34.7,-81.4,-17.3,-82,-3.6,-76.3C10.1,-70.6,20.1,-58.8,30.8,-49.9Z',
  'M32.4,-53.7C38.4,-46.5,37.4,-31.5,44,-19.4C50.6,-7.3,64.9,2.1,69,13.7C73.2,25.3,67.2,39.2,57.2,48.2C47.2,57.2,33.2,61.3,18.9,66.5C4.5,71.8,-10.1,78.1,-22.6,75.3C-35.1,72.4,-45.4,60.3,-52.9,47.9C-60.4,35.5,-65,22.8,-64.7,10.7C-64.3,-1.4,-58.8,-12.9,-53.6,-24.6C-48.4,-36.2,-43.4,-48,-34.6,-54C-25.7,-59.9,-12.8,-59.9,0.2,-60.2C13.2,-60.4,26.3,-60.9,32.4,-53.7Z',
  'M48.3,-68.1C61.8,-66.6,71.2,-51.7,72.1,-36.7C73.1,-21.7,65.6,-6.7,63.8,9.5C62,25.7,65.9,43.1,59.4,52.4C52.8,61.7,35.8,62.9,19.7,67.9C3.7,72.8,-11.4,81.7,-25.1,80.1C-38.8,78.6,-51.1,66.7,-56.5,53.1C-62,39.4,-60.7,24,-63.4,8.8C-66.1,-6.4,-72.8,-21.4,-69.4,-32.8C-65.9,-44.2,-52.2,-52,-38.9,-53.6C-25.7,-55.1,-12.8,-50.3,2.3,-53.9C17.5,-57.5,34.9,-69.5,48.3,-68.1Z'
]

export default function EventHighlights() {
  const [index, setIndex] = useState(0)
  const pathRef = useRef<SVGPathElement>(null)
  const eventsData = useApi<Event>('public/gallery')
  const events = eventsData || []
  const count = events.length

  const next = () => count > 0 && setIndex((i) => (i + 1) % count)
  const prev = () => count > 0 && setIndex((i) => (i - 1 + count) % count)

  // Reset index if it's out of bounds when events change
  useEffect(() => {
    if (events.length > 0 && index >= events.length) {
      setIndex(0)
    }
  }, [events.length, index])

  useLayoutEffect(() => {
    if (pathRef.current && events.length > 0) {
      pathRef.current.setAttribute('d', shapes[index % shapes.length])
    }
  }, [index, events.length])

  // Show loading state or empty state
  if (!eventsData || events.length === 0) {
    return (
      <div className="w-full min-h-[800px] flex items-center justify-center relative overflow-hidden -translate-y-[100px]">
        <div className="text-center text-accent2">
          <div className="animate-pulse">
            {!eventsData ? 'Loading events...' : 'No events to display at this time.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[800px] flex items-center justify-center relative overflow-hidden -translate-y-[100px]">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-16 flex items-center justify-between h-full translate-y-28">
        <button
          onClick={prev}
          aria-label="Previous"
          className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-full"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div className="flex-1 mx-12 flex items-center justify-center gap-16">
          <div className="flex-1 max-w-lg">
            <h2 className="text-3xl font-bold uppercase mb-4 text-accent2">
              {events[index]?.title || 'Loading...'}
            </h2>
            <p className="text-base leading-relaxed text-accent2">
              {events[index]?.description || 'Loading event details...'}
            </p>
          </div>
          
          <div className="flex-shrink-0 relative z-0 overflow-visible -my-[200px]">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-100 -100 200 200"
    className="w-full max-w-[800px] h-[800px] pointer-events-none"
    clipPathUnits="userSpaceOnUse"
  >
              <defs>
                <clipPath id="morphClip">
                  <path 
                    ref={pathRef} 
                    d={shapes[0]} 
                    fill="#fff"
                    style={{
                      transition: 'd 0.6s ease-in-out'
                    }}
                  />
                </clipPath>
              </defs>
              <image
                href={events[index]?.imageUrl || ''}
                x={-150}
                y={-150}
                width={300}
                height={300}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#morphClip)"
                aria-label={events[index]?.title || 'Event image'}
              />
            </svg>
          </div>
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-full"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {events.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === index 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-40 hover:bg-opacity-60'
            }`}
            aria-label={`Go to event ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}