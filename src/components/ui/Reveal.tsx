import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { revealVariant } from './motion-presets';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'section';
}

/** whileInView reveal that fires once. Honors reduced-motion via CSS clamp. */
export function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={revealVariant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
