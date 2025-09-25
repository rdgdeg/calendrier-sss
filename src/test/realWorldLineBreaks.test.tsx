/**
 * Test for real-world custom line break scenarios
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { textFormatter } from '../utils/textFormatter';
import { CalendarEvent } from '../types';

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Real-World Custom Line Breaks', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    vi.clearAllMocks();
  });

  it('should handle the exact content from the screenshot', () => {
    const realWorldEvent: CalendarEvent = {
      id: 'real-world-test',
      title: 'IREC Seminar',
      description: `Prof. Élise Belaidi
Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1
Faculté de Médecine et de Pharmacie***
"Dual effect of HIF-1 in myocardial infarction"
Friday September 26th, 12:00h, CORI***
Présentation de l'oratrice
Élise Belaidi est Professeure titulaire à l'Institut of Pharmaceutical and Biological Sciences, Université Lyon 1, France. Ses recherches portent principalement sur les mécanismes pathophysiologiques induits par l'hypoxie. Elle s'intéresse tout particulièrement aux effets cardiovasculaires délétères résultant de l'hypoxie chronique intermittente et l'activation du système nerveux sympathique.***
Major Publications
• Belaidi et al. Major Role for Hypoxia Inducible Factor-1 and the Endothelin System in Promoting myocardial infarction and hypertension in an animal model of sleep apnea. Journal of the American College of Cardiology (2009). DOI: 10.1016/j.jacc.2008.12.050
• Moulin et al., Belaidi. Metformin protects the heart against chronic intermittent hypoxia-induced cardiovascular dysfunction. FEBS Journal (2025). DOI: 10.1111/febs.70110***
Contacts
• Alice Marino (alice.marino@uclouvain.be)
• Luc Bertrand (luc.bertrand@uclouvain.be)`,
      start: new Date('2025-09-26T12:00:00'),
      end: new Date('2025-09-26T13:30:00'),
      location: 'salle CORI',
      source: 'outlook',
      allDay: false,
      category: { id: 'seminar', name: 'Seminar', color: '#007bff', source: 'outlook' },
      color: '#007bff'
    };

    render(
      <EventModal
        event={realWorldEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should display all sections with proper line breaks
    expect(screen.getByText(/Prof\. Élise Belaidi/)).toBeInTheDocument();
    expect(screen.getByText(/Dual effect of HIF-1 in myocardial infarction/)).toBeInTheDocument();
    expect(screen.getByText(/Friday September 26th, 12:00h, CORI/)).toBeInTheDocument();
    expect(screen.getByText(/Présentation de l'oratrice/)).toBeInTheDocument();
    expect(screen.getByText(/Major Publications/)).toBeInTheDocument();
    expect(screen.getByText(/Contacts/)).toBeInTheDocument();
    expect(screen.getByText(/Alice Marino/)).toBeInTheDocument();
    expect(screen.getByText(/Luc Bertrand/)).toBeInTheDocument();
  });

  it('should process the content correctly with textFormatter', () => {
    const originalText = `Prof. Élise Belaidi
Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1
Faculté de Médecine et de Pharmacie***
"Dual effect of HIF-1 in myocardial infarction"
Friday September 26th, 12:00h, CORI***
Présentation de l'oratrice`;

    // Test the processing pipeline
    const cleaned = textFormatter.cleanHtmlContent(originalText);
    const withBreaks = textFormatter.processCustomLineBreaks(cleaned, '***');

    // Should contain <br> tags where *** was
    expect(withBreaks).toContain('<br><br>');
    
    // Should have the right number of sections
    const sections = withBreaks.split('<br><br>');
    expect(sections).toHaveLength(3);
    
    // First section should contain the professor info
    expect(sections[0]).toContain('Prof. Élise Belaidi');
    expect(sections[0]).toContain('Faculté de Médecine et de Pharmacie');
    
    // Second section should contain the title and event info
    expect(sections[1]).toContain('Dual effect of HIF-1 in myocardial infarction');
    expect(sections[1]).toContain('Friday September 26th, 12:00h, CORI');
    
    // Third section should contain the presentation info
    expect(sections[2]).toContain('Présentation de l\'oratrice');
  });

  it('should handle HTML content mixed with custom breaks', () => {
    const htmlContent = `<p>Prof. Élise Belaidi</p>
<p>Institut <strong>NeuroMyoGène</strong> (INMG) CNRS 5261</p>***
<p>"Dual effect of HIF-1 in myocardial infarction"</p>***
<p>Présentation de l'oratrice</p>`;

    const cleaned = textFormatter.cleanHtmlContent(htmlContent);
    const withBreaks = textFormatter.processCustomLineBreaks(cleaned, '***');

    // Should clean HTML but preserve our custom breaks
    expect(withBreaks).not.toContain('<p>');
    expect(withBreaks).not.toContain('<strong>');
    expect(withBreaks).toContain('<br><br>');
    expect(withBreaks).toContain('Prof. Élise Belaidi');
    expect(withBreaks).toContain('NeuroMyoGène');
  });

  it('should work in the complete EventModal rendering pipeline', () => {
    const testEvent: CalendarEvent = {
      id: 'pipeline-test',
      title: 'Pipeline Test',
      description: `Section 1: Introduction***Section 2: Main content with details***Section 3: Conclusion and contacts`,
      start: new Date('2025-09-26T12:00:00'),
      end: new Date('2025-09-26T13:30:00'),
      location: 'Test Room',
      source: 'outlook',
      allDay: false,
      category: { id: 'test', name: 'Test', color: '#007bff', source: 'outlook' },
      color: '#007bff'
    };

    const { container } = render(
      <EventModal
        event={testEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Check that the content is properly formatted in the DOM
    const descriptionContent = container.querySelector('.event-description-modal');
    expect(descriptionContent).toBeInTheDocument();
    
    // Should contain <br> tags for line breaks
    expect(descriptionContent?.innerHTML).toContain('<br>');
    
    // Should display all sections
    expect(screen.getByText(/Section 1: Introduction/)).toBeInTheDocument();
    expect(screen.getByText(/Section 2: Main content/)).toBeInTheDocument();
    expect(screen.getByText(/Section 3: Conclusion/)).toBeInTheDocument();
  });
});