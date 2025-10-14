/**
 * Fixed version of processCustomLineBreaks function
 */

export function processCustomLineBreaksFixed(text: string, marker: string = '***'): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape special regex characters in the marker properly
  const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Replace custom markers with HTML line breaks
  return text.replace(new RegExp(escapedMarker, 'g'), '<br><br>');
}