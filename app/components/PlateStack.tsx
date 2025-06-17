'use client'

import { useRef, useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function PlateStack() {
  const stackRef = useRef<HTMLDivElement>(null)
  const [shuffledPlates, setShuffledPlates] = useState<string[]>([])

  // ── plates with no text ───────────────────────────────────────────────
  const noTextPathsOriginal = [
    '/images/plate-no-text/plate-1_0002_dinner-plates-vintage-green-and.png',
    '/images/plate-no-text/plate-1_0007_Marzapane-dessert-verde-antico.png',
    '/images/plate-no-text/plate-1_0011_are-these-vintage-plates-food-sa.png',
    '/images/plate-no-text/plate-1_0012_757C8094-285F-4211-BBD5-0DA6D1B1.png',
  ]

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

  // Combine all plates, shuffle, and ensure the specified no-text plate is last
  function getShuffledPlates() {
    const allPlates = [...noTextPathsOriginal, ...textPlatePaths]
    const topPlate = '/images/plate-no-text/plate-1_0007_Marzapane-dessert-verde-antico.png'
    // Remove the top plate if present
    const idx = allPlates.indexOf(topPlate)
    if (idx !== -1) allPlates.splice(idx, 1)
    // Shuffle the rest
    for (let i = allPlates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allPlates[i], allPlates[j]] = [allPlates[j], allPlates[i]]
    }
    // Add the top plate at the end
    allPlates.push(topPlate)
    return allPlates
  }

  // Use a default order for initial render, shuffle in useLayoutEffect
  const defaultPlates = [...noTextPathsOriginal, ...textPlatePaths]
  const allPlates = shuffledPlates.length > 0 ? shuffledPlates : defaultPlates

  // ── flat list of every single menu item ────────────────────────────────
  const items = [
    'Stuffed Calamari: N\'Duja Parsley Oil, Herbs',
    'Seared Cabbage: Almond Chili Butter & Chives',
    'Crostini: Mushroom, Truffle, Gorgonzola, Mascarpone, Caramelized Onion, Thyme',
    'Scallop: Aji Blanco, Dill, Almonds, Cucumber',
    'Summer Salad: Ontario Peas, Charred Broccolini, Red Onion, Cumin, Yogurt, Fennel, Mint, Lemon',
    'Burrata: Roasted Grapes, Pistachio, Saba, Basil',
    'Oysters: Caesar · Black Garlic/Fermented Chili · Mignonette · Lime/Ginger/Fish Sauce Granita',
    'Tomato Carpaccio: N\'Duja Vinaigrette, Stracciatella Di Bufala, EVOO',
    'Braised Beef: Birria Demi, Onion Cracker, Pickled Radish, Cilantro Oil, Spiced Carrot',
    'Roasted Chicken: Guyanese Curry Reduction, Potato',
    'Pan-Seared Perch: Prosecco Beurre Blanc, Pickled Chilis, Herbs',
    'Veal Tenderloin: Rapini Pesto, Pan Jus, Pear Caponata',
    'Fennel & Cherry Tomato Gratin: Green Olive, Celery & Raisin Salsa',
    'Cardamom Panna Cotta: Quince Gelée, Toasted Milk Crumb',
    'Citrus Olive Oil Cake: Mascarpone, Basil Sorbet',
    'Hot Chocolate Tiramisu',
    'Berry & Stone Fruit: Almond Crumble, Whipped Vanilla Ganache',
    'Corn Cake: Popcorn Gelato, Corn Pops',
    'Spiced Chocolate Cake: Marshmallow, Buttered Graham Cracker Gelato, Spiced Chocolate Crème',
    'Parmesan & Thyme Muffins',
    'Guinness‐Braised Beef Stew with Mini Yorkshire Puddings',
    'Rabbit Orecchiette',
    'Potenza‐Style Chicken: Fresh Tomato, Basil',
    'Pollo Mattone with Pan Jus',
    'Savoury Bread Pudding',
    'Zesty Kale Salad & Date Dressing',
    'Baby Gem Lettuce: Burnt Lemon Dressing, Pecorino',
    'XO Grilled Shrimp',
    'Cannoli Tartare',
    'Japchae',
    'Braised Chicken Phyllo Cups',
    'Dauphine Potato: Black Garlic, Tomato, Beef',
    'Empanadas',
    'Goat Cheese & Tomato Tartlet',
    'Seasonal Tasting Menu: 5-course seasonal menu subject to change depending on season & availability',
  ]

  // ── build 12 badges, distributing text evenly by length ────────────────
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

  useLayoutEffect(() => {
    if (!stackRef.current) return
    const container = stackRef.current

    // Shuffle plates on client side only
    setShuffledPlates(getShuffledPlates())

    const doLayout = () => {
      const plates = Array.from(container.querySelectorAll<HTMLDivElement>('.plate'))
      if (!plates.length) return
      const img = plates[0].querySelector('img')!
      const plateW = img.offsetWidth
      const containerW = container.offsetWidth
      const padding = 4
      const availableWidth = containerW - (2 * padding) - plateW
      const gap = availableWidth / (plates.length - 1)

      plates.forEach((el, idx) => {
        const finalX = Math.round(padding + (idx * gap))
        const finalY = Math.round((container.offsetHeight - img.offsetHeight) / 2)
        const finalRotation = Math.round((Math.random() - 0.5) * 8)
        
        // Set initial position (off-screen to the right) and final position for scroll animation
        gsap.set(el, {
          x: finalX + 400, // Start 400px to the right
          y: finalY,
          rotation: finalRotation,
          zIndex: idx + 1,
          scale: 1,
          opacity: 0.3
        })

        // Create scroll-triggered animation for each plate
        gsap.to(el, {
          x: finalX,
          opacity: 1,
          duration: 0.8,
          delay: idx * 0.1, // Stagger the animations
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          }
        })
      })
    }

    doLayout()
    window.addEventListener('resize', doLayout)

    let active: number | null = null
    const plates = Array.from(container.querySelectorAll<HTMLDivElement>('.plate'))

    const onMove = (e: PointerEvent) => {
      const { left, width } = container.getBoundingClientRect()
      const x = e.clientX - left
      const strip = width / plates.length
      const idx = Math.floor(x / strip)
      if (idx !== active && idx >= 0 && idx < plates.length) {
        if (active !== null) {
          gsap.to(plates[active], { scale: 1, zIndex: active + 1, duration: 0.5, ease: 'power2.out' })
        }
        gsap.to(plates[idx], { scale: 3, zIndex: plates.length + 5, duration: 0.3, ease: 'power2.out' })
        active = idx
      }
    }

    const onLeave = () => {
      if (active !== null) {
        gsap.to(plates[active], { scale: 1, zIndex: active + 1, duration: 0.3, ease: 'power2.out' })
        active = null
      }
    }

    container.addEventListener('pointermove', onMove)
    container.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('resize', doLayout)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerleave', onLeave)
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill()
        }
      })
    }
  }, [shuffledPlates.length])

  return (
    <section className="w-full overflow-visible p-0 m-0 relative z-50">
      <div
        ref={stackRef}
        className="relative w-full h-[500px] overflow-visible p-0 m-0"
        style={{ minWidth: 0 }}
      >
        {allPlates.map((src, idx) => {
          // Only show a badge if this is a text plate
          const textIdx = textPlatePaths.indexOf(src)
          const badge = textIdx >= 0 ? labels[textIdx] : undefined
          return (
            <div key={idx} className="plate absolute cursor-pointer" style={{ transformOrigin: 'center' }}>
              <img
                src={src}
                alt={`Plate ${idx + 1}`}
                className="w-[300px] pointer-events-none select-none"
                draggable={false}
                style={{ display: 'block', margin: 0, padding: 0 }}
              />
              {badge && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[50%] h-[50%] rounded-full overflow-hidden flex items-center justify-center p-2">
                    <span
                      className="font-display text-stroke text-[10px] whitespace-pre-line text-center leading-[1.1] text-black break-words overflow-hidden"
                      style={{ 
                        textShadow: '0 0 4px rgba(255,255,255,0.8)',
                        display: '-webkit-box',
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: 'vertical',
                        maxHeight: '100%',
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
    </section>
  )
}
