/**
 * TextFormatter Usage Examples
 * 
 * This file demonstrates how to use the TextFormatter for special content detection and formatting
 */

import { textFormatter } from './textFormatter';

// Example 1: Basic special content detection
const eventDescription = `URGENT: IREC Seminar cancelled on 26/09/2025 at 14h30. 
New date to be announced. Contact Prof. Élise Belaidi at prof.belaidi@uclouvain.be 
or call +32 10 47 43 02. More info at https://uclouvain.be/irec-seminars`;

console.log('=== Example 1: Special Content Detection ===');
const specialContent = textFormatter.extractSpecialContent(eventDescription);
console.log('URLs:', specialContent.urls);
console.log('Emails:', specialContent.emails);
console.log('Phones:', specialContent.phones);
console.log('Dates:', specialContent.dates);
console.log('Times:', specialContent.times);
console.log('Important words:', specialContent.importantWords);

// Example 2: Formatted HTML output with clickable links
console.log('\n=== Example 2: Formatted HTML Output ===');
const formattedHtml = textFormatter.formatWithHighlights(eventDescription, {
  createClickableLinks: true,
  highlightUrls: true,
  highlightEmails: true,
  highlightPhones: true,
  highlightDates: true,
  highlightTimes: true,
  highlightImportantWords: true
});
console.log('Formatted HTML:', formattedHtml);

// Example 3: Extract all links for separate display
console.log('\n=== Example 3: Extracted Links ===');
const links = textFormatter.extractLinks(eventDescription);
links.forEach(link => {
  console.log(`${link.type.toUpperCase()}: ${link.text} -> ${link.url}`);
});

// Example 4: Clean HTML content and format
const htmlContent = `<p><strong>URGENT</strong>: Meeting on <em>26/09/2025</em> 
cancelled. Contact <a href="mailto:prof@uclouvain.be">prof@uclouvain.be</a></p>`;

console.log('\n=== Example 4: HTML Cleaning and Formatting ===');
console.log('Original HTML:', htmlContent);
const cleanedAndFormatted = textFormatter.getFormattedHtml(htmlContent);
console.log('Cleaned and formatted:', cleanedAndFormatted);

// Example 5: Title formatting with truncation
const longTitle = 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie - Very Long Title That Should Be Truncated';

console.log('\n=== Example 5: Title Formatting with Truncation ===');
const formattedTitle = textFormatter.formatTitle(longTitle, { 
  maxLength: 80,
  preserveWords: true,
  showEllipsis: true 
});
console.log('Original title length:', longTitle.length);
console.log('Formatted title:', formattedTitle.content);
console.log('Is truncated:', formattedTitle.isTruncated);
console.log('Has special content:', formattedTitle.hasSpecialContent);

// Example 6: Description formatting with special content
const mixedDescription = `Meeting scheduled for 26/09/2025 at 14h30. 
Contact information: prof.smith@uclouvain.be or +32 10 47 43 02.
IMPORTANT: Please confirm attendance at https://uclouvain.be/confirm`;

console.log('\n=== Example 6: Description Formatting ===');
const formattedDescription = textFormatter.formatDescription(mixedDescription, {
  maxLength: 200,
  preserveWords: true
});
console.log('Formatted description:', formattedDescription.content);
console.log('Has special content:', formattedDescription.hasSpecialContent);

// Example 7: Check for special content patterns
console.log('\n=== Example 7: Pattern Detection ===');
const testTexts = [
  'Regular text without special content',
  'Contact us at info@example.com',
  'Meeting on 26/09/2025',
  'URGENT announcement',
  'Visit https://example.com'
];

testTexts.forEach(text => {
  const hasSpecial = textFormatter.hasSpecialContentPatterns(text);
  console.log(`"${text}" has special content: ${hasSpecial}`);
});

export {};