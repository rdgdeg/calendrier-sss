import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { DisplayView } from '../components/views/DisplayView';
import { CalendarEvent } from '../types';

// Visual consistency test utilities
interface VisualMetrics {
  colorContrast: number;
  fontSizeConsistency: boolean;
  spacingConsistency: boolean;
  alignmentConsistency: boolean;
  brandingConsistency: boolean;
}

class VisualConsistencyValidator {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  validateColorContrast(): number {
    const elements = this.container.querySelectorAll('*');
    let minContrast = Infinity;

    elements.forEach(element => {
      const styles = getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;

      if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(backgroundColor, color);
        if (contrast < minContrast) {
          minContrast = contrast;
        }
      }
    });

    return minContrast === Infinity ? 21 : minContrast; // Return max contrast if no elements found
  }

  validateFontSizeConsistency(): boolean {
    const titleElements = this.container.querySelectorAll('.event-title, .display-title');
    const bodyElements = this.container.querySelectorAll('.event-description, .event-location');
    const metaElements = this.container.querySelectorAll('.event-date, .event-time, .event-source');

    // Check that similar elements have consistent font sizes
    const titleSizes = Array.from(titleElements).map(el => getComputedStyle(el).fontSize);
    const bodySizes = Array.from(bodyElements).map(el => getComputedStyle(el).fontSize);
    const metaSizes = Array.from(metaElements).map(el => getComputedStyle(el).fontSize);

    const isConsistent = (sizes: string[]) => {
      if (sizes.length <= 1) return true;
      const firstSize = sizes[0];
      return sizes.every(size => size === firstSize);
    };

    return isConsistent(titleSizes) && isConsistent(bodySizes) && isConsistent(metaSizes);
  }

  validateSpacingConsistency(): boolean {
    const cards = this.container.querySelectorAll('.event-card, .event-card-basic');
    const paddings = Array.from(cards).map(card => getComputedStyle(card).padding);
    const margins = Array.from(cards).map(card => getComputedStyle(card).margin);

    // Check that all cards have consistent padding and margins
    const firstPadding = paddings[0];
    const firstMargin = margins[0];

    return paddings.every(p => p === firstPadding) && margins.every(m => m === firstMargin);
  }

  validateAlignmentConsistency(): boolean {
    const gridContainers = this.container.querySelectorAll('.events-grid-container');
    const headers = this.container.querySelectorAll('.event-card-header');

    // Check grid alignment
    const gridAlignments = Array.from(gridContainers).map(grid => {
      const styles = getComputedStyle(grid);
      return {
        display: styles.display,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent
      };
    });

    // Check header alignment
    const headerAlignments = Array.from(headers).map(header => {
      const styles = getComputedStyle(header);
      return {
        display: styles.display,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent
      };
    });

    // All grids should have consistent alignment
    const firstGridAlignment = gridAlignments[0];
    const gridConsistent = gridAlignments.every(alignment => 
      alignment.display === firstGridAlignment?.display &&
      alignment.alignItems === firstGridAlignment?.alignItems
    );

    // All headers should have consistent alignment
    const firstHeaderAlignment = headerAlignments[0];
    const headerConsistent = headerAlignments.every(alignment =>
      alignment.display === firstHeaderAlignment?.display &&
      alignment.alignItems === firstHeaderAlignment?.alignItems
    );

    return gridConsistent && headerConsistent;
  }

  validateBrandingConsistency(): boolean {
    // Check UCLouvain color usage
    const primaryElements = this.container.querySelectorAll('.display-header, .event-date, .current-time');
    const brandColors = Array.from(primaryElements).map(el => {
      const styles = getComputedStyle(el);
      return styles.color || styles.backgroundColor;
    });

    // Should use consistent UCLouvain colors
    const hasUCLBlue = brandColors.some(color => 
      color.includes('rgb(0, 63, 127)') || color.includes('#003f7f')
    );

    // Check for consistent border radius
    const cards = this.container.querySelectorAll('.event-card, .current-time-display');
    const borderRadii = Array.from(cards).map(card => getComputedStyle(card).borderRadius);
    const consistentRadius = borderRadii.every(radius => radius === borderRadii[0]);

    return hasUCLBlue && consistentRadius;
  }

  private calculateContrast(backgroundColor: string, textColor: string): number {
    // Simplified contrast calculation
    const bgLuminance = this.getLuminance(backgroundColor);
    const textLuminance = this.getLuminance(textColor);
    
    const lighter = Math.max(bgLuminance, textLuminance);
    const darker = Math.min(bgLuminance, textLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: string): number {
    // Simplified luminance calculation
    const rgb = this.parseColor(color);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private parseColor(color: string): [number, number, number] | null {
    // Simple RGB color parser
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
  }

  getMetrics(): VisualMetrics {
    return {
      colorContrast: this.validateColorContrast(),
      fontSizeConsistency: this.validateFontSizeConsistency(),
      spacingConsistency: this.validateSpacingConsistency(),
      alignmentConsistency: this.validateAlignmentConsistency(),
      brandingConsistency: this.validateBrandingConsistency()
    };
  }
}

// Test data
const createTestEvent = (id: string, title: string, daysFromNow: number = 0): CalendarEvent => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysFromNow);
  startDate.setHours(10, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(11, 0, 0, 0);

  return {
    id,
    title,
    start: startDate,
    end: endDate,
    allDay: false,
    description: `Description for ${title}`,
    location: `Location for ${title}`,
    source: 'test-source',
    color: '#007AFF',
    textColor: '#FFFFFF'
  };
};

