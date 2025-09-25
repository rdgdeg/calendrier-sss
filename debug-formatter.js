import { TextFormatter } from './src/utils/textFormatter.js';

const formatter = new TextFormatter();

// Test paragraph extraction
const multiParagraphText = `First paragraph.

Second paragraph.

Third paragraph.`;

console.log('Testing paragraph extraction...');
const result = formatter.processAdvancedContent(multiParagraphText);
console.log('Paragraphs found:', result.formatting.paragraphs.length);
console.log('Paragraphs:', result.formatting.paragraphs);

// Test list extraction
const listText = `- First item
- Second item
* Third item`;

console.log('\nTesting list extraction...');
const listResult = formatter.processAdvancedContent(listText);
console.log('Lists found:', listResult.formatting.lists.length);
console.log('Lists:', listResult.formatting.lists);