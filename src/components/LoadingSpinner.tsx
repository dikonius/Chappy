import React from 'react';
import '../App.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'; // Optional: Controls width/height
  color?: string; // Optional: Override default color (e.g., via CSS custom property)
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#6366f1' // Default; can be overridden with CSS var
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  return (
    <div 
      className={`loading-spinner ${sizeClasses[size]}`}
      style={{ '--spinner-color': color } as React.CSSProperties} // CSS var for dynamic color
      role="status"
      aria-label="Loading..."
    />
  );
};

export default LoadingSpinner;