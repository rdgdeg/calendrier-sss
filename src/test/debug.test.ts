import { describe, it, expect } from 'vitest';
import { TextFormatter } from '../utils/textFormatter';

describe('Debug TextFormatter', () => {
  it('should debug paragraph extraction', () => {
    const formatter = new TextFormatter();
    const text = `First paragraph.

Second paragraph.

Third paragraph.`;
    
    console.log('Input text:', JSON.stringify(text));
    
    // Test the extractParagraphs method directly
    const paragraphs = (formatter as any).extractParagraphs(text, 10);
    console.log('Extracted paragraphs:', paragraphs);
    
    // Test the full processAdvancedContent method
    const result = formatter.processAdvancedContent(text);
    console.log('Full result:', JSON.stringify(result, null, 2));
    
    expect(paragraphs.length).toBeGreaterThan(1);
  });

  it('should debug list extraction', () => {
    const formatter = new TextFormatter();
    const listText = `Regular text before list.
- First bullet item
- Second bullet item
* Third bullet item with asterisk
• Fourth bullet item with bullet symbol
More text after list.`;
    
    console.log('List input text:', JSON.stringify(listText));
    
    // Test the extractLists method directly
    const lists = (formatter as any).extractLists(listText);
    console.log('Extracted lists:', lists);
    
    // Test the full processAdvancedContent method
    const result = formatter.processAdvancedContent(listText);
    console.log('Full list result:', JSON.stringify(result.formatting.lists, null, 2));
    
    expect(lists.length).toBeGreaterThan(0);
  });

  it('should debug line break preservation', () => {
    const formatter = new TextFormatter();
    const textWithLineBreaks = `First line
Second line`;
    
    console.log('Line break input text:', JSON.stringify(textWithLineBreaks));
    
    // Test the full processAdvancedContent method
    const result = formatter.processAdvancedContent(textWithLineBreaks, {
      preserveLineBreaks: true,
      formatParagraphs: false
    });
    console.log('Line breaks found:', result.formatting.lineBreaks);
    console.log('Paragraphs found:', result.formatting.paragraphs.length);
    console.log('Lists found:', result.formatting.lists.length);
    
    // Test the full formatAdvancedDescription method
    const formatted = formatter.formatAdvancedDescription(textWithLineBreaks, {
      preserveLineBreaks: true,
      formatParagraphs: false
    });
    console.log('Formatted result:', JSON.stringify(formatted));
    
    // Test the renderFormattedContent method directly
    const rendered = (formatter as any).renderFormattedContent(result, {
      preserveLineBreaks: true,
      formatParagraphs: false
    }, textWithLineBreaks);
    console.log('Direct render result:', JSON.stringify(rendered));
    
    // Check the conditions
    console.log('Line breaks length:', result.formatting.lineBreaks.length);
    console.log('Paragraphs length:', result.formatting.paragraphs.length);
    console.log('Lists length:', result.formatting.lists.length);
    console.log('Original text provided:', !!textWithLineBreaks);
    
    expect(result.formatting.lineBreaks.length).toBeGreaterThan(0);
  });
});