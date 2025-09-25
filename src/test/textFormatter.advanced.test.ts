import { describe, it, expect, beforeEach } from 'vitest';
import { TextFormatter } from '../utils/textFormatter';

// Tests for Task 4: Advanced Description Formatting
describe('Advanced Description Formatting - Task 4', () => {
  let formatter: TextFormatter;

  beforeEach(() => {
    formatter = new TextFormatter();
  });

  describe('Paragraph Processing with Appropriate Spacing', () => {
    it('should extract paragraphs from multi-paragraph text', () => {
      const multiParagraphText = `First paragraph with some content.

Second paragraph with different content.

Third paragraph with more information.`;
      
      const processedContent = formatter.processAdvancedContent(multiParagraphText);
      
      expect(processedContent.formatting.paragraphs).toHaveLength(3);
      expect(processedContent.formatting.paragraphs[0]).toBe('First paragraph with some content.');
      expect(processedContent.formatting.paragraphs[1]).toBe('Second paragraph with different content.');
      expect(processedContent.formatting.paragraphs[2]).toBe('Third paragraph with more information.');
    });

    it('should handle paragraphs with different spacing styles', () => {
      const paragraphText = `First paragraph.

Second paragraph.`;
      
      const compactFormatted = formatter.formatAdvancedDescription(paragraphText, {
        paragraphSpacing: 'compact'
      });
      const spaciousFormatted = formatter.formatAdvancedDescription(paragraphText, {
        paragraphSpacing: 'spacious'
      });
      
      expect(compactFormatted).toContain('text-formatter-paragraph-compact');
      expect(spaciousFormatted).toContain('text-formatter-paragraph-spacious');
    });

    it('should limit paragraphs to maxParagraphs setting', () => {
      const manyParagraphsText = `Para 1.

Para 2.

Para 3.

Para 4.

Para 5.`;
      
      const processedContent = formatter.processAdvancedContent(manyParagraphsText, {
        maxParagraphs: 3
      });
      
      expect(processedContent.formatting.paragraphs).toHaveLength(3);
    });

    it('should handle single paragraph text', () => {
      const singleParagraph = 'This is just one paragraph without line breaks.';
      const processedContent = formatter.processAdvancedContent(singleParagraph);
      
      expect(processedContent.formatting.paragraphs).toHaveLength(1);
      expect(processedContent.formatting.paragraphs[0]).toBe(singleParagraph);
    });

    it('should clean HTML from paragraphs', () => {
      const htmlParagraphs = `<p>First paragraph with <strong>HTML</strong>.</p>

<p>Second paragraph with <em>emphasis</em>.</p>`;
      
      const processedContent = formatter.processAdvancedContent(htmlParagraphs);
      
      expect(processedContent.formatting.paragraphs[0]).toBe('First paragraph with HTML.');
      expect(processedContent.formatting.paragraphs[1]).toBe('Second paragraph with emphasis.');
    });
  });

  describe('List Formatting with Visual Bullets', () => {
    it('should extract bullet lists correctly', () => {
      const bulletListText = `Regular text before list.
- First bullet item
- Second bullet item
* Third bullet item with asterisk
• Fourth bullet item with bullet symbol
More text after list.`;
      
      const processedContent = formatter.processAdvancedContent(bulletListText);
      
      expect(processedContent.formatting.lists).toHaveLength(4);
      expect(processedContent.formatting.lists[0].type).toBe('bullet');
      expect(processedContent.formatting.lists[0].content).toBe('First bullet item');
      expect(processedContent.formatting.lists[1].content).toBe('Second bullet item');
      expect(processedContent.formatting.lists[2].content).toBe('Third bullet item with asterisk');
      expect(processedContent.formatting.lists[3].content).toBe('Fourth bullet item with bullet symbol');
    });

    it('should extract numbered lists correctly', () => {
      const numberedListText = `Instructions:
1. First step
2. Second step
3. Third step
a) Sub-step with letter
b) Another sub-step`;
      
      const processedContent = formatter.processAdvancedContent(numberedListText);
      
      expect(processedContent.formatting.lists).toHaveLength(5);
      expect(processedContent.formatting.lists[0].type).toBe('numbered');
      expect(processedContent.formatting.lists[0].content).toBe('First step');
      expect(processedContent.formatting.lists[3].type).toBe('numbered');
      expect(processedContent.formatting.lists[3].content).toBe('Sub-step with letter');
    });

    it('should detect indentation levels in lists', () => {
      const indentedListText = `- Top level item
  - Indented item
    - Double indented item
- Back to top level`;
      
      const processedContent = formatter.processAdvancedContent(indentedListText);
      
      expect(processedContent.formatting.lists[0].level).toBe(0);
      expect(processedContent.formatting.lists[1].level).toBe(1);
      expect(processedContent.formatting.lists[2].level).toBe(2);
      expect(processedContent.formatting.lists[3].level).toBe(0);
    });

    it('should render lists with visual bullets', () => {
      const listText = `- First item
- Second item`;
      
      const formatted = formatter.formatAdvancedDescription(listText, {
        addVisualBullets: true,
        listStyle: 'bullets'
      });
      
      expect(formatted).toContain('text-formatter-list');
      expect(formatted).toContain('text-formatter-bullet');
      expect(formatted).toContain('•');
    });

    it('should render lists with different styles', () => {
      const listText = `- First item
- Second item`;
      
      const bulletsFormatted = formatter.formatAdvancedDescription(listText, {
        listStyle: 'bullets'
      });
      const dashesFormatted = formatter.formatAdvancedDescription(listText, {
        listStyle: 'dashes'
      });
      
      expect(bulletsFormatted).toContain('text-formatter-list-bullets');
      expect(dashesFormatted).toContain('text-formatter-list-dashes');
      expect(dashesFormatted).toContain('–');
    });

    it('should handle mixed list types', () => {
      const mixedListText = `- Bullet item
1. Numbered item
- Another bullet
2. Another number`;
      
      const processedContent = formatter.processAdvancedContent(mixedListText);
      
      expect(processedContent.formatting.lists).toHaveLength(4);
      expect(processedContent.formatting.lists[0].type).toBe('bullet');
      expect(processedContent.formatting.lists[1].type).toBe('numbered');
      expect(processedContent.formatting.lists[2].type).toBe('bullet');
      expect(processedContent.formatting.lists[3].type).toBe('numbered');
    });
  });

  describe('Line Break Preservation', () => {
    it('should preserve line breaks when enabled', () => {
      const textWithLineBreaks = `First line
Second line
Third line`;
      
      const processedContent = formatter.processAdvancedContent(textWithLineBreaks, {
        preserveLineBreaks: true
      });
      
      expect(processedContent.formatting.lineBreaks.length).toBeGreaterThan(0);
    });

    it('should convert line breaks to <br> tags in formatted output', () => {
      const textWithLineBreaks = `First line
Second line`;
      
      const formatted = formatter.formatAdvancedDescription(textWithLineBreaks, {
        preserveLineBreaks: true,
        formatParagraphs: false
      });
      
      expect(formatted).toContain('<br>');
    });

    it('should not add <br> tags when paragraph formatting is enabled', () => {
      const textWithLineBreaks = `First paragraph.

Second paragraph.`;
      
      const formatted = formatter.formatAdvancedDescription(textWithLineBreaks, {
        preserveLineBreaks: true,
        formatParagraphs: true
      });
      
      expect(formatted).toContain('<p class=');
      expect(formatted).not.toContain('<br>');
    });

    it('should handle mixed content with line breaks and special content', () => {
      const mixedContent = `Contact information:
Email: prof.smith@uclouvain.be
Phone: +32 10 47 43 02
Date: 26/09/2025`;
      
      const formatted = formatter.formatAdvancedDescription(mixedContent, {
        preserveLineBreaks: true,
        formatParagraphs: false
      });
      
      expect(formatted).toContain('<br>');
      expect(formatted).toContain('text-formatter-email');
      expect(formatted).toContain('text-formatter-phone');
      expect(formatted).toContain('text-formatter-date');
    });
  });

  describe('Complex Description Formatting', () => {
    it('should handle complex descriptions with paragraphs, lists, and special content', () => {
      const complexDescription = `URGENT: Seminar Information

The seminar will cover the following topics:
- Introduction to research methods
- Data analysis techniques
- Publication strategies

Contact Details:
Email: prof.belaidi@uclouvain.be
Phone: +32 10 47 43 02
Website: https://uclouvain.be/seminar

Date: 26/09/2025 at 14h30

Please confirm your attendance by replying to this email.`;
      
      const processedContent = formatter.processAdvancedContent(complexDescription);
      
      // Should extract paragraphs
      expect(processedContent.formatting.paragraphs.length).toBeGreaterThan(1);
      
      // Should extract lists
      expect(processedContent.formatting.lists.length).toBeGreaterThan(0);
      expect(processedContent.formatting.lists.some(item => item.content.includes('Introduction to research'))).toBe(true);
      
      // Should extract special content
      expect(processedContent.links.length).toBeGreaterThan(0);
      expect(processedContent.dates.length).toBeGreaterThan(0);
      expect(processedContent.contacts.length).toBeGreaterThan(0);
      
      // Should detect important words
      const specialContent = formatter.extractSpecialContent(complexDescription);
      expect(specialContent.importantWords).toContain('URGENT');
    });

    it('should format complex descriptions with all features enabled', () => {
      const complexDescription = `Important Meeting

Agenda:
1. Review of project status
2. Discussion of next steps
3. Q&A session

Contact: admin@uclouvain.be
Date: 26/09/2025`;
      
      const formatted = formatter.formatAdvancedDescription(complexDescription, {
        formatParagraphs: true,
        formatLists: true,
        preserveLineBreaks: true,
        addVisualBullets: true,
        paragraphSpacing: 'normal'
      });
      
      expect(formatted).toContain('text-formatter-paragraph-normal');
      expect(formatted).toContain('text-formatter-list');
      expect(formatted).toContain('text-formatter-email');
      expect(formatted).toContain('text-formatter-date');
      expect(formatted).toContain('text-formatter-important');
    });

    it('should handle HTML content in complex descriptions', () => {
      const htmlDescription = `<h2>Seminar Details</h2>
<p>The seminar will include:</p>
<ul>
<li>Presentation by <strong>Prof. Smith</strong></li>
<li>Q&amp;A session</li>
</ul>
<p>Contact: <a href="mailto:prof.smith@uclouvain.be">prof.smith@uclouvain.be</a></p>`;
      
      const processedContent = formatter.processAdvancedContent(htmlDescription);
      
      expect(processedContent.cleanText).not.toContain('<');
      expect(processedContent.cleanText).toContain('Prof. Smith');
      expect(processedContent.cleanText).toContain('Q&A session');
      expect(processedContent.contacts.some(contact => contact.value === 'prof.smith@uclouvain.be')).toBe(true);
    });

    it('should extract and separate images from descriptions', () => {
      const descriptionWithImages = `<p>Event details with image:</p>
<img src="https://example.com/image1.jpg" alt="Event poster" />
<p>More information available.</p>
<img src="https://example.com/image2.png" alt="Location map" />`;
      
      const processedContent = formatter.processAdvancedContent(descriptionWithImages);
      
      expect(processedContent.images).toHaveLength(2);
      expect(processedContent.images[0].src).toBe('https://example.com/image1.jpg');
      expect(processedContent.images[0].alt).toBe('Event poster');
      expect(processedContent.images[1].src).toBe('https://example.com/image2.png');
      expect(processedContent.images[1].alt).toBe('Location map');
    });

    it('should handle empty or minimal content gracefully', () => {
      const emptyContent = '';
      const minimalContent = 'Short text.';
      
      const emptyProcessed = formatter.processAdvancedContent(emptyContent);
      const minimalProcessed = formatter.processAdvancedContent(minimalContent);
      
      expect(emptyProcessed.formatting.paragraphs).toHaveLength(0);
      expect(emptyProcessed.formatting.lists).toHaveLength(0);
      
      expect(minimalProcessed.formatting.paragraphs).toHaveLength(1);
      expect(minimalProcessed.formatting.lists).toHaveLength(0);
    });
  });

  describe('Requirements Validation - Task 4', () => {
    it('should satisfy Requirement 2.1: Visual paragraph separation', () => {
      const multiParagraphText = `First paragraph content.

Second paragraph content.

Third paragraph content.`;
      
      const formatted = formatter.formatAdvancedDescription(multiParagraphText, {
        paragraphSpacing: 'normal'
      });
      
      expect(formatted).toContain('<p class="text-formatter-paragraph-normal">');
      expect((formatted.match(/<p class="/g) || []).length).toBe(3);
    });

    it('should satisfy Requirement 2.2: Format lists with visible bullets/numbers', () => {
      const listText = `Tasks to complete:
- First task
- Second task
1. Numbered item
2. Another numbered item`;
      
      const formatted = formatter.formatAdvancedDescription(listText, {
        formatLists: true,
        addVisualBullets: true
      });
      
      expect(formatted).toContain('text-formatter-bullet');
      expect(formatted).toContain('•');
      expect(formatted).toContain('text-formatter-list');
    });

    it('should satisfy Requirement 2.4: Preserve line breaks correctly', () => {
      const textWithLineBreaks = `Line one
Line two
Line three`;
      
      const formatted = formatter.formatAdvancedDescription(textWithLineBreaks, {
        preserveLineBreaks: true,
        formatParagraphs: false
      });
      
      expect(formatted).toContain('<br>');
      expect((formatted.match(/<br>/g) || []).length).toBe(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed list items', () => {
      const malformedList = `- Valid item
-Invalid item without space
 - Item with leading space
- Another valid item`;
      
      const processedContent = formatter.processAdvancedContent(malformedList);
      
      // Should extract valid items and handle malformed ones gracefully
      expect(processedContent.formatting.lists.length).toBeGreaterThan(0);
      expect(processedContent.formatting.lists.some(item => item.content === 'Valid item')).toBe(true);
    });

    it('should handle mixed line ending types', () => {
      const mixedLineEndings = 'Line with \\n\nLine with \\r\\n\r\nAnother line';
      const processedContent = formatter.processAdvancedContent(mixedLineEndings);
      
      expect(processedContent.formatting.lineBreaks.length).toBeGreaterThan(0);
    });

    it('should handle very long paragraphs', () => {
      const veryLongParagraph = 'This is a very long paragraph that contains a lot of text and should be handled properly by the formatting system without causing any performance issues or memory problems. '.repeat(50);
      
      const processedContent = formatter.processAdvancedContent(veryLongParagraph);
      
      expect(processedContent.formatting.paragraphs).toHaveLength(1);
      expect(processedContent.cleanText.length).toBeGreaterThan(1000);
    });

    it('should handle deeply nested lists', () => {
      const deeplyNestedList = `- Level 0
  - Level 1
    - Level 2
      - Level 3
        - Level 4
          - Level 5`;
      
      const processedContent = formatter.processAdvancedContent(deeplyNestedList);
      
      expect(processedContent.formatting.lists).toHaveLength(6);
      expect(processedContent.formatting.lists[5].level).toBe(5);
    });
  });
});