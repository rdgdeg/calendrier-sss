import { processCustomLineBreaksFixed } from '../utils/textFormatterFixed';
import { describe, it, expect } from 'vitest';

describe('Line Breaks Fix', () => {
  it('should process *** markers correctly without infinite loops', () => {
    const text = 'First line***Second line***Third line';
    const result = processCustomLineBreaksFixed(text, '***');
    
    expect(result).toBe('First line<br><br>Second line<br><br>Third line');
  });

  it('should handle special regex characters in markers', () => {
    const text = 'First...Second...Third';
    const result = processCustomLineBreaksFixed(text, '...');
    
    expect(result).toBe('First<br><br>Second<br><br>Third');
  });

  it('should handle complex markers with special characters', () => {
    const text = 'First[***]Second[***]Third';
    const result = processCustomLineBreaksFixed(text, '[***]');
    
    expect(result).toBe('First<br><br>Second<br><br>Third');
  });

  it('should handle text without markers', () => {
    const text = 'No markers in this text';
    const result = processCustomLineBreaksFixed(text, '***');
    
    expect(result).toBe('No markers in this text');
  });

  it('should handle empty or null text', () => {
    expect(processCustomLineBreaksFixed('', '***')).toBe('');
    expect(processCustomLineBreaksFixed(null as any, '***')).toBe('');
    expect(processCustomLineBreaksFixed(undefined as any, '***')).toBe('');
  });

  it('should handle multiple consecutive markers', () => {
    const text = 'Start******Middle***End';
    const result = processCustomLineBreaksFixed(text, '***');
    
    expect(result).toBe('Start<br><br><br><br>Middle<br><br>End');
  });

  it('should not cause infinite loops with complex regex patterns', () => {
    const complexText = 'Test with *** and more *** content *** here';
    
    // This should complete quickly without hanging
    const startTime = performance.now();
    const result = processCustomLineBreaksFixed(complexText, '***');
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    expect(result).toBe('Test with <br><br> and more <br><br> content <br><br> here');
  });

  it('should handle markers at the beginning and end of text', () => {
    const text = '***Start with marker and end with marker***';
    const result = processCustomLineBreaksFixed(text, '***');
    
    expect(result).toBe('<br><br>Start with marker and end with marker<br><br>');
  });

  it('should handle very long text with many markers efficiently', () => {
    const longText = Array.from({ length: 100 }, (_, i) => `Section ${i + 1}`).join('***');
    
    const startTime = performance.now();
    const result = processCustomLineBreaksFixed(longText, '***');
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    expect(result).toContain('<br><br>');
    expect(result.split('<br><br>')).toHaveLength(100); // Should have 99 breaks + 1 extra
  });
});