import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color
}) => {
  const spinnerClass = `spinner spinner-${size}`;
  
  const spinnerStyle = color ? { 
    borderColor: `${color} transparent transparent transparent` 
  } : undefined;

  return (
    <div className="spinner-container">
      <div className={spinnerClass}>
        <div style={spinnerStyle}></div>
        <div style={spinnerStyle}></div>
        <div style={spinnerStyle}></div>
        <div style={spinnerStyle}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;