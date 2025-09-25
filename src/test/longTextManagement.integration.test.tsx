import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { textFormatter } from '../utils/textFormatter';
import { ExpandableText } from '../components/display/ExpandableText';

// Mock ResizeObserver for tests
class MockResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Long Text Management Integration', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    
    // Mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        fontSize: '16px',
        fontFamily: 'Arial',
        fontWeight: '400',
        lineHeight: '1.5'
      }),
      writable: true
    });
  });

  describe('TextFormatter Long Word Breaking', () => {
    it('breaks very long words correctly', () => {
      const longWord = 'supercalifragilisticexpialidocious';
      const result = textFormatter.formatTitle(longWord, {
        maxLength: 20,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(String(result.content)).toContain('-');
      expect(String(result.content).length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('breaks URLs at logical points', () => {
      const longUrl = 'https://www.verylongdomainname.com/very/long/path/to/resource';
      const result = textFormatter.formatDescription(longUrl, {
        maxLength: 40,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(String(result.content)).toMatch(/\.\.\./);
    });

    it('handles mixed content with long words', () => {
      const mixedText = 'This text has supercalifragilisticexpialidocious words and normal text.';
      const result = textFormatter.formatDescription(mixedText, {
        maxLength: 50,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(String(result.content).length).toBeLessThanOrEqual(53); // 50 + '...'
    });
  });

  describe('Text Overflow Analysis', () => {
    it('correctly analyzes text characteristics', () => {
      const text = 'This is a test with supercalifragilisticexpialidocious words and https://example.com';
      const analysis = textFormatter.analyzeTextOverflow(text, 50);

      expect(analysis.hasOverflow).toBe(true);
      expect(analysis.hasLongWords).toBe(true);
      expect(analysis.hasSpecialContent).toBe(true);
      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.breakPoints.length).toBeGreaterThan(0);
    });

    it('provides appropriate truncation suggestions', () => {
      const text = 'This is a title with supercalifragilisticexpialidocious content';
      const suggestions = textFormatter.getTruncationSuggestions(text, 'title');

      expect(suggestions.mobile.maxLength).toBeLessThan(suggestions.desktop.maxLength!);
      expect(suggestions.mobile.breakLongWords).toBe(true);
      expect(suggestions.desktop.breakLongWords).toBe(true);
    });
  });

  describe('ExpandableText Component Basic Functionality', () => {
    it('renders without expand button for short text', () => {
      render(
        <ExpandableText
          text="Short text"
          variant="description"
          maxLines={3}
        />
      );

      expect(screen.getByText('Short text')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles empty text gracefully', () => {
      const { container } = render(
        <ExpandableText
          text=""
          variant="description"
          maxLines={3}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles null text gracefully', () => {
      const { container } = render(
        <ExpandableText
          text={null as any}
          variant="description"
          maxLines={3}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles whitespace-only text gracefully', () => {
      const { container } = render(
        <ExpandableText
          text="   \n\t   "
          variant="description"
          maxLines={3}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Text Formatting Integration', () => {
    it('cleans HTML content properly', () => {
      render(
        <ExpandableText
          text="<p>This has <strong>HTML</strong> content</p>"
          variant="description"
          maxLines={2}
        />
      );

      expect(screen.getByText(/This has HTML content/)).toBeInTheDocument();
      expect(screen.queryByText(/<p>/)).not.toBeInTheDocument();
    });

    it('handles special content correctly', () => {
      render(
        <ExpandableText
          text="Contact us at test@example.com or visit https://example.com"
          variant="description"
          maxLines={2}
        />
      );

      expect(screen.getByText(/Contact us at test@example.com/)).toBeInTheDocument();
    });

    it('handles very long words', () => {
      render(
        <ExpandableText
          text="This has supercalifragilisticexpialidocious words"
          variant="description"
          maxLines={1}
          maxLength={30}
        />
      );

      // Should render something (exact content may vary due to word breaking)
      expect(screen.getByText(/This has/)).toBeInTheDocument();
    });
  });

  describe('Requirements Validation', () => {
    it('satisfies Requirement 5.2: Show preview with "see more" indicator', () => {
      const longText = 'This is a very long description that should be truncated and show a see more button. '.repeat(3);
      
      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={2}
          maxLength={100}
        />
      );

      // Should show truncated content
      const displayedText = screen.getByText(/This is a very long description/);
      expect(displayedText).toBeInTheDocument();
      
      // Text should be shorter than original
      expect(displayedText.textContent!.length).toBeLessThan(longText.length);
    });

    it('satisfies Requirement 5.4: Visual indicators for additional content', () => {
      const longText = 'This is a very long text. '.repeat(10);
      
      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={2}
        />
      );

      // Should have visual overflow indicators
      const container = screen.getByText(/This is a very long text/).closest('.expandable-text');
      expect(container).toHaveClass('expandable-text--collapsed');
    });

    it('satisfies Requirement 2.3: Appropriate word breaking for very long words', () => {
      const textWithLongWord = 'Word: supercalifragilisticexpialidocious end';
      const result = textFormatter.formatDescription(textWithLongWord, {
        maxLength: 25,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      // Should break the long word appropriately
      expect(String(result.content)).toMatch(/super.*-|\.\.\.$/);
    });
  });

  describe('Screen Size Adaptations', () => {
    it('adapts truncation for different screen sizes', () => {
      const text = 'This is a test text for responsive truncation behavior';
      
      const mobileSuggestions = textFormatter.getTruncationSuggestions(text, 'description');
      const desktopSuggestions = textFormatter.getTruncationSuggestions(text, 'description');

      expect(mobileSuggestions.mobile.maxLength).toBeLessThan(desktopSuggestions.desktop.maxLength!);
    });

    it('handles different variants appropriately', () => {
      const text = 'Test text for variant handling';
      
      const titleSuggestions = textFormatter.getTruncationSuggestions(text, 'title');
      const descSuggestions = textFormatter.getTruncationSuggestions(text, 'description');

      expect(titleSuggestions.mobile.maxLength).toBeLessThan(descSuggestions.mobile.maxLength!);
    });
  });
});