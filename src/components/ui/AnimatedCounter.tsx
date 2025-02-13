import React, { useEffect, useRef } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  
  const animatedValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0.1,
  });

  useEffect(() => {
    if (isInView) {
      animatedValue.set(value);
    }
  }, [isInView, value, animatedValue]);

  return (
    <motion.span ref={ref}>
      {animatedValue.get().toFixed(0)}
    </motion.span>
  );
};