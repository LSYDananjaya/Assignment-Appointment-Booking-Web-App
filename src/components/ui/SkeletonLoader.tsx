import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(item => (
        <motion.div
          key={item}
          className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
