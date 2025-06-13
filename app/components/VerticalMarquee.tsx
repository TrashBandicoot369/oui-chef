'use client';
import React, { useRef, useEffect } from 'react';

interface VerticalMarqueeProps {
  items: string[];
  className?: string;
  speed?: number; // in px/sec
}

export default function VerticalMarquee({
  items,
  className = '',
  speed = 40,
}: VerticalMarqueeProps) {
  const columnCount = 3;
  const containerRefs = Array.from({ length: columnCount }, () =>
    useRef<HTMLDivElement>(null)
  );

  useEffect(() => {
    const animationFrames: number[] = [];
  
    containerRefs.forEach((ref, i) => {
      if (!ref.current) return;
  
      let scrollY = Math.floor(Math.random() * (ref.current.scrollHeight / 2));
      let paused = false;
      const dir = i % 2 === 0 ? 1 : -1;
  
      const step = () => {
        if (!paused && ref.current) {
          scrollY += (dir * speed) / 60;
          const maxScroll = ref.current.scrollHeight / 2;
  
          if (dir === 1 && scrollY >= maxScroll) scrollY = 0;
          if (dir === -1 && scrollY <= 0) scrollY = maxScroll;
  
          ref.current.scrollTop = scrollY;
        }
        animationFrames[i] = requestAnimationFrame(step);
      };
  
      const onMouseEnter = () => (paused = true);
      const onMouseLeave = () => (paused = false);
  
      ref.current.scrollTop = scrollY; // set initial random offset
      ref.current.addEventListener('mouseenter', onMouseEnter);
      ref.current.addEventListener('mouseleave', onMouseLeave);
      animationFrames[i] = requestAnimationFrame(step);
  
      return () => {
        cancelAnimationFrame(animationFrames[i]);
        ref.current?.removeEventListener('mouseenter', onMouseEnter);
        ref.current?.removeEventListener('mouseleave', onMouseLeave);
      };
    });
  }, [containerRefs, speed]);
  

  const doubledItems = [...items, ...items]; // for seamless looping

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 ${className}`}>
      {containerRefs.map((ref, i) => (
        <div
          key={i}
          ref={ref}
          className="h-96 overflow-hidden bg-transparent"
        >
          <div className="flex flex-col items-center">
            {doubledItems.map((text, j) => (
              <div
                key={`${i}-${j}`}
                className="w-64 bg-primary3  text-primary2 p-4 rounded-xl shadow-xl my-4 text-sm"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
