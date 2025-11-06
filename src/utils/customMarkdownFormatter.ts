/**
 * Custom Markdown-like Formatter for Event Descriptions
 * Supports custom markers for formatting text content
 */

export interface CustomFormattingOptions {
  boldMarker?: string;
  italicMarker?: string;
  underlineMarker?: string;
  lineBreakMarker?: string;
  separatorMarker?: string;
}

export class CustomMarkdownFormatter {
  private static readonly DEFAULT_OPTIONS: Required<CustomFormattingOptions> = {
    boldMarker: '+++',
    italicMarker: '___',
    underlineMarker: '~~~',
    lineBreakMarker: '|||',
    separatorMarker: '==='
  };

  /**
   * Format text with custom markdown-like markers
   */
  static formatText(text: string, options: CustomFormattingOptions = {}): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let formattedText = text;

    // Process markers in order of priority
    formattedText = this.processBoldMarkers(formattedText, opts.boldMarker);
    formattedText = this.processItalicMarkers(formattedText, opts.italicMarker);
    formattedText = this.processUnderlineMarkers(formattedText, opts.underlineMarker);
    formattedText = this.processLineBreakMarkers(formattedText, opts.lineBreakMarker);
    formattedText = this.processSeparatorMarkers(formattedText, opts.separatorMarker);

    return formattedText;
  }

  /**
   * Process bold markers: +++text+++ → <strong>text</strong>
   */
  private static processBoldMarkers(text: string, marker: string): string {
    const escapedMarker = this.escapeRegexChars(marker);
    const regex = new RegExp(`${escapedMarker}([^${escapedMarker}]+?)${escapedMarker}`, 'g');
    return text.replace(regex, '<strong class="custom-bold">$1</strong>');
  }

  /**
   * Process italic markers: ___text___ → <em>text</em>
   */
  private static processItalicMarkers(text: string, marker: string): string {
    const escapedMarker = this.escapeRegexChars(marker);
    const regex = new RegExp(`${escapedMarker}([^${escapedMarker}]+?)${escapedMarker}`, 'g');
    return text.replace(regex, '<em class="custom-italic">$1</em>');
  }

  /**
   * Process underline markers: ~~~text~~~ → <u>text</u>
   */
  private static processUnderlineMarkers(text: string, marker: string): string {
    const escapedMarker = this.escapeRegexChars(marker);
    const regex = new RegExp(`${escapedMarker}([^${escapedMarker}]+?)${escapedMarker}`, 'g');
    return text.replace(regex, '<u class="custom-underline">$1</u>');
  }

  /**
   * Process line break markers: ||| → <br>
   */
  private static processLineBreakMarkers(text: string, marker: string): string {
    const escapedMarker = this.escapeRegexChars(marker);
    const regex = new RegExp(escapedMarker, 'g');
    return text.replace(regex, '<br class="custom-break">');
  }

  /**
   * Process separator markers: === → <hr>
   */
  private static processSeparatorMarkers(text: string, marker: string): string {
    const escapedMarker = this.escapeRegexChars(marker);
    // Match === on its own line, with optional whitespace
    const regex = new RegExp(`(^|\\n)\\s*${escapedMarker}\\s*(?=\\n|$)`, 'gm');
    return text.replace(regex, '$1<hr class="custom-separator">');
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegexChars(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get a preview of available markers for documentation
   */
  static getMarkersGuide(): string {
    return `
Marqueurs de formatage disponibles :
• +++texte+++ → texte en gras
• ___texte___ → texte en italique  
• ~~~texte~~~ → texte souligné
• ||| → retour à la ligne
• === → ligne de séparation

Exemples :
+++Important+++ : Inscription obligatoire
___Lieu___ : Salle A.123
~~~Attention~~~ : Places limitées
|||
Première ligne|||Deuxième ligne
===
Section suivante
    `.trim();
  }

  /**
   * Process a complete event description with all formatting
   */
  static processEventDescription(description: string): string {
    if (!description) return '';

    // First apply custom formatting BEFORE any other processing
    let processed = this.formatText(description);

    // Then handle standard line breaks and bullet points
    processed = processed
      // Convert double line breaks to paragraph breaks (but preserve custom elements)
      .replace(/\n\s*\n(?![^<]*>)/g, '</p><p>')
      // Convert single line breaks to <br> (but preserve custom breaks and other HTML)
      .replace(/\n(?![^<]*>)/g, '<br>')
      // Handle bullet points (*, -, •) - but not inside HTML tags
      .replace(/(<br>)?[\s]*\*\s+(?![^<]*>)/g, '<br>• ')
      .replace(/(<br>)?[\s]*-\s+(?![^<]*>)/g, '<br>• ')
      .replace(/(<br>)?[\s]*•\s+(?![^<]*>)/g, '<br>• ')
      // Clean up multiple breaks (but preserve custom breaks)
      .replace(/(<br>\s*){3,}(?!class="custom-break")/g, '<br><br>');

    // Wrap in paragraphs if not already wrapped and no custom elements
    if (!processed.includes('<p>') && !processed.includes('<hr')) {
      processed = `<p>${processed}</p>`;
    } else if (!processed.includes('<p>')) {
      // Handle case where we have custom elements but need paragraph wrapping
      const parts = processed.split(/(<hr[^>]*>)/);
      processed = parts.map(part => {
        if (part.includes('<hr')) return part;
        return part.trim() ? `<p>${part.trim()}</p>` : '';
      }).filter(Boolean).join('');
    }

    return processed;
  }
}

// Export default instance for convenience
export const customMarkdownFormatter = CustomMarkdownFormatter;