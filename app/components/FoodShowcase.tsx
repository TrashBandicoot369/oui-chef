'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useApi from '@/lib/useApi';

gsap.registerPlugin(ScrollTrigger);

type FoodShowcaseItem = {
  id: string;
  imageUrl: string;
  alt: string;
  visible: boolean;
  order: number;
};

export default function FoodShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [tappedIndex, setTappedIndex] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const foodItemsData = useApi<FoodShowcaseItem>('public/food-showcase');
  const foodItems = (foodItemsData || []).filter(item => item.visible === true);

  // Debug logging
  useEffect(() => {
    console.log('🍽️ [FoodShowcase] foodItemsData:', foodItemsData);
    console.log('🍽️ [FoodShowcase] foodItems:', foodItems);
    console.log('🍽️ [FoodShowcase] foodItems length:', foodItems.length);
  }, [foodItemsData, foodItems]);

  // GSAP animation: useLayoutEffect + querySelectorAll so elements exist
  useLayoutEffect(() => {
    if (!gridRef.current) return;
    const els = Array.from(gridRef.current.querySelectorAll<HTMLElement>('.showcase-item'));
    if (els.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(els, {
        y: 60,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
        },
      });
    }, gridRef);

    return () => {
      // revert context which also cleans up ScrollTrigger instances created within context
      ctx.revert();
    };
    // run whenever number of items changes so new items animate
  }, [foodItems.length]);

  // Show loading state or empty state
  if (!foodItemsData || foodItems.length === 0) {
    return (
      <section className="bg-primary2 text-accent1 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-accent2 py-20">
            <div className="animate-pulse">
              {!foodItemsData ? 'Loading food showcase...' : 'No food showcase items to display. Use the admin panel to add images.'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-primary2 text-accent1 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div 
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {foodItems.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => { imageRefs.current[index] = el; }}
              /* add selector class for GSAP */
              className="showcase-item relative group cursor-pointer overflow-hidden rounded-lg"
              style={{
                outline: '2px solid var(--color-stroke)',
                outlineOffset: '-2px',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
              onClick={() => setTappedIndex(tappedIndex === index ? -1 : index)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.alt || `Chef Alex J food showcase ${index + 1}`}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  style={{
                    filter: (hoveredIndex === index || tappedIndex === index)
                      ? 'brightness(0.7) contrast(1.1) saturate(1.2) blur(1px)' 
                      : 'brightness(0.9) contrast(1.05)',
                  }}
                />
                <div 
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    background: (hoveredIndex === index || tappedIndex === index)
                      ? 'linear-gradient(45deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))'
                      : 'transparent',
                  }}
                />
                {(hoveredIndex === index || tappedIndex === index) && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center text-white">
                      <p className="text-sm font-sans opacity-90 leading-relaxed">
                        {item.alt || `Exquisite culinary creation by Chef Alex J`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
