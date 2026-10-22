import React from 'react';

export default function PixelButton({ children, variant = '', className = '', ...props }) {
  const variantClass = variant ? `pixel-btn--${variant}` : '';
  return (
    <button type="button" className={`pixel-btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}