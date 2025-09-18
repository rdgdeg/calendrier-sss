import React, { memo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventBadgeProps {
  type: 'date' | 'source';
  value: string | Date;
  source?: 'icloud' | 'outlook';
  className?: string;
}

const EventBadgeComponent: React.FC<EventBadgeProps> = ({ 
  type, 
  value, 
  source, 
  className = '' 
}) => {
  const getBadgeContent = () => {
    if (type === 'date' && value instanceof Date) {
      return format(value, 'd MMM', { locale: fr });
    }
    return value as string;
  };

  const getBadgeClass = () => {
    const baseClass = `event-badge event-badge-${type}`;
    
    if (type === 'source' && source) {
      return `${baseClass} event-badge-${source}`;
    }
    
    return baseClass;
  };

  return (
    <div className={`${getBadgeClass()} ${className}`}>
      {getBadgeContent()}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const EventBadge = memo(EventBadgeComponent);