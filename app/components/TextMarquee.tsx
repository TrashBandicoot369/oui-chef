'use client';
import Marquee from 'react-fast-marquee';
import React from 'react';

interface TextMarqueeProps {
  children: React.ReactNode;
  className?: string;
}

export default function TextMarquee({ children, className }: TextMarqueeProps) {
  return (
    <Marquee gradient={false} autoFill className={className}>
      {children}
    </Marquee>
  );
}
