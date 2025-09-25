import { describe, it, expect } from 'vitest';
import { textFormatter } from '../utils/textFormatter';

describe('TextFormatter - Long Text Management', () => {
  describe('Long Word Breaking', () => {
    it('breaks very long words with hyphens', () => {
      const longWord = 'supercalifragilisticexpialidocious';
      const result = textFormatter.formatTitle(longWord, {
        maxLength: 20,
        breakLongWords: true
      });

      expect(result.content).toContain('-');
      expect(result.isTruncated).toBe(true);
      expect(String(result.content).length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('breaks URLs at logical points', () => {
      const longUrl = 'https://www.verylongdomainname.com/very/long/path/to/resource?param1=value1&param2=value2';
      const result = textFormatter.formatDescription(longUrl, {
        maxLength: 50,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(String(result.content)).toMatch(/\.\.\./);
    });

    it('breaks emails at appropriate points', () => {
      const longEmail = 'verylongusername@verylongdomainname.organization.com';
      const result = textFormatter.formatDescription(longEmail, {
        maxLength: 30,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(String(result.content)).toMatch(/\.\.\./);
    });
  });

  describe('Text Overflow Analysis', () => {
    it('analyzes text overflow characteristics', () => {
      const text = 'This is a test text with some verylongwordthatdoesnotbreak and normal words.';
      const analysis = textFormatter.analyzeTextOverflow(text, 50);

      expect(analysis.hasOverflow).toBe(true);
      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.characterCount).toBe(text.length);
      expect(analysis.hasLongWords).toBe(true);
      expect(analysis.breakPoints.length).toBeGreaterThan(0);
    });

    it('detects special content in overflow analysis', () => {
      const textWithSpecial = 'Visit https://example.com or email test@example.com for urgent information.';
      const analysis = textFormatter.analyzeTextOverflow(textWithSpecial);

      expect(analysis.hasSpecialContent).toBe(true);
      expect(analysis.wordCount).toBeGreaterThan(0);
    });

    it('provides accurate line estimation', () => {
      const shortText = 'Short text';
      const longText = 'This is a much longer text that would span multiple lines in a typical display container with standard width.';
      
      const shortAnalysis = textFormatter.analyzeTextOverflow(shortText, undefined, undefined, 300);
      const longAnalysis = textFormatter.analyzeTextOverflow(longText, undefined, undefined, 300);

      expect(shortAnalysis.estimatedLines).toBeLessThan(longAnalysis.estimatedLines);
    });
  });

  describe('Truncation Suggestions', () => {
    it('provides appropriate suggestions for titles', () => {
      const titleText = 'This is a very long title that needs different truncation for different screen sizes';
      const suggestions = textFormatter.getTruncationSuggestions(titleText, 'title');

      expect(suggestions.mobile.maxLength).toBeLessThan(suggestions.tablet.maxLength!);
      expect(suggestions.tablet.maxLength).toBeLessThan(suggestions.desktop.maxLength!);
      expect(suggestions.desktop.maxLength).toBeLessThan(suggestions.tv.maxLength!);
    });

    it('provides appropriate suggestions for descriptions', () => {
      const descText = 'This is a description with more content that can be longer than titles';
      const suggestions = textFormatter.getTruncationSuggestions(descText, 'description');

      expect(suggestions.mobile.maxLength).toBeGreaterThan(100);
      expect(suggestions.tv.maxLength).toBeGreaterThan(suggestions.mobile.maxLength!);
    });

    it('enables word breaking for texts with long words', () => {
      const textWithLongWords = 'Text with supercalifragilisticexpialidocious words';
      const suggestions = textFormatter.getTruncationSuggestions(textWithLongWords, 'description');

      expect(suggestions.mobile.breakLongWords).toBe(true);
      expect(suggestions.desktop.breakLongWords).toBe(true);
    });
  });

  describe('Smart Character Truncation', () => {
    it('avoids breaking words when possible', () => {
      const text = 'This is a sentence with multiple words that should break nicely.';
      const result = textFormatter.formatDescription(text, {
        maxLength: 30,
        preserveWords: false,
        breakLongWords: true
      });

      // Should not end in the middle of a word if possible
      const content = String(result.content).replace('...', '');
      expect(content).not.toMatch(/\w$/); // Should not end with a word character
    });

    it('finds punctuation break points', () => {
      const text = 'First sentence. Second sentence, with comma. Third sentence!';
      const result = textFormatter.formatDescription(text, {
        maxLength: 25,
        preserveWords: false,
        breakLongWords: true
      });

      const content = String(result.content).replace('...', '');
      // Should break at punctuation if possible
      expect(content).toMatch(/[.!,]$/);
    });
  });

  describe('Edge Cases', () => {
    it('handles text with only long words', () => {
      const onlyLongWords = 'supercalifragilisticexpialidocious antidisestablishmentarianism';
      const result = textFormatter.formatTitle(onlyLongWords, {
        maxLength: 25,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(String(result.content).length).toBeLessThanOrEqual(28); // 25 + '...'
    });

    it('handles text with mixed content types', () => {
      const mixedText = 'Contact verylongusername@verylongdomain.com or visit https://www.verylongurl.com/path for urgent information about supercalifragilisticexpialidocious matters.';
      const result = textFormatter.formatDescription(mixedText, {
        maxLength: 80,
        breakLongWords: true
      });

      expect(result.isTruncated).toBe(true);
      expect(result.hasSpecialContent).toBe(true);
    });

    it('preserves important words when possible', () => {
      const textWithImportant = 'This is urgent information about supercalifragilisticexpialidocious matters that need attention.';
      const result = textFormatter.formatDescription(textWithImportant, {
        maxLength: 50,
        preserveWords: true,
        breakLongWords: true
      });

      // Keywords should be preserved in the content
      expect(result.content).toContain('urgent');
      expect(result.content).toContain('attention');
    });
  });
});