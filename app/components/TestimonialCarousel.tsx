"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Chef Alex delivered a flawless five-course meal that our guests still rave about.",
    author: "Olivia P., Corporate Event",
  },
  {
    quote:
      "The flavours were unbelievable and the service was top-notch. Truly memorable!",
    author: "Marcus T., Wedding Reception",
  },
  {
    quote:
      "Our festival attendees couldn’t get enough of the creative dishes Alex served.",
    author: "Sasha L., Summer Festival",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[index];

  return (
    <div className="relative mx-auto max-w-xl flex items-center justify-center h-60">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="relative bg-primary2 p-8 text-accent2 w-full"
        >
          <p className="text-xl leading-relaxed mb-4">“{t.quote}”</p>
          <footer className="text-sm opacity-70">— {t.author}</footer>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 Q20,0 40,20 T80,20 T120,20 T160,20 T200,20 T240,20 T280,20 T320,20 T360,20 Q380,0 400,20 L400,180 Q380,200 360,180 T320,180 T280,180 T240,180 T200,180 T160,180 T120,180 T80,180 T40,180 Q20,200 0,180Z"
              fill="none"
              stroke="var(--color-stroke)"
              strokeWidth="6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
