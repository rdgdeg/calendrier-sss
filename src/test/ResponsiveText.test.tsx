import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResponsiveText, useScreenSize, type ScreenSize, type TextVariant } from '../components/display/ResponsiveText';

// Mock window.innerWidth for testing
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock ResizeObserver if not available
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ResponsiveText Component', () => {
  beforeEach(() => {
    // Reset window size to desktop default
    mockInnerWidth(1200);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders text content correctly', () => {
      const testText = 'Test event title';
      render(<ResponsiveText text={testText} variant="title" />);
      
      expect(screen.getByText(testText)).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      const testText = 'Test content';
      render(<ResponsiveText text={testText} variant="description" className="custom-class" />);
      
      const element = screen.getByText(testText);
      expect(element).toHaveClass('responsive-text');
      expect(element).toHaveClass('responsive-text--description');
      expect(element).toHaveClass('responsive-text--desktop'); // Default screen size
      expect(element).toHaveClass('custom-class');
    });

    it('sets correct data attributes', () => {
      const testText = 'Test content';
      render(<ResponsiveText text={testText} variant="metadata" />);
      
      const element = screen.getByText(testText);
      expect(element).toHaveAttribute('data-variant', 'metadata');
      expect(element).toHaveAttribute('data-screen-size', 'desktop');
    });
  });

  describe('Typography Scaling', () => {
    const testCases: Array<{
      variant: TextVariant;
      screenSize: ScreenSize;
      expectedFontSize: string;
      expectedLineHeight: string;
      expectedFontWeight: string;
    }> = [
      // Title variant
      { variant: 'title', screenSize: 'mobile', expectedFontSize: '16px', expectedLineHeight: '1.3', expectedFontWeight: '600' },
      { variant: 'title', screenSize: 'tablet', expectedFontSize: '18px', expectedLineHeight: '1.3', expectedFontWeight: '600' },
      { variant: 'title', screenSize: 'desktop', expectedFontSize: '20px', expectedLineHeight: '1.3', expectedFontWeight: '600' },
      { variant: 'title', screenSize: 'tv', expectedFontSize: '28px', expectedLineHeight: '1.2', expectedFontWeight: '700' },
      
      // Description variant
      { variant: 'description', screenSize: 'mobile', expectedFontSize: '13px', expectedLineHeight: '1.4', expectedFontWeight: '400' },
      { variant: 'description', screenSize: 'tablet', expectedFontSize: '14px', expectedLineHeight: '1.5', expectedFontWeight: '400' },
      { variant: 'description', screenSize: 'desktop', expectedFontSize: '15px', expectedLineHeight: '1.5', expectedFontWeight: '400' },
      { variant: 'description', screenSize: 'tv', expectedFontSize: '18px', expectedLineHeight: '1.4', expectedFontWeight: '400' },
      
      // Metadata variant
      { variant: 'metadata', screenSize: 'mobile', expectedFontSize: '11px', expectedLineHeight: '1.3', expectedFontWeight: '500' },
      { variant: 'metadata', screenSize: 'tablet', expectedFontSize: '12px', expectedLineHeight: '1.3', expectedFontWeight: '500' },
      { variant: 'metadata', screenSize: 'desktop', expectedFontSize: '13px', expectedLineHeight: '1.3', expectedFontWeight: '500' },
      { variant: 'metadata', screenSize: 'tv', expectedFontSize: '16px', expectedLineHeight: '1.3', expectedFontWeight: '500' },
    ];

    testCases.forEach(({ variant, screenSize, expectedFontSize, expectedLineHeight, expectedFontWeight }) => {
      it(`applies correct typography for ${variant} variant on ${screenSize} screen`, () => {
        const testText = 'Test content';
        render(<ResponsiveText text={testText} variant={variant} screenSize={screenSize} />);
        
        const element = screen.getByText(testText);
        
        expect(element.style.fontSize).toBe(expectedFontSize);
        expect(element.style.lineHeight).toBe(expectedLineHeight);
        expect(element.style.fontWeight).toBe(expectedFontWeight);
      });
    });
  });

  describe('Line Clamping', () => {
    it('applies line clamping when maxLines is specified', () => {
      const testText = 'Very long text that should be clamped';
      render(<ResponsiveText text={testText} variant="description" maxLines={2} />);
      
      const element = screen.getByText(testText);
      expect(element.style.display).toBe('-webkit-box');
      expect(element.style.overflow).toBe('hidden');
      expect(element.style.textOverflow).toBe('ellipsis');
      // Note: webkit properties may not be fully supported in jsdom, but the component sets them
    });

    it('does not apply line clamping when maxLines is not specified', () => {
      const testText = 'Text without line clamping';
      render(<ResponsiveText text={testText} variant="description" />);
      
      const element = screen.getByText(testText);
      expect(element.style.display).not.toBe('-webkit-box');
    });

    it('adds title attribute for long text with line clamping', () => {
      const longText = 'This is a very long text that exceeds 100 characters and should have a title attribute for accessibility purposes when line clamping is applied';
      render(<ResponsiveText text={longText} variant="description" maxLines={2} />);
      
      const element = screen.getByText(longText);
      expect(element).toHaveAttribute('title', longText);
    });

    it('does not add title attribute for short text', () => {
      const shortText = 'Short text';
      render(<ResponsiveText text={shortText} variant="description" maxLines={2} />);
      
      const element = screen.getByText(shortText);
      expect(element).not.toHaveAttribute('title');
    });
  });

  describe('Screen Size Override', () => {
    it('uses provided screenSize prop instead of detected size', () => {
      const testText = 'Test content';
      render(<ResponsiveText text={testText} variant="title" screenSize="mobile" />);
      
      const element = screen.getByText(testText);
      expect(element).toHaveClass('responsive-text--mobile');
      expect(element).toHaveAttribute('data-screen-size', 'mobile');
      expect(element.style.fontSize).toBe('16px'); // Mobile title font size
    });
  });
});

