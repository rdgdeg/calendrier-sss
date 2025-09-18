import React, { memo } from 'react';
import { 
  Calendar, 
  Users, 
  GraduationCap, 
  Presentation, 
  BookOpen,
  Star,
  Briefcase,
  Coffee
} from 'lucide-react';
import { CalendarEvent } from '../../types';

interface EventIconProps {
  event: CalendarEvent;
  size?: number;
  className?: string;
}

const EventIconComponent: React.FC<EventIconProps> = ({ 
  event, 
  size = 24, 
  className = '' 
}) => {
  const getEventIcon = () => {
    const title = event.title.toLowerCase();
    const category = event.category?.name?.toLowerCase() || '';
    
    // Mapping based on keywords in title, description, or category
    if (title.includes('colloque') || category.includes('colloque')) {
      return <Users size={size} />;
    }
    
    if (title.includes('thèse') || title.includes('these') || 
        title.includes('défense') || category.includes('these')) {
      return <GraduationCap size={size} />;
    }
    
    if (title.includes('séminaire') || title.includes('seminaire') || 
        category.includes('seminaire')) {
      return <Presentation size={size} />;
    }
    
    if (title.includes('conférence') || title.includes('conference') ||
        title.includes('présentation') || title.includes('presentation')) {
      return <Presentation size={size} />;
    }
    
    if (title.includes('formation') || title.includes('cours') ||
        title.includes('atelier') || title.includes('workshop')) {
      return <BookOpen size={size} />;
    }
    
    if (title.includes('réunion') || title.includes('reunion') ||
        title.includes('meeting') || title.includes('assemblée')) {
      return <Briefcase size={size} />;
    }
    
    if (title.includes('pause') || title.includes('café') ||
        title.includes('coffee') || title.includes('break')) {
      return <Coffee size={size} />;
    }
    
    if (title.includes('important') || title.includes('urgent') ||
        title.includes('spécial') || title.includes('special')) {
      return <Star size={size} />;
    }
    
    // Default icon
    return <Calendar size={size} />;
  };

  const getIconColor = () => {
    const title = event.title.toLowerCase();
    
    if (title.includes('colloque')) return '#8B5CF6'; // Purple
    if (title.includes('thèse') || title.includes('these')) return '#10B981'; // Green
    if (title.includes('séminaire') || title.includes('seminaire')) return '#F59E0B'; // Amber
    if (title.includes('conférence') || title.includes('conference')) return '#EF4444'; // Red
    if (title.includes('formation') || title.includes('cours')) return '#3B82F6'; // Blue
    if (title.includes('réunion') || title.includes('reunion')) return '#6B7280'; // Gray
    if (title.includes('important') || title.includes('urgent')) return '#DC2626'; // Red
    
    return event.color || '#003f7f'; // UCLouvain primary color as default
  };

  return (
    <div 
      className={`event-icon ${className}`}
      style={{ color: getIconColor() }}
      aria-hidden="true"
    >
      {getEventIcon()}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const EventIcon = memo(EventIconComponent, (prevProps, nextProps) => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.category?.name === nextProps.event.category?.name &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
});