import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-calendar-grid">
        {/* Header des jours de la semaine */}
        <div className="skeleton-weekdays">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton-weekday"></div>
          ))}
        </div>
        
        {/* Grille des jours */}
        <div className="skeleton-days">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="skeleton-day">
              <div className="skeleton-day-number"></div>
              {Math.random() > 0.7 && (
                <div className="skeleton-event"></div>
              )}
              {Math.random() > 0.8 && (
                <div className="skeleton-event"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="skeleton-loading-text">
        <div className="skeleton-pulse"></div>
        Chargement des calendriers...
      </div>
    </div>
  );
};