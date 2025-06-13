'use client';
import Marquee from 'react-fast-marquee';
import React from 'react';

interface TextMarqueeProps {
  children: React.ReactNode;
  className?: string;
}

export default function TextMarquee({ children, className }: TextMarqueeProps) {
  const text =
    typeof children === 'string'
      ? (
          <>
            {children.toUpperCase()}
            <span style={{ margin: '0 .5em' }}>*</span>
          </>
        )
      : children;
  
  return (
    <Marquee
      gradient={false}
      autoFill
      className={`${className} overflow-hidden`}
      style={{ letterSpacing: '0.1em' }}
    >
      {text}
    </Marquee>
  );
}