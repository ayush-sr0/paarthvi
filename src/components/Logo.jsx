import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-10 w-auto',
    md: 'h-12 md:h-14 w-auto',
    lg: 'h-16 md:h-20 w-auto',
    xl: 'h-24 md:h-28 w-auto',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      <img
        src="/logo.svg"
        alt="Paarthvi Ayurveda"
        className={`${sizeClasses[size] || sizeClasses.md} object-contain filter drop-shadow-sm`}
      />
    </Link>
  );
};
