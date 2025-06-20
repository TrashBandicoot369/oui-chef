'use client'

import { useState, useRef } from 'react'
import { useSiteData } from '../context/SiteDataContext'

export default function MobilePlateCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // ── Use only one plate with no text as the first image ──────────────────
  const firstPlate = '/images/plate-no-text/plate-1_0007_Marzapane-dessert-verde-antico.png'

  const textPlatePaths = [
    '/images/plates/plate-1_0000_remove-3.png',
    '/images/plates/plate-1_0001_DSC_1890_dc30ca82-3f12-49fb-8bc6.png',
    '/images/plates/plate-1_0003_P0000087928S000000142123T1.png',
    '/images/plates/plate-1_0004_il_570xN.6707194376_sy50.png',
    '/images/plates/plate-1_0005_GreenVintageDinnerPlate_1600x.png',
    '/images/plates/plate-1_0006_VintageDinnerPlate10in_1000x.png',
    '/images/plates/plate-1_0008_remove.png',
    '/images/plates/plate-1_0009_PinkVintageDInnerPlate.png',
    '/images/plates/plate-1_0010_71-RED97-5L.png',
    '/images/plates/plate-1_0012_Generative-Fill.png',
    '/images/plates/plate-1_0012_remove-2.png',
    '/images/plates/plate-1_0013_Remove-tool-edits.png',
  ]

  // Combine first plate with text plates
  const allPlates = [firstPlate, ...textPlatePaths]

  // Menu items for text plates
  const { menu: items } = useSiteData()

  // Distribute menu items evenly across text plates
  function distributeItemsEvenly() {
    const plateCount = textPlatePaths.length
    const plateGroups: string[][] = Array.from({ length: plateCount }, () => [])
    const plateLengths: number[] = Array(plateCount).fill(0)
    
    // Sort items by length (longest first) for better distribution
    const sortedItems = [...items].sort((a, b) => b.length - a.length)
    
    // Distribute each item to the plate with the least total text length
    sortedItems.forEach(item => {
      const shortestPlateIndex = plateLengths.indexOf(Math.min(...plateLengths))
      plateGroups[shortestPlateIndex].push(item)
      plateLengths[shortestPlateIndex] += item.length
    })
    
    return plateGroups.map(group => group.join('\n'))
  }
  
  const labels = distributeItemsEvenly()

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allPlates.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allPlates.length) % allPlates.length)
  }

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }

    // Reset touch positions
    touchStartX.current = 0
    touchEndX.current = 0
  }

  return (
    <section className="w-full overflow-hidden p-0 m-0 relative z-50">
      {/* Swipe instruction */}
      <div className="text-center mb-4">
        <p className="text-accent2 text-sm font-sans uppercase tracking-wide">
          Swipe to explore menu
        </p>
      </div>

      {/* Carousel container */}
      <div 
        className="relative w-full h-[400px] overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allPlates.map((src, idx) => {
            // First plate is the no-text plate, text plates start from index 1
            const isTextPlate = idx > 0
            const textIdx = isTextPlate ? idx - 1 : -1
            const badge = isTextPlate && textIdx >= 0 ? labels[textIdx] : undefined
            
            return (
              <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center relative">
                <img
                  src={src}
                  alt={idx === 0 ? "Chef Alex J signature plate" : `Menu plate ${idx}`}
                  className="w-[280px] h-auto object-contain"
                  draggable={false}
                />
                {badge && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[140px] h-[140px] rounded-full overflow-hidden flex items-center justify-center p-3">
                      <span
                        className="font-display text-stroke text-[9px] whitespace-pre-line text-center leading-[1.1] text-black break-words"
                        style={{ 
                          textShadow: '0 0 4px rgba(255,255,255,0.8)',
                          display: '-webkit-box',
                          WebkitLineClamp: 8,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {badge}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {allPlates.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              idx === currentIndex ? 'bg-accent2' : 'bg-accent2/30'
            }`}
            aria-label={`Go to plate ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
} 