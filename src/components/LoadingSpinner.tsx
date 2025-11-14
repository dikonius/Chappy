import React from 'react';
import './loadingSpinner.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;   // Optional override
  centered?: boolean; // Optional: center in parent
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--profile-text)',
  centered = false
}) => {
  const sizeClasses = {
    small: 'spinner--small',
    medium: 'spinner--medium',
    large: 'spinner--large'
  };

  return (
    <div
      className={`spinner ${sizeClasses[size]} ${centered ? 'spinner-centered' : ''}`}
      style={{ '--spinner-color': color } as React.CSSProperties}
      role="status"
      aria-label="Loading..."
    />
  );
};

export default LoadingSpinner;
