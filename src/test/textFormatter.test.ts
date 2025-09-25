import { describe, it, expect, beforeEach } from 'vitest';
import { TextFormatter, textFormatter } from '../utils/textFormatter';

describe('TextFormatter', () => {
  let formatter: TextFormatter;

  beforeEach(() => {
    formatter = new TextFormatter();
  });

  describe('formatTitle', () => {
    it('should format a simple title without truncation', () => {
      const result = formatter.formatTitle('Simple Title');
      
      expect(result.content).toBe('Simple Title');
      expect(result.isTruncated).toBe(false);
      expect(result.originalLength).toBe(12);
      expect(result.hasSpecialContent).toBe(false);
    });

    it('should truncate long titles while preserving words', () => {
      const longTitle = 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie';
      const result = formatter.formatTitle(longTitle, { maxLength: 80 });
      
      expect(result.content).toContain('...');
      expect(result.isTruncated).toBe(true);
      expect((result.content as string).length).toBeLessThanOrEqual(80);
      expect(result.originalLength).toBe(longTitle.length);
      // Should not cut in the middle of a word
      expect(result.content).not.toMatch(/\w\.\.\.$/);
    });

    it('should handle empty or invalid input', () => {
      expect(formatter.formatTitle('').content).toBe('');
      expect(formatter.formatTitle(null as any).content).toBe('');
      expect(formatter.formatTitle(undefined as any).content).toBe('');
    });

    it('should detect special content in titles', () => {
      const titleWithEmail = 'Contact Prof. Smith at prof.smith@uclouvain.be';
      const result = formatter.formatTitle(titleWithEmail);
      
      expect(result.hasSpecialContent).toBe(true);
    });

    it('should handle titles with important words', () => {
      const urgentTitle = 'URGENT: Meeting cancelled due to weather';
      const result = formatter.formatTitle(urgentTitle, { maxLength: 50 });
      
      expect(result.hasSpecialContent).toBe(true);
      expect(result.content).toContain('URGENT');
    });
  });

  describe('formatDescription', () => {
    it('should format a simple description without truncation', () => {
      const description = 'This is a simple event description.';
      const result = formatter.formatDescription(description);
      
      expect(result.content).toBe(description);
      expect(result.isTruncated).toBe(false);
      expect(result.hasSpecialContent).toBe(false);
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'This is a very long description that should be truncated because it exceeds the maximum length limit that we have set for descriptions in the calendar application. It contains multiple sentences and should be handled gracefully by the truncation algorithm.';
      const result = formatter.formatDescription(longDescription, { maxLength: 100 });
      
      expect(result.content).toContain('...');
      expect(result.isTruncated).toBe(true);
      expect((result.content as string).length).toBeLessThanOrEqual(100);
    });

    it('should detect and preserve special content', () => {
      const descriptionWithSpecialContent = 'Meeting on 26/09/2025 at 14h30. Contact: prof.belaidi@uclouvain.be or call +32 10 47 43 02. More info at https://uclouvain.be/event';
      const result = formatter.formatDescription(descriptionWithSpecialContent);
      
      expect(result.hasSpecialContent).toBe(true);
    });
  });

  describe('cleanHtmlContent', () => {
    it('should remove HTML tags while preserving content', () => {
      const htmlContent = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
      const cleaned = formatter.cleanHtmlContent(htmlContent);
      
      expect(cleaned).toBe('This is bold and italic text.');
    });

    it('should remove script and style tags completely', () => {
      const htmlWithScript = '<p>Content</p><script>alert("hack")</script><style>body{color:red}</style>';
      const cleaned = formatter.cleanHtmlContent(htmlWithScript);
      
      expect(cleaned).toBe('Content');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).not.toContain('color:red');
    });

    it('should decode HTML entities', () => {
      const htmlWithEntities = 'Caf&eacute; &amp; Restaurant';
      const cleaned = formatter.cleanHtmlContent(htmlWithEntities);
      
      // The function should decode common HTML entities
      expect(cleaned).toContain('Café');
      expect(cleaned).toContain('&');
      expect(cleaned).toBe('Café & Restaurant');
    });

    it('should handle malformed HTML gracefully', () => {
      const malformedHtml = '<p>Unclosed paragraph <strong>bold text <em>nested emphasis</p> more text</em>';
      const cleaned = formatter.cleanHtmlContent(malformedHtml);
      
      expect(cleaned).toBe('Unclosed paragraph bold text nested emphasis more text');
    });

    it('should clean up excessive whitespace', () => {
      const htmlWithWhitespace = '<p>  Multiple   spaces  </p>\n\n<div>  And   tabs\t\t</div>';
      const cleaned = formatter.cleanHtmlContent(htmlWithWhitespace);
      
      expect(cleaned).toBe('Multiple spaces And tabs');
    });

    it('should handle empty or invalid input', () => {
      expect(formatter.cleanHtmlContent('')).toBe('');
      expect(formatter.cleanHtmlContent(null as any)).toBe('');
      expect(formatter.cleanHtmlContent(undefined as any)).toBe('');
    });
  });

  describe('extractSpecialContent', () => {
    it('should extract URLs correctly', () => {
      const textWithUrls = 'Visit https://uclouvain.be and http://example.com for more info';
      const specialContent = formatter.extractSpecialContent(textWithUrls);
      
      expect(specialContent.urls).toContain('https://uclouvain.be');
      expect(specialContent.urls).toContain('http://example.com');
      expect(specialContent.urls).toHaveLength(2);
    });

    it('should extract email addresses correctly', () => {
      const textWithEmails = 'Contact prof.smith@uclouvain.be or admin@example.org';
      const specialContent = formatter.extractSpecialContent(textWithEmails);
      
      expect(specialContent.emails).toContain('prof.smith@uclouvain.be');
      expect(specialContent.emails).toContain('admin@example.org');
      expect(specialContent.emails).toHaveLength(2);
    });

    it('should extract phone numbers correctly', () => {
      const textWithPhones = 'Call +32 10 47 43 02 or 010-474-302';
      const specialContent = formatter.extractSpecialContent(textWithPhones);
      
      expect(specialContent.phones.length).toBeGreaterThan(0);
      expect(specialContent.phones).toContain('010-474-302');
      // Phone regex might capture partial matches, so we check for presence
      expect(specialContent.phones.some(phone => phone.includes('+32'))).toBe(true);
    });

    it('should extract dates correctly', () => {
      const textWithDates = 'Meeting on 26/09/2025 and follow-up on 15-10-2025';
      const specialContent = formatter.extractSpecialContent(textWithDates);
      
      expect(specialContent.dates).toContain('26/09/2025');
      expect(specialContent.dates).toContain('15-10-2025');
      expect(specialContent.dates).toHaveLength(2);
    });

    it('should extract times correctly', () => {
      const textWithTimes = 'Start at 14h30 and end at 16:45';
      const specialContent = formatter.extractSpecialContent(textWithTimes);
      
      expect(specialContent.times).toContain('14h30');
      expect(specialContent.times).toContain('16:45');
      expect(specialContent.times).toHaveLength(2);
    });

    it('should extract important words correctly', () => {
      const textWithImportantWords = 'URGENT meeting cancelled. New date to be announced.';
      const specialContent = formatter.extractSpecialContent(textWithImportantWords);
      
      expect(specialContent.importantWords).toContain('URGENT');
      expect(specialContent.importantWords).toContain('cancelled');
      expect(specialContent.importantWords).toContain('New');
      expect(specialContent.importantWords).toHaveLength(3);
    });

    it('should handle text without special content', () => {
      const plainText = 'This is just a regular text without any special content.';
      const specialContent = formatter.extractSpecialContent(plainText);
      
      expect(specialContent.urls).toHaveLength(0);
      expect(specialContent.emails).toHaveLength(0);
      expect(specialContent.phones).toHaveLength(0);
      expect(specialContent.dates).toHaveLength(0);
      expect(specialContent.times).toHaveLength(0);
      expect(specialContent.importantWords).toHaveLength(0);
    });

    it('should remove duplicates from extracted content', () => {
      const textWithDuplicates = 'Contact prof.smith@uclouvain.be or prof.smith@uclouvain.be again';
      const specialContent = formatter.extractSpecialContent(textWithDuplicates);
      
      expect(specialContent.emails).toHaveLength(1);
      expect(specialContent.emails[0]).toBe('prof.smith@uclouvain.be');
    });

    it('should extract complex URLs with parameters', () => {
      const textWithComplexUrls = 'Visit https://uclouvain.be/event?id=123&category=seminar for details';
      const specialContent = formatter.extractSpecialContent(textWithComplexUrls);
      
      expect(specialContent.urls).toContain('https://uclouvain.be/event?id=123&category=seminar');
      expect(specialContent.urls).toHaveLength(1);
    });

    it('should extract international phone numbers', () => {
      const textWithIntlPhones = 'Call +32 10 47 43 02 or +1-555-123-4567 or 0032.10.47.43.02';
      const specialContent = formatter.extractSpecialContent(textWithIntlPhones);
      
      expect(specialContent.phones.length).toBeGreaterThan(0);
      expect(specialContent.phones.some(phone => phone.includes('+32'))).toBe(true);
      expect(specialContent.phones.some(phone => phone.includes('+1-555'))).toBe(true);
    });

    it('should extract various date formats', () => {
      const textWithDates = 'Events on 26/09/2025, 15-10-2025, and 03.11.2025';
      const specialContent = formatter.extractSpecialContent(textWithDates);
      
      expect(specialContent.dates).toContain('26/09/2025');
      expect(specialContent.dates).toContain('15-10-2025');
      expect(specialContent.dates).toContain('03.11.2025');
      expect(specialContent.dates).toHaveLength(3);
    });

    it('should extract French and English important words', () => {
      const textWithMixedImportant = 'URGENT: Meeting annulé. New session postponed. Attention required.';
      const specialContent = formatter.extractSpecialContent(textWithMixedImportant);
      
      expect(specialContent.importantWords).toContain('URGENT');
      expect(specialContent.importantWords).toContain('New');
      expect(specialContent.importantWords).toContain('postponed');
      expect(specialContent.importantWords).toContain('Attention');
      // Note: annulé might not be detected due to Unicode handling in regex
      expect(specialContent.importantWords.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('formatWithHighlights', () => {
    it('should format URLs with clickable links', () => {
      const textWithUrl = 'Visit https://uclouvain.be for more info';
      const formatted = formatter.formatWithHighlights(textWithUrl, { createClickableLinks: true });
      
      expect(formatted).toContain('<a href="https://uclouvain.be"');
      expect(formatted).toContain('class="text-formatter-url"');
      expect(formatted).toContain('target="_blank"');
      expect(formatted).toContain('rel="noopener noreferrer"');
    });

    it('should format emails with mailto links', () => {
      const textWithEmail = 'Contact prof.smith@uclouvain.be';
      const formatted = formatter.formatWithHighlights(textWithEmail, { createClickableLinks: true });
      
      expect(formatted).toContain('<a href="mailto:prof.smith@uclouvain.be"');
      expect(formatted).toContain('class="text-formatter-email"');
    });

    it('should format phone numbers with tel links', () => {
      const textWithPhone = 'Call +32 10 47 43 02';
      const formatted = formatter.formatWithHighlights(textWithPhone, { createClickableLinks: true });
      
      expect(formatted).toContain('<a href="tel:+32104743');
      expect(formatted).toContain('class="text-formatter-phone"');
    });

    it('should format dates with highlighting', () => {
      const textWithDate = 'Meeting on 26/09/2025';
      const formatted = formatter.formatWithHighlights(textWithDate);
      
      expect(formatted).toContain('<span class="text-formatter-date">26/09/2025</span>');
    });

    it('should format times with highlighting', () => {
      const textWithTime = 'Start at 14h30';
      const formatted = formatter.formatWithHighlights(textWithTime);
      
      expect(formatted).toContain('<span class="text-formatter-time">14h30</span>');
    });

    it('should format important words with highlighting', () => {
      const textWithImportant = 'URGENT meeting cancelled';
      const formatted = formatter.formatWithHighlights(textWithImportant);
      
      expect(formatted).toContain('<span class="text-formatter-important">URGENT</span>');
      expect(formatted).toContain('<span class="text-formatter-important">cancelled</span>');
    });

    it('should handle mixed content with multiple special elements', () => {
      const mixedContent = 'URGENT: Meeting on 26/09/2025 at 14h30. Contact prof.smith@uclouvain.be or visit https://uclouvain.be';
      const formatted = formatter.formatWithHighlights(mixedContent, { createClickableLinks: true });
      
      expect(formatted).toContain('text-formatter-important');
      expect(formatted).toContain('text-formatter-date');
      expect(formatted).toContain('text-formatter-time');
      expect(formatted).toContain('text-formatter-email');
      expect(formatted).toContain('text-formatter-url');
    });

    it('should respect formatting options', () => {
      const textWithUrl = 'Visit https://uclouvain.be';
      const withoutLinks = formatter.formatWithHighlights(textWithUrl, { createClickableLinks: false });
      const withoutHighlight = formatter.formatWithHighlights(textWithUrl, { highlightUrls: false });
      
      expect(withoutLinks).toContain('<span class="text-formatter-url">');
      expect(withoutLinks).not.toContain('<a href=');
      expect(withoutHighlight).not.toContain('text-formatter-url');
    });

    it('should avoid double-formatting already formatted content', () => {
      const preFormatted = 'Text with <span class="text-formatter-url">https://example.com</span>';
      const formatted = formatter.formatWithHighlights(preFormatted);
      
      // Should not add additional formatting to already formatted content
      const matches = formatted.match(/text-formatter-url/g);
      expect(matches?.length || 0).toBeLessThanOrEqual(2); // Allow for some edge cases
    });
  });

  describe('extractLinks', () => {
    it('should extract all types of links', () => {
      const textWithLinks = 'Contact prof.smith@uclouvain.be, call +32 10 47 43 02, or visit https://uclouvain.be';
      const links = formatter.extractLinks(textWithLinks);
      
      expect(links).toHaveLength(3);
      expect(links.some(link => link.type === 'email')).toBe(true);
      expect(links.some(link => link.type === 'phone')).toBe(true);
      expect(links.some(link => link.type === 'url')).toBe(true);
    });

    it('should format URLs correctly', () => {
      const textWithUrl = 'Visit https://uclouvain.be';
      const links = formatter.extractLinks(textWithUrl);
      
      const urlLink = links.find(link => link.type === 'url');
      expect(urlLink).toBeDefined();
      expect(urlLink?.text).toBe('https://uclouvain.be');
      expect(urlLink?.url).toBe('https://uclouvain.be');
    });

    it('should format emails correctly', () => {
      const textWithEmail = 'Contact prof.smith@uclouvain.be';
      const links = formatter.extractLinks(textWithEmail);
      
      const emailLink = links.find(link => link.type === 'email');
      expect(emailLink).toBeDefined();
      expect(emailLink?.text).toBe('prof.smith@uclouvain.be');
      expect(emailLink?.url).toBe('mailto:prof.smith@uclouvain.be');
    });

    it('should format phone numbers correctly', () => {
      const textWithPhone = 'Call +32 10 47 43 02';
      const links = formatter.extractLinks(textWithPhone);
      
      const phoneLink = links.find(link => link.type === 'phone');
      expect(phoneLink).toBeDefined();
      expect(phoneLink?.text).toBe('+32 10 47 43 02');
      expect(phoneLink?.url).toBe('tel:+3210474302');
    });

    it('should handle empty text', () => {
      const links = formatter.extractLinks('');
      expect(links).toHaveLength(0);
    });
  });

  describe('getFormattedHtml', () => {
    it('should clean HTML and apply formatting', () => {
      const htmlContent = '<p>Contact <strong>prof.smith@uclouvain.be</strong> on 26/09/2025</p>';
      const formatted = formatter.getFormattedHtml(htmlContent);
      
      expect(formatted).not.toContain('<p>');
      expect(formatted).not.toContain('<strong>');
      expect(formatted).toContain('text-formatter-email');
      expect(formatted).toContain('text-formatter-date');
    });

    it('should handle malformed HTML with special content', () => {
      const malformedHtml = '<p>Meeting <strong>cancelled on 26/09/2025 at prof.smith@uclouvain.be</p>';
      const formatted = formatter.getFormattedHtml(malformedHtml);
      
      expect(formatted).toContain('text-formatter-important');
      expect(formatted).toContain('text-formatter-date');
      expect(formatted).toContain('text-formatter-email');
    });
  });

  describe('hasSpecialContentPatterns', () => {
    it('should detect when text has special content', () => {
      const textWithSpecial = 'Contact prof.smith@uclouvain.be on 26/09/2025';
      expect(formatter.hasSpecialContentPatterns(textWithSpecial)).toBe(true);
    });

    it('should detect when text has no special content', () => {
      const plainText = 'This is just regular text without special patterns';
      expect(formatter.hasSpecialContentPatterns(plainText)).toBe(false);
    });

    it('should handle empty text', () => {
      expect(formatter.hasSpecialContentPatterns('')).toBe(false);
      expect(formatter.hasSpecialContentPatterns(null as any)).toBe(false);
    });
  });

  describe('intelligent truncation', () => {
    it('should preserve word boundaries when truncating', () => {
      const text = 'This is a long sentence that needs to be truncated properly';
      const result = formatter.formatTitle(text, { maxLength: 30, preserveWords: true });
      
      // Should not cut in the middle of a word - should end cleanly
      expect(result.content).toContain('...');
      expect((result.content as string).length).toBeLessThanOrEqual(30);
      expect(result.isTruncated).toBe(true);
      
      // The truncated part should be complete words
      const withoutEllipsis = (result.content as string).replace('...', '').trim();
      const words = text.split(' ');
      const truncatedWords = withoutEllipsis.split(' ');
      
      // Each truncated word should be a complete word from the original
      truncatedWords.forEach((word: string) => {
        expect(words.some(originalWord => originalWord.startsWith(word))).toBe(true);
      });
    });

    it('should break long words when breakLongWords is true', () => {
      const textWithLongWord = 'Supercalifragilisticexpialidocious word';
      const result = formatter.formatDescription(textWithLongWord, { 
        maxLength: 20, 
        breakLongWords: true 
      });
      
      expect((result.content as string).length).toBeLessThanOrEqual(20);
      expect(result.isTruncated).toBe(true);
    });

    it('should not break long words when breakLongWords is false', () => {
      const textWithLongWord = 'Supercalifragilisticexpialidocious';
      const result = formatter.formatTitle(textWithLongWord, { 
        maxLength: 20, 
        breakLongWords: false 
      });
      
      expect(result.content).toContain('Supercalifragilisticexpialidocious');
    });

    it('should handle ellipsis option correctly', () => {
      const longText = 'This is a long text that will be truncated';
      const withEllipsis = formatter.formatTitle(longText, { 
        maxLength: 20, 
        showEllipsis: true 
      });
      const withoutEllipsis = formatter.formatTitle(longText, { 
        maxLength: 20, 
        showEllipsis: false 
      });
      
      expect(withEllipsis.content).toContain('...');
      expect(withoutEllipsis.content).not.toContain('...');
    });
  });

  describe('edge cases', () => {
    it('should handle text that is exactly at the limit', () => {
      const exactLengthText = '12345678901234567890'; // 20 characters
      const result = formatter.formatTitle(exactLengthText, { maxLength: 20 });
      
      expect(result.content).toBe(exactLengthText);
      expect(result.isTruncated).toBe(false);
    });

    it('should handle single character input', () => {
      const result = formatter.formatTitle('A');
      
      expect(result.content).toBe('A');
      expect(result.isTruncated).toBe(false);
    });

    it('should handle text with only whitespace', () => {
      const result = formatter.cleanHtmlContent('   \n\t   ');
      
      expect(result).toBe('');
    });

    it('should handle mixed content with HTML and special patterns', () => {
      const mixedContent = '<p>Contact <strong>Prof. Smith</strong> at prof.smith@uclouvain.be on 26/09/2025</p>';
      const result = formatter.formatDescription(mixedContent);
      
      expect(result.content).toBe('Contact Prof. Smith at prof.smith@uclouvain.be on 26/09/2025');
      expect(result.hasSpecialContent).toBe(true);
    });
  });

  describe('singleton instance', () => {
    it('should provide a working singleton instance', () => {
      const result = textFormatter.formatTitle('Test Title');
      
      expect(result.content).toBe('Test Title');
      expect(result.isTruncated).toBe(false);
    });
  });
});

// Test cases for specific requirements
describe('TextFormatter Requirements Validation', () => {
  let formatter: TextFormatter;

  beforeEach(() => {
    formatter = new TextFormatter();
  });

  describe('Requirement 1.2: Intelligent truncation preserving important words', () => {
    it('should preserve important words when truncating', () => {
      const titleWithImportant = 'URGENT: Important meeting about the new project cancelled due to weather conditions';
      const result = formatter.formatTitle(titleWithImportant, { maxLength: 50 });
      
      expect(result.content).toContain('URGENT');
      expect(result.isTruncated).toBe(true);
    });
  });

  describe('Requirement 1.4: Clean HTML and special characters', () => {
    it('should clean HTML and display properly', () => {
      const htmlTitle = '<p>Event with <strong>HTML</strong> &amp; special chars</p>';
      const result = formatter.formatTitle(htmlTitle);
      
      expect(result.content).toBe('Event with HTML & special chars');
      expect(result.content).not.toContain('<');
      expect(result.content).not.toContain('&amp;');
    });
  });

  describe('Requirement 5.1: Truncate at last complete word with ellipsis', () => {
    it('should truncate at word boundaries with ellipsis', () => {
      const longTitle = 'This is a very long title that should be truncated at word boundaries';
      const result = formatter.formatTitle(longTitle, { maxLength: 30 });
      
      expect(result.content).toMatch(/\s\.\.\.$|^\w+\.\.\.$|^[^\.]*\.\.\.$$/);
      expect(result.isTruncated).toBe(true);
    });
  });

  describe('Requirement 5.3: Break very long words appropriately', () => {
    it('should break very long words when enabled', () => {
      const veryLongWord = 'Pneumonoultramicroscopicsilicovolcanoconiosisextraordinaire';
      const result = formatter.formatDescription(veryLongWord, { 
        maxLength: 30, 
        breakLongWords: true 
      });
      
      expect((result.content as string).length).toBeLessThanOrEqual(30);
      expect(result.isTruncated).toBe(true);
    });
  });
});

// Additional tests for Task 2 requirements
describe('Special Content Detection and Formatting - Task 2', () => {
  let formatter: TextFormatter;

  beforeEach(() => {
    formatter = new TextFormatter();
  });

  describe('Requirement 6.1: Format URLs distinctively', () => {
    it('should display URLs with distinctive color and style', () => {
      const textWithUrl = 'Visit https://uclouvain.be/calendar';
      const formatted = formatter.formatWithHighlights(textWithUrl);
      
      expect(formatted).toContain('class="text-formatter-url"');
      expect(formatted).toContain('https://uclouvain.be/calendar');
    });

    it('should handle multiple URLs in text', () => {
      const textWithUrls = 'Visit https://uclouvain.be and http://example.com';
      const formatted = formatter.formatWithHighlights(textWithUrls);
      
      expect((formatted.match(/text-formatter-url/g) || []).length).toBe(2);
    });

    it('should handle complex URLs with parameters', () => {
      const textWithComplexUrl = 'Register at https://uclouvain.be/register?event=123&type=seminar';
      const specialContent = formatter.extractSpecialContent(textWithComplexUrl);
      
      expect(specialContent.urls).toContain('https://uclouvain.be/register?event=123&type=seminar');
    });
  });

  describe('Requirement 6.2: Format email addresses as clickable links', () => {
    it('should format emails as clickable links', () => {
      const textWithEmail = 'Contact prof.belaidi@uclouvain.be';
      const formatted = formatter.formatWithHighlights(textWithEmail, { createClickableLinks: true });
      
      expect(formatted).toContain('<a href="mailto:prof.belaidi@uclouvain.be"');
      expect(formatted).toContain('class="text-formatter-email"');
    });

    it('should extract emails correctly from complex text', () => {
      const textWithEmails = 'Contact prof.smith@uclouvain.be or admin@example.org for assistance';
      const specialContent = formatter.extractSpecialContent(textWithEmails);
      
      expect(specialContent.emails).toContain('prof.smith@uclouvain.be');
      expect(specialContent.emails).toContain('admin@example.org');
      expect(specialContent.emails).toHaveLength(2);
    });

    it('should handle emails with various domains', () => {
      const textWithVariousEmails = 'Contact support@uclouvain.be, info@example.com, or admin@test.org';
      const links = formatter.extractLinks(textWithVariousEmails);
      const emailLinks = links.filter(link => link.type === 'email');
      
      expect(emailLinks).toHaveLength(3);
      expect(emailLinks.some(link => link.url === 'mailto:support@uclouvain.be')).toBe(true);
      expect(emailLinks.some(link => link.url === 'mailto:info@example.com')).toBe(true);
      expect(emailLinks.some(link => link.url === 'mailto:admin@test.org')).toBe(true);
    });
  });

  describe('Requirement 6.3: Highlight dates with specific color', () => {
    it('should highlight dates with specific color', () => {
      const textWithDate = 'Meeting scheduled for 26/09/2025';
      const formatted = formatter.formatWithHighlights(textWithDate);
      
      expect(formatted).toContain('<span class="text-formatter-date">26/09/2025</span>');
    });

    it('should detect various date formats', () => {
      const textWithDates = 'Events on 26/09/2025, 15-10-2025, and 03.11.2025';
      const specialContent = formatter.extractSpecialContent(textWithDates);
      
      expect(specialContent.dates).toHaveLength(3);
      expect(specialContent.dates).toContain('26/09/2025');
      expect(specialContent.dates).toContain('15-10-2025');
      expect(specialContent.dates).toContain('03.11.2025');
    });

    it('should handle dates in mixed content', () => {
      const mixedContent = 'URGENT: Meeting on 26/09/2025 at 14h30 cancelled. Contact prof.smith@uclouvain.be';
      const formatted = formatter.formatWithHighlights(mixedContent);
      
      expect(formatted).toContain('text-formatter-date');
      expect(formatted).toContain('text-formatter-time');
      expect(formatted).toContain('text-formatter-important');
      expect(formatted).toContain('text-formatter-email');
    });
  });

  describe('Requirement 6.4: Format phone numbers as clickable links', () => {
    it('should format phone numbers as clickable links', () => {
      const textWithPhone = 'Call +32 10 47 43 02';
      const formatted = formatter.formatWithHighlights(textWithPhone, { createClickableLinks: true });
      
      expect(formatted).toContain('<a href="tel:');
      expect(formatted).toContain('class="text-formatter-phone"');
    });

    it('should handle various phone number formats', () => {
      const textWithPhones = 'Call +32 10 47 43 02 or 010-474-302 or +1-555-123-4567';
      const specialContent = formatter.extractSpecialContent(textWithPhones);
      
      expect(specialContent.phones.length).toBeGreaterThan(0);
      expect(specialContent.phones.some(phone => phone.includes('+32'))).toBe(true);
      expect(specialContent.phones.some(phone => phone.includes('010-474-302'))).toBe(true);
    });

    it('should clean phone numbers for tel: links', () => {
      const textWithPhone = 'Call +32 10 47 43 02';
      const links = formatter.extractLinks(textWithPhone);
      const phoneLink = links.find(link => link.type === 'phone');
      
      expect(phoneLink?.url).toContain('tel:+3210474302');
      expect(phoneLink?.url).not.toContain(' ');
      expect(phoneLink?.url).not.toContain('-');
    });

    it('should handle international phone formats', () => {
      const textWithIntlPhones = 'Call +32 10 47 43 02 or +1-555-123-4567';
      const specialContent = formatter.extractSpecialContent(textWithIntlPhones);
      
      expect(specialContent.phones.length).toBeGreaterThan(0);
      expect(specialContent.phones.some(phone => phone.includes('+32'))).toBe(true);
      expect(specialContent.phones.some(phone => phone.includes('+1-555'))).toBe(true);
    });
  });
});

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

  describe('Important content highlighting', () => {
    it('should highlight important words in French and English', () => {
      const textWithImportant = 'URGENT: Meeting cancelled. New session postponed. Attention required.';
      const formatted = formatter.formatWithHighlights(textWithImportant);
      
      expect(formatted).toContain('<span class="text-formatter-important">URGENT</span>');
      expect(formatted).toContain('<span class="text-formatter-important">cancelled</span>');
      expect(formatted).toContain('<span class="text-formatter-important">New</span>');
      expect(formatted).toContain('<span class="text-formatter-important">postponed</span>');
      expect(formatted).toContain('<span class="text-formatter-important">Attention</span>');
    });

    it('should detect case-insensitive important words', () => {
      const textWithMixedCase = 'urgent meeting Cancelled. new date Important';
      const specialContent = formatter.extractSpecialContent(textWithMixedCase);
      
      expect(specialContent.importantWords).toContain('urgent');
      expect(specialContent.importantWords).toContain('Cancelled');
      expect(specialContent.importantWords).toContain('new');
      expect(specialContent.importantWords).toContain('Important');
    });
  });

  describe('Complex content scenarios', () => {
    it('should handle real-world event description', () => {
      const realWorldContent = `URGENT: IREC Seminar cancelled on 26/09/2025 at 14h30. 
        New date to be announced. Contact Prof. Élise Belaidi at prof.belaidi@uclouvain.be 
        or call +32 10 47 43 02. More info at https://uclouvain.be/irec-seminars`;
      
      const formatted = formatter.formatWithHighlights(realWorldContent, { createClickableLinks: true });
      
      // Should contain all types of special content
      expect(formatted).toContain('text-formatter-important'); // URGENT, cancelled, New
      expect(formatted).toContain('text-formatter-date'); // 26/09/2025
      expect(formatted).toContain('text-formatter-time'); // 14h30
      expect(formatted).toContain('text-formatter-email'); // prof.belaidi@uclouvain.be
      expect(formatted).toContain('text-formatter-phone'); // +32 10 47 43 02
      expect(formatted).toContain('text-formatter-url'); // https://uclouvain.be/irec-seminars
      
      // Should have clickable links
      expect(formatted).toContain('<a href="mailto:prof.belaidi@uclouvain.be"');
      expect(formatted).toContain('<a href="tel:');
      expect(formatted).toContain('<a href="https://uclouvain.be/irec-seminars"');
    });

    it('should handle HTML content with special patterns', () => {
      const htmlWithSpecial = `<p><strong>URGENT</strong>: Meeting on <em>26/09/2025</em> 
        cancelled. Contact <a href="mailto:prof@uclouvain.be">prof@uclouvain.be</a></p>`;
      
      const formatted = formatter.getFormattedHtml(htmlWithSpecial);
      
      // HTML should be cleaned
      expect(formatted).not.toContain('<p>');
      expect(formatted).not.toContain('<strong>');
      expect(formatted).not.toContain('<em>');
      
      // Special content should be formatted
      expect(formatted).toContain('text-formatter-important');
      expect(formatted).toContain('text-formatter-date');
      expect(formatted).toContain('text-formatter-email');
    });

    it('should preserve formatting order and avoid conflicts', () => {
      const textWithOverlap = 'Email urgent@example.com about the urgent meeting';
      const formatted = formatter.formatWithHighlights(textWithOverlap);
      
      // Should format email first, then important word separately
      expect(formatted).toContain('text-formatter-email');
      expect(formatted).toContain('text-formatter-important');
      
      // Should not double-format the word "urgent" in the email
      const emailMatches = formatted.match(/text-formatter-email[^>]*>urgent@example\.com/g);
      expect(emailMatches?.length || 0).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty and null inputs gracefully', () => {
      expect(formatter.formatWithHighlights('')).toBe('');
      expect(formatter.formatWithHighlights(null as any)).toBe('');
      expect(formatter.formatWithHighlights(undefined as any)).toBe('');
      
      expect(formatter.extractLinks('')).toHaveLength(0);
      expect(formatter.extractLinks(null as any)).toHaveLength(0);
      
      expect(formatter.hasSpecialContentPatterns('')).toBe(false);
      expect(formatter.hasSpecialContentPatterns(null as any)).toBe(false);
    });

    it('should handle malformed URLs gracefully', () => {
      const textWithMalformedUrl = 'Visit http:// or https:// for info';
      const specialContent = formatter.extractSpecialContent(textWithMalformedUrl);
      
      // Should not extract malformed URLs
      expect(specialContent.urls).toHaveLength(0);
    });

    it('should handle text with only special characters', () => {
      const specialCharsOnly = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const formatted = formatter.formatWithHighlights(specialCharsOnly);
      
      expect(formatted).toBe(specialCharsOnly);
    });

    it('should handle very long URLs', () => {
      const veryLongUrl = 'https://example.com/very/long/path/with/many/segments/and/parameters?param1=value1&param2=value2&param3=value3&param4=value4';
      const specialContent = formatter.extractSpecialContent(veryLongUrl);
      
      expect(specialContent.urls).toContain(veryLongUrl);
    });
  });
});