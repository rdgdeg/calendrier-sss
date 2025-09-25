// React import removed as JSX transform handles it
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExpandableText from '../components/display/ExpandableText';

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe() {
    // Simulate immediate callback
    setTimeout(() => {
      this.callback([], this);
    }, 0);
  }
  
  unobserve() {}
  disconnect() {}
}

// Mock window.getComputedStyle
const mockGetComputedStyle = vi.fn(() => ({
  fontSize: '16px',
  fontFamily: 'Arial',
  fontWeight: '400',
  lineHeight: '1.5'
}));

describe('ExpandableText', () => {
  beforeEach(() => {
    // Setup mocks
    global.ResizeObserver = MockResizeObserver as any;
    Object.defineProperty(window, 'getComputedStyle', {
      value: mockGetComputedStyle,
      writable: true
    });
    
    // Mock element properties
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      value: 300,
      writable: true
    });
    
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      value: 100,
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders short text without expand button', () => {
      const shortText = 'This is a short text.';
      
      render(
        <ExpandableText
          text={shortText}
          variant="description"
          maxLines={3}
        />
      );

      expect(screen.getByText(shortText)).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders long text with expand button', async () => {
      const longText = 'This is a very long text that should definitely exceed the maximum number of lines and trigger the expandable functionality. '.repeat(5);
      
      // Mock scrollHeight to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200, // Simulate content that overflows
        writable: true
      });

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /voir plus/i })).toBeInTheDocument();
      });
    });

    it('expands and collapses text when button is clicked', async () => {
      const longText = 'This is a very long text. '.repeat(20);
      
      // Mock scrollHeight to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
        />
      );

      const expandButton = await screen.findByRole('button', { name: /voir plus/i });
      
      // Click to expand
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /voir moins/i })).toBeInTheDocument();
      });

      // Click to collapse
      const collapseButton = screen.getByRole('button', { name: /voir moins/i });
      fireEvent.click(collapseButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /voir plus/i })).toBeInTheDocument();
      });
    });
  });

  describe('Text Formatting', () => {
    it('handles HTML content properly', async () => {
      const htmlText = '<p>This is <strong>bold</strong> text with <a href="http://example.com">links</a></p>';
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={htmlText}
          variant="description"
          maxLines={2}
        />
      );

      // Should clean HTML and show clean text
      expect(screen.getByText(/This is bold text with links/)).toBeInTheDocument();
    });

    it('handles very long words correctly', async () => {
      const longWordText = 'This text contains a verylongwordthatshouldbebrokenproperly and normal words.';
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={longWordText}
          variant="description"
          maxLines={2}
          maxLength={50}
        />
      );

      // Text should be present (exact formatting may vary due to word breaking)
      expect(screen.getByText(/This text contains/)).toBeInTheDocument();
    });

    it('handles URLs and special content', async () => {
      const textWithUrls = 'Visit https://www.example.com for more information. Contact us at test@example.com or call +32 10 47 43 02.';
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={textWithUrls}
          variant="description"
          maxLines={2}
        />
      );

      expect(screen.getByText(/Visit https:\/\/www\.example\.com/)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to different screen sizes', () => {
      const text = 'This is test text for responsive behavior.';

      const { rerender } = render(
        <ExpandableText
          text={text}
          variant="description"
          screenSize="mobile"
          maxLines={2}
        />
      );

      expect(screen.getByText(text)).toHaveClass('expandable-text--mobile');

      rerender(
        <ExpandableText
          text={text}
          variant="description"
          screenSize="desktop"
          maxLines={2}
        />
      );

      expect(screen.getByText(text)).toHaveClass('expandable-text--desktop');
    });

    it('applies different max lengths for different variants', () => {
      const longText = 'This is a long text. '.repeat(10);

      const { rerender } = render(
        <ExpandableText
          text={longText}
          variant="title"
          maxLength={50}
        />
      );

      let textElement = screen.getByText(/This is a long text/);
      expect(textElement).toBeInTheDocument();

      rerender(
        <ExpandableText
          text={longText}
          variant="description"
          maxLength={100}
        />
      );

      textElement = screen.getByText(/This is a long text/);
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const longText = 'This is a very long text. '.repeat(10);
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
        />
      );

      const button = await screen.findByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-label', 'Voir plus');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-label', 'Voir moins');
      });
    });

    it('supports keyboard navigation', async () => {
      const longText = 'This is a very long text. '.repeat(10);
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
        />
      );

      const button = await screen.findByRole('button');
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter to activate
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onExpand and onCollapse callbacks', async () => {
      const onExpand = vi.fn();
      const onCollapse = vi.fn();
      const longText = 'This is a very long text. '.repeat(10);
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
          onExpand={onExpand}
          onCollapse={onCollapse}
        />
      );

      const button = await screen.findByRole('button');
      
      // Expand
      fireEvent.click(button);
      expect(onExpand).toHaveBeenCalledTimes(1);

      // Collapse
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /voir moins/i })).toBeInTheDocument();
      });
      
      fireEvent.click(button);
      expect(onCollapse).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty text', () => {
      render(
        <ExpandableText
          text=""
          variant="description"
          maxLines={3}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles null/undefined text gracefully', () => {
      render(
        <ExpandableText
          text={null as any}
          variant="description"
          maxLines={3}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles text with only whitespace', () => {
      render(
        <ExpandableText
          text="   \n\t   "
          variant="description"
          maxLines={3}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles maxLines of 0', () => {
      render(
        <ExpandableText
          text="Some text"
          variant="description"
          maxLines={0}
        />
      );

      expect(screen.getByText('Some text')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Custom Button Text', () => {
    it('uses custom expand/collapse button text', async () => {
      const longText = 'This is a very long text. '.repeat(10);
      
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
        writable: true
      });

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
          expandButtonText="Show More"
          collapseButtonText="Show Less"
        />
      );

      const button = await screen.findByRole('button', { name: /show more/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument();
      });
    });
  });
});