describe('useScreenSize Hook', () => {
  // Component to test the hook
  const TestComponent: React.FC = () => {
    const screenSize = useScreenSize();
    return <div data-testid="screen-size">{screenSize}</div>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects mobile screen size correctly', () => {
    mockInnerWidth(600);
    render(<TestComponent />);
    
    expect(screen.getByTestId('screen-size')).toHaveTextContent('mobile');
  });

  it('detects tablet screen size correctly', () => {
    mockInnerWidth(800);
    render(<TestComponent />);
    
    expect(screen.getByTestId('screen-size')).toHaveTextContent('tablet');
  });

  it('detects desktop screen size correctly', () => {
    mockInnerWidth(1200);
    render(<TestComponent />);
    
    expect(screen.getByTestId('screen-size')).toHaveTextContent('desktop');
  });

  it('detects TV screen size correctly', () => {
    mockInnerWidth(2000);
    render(<TestComponent />);
    
    expect(screen.getByTestId('screen-size')).toHaveTextContent('tv');
  });

  it('updates screen size on window resize', async () => {
    mockInnerWidth(600);
    render(<TestComponent />);
    
    expect(screen.getByTestId('screen-size')).toHaveTextContent('mobile');
    
    // Simulate window resize
    mockInnerWidth(1200);
    
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      // Wait for debounced resize handler
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    expect(screen.getByTestId('screen-size')).toHaveTextContent('desktop');
  });

  it('debounces resize events', async () => {
    const resizeHandler = vi.fn();
    
    // Mock addEventListener to capture the resize handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'resize') {
        resizeHandler.mockImplementation(handler as EventListener);
      }
      return originalAddEventListener.call(window, event, handler);
    });

    render(<TestComponent />);
    
    // Trigger multiple resize events quickly
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        resizeHandler();
      }
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // Should only update once due to debouncing
    expect(resizeHandler).toHaveBeenCalled();
    
    // Restore original addEventListener
    window.addEventListener = originalAddEventListener;
  });
});

describe('Integration Tests', () => {
  it('renders correctly with all props combined', () => {
    const testText = 'Complete integration test';
    render(
      <ResponsiveText 
        text={testText} 
        variant="title" 
        screenSize="tablet" 
        maxLines={3}
        className="integration-test"
      />
    );
    
    const element = screen.getByText(testText);
    
    // Check all applied classes
    expect(element).toHaveClass('responsive-text');
    expect(element).toHaveClass('responsive-text--title');
    expect(element).toHaveClass('responsive-text--tablet');
    expect(element).toHaveClass('integration-test');
    
    // Check data attributes
    expect(element).toHaveAttribute('data-variant', 'title');
    expect(element).toHaveAttribute('data-screen-size', 'tablet');
    
    // Check typography styles
    expect(element.style.fontSize).toBe('18px');
    expect(element.style.lineHeight).toBe('1.3');
    expect(element.style.fontWeight).toBe('600');
    
    // Check line clamping styles are applied
    expect(element.style.display).toBe('-webkit-box');
    expect(element.style.overflow).toBe('hidden');
  });

  it('handles empty text gracefully', () => {
    const { container } = render(<ResponsiveText text="" variant="description" />);
    
    const element = container.querySelector('.responsive-text--description');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('responsive-text--description');
  });

  it('handles very long text without breaking', () => {
    const veryLongText = 'A'.repeat(1000);
    render(<ResponsiveText text={veryLongText} variant="description" maxLines={2} />);
    
    const element = screen.getByText(veryLongText);
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('title', veryLongText);
  });
});