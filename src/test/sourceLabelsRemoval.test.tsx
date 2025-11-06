import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EventCard } from '../components/display/EventCard';
import { EventModal } from '../components/EventModal';
import { SearchResults } from '../components/SearchResults';
import { CalendarEvent } from '../types';

const mockEvent: CalendarEvent = {
  id: 'test-no-source-labels',
  title: 'Test Event Without Source Labels',
  description: 'Test description',
  start: new Date('2025-12-05T10:00:00'),
  end: new Date('2025-12-05T16:00:00'),
  location: 'Test Location',
  allDay: false,
  source: 'icloud' as const,
  color: '#ff6b6b',
  category: {
    id: 'test',
    name: 'TEST',
    color: '#ff6b6b',
    source: 'icloud' as const
  }
};

describe('Source Labels Removal', () => {
  it('should not display source labels in EventCard', () => {
    const { container } = render(<EventCard event={mockEvent} />);
    
    // Should not contain source labels
    expect(screen.queryByText('de Duve')).not.toBeInTheDocument();
    expect(screen.queryByText('SSS')).not.toBeInTheDocument();
    expect(screen.queryByText('📧 SSS')).not.toBeInTheDocument();
    
    // Should not have source-related CSS classes
    expect(container.querySelector('.event-source')).not.toBeInTheDocument();
    expect(container.querySelector('.event-source-text')).not.toBeInTheDocument();
  });

  it('should not display source labels in EventModal', () => {
    const modalProps = {
      event: mockEvent,
      isOpen: true,
      onClose: vi.fn(),
    };

    const { container } = render(<EventModal {...modalProps} />);
    
    // Should not contain source section
    expect(screen.queryByText('Source')).not.toBeInTheDocument();
    expect(screen.queryByText('de Duve')).not.toBeInTheDocument();
    expect(screen.queryByText('SSS')).not.toBeInTheDocument();
    
    // Should not have source detail row
    const sourceIcon = container.querySelector('[title*="Source"]');
    expect(sourceIcon).not.toBeInTheDocument();
  });

  it('should not display source labels in SearchResults', () => {
    const searchProps = {
      searchResults: [mockEvent],
      searchQuery: 'test',
      isVisible: true,
      onEventClick: vi.fn(),
      onExportToGoogle: vi.fn(),
      onExportToOutlook: vi.fn(),
      onExportToICS: vi.fn()
    };

    const { container } = render(<SearchResults {...searchProps} />);
    
    // Should not contain source badges
    expect(screen.queryByText('de Duve')).not.toBeInTheDocument();
    expect(screen.queryByText('📧 SSS')).not.toBeInTheDocument();
    
    // Should not have source-related CSS classes
    expect(container.querySelector('.search-result-source')).not.toBeInTheDocument();
    expect(container.querySelector('.source-badge')).not.toBeInTheDocument();
  });

  it('should work with both icloud and outlook events without showing source', () => {
    const icloudEvent = { ...mockEvent, source: 'icloud' as const };
    const outlookEvent = { ...mockEvent, id: 'test-2', source: 'outlook' as const };

    // Test EventCard with both sources
    const { container: icloudContainer } = render(<EventCard event={icloudEvent} />);
    const { container: outlookContainer } = render(<EventCard event={outlookEvent} />);

    // Neither should show source labels
    expect(icloudContainer.textContent).not.toContain('de Duve');
    expect(outlookContainer.textContent).not.toContain('SSS');
  });

  it('should handle events from different sources identically', () => {
    const icloudEvent = { ...mockEvent, source: 'icloud' as const };
    const outlookEvent = { ...mockEvent, id: 'test-2', source: 'outlook' as const };

    const { container: icloudContainer } = render(<EventCard event={icloudEvent} />);
    const { container: outlookContainer } = render(<EventCard event={outlookEvent} />);

    // Both should have similar structure without source differentiation
    const icloudCard = icloudContainer.querySelector('.event-card');
    const outlookCard = outlookContainer.querySelector('.event-card');

    expect(icloudCard).toBeInTheDocument();
    expect(outlookCard).toBeInTheDocument();

    // Should not have source-specific classes in the main structure
    expect(icloudCard?.className).not.toContain('icloud');
    expect(outlookCard?.className).not.toContain('outlook');
  });
});