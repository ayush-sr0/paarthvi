import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo Component
 * Renders linked logo images where the emblem image is decorative (alt="")
 * and the brand typography image provides the single accessible "Parthvi Ayurveda" brand name.
 *
 * Props:
 *   size    — 'sm' | 'md' | 'lg' | 'xl'
 *   variant — 'dark' (default, for light backgrounds) | 'light' (for dark backgrounds)
 */
export const Logo = ({ className = '', size = 'md', variant = 'dark' }) => {
  const heightClasses = {
    sm: 'h-8 md:h-9',
    md: 'h-10 md:h-12',
    lg: 'h-14 md:h-16',
    xl: 'h-18 md:h-22',
  };

  const currentHeight = heightClasses[size] || heightClasses.md;

  // On dark backgrounds (footer), invert the dark-green logo to gold/cream
  const wordmarkFilter = variant === 'light'
    ? 'brightness(0) saturate(100%) invert(85%) sepia(30%) saturate(400%) hue-rotate(5deg) brightness(105%)'
    : undefined;

  return (
    <Link
      to="/"
      className={`inline-flex items-center shrink-0 group transition-transform duration-300 hover:scale-[1.02] ${className}`}
    >
      {/* Decorative Emblem Image */}
      <img
        src="/logo_emblem.png"
        alt=""
        aria-hidden="true"
        className={`${currentHeight} w-auto object-contain transition-transform duration-300 group-hover:rotate-3 shrink-0`}
      />
      {/* Accessible Brand Typography Image */}
      <img
        src="/logo_text.png"
        alt="Parthvi Ayurveda"
        className={`${currentHeight} w-auto object-contain max-h-[85%] shrink-0 ml-1.5`}
        style={wordmarkFilter ? { filter: wordmarkFilter } : undefined}
      />
    </Link>
  );
};
