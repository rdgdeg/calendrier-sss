/**
 * Utility functions for cleaning text from custom formatting markers
 */

/**
 * Remove custom formatting markers from text for clean display in previews
 */
export function removeCustomFormatting(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Remove bold markers +++text+++
    .replace(/\+\+\+([^+]+)\+\+\+/g, '$1')
    // Remove italic markers ___text___
    .replace(/___([^_]+)___/g, '$1')
    // Remove underline markers ~~~text~~~
    .replace(/~~~([^~]+)~~~/g, '$1')
    // Remove line break markers |||
    .replace(/\|\|\|/g, ' ')
    // Remove separator markers ===
    .replace(/===/g, ' ')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get clean text preview with length limit
 */
export function getCleanPreview(text: string, maxLength: number = 120): string {
  const cleanText = removeCustomFormatting(text);
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return `${cleanText.substring(0, maxLength - 3)}...`;
}

/**
 * Check if text contains custom formatting markers
 */
export function hasCustomFormatting(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const markers = [
    /\+\+\+[^+]+\+\+\+/,
    /___[^_]+___/,
    /~~~[^~]+~~~/,
    /\|\|\|/,
    /===/
  ];

  return markers.some(marker => marker.test(text));
}