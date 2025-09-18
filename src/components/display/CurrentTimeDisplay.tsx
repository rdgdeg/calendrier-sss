import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CurrentTimeDisplayProps {
  className?: string;
}

const CurrentTimeDisplayComponent: React.FC<CurrentTimeDisplayProps> = ({ 
  className = '' 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Memoized function to update time with fade transition
  const updateTime = useCallback(() => {
    setIsUpdating(true);
    
    // Brief fade effect before updating
    updateTimeoutRef.current = setTimeout(() => {
      setCurrentTime(new Date());
      setIsUpdating(false);
    }, 150); // Half of the CSS transition duration
  }, []);

  // Handle page visibility changes for performance optimization
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, reduce update frequency or pause
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // Page is visible again, resume normal updates
      if (!timerRef.current) {
        // Update immediately when becoming visible
        updateTime();
        timerRef.current = setInterval(updateTime, 1000);
      }
    }
  }, [updateTime]);

  // Subtle animation cycle to avoid monotony during continuous display
  useEffect(() => {
    const startVisibilityAnimation = () => {
      visibilityTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setIsVisible(true);
          startVisibilityAnimation(); // Restart the cycle
        }, 200); // Brief invisible period
      }, 30000); // Every 30 seconds, create a subtle pulse
    };

    startVisibilityAnimation();

    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // Setup performance monitoring
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('time-update-animation')) {
            console.log(`Time update animation took ${entry.duration}ms`);
          }
        });
      });

      performanceObserverRef.current.observe({ entryTypes: ['measure'] });
    }

    // Set up interval for real-time updates every second
    timerRef.current = setInterval(updateTime, 1000);

    // Add visibility change listener for performance optimization
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to prevent memory leaks
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
        visibilityTimeoutRef.current = null;
      }
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      mediaQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateTime, handleVisibilityChange]);

  // Additional cleanup on unmount to ensure no memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`current-time-display pulse-animation ${className} ${!isVisible ? 'subtle-fade' : ''} ${isUpdating ? 'time-updating' : ''} ${prefersReducedMotion ? 'reduced-motion' : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={`Heure actuelle: ${format(currentTime, 'HH:mm:ss')} le ${format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}`}
      data-testid="current-time-display"
    >
      <div className={`current-time ${isUpdating ? 'updating' : ''}`}>
        {format(currentTime, 'HH:mm:ss')}
      </div>
      <div className="current-date">
        {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders during continuous display
export const CurrentTimeDisplay = memo(CurrentTimeDisplayComponent, (prevProps, nextProps) => {
  // Only re-render if className changes (time updates are handled internally)
  return prevProps.className === nextProps.className;
});