import React, { useState, useEffect, useCallback } from 'react';
import { globalResizeHandler } from '../../utils/performanceOptimizer';

// Types and interfaces
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'tv';
export type TextVariant = 'title' | 'description' | 'metadata';

export interface TypographyScale {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
}

export interface ResponsiveTextProps {
  text: string;
  variant: TextVariant;
  maxLines?: number;
  className?: string;
  screenSize?: ScreenSize; // Optional override for testing
}

// Typography scales configuration
const TYPOGRAPHY_SCALES: Record<TextVariant, Record<ScreenSize, TypographyScale>> = {
  title: {
    mobile: { fontSize: '16px', lineHeight: '1.3', fontWeight: '600' },
    tablet: { fontSize: '18px', lineHeight: '1.3', fontWeight: '600' },
    desktop: { fontSize: '20px', lineHeight: '1.3', fontWeight: '600' },
    tv: { fontSize: '28px', lineHeight: '1.2', fontWeight: '700' }
  },
  description: {
    mobile: { fontSize: '13px', lineHeight: '1.4', fontWeight: '400' },
    tablet: { fontSize: '14px', lineHeight: '1.5', fontWeight: '400' },
    desktop: { fontSize: '15px', lineHeight: '1.5', fontWeight: '400' },
    tv: { fontSize: '18px', lineHeight: '1.4', fontWeight: '400' }
  },
  metadata: {
    mobile: { fontSize: '11px', lineHeight: '1.3', fontWeight: '500' },
    tablet: { fontSize: '12px', lineHeight: '1.3', fontWeight: '500' },
    desktop: { fontSize: '13px', lineHeight: '1.3', fontWeight: '500' },
    tv: { fontSize: '16px', lineHeight: '1.3', fontWeight: '500' }
  }
};

// Screen size detection breakpoints
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1920,
  tv: Infinity
};

// Hook for screen size detection (performance optimized)
export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    // Initialize with current screen size to avoid layout shift
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    if (width < BREAKPOINTS.desktop) return 'desktop';
    return 'tv';
  });

  const detectScreenSize = useCallback((): ScreenSize => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    if (width < BREAKPOINTS.desktop) return 'desktop';
    return 'tv';
  }, []);

  const handleResize = useCallback(() => {
    const newScreenSize = detectScreenSize();
    setScreenSize(prevSize => {
      // Only update if screen size actually changed
      if (prevSize !== newScreenSize) {
        return newScreenSize;
      }
      return prevSize;
    });
  }, [detectScreenSize]);

  useEffect(() => {
    // Use global resize handler for better performance
    let cleanup: (() => void) | undefined;
    
    try {
      cleanup = globalResizeHandler.addCallback(handleResize);
    } catch (error) {
      console.warn('Failed to add resize handler:', error);
      // Fallback to direct window listener
      window.addEventListener('resize', handleResize);
      cleanup = () => window.removeEventListener('resize', handleResize);
    }
    
    return cleanup;
  }, [handleResize]);

  return screenSize;
};

// Main ResponsiveText component
export const ResponsiveText = React.forwardRef<HTMLDivElement, ResponsiveTextProps>(({
  text,
  variant,
  maxLines,
  className = '',
  screenSize: overrideScreenSize
}, ref) => {
  // Use override screenSize if provided, otherwise detect
  const detectedScreenSize = useScreenSize();
  const screenSize = overrideScreenSize || detectedScreenSize;
  
  // Safety check for text content first
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Calculate typography style without useMemo to avoid dependency issues
  const getTypographyStyle = (): React.CSSProperties => {
    // Safety checks to prevent errors
    if (!variant || !screenSize) {
      return {
        fontSize: '14px',
        lineHeight: '1.4',
        fontWeight: '400',
        margin: 0,
        padding: 0
      };
    }

    if (!TYPOGRAPHY_SCALES[variant] || !TYPOGRAPHY_SCALES[variant][screenSize]) {
      // Fallback to desktop scale if invalid variant/screenSize
      const fallbackScale = TYPOGRAPHY_SCALES.description.desktop;
      return {
        fontSize: fallbackScale.fontSize,
        lineHeight: fallbackScale.lineHeight,
        fontWeight: fallbackScale.fontWeight,
        margin: 0,
        padding: 0
      };
    }

    const scale = TYPOGRAPHY_SCALES[variant][screenSize];
    const style: React.CSSProperties = {
      fontSize: scale.fontSize,
      lineHeight: scale.lineHeight,
      fontWeight: scale.fontWeight,
      margin: 0,
      padding: 0
    };

    // Add line clamping if maxLines is specified
    if (maxLines && maxLines > 0) {
      style.display = '-webkit-box';
      style.WebkitLineClamp = maxLines;
      style.WebkitBoxOrient = 'vertical';
      style.overflow = 'hidden';
      style.textOverflow = 'ellipsis';
    }

    return style;
  };

  const typographyStyle = getTypographyStyle();
  const combinedClassName = `responsive-text responsive-text--${variant} responsive-text--${screenSize} ${className}`.trim();

  return (
    <div 
      ref={ref}
      className={combinedClassName}
      style={typographyStyle}
      data-variant={variant}
      data-screen-size={screenSize}
      title={maxLines && text.length > 100 ? text : undefined}
    >
      {text}
    </div>
  );
});

ResponsiveText.displayName = 'ResponsiveText';

export default ResponsiveText;