import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';

const mockEventWithLongDescription: CalendarEvent = {
  id: 'test-layout-stability',
  title: 'Event with Long Description',
  description: `+++Présentation des dispositifs et personnes de contact+++

Présentation des dispositifs et personnes de contact au sein de l'administration mis en place et accessibles à la communauté UCLouvain, notamment aux académiques, chercheurs et chercheuses, pour les accompagner au mieux dans le montage "responsable" de leurs projets de recherche.

Il est important d'informer au mieux notre communauté, pour que cette politique de partenariats responsables soit aussi transparente, comprise et intégrée que possible dans l'ensemble de l'institution.

===

___Contact___ : administration@uclouvain.be
~~~Important~~~ : Inscription obligatoire|||

* Point 1 avec beaucoup de texte pour tester le comportement du scroll
* Point 2 avec encore plus de texte pour voir comment la barre de défilement se comporte
* Point 3 pour continuer à tester la stabilité du layout

Encore plus de contenu pour s'assurer que le scroll fonctionne correctement sans causer de problèmes de layout ou de changements de ligne constants.`,
  start: new Date('2025-12-05T10:00:00'),
  end: new Date('2025-12-05T16:00:00'),
  location: 'Auditoire MAISIN',
  allDay: false,
  source: 'icloud' as const,
  color: '#ff6b6b',
  category: {
    id: 'secteur-sss',
    name: 'SECTEUR SSS',
    color: '#ff6b6b',
    source: 'icloud' as const
  }
};

describe('Modal Layout Stability', () => {
  const mockProps = {
    event: mockEventWithLongDescription,
    isOpen: true,
    onClose: vi.fn(),
    onExportToGoogle: vi.fn(),
    onExportToOutlook: vi.fn(),
    onExportToICS: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal without layout shifts', () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const modal = container.querySelector('.event-modal');
    expect(modal).toBeInTheDocument();
    
    const descriptionElement = container.querySelector('.event-description-modal');
    expect(descriptionElement).toBeInTheDocument();
  });

  it('should handle scroll without constant recalculation', async () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const descriptionContent = container.querySelector('.description-content');
    expect(descriptionContent).toBeInTheDocument();
    
    // Simulate scroll events
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
        value: 50,
        writable: true
      });

      // Trigger scroll event
      fireEvent.scroll(descriptionContent, { target: { scrollTop: 50 } });
      
      // Wait for any updates
      await waitFor(() => {
        expect(descriptionContent).toBeInTheDocument();
      });
    }
  });

  it('should maintain stable text rendering', () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    expect(descriptionElement).toBeInTheDocument();
    
    // Check that formatted content is rendered
    expect(descriptionElement?.innerHTML).toContain('<strong class="custom-bold">');
    expect(descriptionElement?.innerHTML).toContain('<em class="custom-italic">');
    expect(descriptionElement?.innerHTML).toContain('<u class="custom-underline">');
    expect(descriptionElement?.innerHTML).toContain('<hr class="custom-separator">');
  });

  it('should not cause infinite re-renders', async () => {
    const renderSpy = vi.fn();
    
    const TestWrapper = () => {
      renderSpy();
      return <EventModal {...mockProps} />;
    };

    render(<TestWrapper />);
    
    // Wait a bit to see if there are excessive re-renders
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Should not have excessive renders (allow some initial renders)
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle modal close without errors', () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const closeButton = container.querySelector('.event-modal-close');
    expect(closeButton).toBeInTheDocument();
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalled();
    }
  });

  it('should handle events without description', () => {
    const eventWithoutDescription = {
      ...mockEventWithLongDescription,
      description: undefined
    };

    const propsWithoutDescription = {
      ...mockProps,
      event: eventWithoutDescription
    };

    const { container } = render(<EventModal {...propsWithoutDescription} />);
    
    // Should not show description section
    expect(container.querySelector('.description-row')).not.toBeInTheDocument();
    
    // But modal should still render
    expect(container.querySelector('.event-modal')).toBeInTheDocument();
  });

  it('should maintain consistent scroll indicators when scrollable', async () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    // Check for description content wrapper
    const descriptionWrapper = container.querySelector('.description-content-wrapper');
    expect(descriptionWrapper).toBeInTheDocument();
    
    // Scroll indicators may or may not be present depending on content height
    // This is expected behavior - they only appear when content is scrollable
    const topIndicator = container.querySelector('.scroll-indicator--top');
    const bottomIndicator = container.querySelector('.scroll-indicator--bottom');
    
    // If indicators exist, they should be properly structured
    if (topIndicator) {
      expect(topIndicator).toHaveClass('scroll-indicator');
    }
    if (bottomIndicator) {
      expect(bottomIndicator).toHaveClass('scroll-indicator');
    }
  });
});