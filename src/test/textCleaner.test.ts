import { describe, it, expect } from 'vitest';
import { removeCustomFormatting, getCleanPreview, hasCustomFormatting } from '../utils/textCleaner';

describe('textCleaner', () => {
  describe('removeCustomFormatting', () => {
    it('should remove bold markers', () => {
      const input = 'This is +++bold text+++ in a sentence.';
      const result = removeCustomFormatting(input);
      expect(result).toBe('This is bold text in a sentence.');
    });

    it('should remove italic markers', () => {
      const input = 'This is ___italic text___ in a sentence.';
      const result = removeCustomFormatting(input);
      expect(result).toBe('This is italic text in a sentence.');
    });

    it('should remove underline markers', () => {
      const input = 'This is ~~~underlined text~~~ in a sentence.';
      const result = removeCustomFormatting(input);
      expect(result).toBe('This is underlined text in a sentence.');
    });

    it('should remove line break markers', () => {
      const input = 'First line|||Second line|||Third line';
      const result = removeCustomFormatting(input);
      expect(result).toBe('First line Second line Third line');
    });

    it('should remove separator markers', () => {
      const input = 'Section 1\n===\nSection 2';
      const result = removeCustomFormatting(input);
      expect(result).toBe('Section 1 Section 2');
    });

    it('should remove all markers in complex text', () => {
      const input = `+++Important+++: ___Please note___ that ~~~this is underlined~~~|||New line here===Another section`;
      const result = removeCustomFormatting(input);
      expect(result).toBe('Important: Please note that this is underlined New line here Another section');
    });

    it('should handle empty or invalid input', () => {
      expect(removeCustomFormatting('')).toBe('');
      expect(removeCustomFormatting(null as any)).toBe('');
      expect(removeCustomFormatting(undefined as any)).toBe('');
    });

    it('should handle text without markers', () => {
      const input = 'Regular text without any special formatting.';
      const result = removeCustomFormatting(input);
      expect(result).toBe(input);
    });
  });

  describe('getCleanPreview', () => {
    it('should return clean text within length limit', () => {
      const input = '+++Short+++ text';
      const result = getCleanPreview(input, 50);
      expect(result).toBe('Short text');
    });

    it('should truncate long text with ellipsis', () => {
      const input = '+++This is a very long text+++ that should be truncated because it exceeds the maximum length limit.';
      const result = getCleanPreview(input, 30);
      expect(result).toBe('This is a very long text th...');
    });

    it('should use default length limit', () => {
      const longText = 'A'.repeat(150);
      const input = `+++${longText}+++`;
      const result = getCleanPreview(input);
      expect(result.length).toBe(120); // 117 chars + "..."
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('hasCustomFormatting', () => {
    it('should detect bold markers', () => {
      expect(hasCustomFormatting('+++bold+++')).toBe(true);
    });

    it('should detect italic markers', () => {
      expect(hasCustomFormatting('___italic___')).toBe(true);
    });

    it('should detect underline markers', () => {
      expect(hasCustomFormatting('~~~underline~~~')).toBe(true);
    });

    it('should detect line break markers', () => {
      expect(hasCustomFormatting('text|||more text')).toBe(true);
    });

    it('should detect separator markers', () => {
      expect(hasCustomFormatting('text\n===\nmore')).toBe(true);
    });

    it('should return false for text without markers', () => {
      expect(hasCustomFormatting('Regular text')).toBe(false);
    });

    it('should handle empty or invalid input', () => {
      expect(hasCustomFormatting('')).toBe(false);
      expect(hasCustomFormatting(null as any)).toBe(false);
      expect(hasCustomFormatting(undefined as any)).toBe(false);
    });
  });
});