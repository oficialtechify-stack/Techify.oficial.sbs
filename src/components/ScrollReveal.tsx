import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
  scale?: number;
  blur?: boolean | number;
  className?: string;
  threshold?: number | 'some' | 'all';
  once?: boolean;
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.55,
  yOffset = 18,
  xOffset = 0,
  scale = 0.99,
  blur = true,
  className = "",
  threshold = 0.1,
  once = true, // Default to true to prevent scroll jitter and repetitive layout shifts
  ...props
}: ScrollRevealProps) {
  const blurAmount = typeof blur === 'number' ? blur : blur ? 8 : 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: yOffset,
        x: xOffset,
        scale: scale,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      viewport={{
        once: once,
        amount: threshold,
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Smooth exponential ease-out
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
