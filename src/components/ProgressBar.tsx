import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  isIndeterminate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  message = "Chargement...", 
  isIndeterminate = false 
}) => {
  return (
    <div className="progress-container">
      <div className="progress-message">{message}</div>
      <div className="progress-bar-wrapper">
        <div 
          className={`progress-bar ${isIndeterminate ? 'indeterminate' : ''}`}
          style={!isIndeterminate ? { width: `${Math.min(100, Math.max(0, progress))}%` } : {}}
        >
          <div className="progress-bar-fill"></div>
        </div>
      </div>
      {!isIndeterminate && (
        <div className="progress-percentage">{Math.round(progress)}%</div>
      )}
    </div>
  );
};