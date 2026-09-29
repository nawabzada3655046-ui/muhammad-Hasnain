import React from 'react';

interface TikTokIconProps {
  className?: string;
  size?: number;
}

export const TikTokIcon: React.FC<TikTokIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.3 6.3 0 0 0 1.86-4.47V8.71a8.21 8.21 0 0 0 4.91 1.63V6.89c-.33 0-.67-.07-1-.2z" />
  </svg>
);
