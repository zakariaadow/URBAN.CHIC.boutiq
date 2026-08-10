// src/components/common/Loader.jsx
import React from 'react';

const Loader = ({ size = 'md', fullScreen = false, message = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className={`${sizeClasses[size] || sizeClasses.md} border-purple-600 border-t-transparent rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          {message && <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {spinner}
      {message && <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>}
    </div>
  );
};

export default Loader;