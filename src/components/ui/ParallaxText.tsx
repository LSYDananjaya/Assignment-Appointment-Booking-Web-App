import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxTextProps {
  children: React.ReactNode;
  className?: string;
  baseVelocity?: number;
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  className = '',
  baseVelocity = 100,
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, baseVelocity]);

  return (
    <motion.div
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};