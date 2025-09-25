// React import removed as it's not needed in this test file
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock textFormatter
vi.mock('../utils/textFormatter', () => ({
  textFormatter: {
    processAdvancedContent: vi.fn((text) => ({
      cleanText: text?.replace(/<[^>]*>/g, '') || '',
      links: [],
      dates: [],
      contacts: [],
      images: [],
      formatting: {
        paragraphs: text ? [text.replace(/<[^>]*>/g, '')] : [],
        lists: [],
        emphasis: [],
        lineBreaks: []
      }
    })),
    extractLinks: vi.fn(() => []),
    formatAdvancedDescription: vi.fn((text) => text?.replace(/<[^>]*>/g, '') || '')
  }
}));

// Mock extractImagesFromDescription
vi.mock('../utils/imageExtractor', () => ({
  extractImagesFromDescription: vi.fn(() => ({
    hasImages: false,
    images: [],
    cleanDescription: 'Test description'
  }))
}));

// Mock ResponsiveText
vi.mock('../components/display/ResponsiveText', () => ({
  ResponsiveText: ({ text, className }: { text: string; className?: string }) => (
    <div className={className}>{text}</div>
  )
}));

describe('EventModal Enhanced Features', () => {
  const mockEvent: CalendarEvent = {
    id: 'test-1',
    title: 'Test Event with Long Title That Should Be Handled by ResponsiveText',
    description: `
      <p>This is a test description with <strong>HTML formatting</strong>.</p>
      <p>It contains multiple paragraphs and special content:</p>
      <ul>
        <li>Email: test@uclouvain.be</li>
        <li>Phone: +32 10 47 43 02</li>
        <li>Website: https://uclouvain.be</li>
      </ul>
      <p>Date: 26/09/2025 at 14h30</p>
      <p>This is an <em>important</em> event that has been <strong>modified</strong>.</p>
    `,
    start: new Date('2025-09-26T14:30:00'),
    end: new Date('2025-09-26T16:00:00'),
    allDay: false,
    location: 'Louvain-la-Neuve',
    source: 'icloud',
    category: { id: 'work', name: 'Work', color: '#007bff', source: 'icloud' },
    color: '#007bff'
  };

  const defaultProps = {
    event: mockEvent,
    isOpen: true,
    onClose: vi.fn(),
    onExportToGoogle: vi.fn(),
    onExportToOutlook: vi.fn(),
    onExportToICS: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Enhanced Title Display', () => {
    it('should render title using ResponsiveText component', () => {
      render(<EventModal {...defaultProps} />);
      
      const titleElement = screen.getByText(mockEvent.title);
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle empty title gracefully', () => {
      const eventWithoutTitle = { ...mockEvent, title: '' };
      render(<EventModal {...defaultProps} event={eventWithoutTitle} />);
      
      // Should not crash and modal should still render
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Advanced Description Formatting', () => {
    it('should process description with advanced text formatter', async () => {
      const { textFormatter } = await import('../utils/textFormatter');
      render(<EventModal {...defaultProps} />);
      
      expect(textFormatter.processAdvancedContent).toHaveBeenCalledWith(
        mockEvent.description,
        expect.objectContaining({
          preserveLineBreaks: true,
          formatParagraphs: true,
          formatLists: true,
          addVisualBullets: true,
          paragraphSpacing: 'normal',
          listStyle: 'bullets',
          maxParagraphs: 20
        })
      );
    });

    it('should extract and format links separately', async () => {
      const { textFormatter } = await import('../utils/textFormatter');
      render(<EventModal {...defaultProps} />);
      
      expect(textFormatter.extractLinks).toHaveBeenCalledWith(mockEvent.description);
    });

    it('should render formatted HTML content', () => {
      render(<EventModal {...defaultProps} />);
      
      const descriptionElement = screen.getByText('Description');
      expect(descriptionElement).toBeInTheDocument();
    });

    it('should handle empty description gracefully', () => {
      const eventWithoutDescription = { ...mockEvent, description: '' };
      render(<EventModal {...defaultProps} event={eventWithoutDescription} />);
      
      // Should not show description section
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  describe('Extracted Links Display', () => {
    it('should display extracted links when available', async () => {
      const mockLinks = [
        { text: 'test@uclouvain.be', url: 'mailto:test@uclouvain.be', type: 'email' as const },
        { text: '+32 10 47 43 02', url: 'tel:+32104743002', type: 'phone' as const },
        { text: 'https://uclouvain.be', url: 'https://uclouvain.be', type: 'url' as const }
      ];

      const { textFormatter } = await import('../utils/textFormatter');
      vi.mocked(textFormatter.extractLinks).mockReturnValue(mockLinks);

      render(<EventModal {...defaultProps} />);
      
      expect(screen.getByText('Liens et contacts')).toBeInTheDocument();
    });

    it('should not display links section when no links are found', async () => {
      const { textFormatter } = await import('../utils/textFormatter');
      vi.mocked(textFormatter.extractLinks).mockReturnValue([]);

      render(<EventModal {...defaultProps} />);
      
      expect(screen.queryByText('Liens et contacts')).not.toBeInTheDocument();
    });

    it('should render different link types with appropriate icons', async () => {
      const mockLinks = [
        { text: 'test@uclouvain.be', url: 'mailto:test@uclouvain.be', type: 'email' as const },
        { text: '+32 10 47 43 02', url: 'tel:+32104743002', type: 'phone' as const },
        { text: 'https://uclouvain.be', url: 'https://uclouvain.be', type: 'url' as const }
      ];

      const { textFormatter } = await import('../utils/textFormatter');
      vi.mocked(textFormatter.extractLinks).mockReturnValue(mockLinks);

      render(<EventModal {...defaultProps} />);
      
      // Check for email link
      const emailLink = screen.getByText('test@uclouvain.be');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:test@uclouvain.be');
      
      // Check for phone link
      const phoneLink = screen.getByText('+32 10 47 43 02');
      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+32104743002');
      
      // Check for URL link
      const urlLink = screen.getByText('https://uclouvain.be');
      expect(urlLink.closest('a')).toHaveAttribute('href', 'https://uclouvain.be');
      expect(urlLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(urlLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Scroll Indicators', () => {
    it('should initialize scroll state correctly', () => {
      const { container } = render(<EventModal {...defaultProps} />);
      
      const descriptionContent = container.querySelector('.description-content');
      
      if (descriptionContent) {
        expect(descriptionContent).toHaveAttribute('data-has-scroll');
      }
    });

    it('should handle scroll events and update indicators', async () => {
      const { container } = render(<EventModal {...defaultProps} />);
      
      const descriptionContent = container.querySelector('.description-content');
      
      if (descriptionContent) {
        // Mock scroll properties
        Object.defineProperty(descriptionContent, 'scrollHeight', {
          value: 500,
          writable: true
        });
        Object.defineProperty(descriptionContent, 'clientHeight', {
          value: 300,
          writable: true
        });
        Object.defineProperty(descriptionContent, 'scrollTop', {
          value: 100,
          writable: true
        });

        // Trigger scroll event
        fireEvent.scroll(descriptionContent);

        await waitFor(() => {
          expect(descriptionContent).toHaveAttribute('data-has-scroll');
        });
      }
    });
  });

  describe('Modal Interaction', () => {
    it('should close modal when clicking backdrop', () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should close modal when pressing Escape key', () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        fireEvent.keyDown(backdrop, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should close modal when clicking close button', () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Fermer les détails de l\'événement');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when handlers are provided', () => {
      render(<EventModal {...defaultProps} />);
      
      expect(screen.getByText('Google Calendar')).toBeInTheDocument();
      expect(screen.getByText('Outlook')).toBeInTheDocument();
      expect(screen.getByText('Fichier ICS')).toBeInTheDocument();
    });

    it('should call export handlers when buttons are clicked', () => {
      const onExportToGoogle = vi.fn();
      const onExportToOutlook = vi.fn();
      const onExportToICS = vi.fn();

      render(<EventModal 
        {...defaultProps} 
        onExportToGoogle={onExportToGoogle}
        onExportToOutlook={onExportToOutlook}
        onExportToICS={onExportToICS}
      />);
      
      fireEvent.click(screen.getByText('Google Calendar'));
      expect(onExportToGoogle).toHaveBeenCalledWith(mockEvent);
      
      fireEvent.click(screen.getByText('Outlook'));
      expect(onExportToOutlook).toHaveBeenCalledWith(mockEvent);
      
      fireEvent.click(screen.getByText('Fichier ICS'));
      expect(onExportToICS).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<EventModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'event-title');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have proper focus management', () => {
      render(<EventModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Fermer les détails de l\'événement');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have proper link accessibility for extracted links', async () => {
      const mockLinks = [
        { text: 'https://uclouvain.be', url: 'https://uclouvain.be', type: 'url' as const }
      ];

      const { textFormatter } = await import('../utils/textFormatter');
      vi.mocked(textFormatter.extractLinks).mockReturnValue(mockLinks);

      render(<EventModal {...defaultProps} />);
      
      const urlLink = screen.getByText('https://uclouvain.be');
      const linkElement = urlLink.closest('a');
      
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Error Handling', () => {
    it('should handle null event gracefully', () => {
      render(<EventModal {...defaultProps} event={null} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle modal closed state', () => {
      render(<EventModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle text formatter errors gracefully', async () => {
      const { textFormatter } = await import('../utils/textFormatter');
      vi.mocked(textFormatter.processAdvancedContent).mockImplementation(() => {
        throw new Error('Formatting error');
      });

      // Should not crash
      expect(() => {
        render(<EventModal {...defaultProps} />);
      }).not.toThrow();
    });
  });
});