const testScenarios = {
  empty: [],
  single: [createTestEvent('1', 'Single Event', 1)],
  multiple: [
    createTestEvent('1', 'Event One', 1),
    createTestEvent('2', 'Event Two', 2),
    createTestEvent('3', 'Event Three', 3),
    createTestEvent('4', 'Event Four', 4),
    createTestEvent('5', 'Event Five', 5),
    createTestEvent('6', 'Event Six', 6)
  ]
};

describe('Visual Consistency Validation', () => {
  let mockCurrentDate: Date;

  beforeEach(() => {
    mockCurrentDate = new Date('2024-01-15T09:00:00Z');
    
    // Add CSS custom properties for testing
    document.documentElement.style.setProperty('--ucl-primary', '#003f7f');
    document.documentElement.style.setProperty('--ucl-white', '#ffffff');
    document.documentElement.style.setProperty('--ucl-gray-700', '#495057');
    document.documentElement.style.setProperty('--ucl-text-lg', '1.125rem');
    document.documentElement.style.setProperty('--ucl-text-base', '1rem');
    document.documentElement.style.setProperty('--ucl-text-sm', '0.875rem');
  });

  describe('Color Consistency', () => {
    it('should maintain WCAG AA contrast ratios across all states', () => {
      const scenarios = Object.entries(testScenarios);
      
      scenarios.forEach(([scenarioName, events]) => {
        const { container } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        const validator = new VisualConsistencyValidator(container);
        
        const metrics = validator.getMetrics();
        
        // WCAG AA requires minimum 4.5:1 contrast for normal text
        expect(metrics.colorContrast).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should use consistent UCLouvain brand colors', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      const validator = new VisualConsistencyValidator(container);
      
      const metrics = validator.getMetrics();
      expect(metrics.brandingConsistency).toBe(true);
    });

    it('should maintain color consistency between different event counts', () => {
      const colorMaps = new Map<string, string[]>();
      
      Object.entries(testScenarios).forEach(([scenarioName, events]) => {
        const { container } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        
        // Collect colors from key elements
        const header = container.querySelector('.display-header');
        const eventDates = container.querySelectorAll('.event-date');
        const eventTitles = container.querySelectorAll('.event-title');
        
        const colors: string[] = [];
        if (header) colors.push(getComputedStyle(header).backgroundColor);
        eventDates.forEach(el => colors.push(getComputedStyle(el).color));
        eventTitles.forEach(el => colors.push(getComputedStyle(el).color));
        
        colorMaps.set(scenarioName, colors);
      });

      // Compare color consistency across scenarios
      const colorArrays = Array.from(colorMaps.values());
      const headerColors = colorArrays.map(colors => colors[0]).filter(Boolean);
      
      // All headers should have the same background color
      const firstHeaderColor = headerColors[0];
      expect(headerColors.every(color => color === firstHeaderColor)).toBe(true);
    });
  });

  describe('Typography Consistency', () => {
    it('should maintain consistent font sizes across all states', () => {
      Object.entries(testScenarios).forEach(([scenarioName, events]) => {
        const { container } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        const validator = new VisualConsistencyValidator(container);
        
        const metrics = validator.getMetrics();
        expect(metrics.fontSizeConsistency).toBe(true);
      });
    });

    it('should maintain proper typography hierarchy', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      // Check font size hierarchy
      const displayTitle = container.querySelector('.display-title');
      const eventTitles = container.querySelectorAll('.event-title');
      const eventDescriptions = container.querySelectorAll('.event-description');
      const eventMeta = container.querySelectorAll('.event-date, .event-time');
      
      if (displayTitle && eventTitles.length > 0) {
        const displayTitleSize = parseFloat(getComputedStyle(displayTitle).fontSize);
        const eventTitleSize = parseFloat(getComputedStyle(eventTitles[0]).fontSize);
        
        // Display title should be larger than event titles
        expect(displayTitleSize).toBeGreaterThan(eventTitleSize);
      }
      
      if (eventTitles.length > 0 && eventDescriptions.length > 0) {
        const eventTitleSize = parseFloat(getComputedStyle(eventTitles[0]).fontSize);
        const eventDescSize = parseFloat(getComputedStyle(eventDescriptions[0]).fontSize);
        
        // Event titles should be larger than descriptions
        expect(eventTitleSize).toBeGreaterThan(eventDescSize);
      }
      
      if (eventDescriptions.length > 0 && eventMeta.length > 0) {
        const eventDescSize = parseFloat(getComputedStyle(eventDescriptions[0]).fontSize);
        const eventMetaSize = parseFloat(getComputedStyle(eventMeta[0]).fontSize);
        
        // Descriptions should be larger than or equal to meta text
        expect(eventDescSize).toBeGreaterThanOrEqual(eventMetaSize);
      }
    });

    it('should use consistent line heights for readability', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const textElements = container.querySelectorAll('.event-title, .event-description, .event-date');
      
      textElements.forEach(element => {
        const styles = getComputedStyle(element);
        const fontSize = parseFloat(styles.fontSize);
        const lineHeight = parseFloat(styles.lineHeight);
        
        // Line height should be reasonable (1.2 to 1.8 times font size)
        const ratio = lineHeight / fontSize;
        expect(ratio).toBeGreaterThanOrEqual(1.2);
        expect(ratio).toBeLessThanOrEqual(1.8);
      });
    });
  });

  describe('Spacing and Layout Consistency', () => {
    it('should maintain consistent spacing across all states', () => {
      Object.entries(testScenarios).forEach(([scenarioName, events]) => {
        const { container } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        const validator = new VisualConsistencyValidator(container);
        
        const metrics = validator.getMetrics();
        expect(metrics.spacingConsistency).toBe(true);
      });
    });

    it('should maintain consistent alignment across different layouts', () => {
      Object.entries(testScenarios).forEach(([scenarioName, events]) => {
        const { container } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        const validator = new VisualConsistencyValidator(container);
        
        const metrics = validator.getMetrics();
        expect(metrics.alignmentConsistency).toBe(true);
      });
    });

    it('should maintain consistent grid gaps', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const gridContainers = container.querySelectorAll('.events-grid-container');
      
      gridContainers.forEach(grid => {
        const styles = getComputedStyle(grid);
        const gap = styles.gap || styles.gridGap;
        
        // Should have consistent gap (1.25rem = 20px)
        expect(gap).toMatch(/1\.25rem|20px/);
      });
    });

    it('should maintain proper aspect ratios for cards', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const eventCards = container.querySelectorAll('.event-card');
      
      eventCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;
        
        // Cards should have reasonable aspect ratio (not too narrow or too wide)
        expect(aspectRatio).toBeGreaterThan(0.5);
        expect(aspectRatio).toBeLessThan(3);
      });
    });
  });

  describe('Visual Hierarchy Consistency', () => {
    it('should maintain consistent visual priority across states', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const priorityElements = container.querySelectorAll('.event-priority-1, .event-priority-2, .event-priority-3');
      
      // Check that priority classes are applied correctly
      const priority1 = container.querySelectorAll('.event-priority-1');
      const priority2 = container.querySelectorAll('.event-priority-2');
      const priority3 = container.querySelectorAll('.event-priority-3');
      
      // Should have at least one priority-1 element
      expect(priority1.length).toBeGreaterThan(0);
      
      // Priority 1 should have the strongest visual treatment
      if (priority1.length > 0 && priority2.length > 0) {
        const p1Transform = getComputedStyle(priority1[0]).transform;
        const p2Transform = getComputedStyle(priority2[0]).transform;
        
        // Priority 1 should have larger scale
        expect(p1Transform).toContain('scale');
      }
    });

    it('should maintain consistent badge positioning', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const badges = container.querySelectorAll('.event-source, .event-date');
      
      badges.forEach(badge => {
        const styles = getComputedStyle(badge);
        
        // Badges should have consistent styling
        expect(styles.borderRadius).toMatch(/6px|8px/);
        expect(styles.padding).toBeTruthy();
        expect(styles.fontSize).toBeTruthy();
      });
    });

    it('should maintain consistent icon positioning', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const icons = container.querySelectorAll('.event-icon');
      
      icons.forEach(icon => {
        const styles = getComputedStyle(icon);
        
        // Icons should have consistent positioning
        expect(styles.display).toBe('inline-flex');
        expect(styles.alignItems).toBe('center');
        expect(styles.justifyContent).toBe('center');
      });
    });
  });

  describe('Responsive Consistency', () => {
    it('should maintain visual consistency across viewport sizes', () => {
      const viewports = [
        { width: 1920, height: 1080 }, // Large desktop
        { width: 1400, height: 900 },  // Medium desktop
        { width: 1200, height: 800 },  // Small desktop
        { width: 768, height: 1024 }   // Tablet
      ];

      viewports.forEach(viewport => {
        // Mock viewport size
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, configurable: true });
        
        const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
        const validator = new VisualConsistencyValidator(container);
        
        const metrics = validator.getMetrics();
        
        // Should maintain consistency across viewports
        expect(metrics.brandingConsistency).toBe(true);
        expect(metrics.alignmentConsistency).toBe(true);
        expect(metrics.colorContrast).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should scale typography appropriately for distance reading', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.multiple} />);
      
      const displayTitle = container.querySelector('.display-title');
      const eventTitles = container.querySelectorAll('.event-title');
      const eventDates = container.querySelectorAll('.event-date');
      
      if (displayTitle) {
        const fontSize = parseFloat(getComputedStyle(displayTitle).fontSize);
        // Display title should be large enough for distance reading (at least 36px)
        expect(fontSize).toBeGreaterThanOrEqual(36);
      }
      
      eventTitles.forEach(title => {
        const fontSize = parseFloat(getComputedStyle(title).fontSize);
        // Event titles should be readable from distance (at least 18px)
        expect(fontSize).toBeGreaterThanOrEqual(18);
      });
      
      eventDates.forEach(date => {
        const fontSize = parseFloat(getComputedStyle(date).fontSize);
        // Event dates should be readable (at least 14px)
        expect(fontSize).toBeGreaterThanOrEqual(14);
      });
    });
  });
});