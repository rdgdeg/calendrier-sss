import React, { useState, useRef, useEffect, useMemo } from 'react';
import { textFormatter, TextFormatterOptions } from '../../utils/textFormatter';
import { ResponsiveText, ScreenSize, TextVariant } from './ResponsiveText';

export interface ExpandableTextProps {
  text: string;
  variant: TextVariant;
  maxLines?: number;
  maxLength?: number;
  screenSize?: ScreenSize;
  className?: string;
  showExpandButton?: boolean;
  expandButtonText?: string;
  collapseButtonText?: string;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export interface TextOverflowInfo {
  hasOverflow: boolean;
  isExpanded: boolean;
  canExpand: boolean;
  hiddenContentLength: number;
  visibleContentLength: number;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  variant,
  maxLines = 3,
  maxLength,
  screenSize,
  className = '',
  showExpandButton = true,
  expandButtonText = 'Voir plus',
  collapseButtonText = 'Voir moins',
  onExpand,
  onCollapse
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Format the text using TextFormatter
  const formattedText = useMemo(() => {
    const options: TextFormatterOptions = {
      maxLength: isExpanded ? undefined : maxLength,
      preserveWords: true,
      showEllipsis: !isExpanded && !showExpandButton,
      breakLongWords: true
    };

    if (variant === 'title') {
      return textFormatter.formatTitle(text, options);
    } else {
      return textFormatter.formatDescription(text, options);
    }
  }, [text, variant, maxLength, isExpanded, showExpandButton]);

  // Check for overflow using a hidden measurement element
  useEffect(() => {
    if (!textRef.current || !measureRef.current || !maxLines) {
      return;
    }

    const checkOverflow = () => {
      const measureElement = measureRef.current;
      const textElement = textRef.current;
      
      if (!measureElement || !textElement) return;

      // Get computed styles from the actual text element
      const computedStyle = window.getComputedStyle(textElement);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Calculate effective line height
      const effectiveLineHeight = isNaN(lineHeight) ? fontSize * 1.2 : lineHeight;
      const maxHeight = effectiveLineHeight * maxLines;

      // Set the same styles on measurement element
      measureElement.style.fontSize = computedStyle.fontSize;
      measureElement.style.fontFamily = computedStyle.fontFamily;
      measureElement.style.fontWeight = computedStyle.fontWeight;
      measureElement.style.lineHeight = computedStyle.lineHeight;
      measureElement.style.width = textElement.offsetWidth + 'px';
      measureElement.style.visibility = 'hidden';
      measureElement.style.position = 'absolute';
      measureElement.style.top = '-9999px';
      measureElement.style.left = '-9999px';
      measureElement.style.whiteSpace = 'normal';
      measureElement.style.wordWrap = 'break-word';
      measureElement.style.overflowWrap = 'break-word';

      // Set the full text content
      measureElement.textContent = text;

      // Check if content overflows
      const contentHeight = measureElement.scrollHeight;
      const overflow = contentHeight > maxHeight;
      
      setHasOverflow(overflow);
    };

    // Initial check
    checkOverflow();

    // Check on resize
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(textRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [text, maxLines]);

  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (newExpandedState) {
      onExpand?.();
    } else {
      onCollapse?.();
    }
  };

  const overflowInfo: TextOverflowInfo = {
    hasOverflow,
    isExpanded,
    canExpand: hasOverflow && showExpandButton,
    hiddenContentLength: formattedText.isTruncated ? formattedText.originalLength - String(formattedText.content).length : 0,
    visibleContentLength: String(formattedText.content).length
  };

  const containerClassName = [
    'expandable-text',
    `expandable-text--${variant}`,
    isExpanded ? 'expandable-text--expanded' : 'expandable-text--collapsed',
    hasOverflow ? 'expandable-text--has-overflow' : '',
    className
  ].filter(Boolean).join(' ');

  // Don't render anything if text is empty or invalid
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return null;
  }

  // Don't show expand button if content is not truncated and doesn't overflow
  const shouldShowButton = hasOverflow && showExpandButton && formattedText.isTruncated;

  return (
    <div className={containerClassName}>
      {/* Hidden measurement element - positioned off-screen */}
      <div 
        ref={measureRef} 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      />
      
      {/* Main text content */}
      <div className="expandable-text__content">
        <ResponsiveText
          ref={textRef}
          text={String(formattedText.content)}
          variant={variant}
          maxLines={isExpanded ? undefined : maxLines}
          screenSize={screenSize}
          className="expandable-text__text"
        />
        
        {/* Overflow indicator */}
        {hasOverflow && !isExpanded && shouldShowButton && (
          <div className="expandable-text__overflow-indicator" aria-hidden="true">
            <div className="expandable-text__fade-gradient" />
            <div className="expandable-text__overflow-dots">...</div>
          </div>
        )}
      </div>

      {/* Expand/Collapse button */}
      {shouldShowButton && (
        <button
          type="button"
          className="expandable-text__toggle-button"
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? collapseButtonText : expandButtonText}
        >
          <span className="expandable-text__toggle-text">
            {isExpanded ? collapseButtonText : expandButtonText}
          </span>
          <span className="expandable-text__toggle-icon" aria-hidden="true">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>
      )}

      {/* Content length indicator for debugging/accessibility */}
      {process.env.NODE_ENV === 'development' && (
        <div className="expandable-text__debug-info" style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
          Visible: {overflowInfo.visibleContentLength} / Total: {formattedText.originalLength}
          {overflowInfo.hiddenContentLength > 0 && ` (Hidden: ${overflowInfo.hiddenContentLength})`}
        </div>
      )}
    </div>
  );
};

export default ExpandableText;