import React, { memo } from 'react';

interface EmptyStateProps {
  className?: string;
}

const EmptyStateComponent: React.FC<EmptyStateProps> = ({ className = '' }) => {
  return (
    <div 
      className={`empty-state ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* UCLouvain SVG Illustration */}
      <div 
        className="empty-state-illustration"
        role="img"
        aria-label="Illustration UCLouvain - Calendrier vide"
      >
        <svg
          width="200"
          height="160"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="empty-state-svg"
          aria-hidden="true"
        >
          {/* UCLouvain Shield Background */}
          <path
            d="M100 10L170 40V100C170 120 150 140 100 150C50 140 30 120 30 100V40L100 10Z"
            fill="url(#ucl-gradient)"
            className="shield-background"
          />
          
          {/* UCLouvain Shield Border */}
          <path
            d="M100 10L170 40V100C170 120 150 140 100 150C50 140 30 120 30 100V40L100 10Z"
            stroke="var(--ucl-primary)"
            strokeWidth="2"
            fill="none"
            className="shield-border"
          />
          
          {/* Calendar Icon in Center */}
          <rect
            x="75"
            y="60"
            width="50"
            height="40"
            rx="4"
            fill="white"
            stroke="var(--ucl-primary)"
            strokeWidth="2"
            className="calendar-body"
          />
          
          {/* Calendar Header */}
          <rect
            x="75"
            y="60"
            width="50"
            height="12"
            rx="4"
            fill="var(--ucl-primary)"
            className="calendar-header"
          />
          
          {/* Calendar Rings */}
          <circle
            cx="85"
            cy="55"
            r="3"
            fill="var(--ucl-primary)"
            className="calendar-ring"
          />
          <circle
            cx="115"
            cy="55"
            r="3"
            fill="var(--ucl-primary)"
            className="calendar-ring"
          />
          
          {/* Calendar Grid */}
          <g className="calendar-grid">
            <circle cx="85" cy="82" r="2" fill="var(--ucl-gray-400)" />
            <circle cx="95" cy="82" r="2" fill="var(--ucl-gray-400)" />
            <circle cx="105" cy="82" r="2" fill="var(--ucl-gray-400)" />
            <circle cx="115" cy="82" r="2" fill="var(--ucl-gray-400)" />
            <circle cx="85" cy="92" r="2" fill="var(--ucl-accent)" />
            <circle cx="95" cy="92" r="2" fill="var(--ucl-gray-400)" />
            <circle cx="105" cy="92" r="2" fill="var(--ucl-gray-400)" />
          </g>
          
          {/* Decorative Elements */}
          <g className="decorative-dots">
            <circle cx="60" cy="50" r="2" fill="var(--ucl-secondary)" opacity="0.6" />
            <circle cx="140" cy="50" r="2" fill="var(--ucl-secondary)" opacity="0.6" />
            <circle cx="50" cy="80" r="1.5" fill="var(--ucl-accent)" opacity="0.4" />
            <circle cx="150" cy="80" r="1.5" fill="var(--ucl-accent)" opacity="0.4" />
            <circle cx="65" cy="110" r="1" fill="var(--ucl-secondary)" opacity="0.3" />
            <circle cx="135" cy="110" r="1" fill="var(--ucl-secondary)" opacity="0.3" />
          </g>
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="ucl-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ucl-primary)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--ucl-secondary)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--ucl-primary)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Encouraging Message */}
      <div className="empty-state-content">
        <h2 className="empty-state-title">
          Aucun événement à venir
        </h2>
        <p className="empty-state-message">
          Les prochains événements du Secteur SSS apparaîtront ici dès qu'ils seront programmés.
        </p>
        <p className="empty-state-submessage">
          Restez connectés pour ne rien manquer !
        </p>
      </div>
    </div>
  );
};

// Memoize the component since it's static content
export const EmptyState = memo(EmptyStateComponent);