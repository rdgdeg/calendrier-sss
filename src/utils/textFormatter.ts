/**
 * TextFormatter Service
 * Provides text formatting, HTML cleaning, and intelligent truncation capabilities
 * Enhanced with performance optimizations including memoization and lazy loading
 */

import { globalTextFormattingCache, globalLazyTextProcessor } from './performanceOptimizer';

export interface TextFormatterOptions {
  maxLength?: number;
  preserveWords?: boolean;
  showEllipsis?: boolean;
  breakLongWords?: boolean;
  highlightPatterns?: string[];
}

export interface FormattedText {
  content: string | JSX.Element;
  isTruncated: boolean;
  originalLength: number;
  hasSpecialContent: boolean;
}

export interface SpecialContent {
  urls: string[];
  emails: string[];
  phones: string[];
  dates: string[];
  times: string[];
  importantWords: string[];
}

export interface ExtractedLink {
  text: string;
  url: string;
  type: 'url' | 'email' | 'phone';
}

export interface FormattingOptions {
  highlightUrls?: boolean;
  highlightEmails?: boolean;
  highlightPhones?: boolean;
  highlightDates?: boolean;
  highlightTimes?: boolean;
  highlightImportantWords?: boolean;
  createClickableLinks?: boolean;
}

export interface ProcessedContent {
  cleanText: string;
  links: ExtractedLink[];
  dates: ExtractedDate[];
  contacts: ExtractedContact[];
  images: ExtractedImage[];
  formatting: TextFormatting;
}

export interface TextFormatting {
  paragraphs: string[];
  lists: ListItem[];
  emphasis: EmphasisSpan[];
  lineBreaks: number[];
}

export interface ListItem {
  type: 'bullet' | 'numbered';
  content: string;
  level: number;
  index: number;
}

export interface EmphasisSpan {
  start: number;
  end: number;
  type: 'bold' | 'italic' | 'important';
}

export interface ExtractedDate {
  text: string;
  type: 'date' | 'time' | 'datetime';
}

export interface ExtractedContact {
  text: string;
  type: 'email' | 'phone';
  value: string;
}

export interface ExtractedImage {
  alt: string;
  src: string;
}

export interface AdvancedFormattingOptions {
  preserveLineBreaks?: boolean;
  formatParagraphs?: boolean;
  formatLists?: boolean;
  addVisualBullets?: boolean;
  paragraphSpacing?: 'normal' | 'compact' | 'spacious';
  listStyle?: 'bullets' | 'numbers' | 'dashes';
  maxParagraphs?: number;
}

export interface TruncationResult {
  truncatedText: string;
  isTruncated: boolean;
  preservedKeywords: string[];
  hiddenContent: string;
}

export interface TextOverflowAnalysis {
  hasOverflow: boolean;
  estimatedLines: number;
  wordCount: number;
  characterCount: number;
  hasLongWords: boolean;
  hasSpecialContent: boolean;
  breakPoints: number[];
}

// Content detection patterns
const CONTENT_PATTERNS = {
  urls: /https?:\/\/[^\s<>"']+/gi,
  emails: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
  phones: /(\+?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4})/gi,
  dates: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/gi,
  times: /\b\d{1,2}[h:]\d{2}\b/gi,
  importantWords: /\b(urgent|important|annulé|reporté|nouveau|attention|cancelled|canceled|postponed|new|modifié|modified|changed|changé)\b/giu
};

// CSS classes for styling special content
const SPECIAL_CONTENT_CLASSES = {
  url: 'text-formatter-url',
  email: 'text-formatter-email',
  phone: 'text-formatter-phone',
  date: 'text-formatter-date',
  time: 'text-formatter-time',
  important: 'text-formatter-important'
};

export class TextFormatter {
  // Memoized methods for performance optimization
  private memoizedCleanHtml = globalTextFormattingCache.memoize(
    (html: string) => this._cleanHtmlContent(html),
    (html: string) => `clean_${html?.length || 0}_${this.hashString(html || '')}`
  );

  private memoizedExtractSpecialContent = globalTextFormattingCache.memoize(
    (text: string) => this._extractSpecialContent(text),
    (text: string) => `special_${text?.length || 0}_${this.hashString(text || '')}`
  );

  private memoizedIntelligentTruncate = globalTextFormattingCache.memoize(
    (text: string, options: any) => this._intelligentTruncate(text, options),
    (text: string, options: any) => `truncate_${text?.length || 0}_${JSON.stringify(options)}`
  );

  /**
   * Simple hash function for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Format a title with intelligent truncation (performance optimized)
   */
  formatTitle(text: string, options: TextFormatterOptions = {}): FormattedText {
    const {
      maxLength = 120,
      preserveWords = true,
      showEllipsis = true,
      breakLongWords = false
    } = options;

    if (!text || typeof text !== 'string') {
      return {
        content: '',
        isTruncated: false,
        originalLength: 0,
        hasSpecialContent: false
      };
    }

    // Clean the text first (memoized)
    const cleanedText = this.memoizedCleanHtml(text);
    const specialContent = this.memoizedExtractSpecialContent(cleanedText);
    
    // Apply truncation if needed (memoized)
    const truncationResult = this.memoizedIntelligentTruncate(cleanedText, {
      maxLength,
      preserveWords,
      showEllipsis,
      breakLongWords
    });

    return {
      content: truncationResult.truncatedText,
      isTruncated: truncationResult.isTruncated,
      originalLength: cleanedText.length,
      hasSpecialContent: this.hasSpecialContent(specialContent)
    };
  }

  /**
   * Format a description with advanced formatting (performance optimized)
   */
  formatDescription(text: string, options: TextFormatterOptions = {}): FormattedText {
    const {
      maxLength = 500,
      preserveWords = true,
      showEllipsis = true,
      breakLongWords = true
    } = options;

    if (!text || typeof text !== 'string') {
      return {
        content: '',
        isTruncated: false,
        originalLength: 0,
        hasSpecialContent: false
      };
    }

    // Clean the text first (memoized)
    const cleanedText = this.memoizedCleanHtml(text);
    const specialContent = this.memoizedExtractSpecialContent(cleanedText);
    
    // Apply truncation if needed (memoized)
    const truncationResult = this.memoizedIntelligentTruncate(cleanedText, {
      maxLength,
      preserveWords,
      showEllipsis,
      breakLongWords
    });

    return {
      content: truncationResult.truncatedText,
      isTruncated: truncationResult.isTruncated,
      originalLength: cleanedText.length,
      hasSpecialContent: this.hasSpecialContent(specialContent)
    };
  }

  /**
   * Clean HTML content securely (public interface - uses memoized version)
   */
  cleanHtmlContent(html: string): string {
    return this.memoizedCleanHtml(html);
  }

  /**
   * Clean HTML content securely (private implementation)
   */
  private _cleanHtmlContent(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Remove HTML tags while preserving content
    let cleaned = html
      // Remove script and style tags completely
      .replace(/<(script|style)[^>]*>.*?<\/(script|style)>/gis, '')
      // Remove HTML comments
      .replace(/<!--.*?-->/gs, '')
      // Replace common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Decode any remaining HTML entities
    try {
      if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = cleaned;
        cleaned = textarea.value;
      } else {
        // Fallback for server-side or test environments
        cleaned = cleaned
          .replace(/&eacute;/g, 'é')
          .replace(/&egrave;/g, 'è')
          .replace(/&agrave;/g, 'à')
          .replace(/&ccedil;/g, 'ç')
          .replace(/&ocirc;/g, 'ô')
          .replace(/&ecirc;/g, 'ê')
          .replace(/&uuml;/g, 'ü')
          .replace(/&ouml;/g, 'ö')
          .replace(/&auml;/g, 'ä');
      }
    } catch (error) {
      // Fallback if DOM is not available (e.g., in tests)
      console.warn('DOM not available for HTML entity decoding');
    }

    return cleaned;
  }

  /**
   * Extract special content from text (public interface - uses memoized version)
   */
  extractSpecialContent(text: string): SpecialContent {
    return this.memoizedExtractSpecialContent(text);
  }

  /**
   * Extract special content from text (private implementation)
   */
  private _extractSpecialContent(text: string): SpecialContent {
    if (!text || typeof text !== 'string') {
      return {
        urls: [],
        emails: [],
        phones: [],
        dates: [],
        times: [],
        importantWords: []
      };
    }

    return {
      urls: this.extractMatches(text, CONTENT_PATTERNS.urls),
      emails: this.extractMatches(text, CONTENT_PATTERNS.emails),
      phones: this.extractMatches(text, CONTENT_PATTERNS.phones),
      dates: this.extractMatches(text, CONTENT_PATTERNS.dates),
      times: this.extractMatches(text, CONTENT_PATTERNS.times),
      importantWords: this.extractMatches(text, CONTENT_PATTERNS.importantWords)
    };
  }

  /**
   * Format text with highlighted special content
   */
  formatWithHighlights(text: string, options: FormattingOptions = {}): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const {
      highlightUrls = true,
      highlightEmails = true,
      highlightPhones = true,
      highlightDates = true,
      highlightTimes = true,
      highlightImportantWords = true,
      createClickableLinks = true
    } = options;

    let formattedText = text;

    // Apply formatting in order of priority (most specific first)
    if (highlightUrls) {
      formattedText = this.highlightPattern(
        formattedText,
        CONTENT_PATTERNS.urls,
        (match) => createClickableLinks 
          ? `<a href="${match}" class="${SPECIAL_CONTENT_CLASSES.url}" target="_blank" rel="noopener noreferrer">${match}</a>`
          : `<span class="${SPECIAL_CONTENT_CLASSES.url}">${match}</span>`
      );
    }

    if (highlightEmails) {
      formattedText = this.highlightPattern(
        formattedText,
        CONTENT_PATTERNS.emails,
        (match) => createClickableLinks
          ? `<a href="mailto:${match}" class="${SPECIAL_CONTENT_CLASSES.email}">${match}</a>`
          : `<span class="${SPECIAL_CONTENT_CLASSES.email}">${match}</span>`
      );
    }

    if (highlightPhones) {
      formattedText = this.highlightPattern(
        formattedText,
        CONTENT_PATTERNS.phones,
        (match) => createClickableLinks
          ? `<a href="tel:${match.replace(/[-.\s]/g, '')}" class="${SPECIAL_CONTENT_CLASSES.phone}">${match}</a>`
          : `<span class="${SPECIAL_CONTENT_CLASSES.phone}">${match}</span>`
      );
    }

    if (highlightDates) {
      formattedText = this.highlightPattern(
        formattedText,
        CONTENT_PATTERNS.dates,
        (match) => `<span class="${SPECIAL_CONTENT_CLASSES.date}">${match}</span>`
      );
    }

    if (highlightTimes) {
      formattedText = this.highlightPattern(
        formattedText,
        CONTENT_PATTERNS.times,
        (match) => `<span class="${SPECIAL_CONTENT_CLASSES.time}">${match}</span>`
      );
    }

    if (highlightImportantWords) {
      formattedText = this.highlightPattern(
        formattedText,
        CONTENT_PATTERNS.importantWords,
        (match) => `<span class="${SPECIAL_CONTENT_CLASSES.important}">${match}</span>`
      );
    }

    return formattedText;
  }

  /**
   * Extract all links (URLs, emails, phones) from text
   */
  extractLinks(text: string): ExtractedLink[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const links: ExtractedLink[] = [];

    // Extract URLs
    const urls = this.extractMatches(text, CONTENT_PATTERNS.urls);
    urls.forEach(url => {
      links.push({
        text: url,
        url: url,
        type: 'url'
      });
    });

    // Extract emails
    const emails = this.extractMatches(text, CONTENT_PATTERNS.emails);
    emails.forEach(email => {
      links.push({
        text: email,
        url: `mailto:${email}`,
        type: 'email'
      });
    });

    // Extract phones
    const phones = this.extractMatches(text, CONTENT_PATTERNS.phones);
    phones.forEach(phone => {
      links.push({
        text: phone,
        url: `tel:${phone.replace(/[-.\s]/g, '')}`,
        type: 'phone'
      });
    });

    return links;
  }

  /**
   * Get formatted text with special content highlighted (returns HTML string)
   */
  getFormattedHtml(text: string, options: FormattingOptions = {}): string {
    const cleanedText = this.cleanHtmlContent(text);
    return this.formatWithHighlights(cleanedText, options);
  }

  /**
   * Process content with advanced formatting for descriptions (with lazy loading)
   */
  async processAdvancedContentLazy(text: string, options: AdvancedFormattingOptions = {}): Promise<ProcessedContent> {
    const key = `advanced_${this.hashString(text)}_${JSON.stringify(options)}`;
    
    return globalLazyTextProcessor.processLazy(
      key,
      () => this.processAdvancedContent(text, options),
      'normal'
    );
  }

  /**
   * Process content with advanced formatting for descriptions (synchronous)
   */
  processAdvancedContent(text: string, options: AdvancedFormattingOptions = {}): ProcessedContent {
    const {
      preserveLineBreaks = true,
      formatParagraphs = true,
      formatLists = true,
      addVisualBullets = true,
      paragraphSpacing = 'normal',
      listStyle = 'bullets',
      maxParagraphs = 10
    } = options;

    if (!text || typeof text !== 'string') {
      return {
        cleanText: '',
        links: [],
        dates: [],
        contacts: [],
        images: [],
        formatting: {
          paragraphs: [],
          lists: [],
          emphasis: [],
          lineBreaks: []
        }
      };
    }

    // Clean the text first
    const cleanedText = this.cleanHtmlContent(text);
    
    // Extract various content types
    const links = this.extractLinks(cleanedText);
    const dates = this.extractDates(cleanedText);
    const contacts = this.extractContacts(cleanedText);
    const images = this.extractImages(text); // Use original text for images
    
    // Process formatting using original text to preserve structure
    const formatting = this.processTextFormatting(text, {
      preserveLineBreaks,
      formatParagraphs,
      formatLists,
      addVisualBullets,
      paragraphSpacing,
      listStyle,
      maxParagraphs
    });

    return {
      cleanText: cleanedText,
      links,
      dates,
      contacts,
      images,
      formatting
    };
  }

  /**
   * Format description with advanced paragraph and list processing
   */
  formatAdvancedDescription(text: string, options: AdvancedFormattingOptions = {}): string {
    const processedContent = this.processAdvancedContent(text, options);
    return this.renderFormattedContent(processedContent, options, text);
  }

  /**
   * Check if text contains any special content patterns
   */
  hasSpecialContentPatterns(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    return Object.values(CONTENT_PATTERNS).some(pattern => pattern.test(text));
  }

  /**
   * Analyze text for overflow characteristics
   */
  analyzeTextOverflow(text: string, maxLength?: number, _estimatedLineHeight?: number, containerWidth?: number): TextOverflowAnalysis {
    if (!text || typeof text !== 'string') {
      return {
        hasOverflow: false,
        estimatedLines: 0,
        wordCount: 0,
        characterCount: 0,
        hasLongWords: false,
        hasSpecialContent: false,
        breakPoints: []
      };
    }

    const cleanedText = this.cleanHtmlContent(text);
    const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
    const specialContent = this.extractSpecialContent(cleanedText);
    
    // Detect long words (more than 20 characters)
    const hasLongWords = words.some(word => word.length > 20);
    
    // Estimate lines based on character count and average characters per line
    const avgCharsPerLine = containerWidth ? Math.floor(containerWidth / 8) : 80; // Rough estimate
    const estimatedLines = Math.ceil(cleanedText.length / avgCharsPerLine);
    
    // Find potential break points (spaces, punctuation)
    const breakPoints: number[] = [];
    for (let i = 0; i < cleanedText.length; i++) {
      if (/[\s.,;:!?-]/.test(cleanedText[i])) {
        breakPoints.push(i);
      }
    }

    return {
      hasOverflow: maxLength ? cleanedText.length > maxLength : false,
      estimatedLines,
      wordCount: words.length,
      characterCount: cleanedText.length,
      hasLongWords,
      hasSpecialContent: this.hasSpecialContent(specialContent),
      breakPoints
    };
  }

  /**
   * Get smart truncation suggestions for different contexts
   */
  getTruncationSuggestions(text: string, context: 'title' | 'description' | 'preview'): {
    mobile: TextFormatterOptions;
    tablet: TextFormatterOptions;
    desktop: TextFormatterOptions;
    tv: TextFormatterOptions;
  } {
    const analysis = this.analyzeTextOverflow(text);
    
    const baseOptions: TextFormatterOptions = {
      preserveWords: true,
      showEllipsis: true,
      breakLongWords: analysis.hasLongWords
    };

    switch (context) {
      case 'title':
        return {
          mobile: { ...baseOptions, maxLength: 60 },
          tablet: { ...baseOptions, maxLength: 80 },
          desktop: { ...baseOptions, maxLength: 120 },
          tv: { ...baseOptions, maxLength: 200 }
        };
      
      case 'description':
        return {
          mobile: { ...baseOptions, maxLength: 150 },
          tablet: { ...baseOptions, maxLength: 200 },
          desktop: { ...baseOptions, maxLength: 300 },
          tv: { ...baseOptions, maxLength: 500 }
        };
      
      case 'preview':
        return {
          mobile: { ...baseOptions, maxLength: 100 },
          tablet: { ...baseOptions, maxLength: 120 },
          desktop: { ...baseOptions, maxLength: 150 },
          tv: { ...baseOptions, maxLength: 200 }
        };
      
      default:
        return {
          mobile: { ...baseOptions, maxLength: 100 },
          tablet: { ...baseOptions, maxLength: 150 },
          desktop: { ...baseOptions, maxLength: 200 },
          tv: { ...baseOptions, maxLength: 300 }
        };
    }
  }

  /**
   * Intelligent truncation that preserves word boundaries and important content (private implementation)
   */
  private _intelligentTruncate(
    text: string,
    options: {
      maxLength: number;
      preserveWords: boolean;
      showEllipsis: boolean;
      breakLongWords: boolean;
    }
  ): TruncationResult {
    const { maxLength, preserveWords, showEllipsis, breakLongWords } = options;

    if (!text || text.length <= maxLength) {
      return {
        truncatedText: text,
        isTruncated: false,
        preservedKeywords: [],
        hiddenContent: ''
      };
    }

    const ellipsis = showEllipsis ? '...' : '';
    const effectiveMaxLength = maxLength - ellipsis.length;

    let truncatedText = text;
    let preservedKeywords: string[] = [];

    if (preserveWords) {
      // Find the last complete word within the limit
      const words = text.split(/\s+/);
      let currentLength = 0;
      let wordIndex = 0;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordLength = word.length + (i > 0 ? 1 : 0); // +1 for space
        
        if (currentLength + wordLength > effectiveMaxLength) {
          // If this word is too long and we're allowed to break it
          if (breakLongWords && word.length > effectiveMaxLength - currentLength) {
            const remainingSpace = effectiveMaxLength - currentLength - (i > 0 ? 1 : 0);
            if (remainingSpace > 10) { // Only break if we have reasonable space
              const brokenWord = this.breakLongWord(word, remainingSpace);
              words[i] = brokenWord;
              wordIndex = i + 1;
              currentLength += brokenWord.length + (i > 0 ? 1 : 0);
            }
          }
          break;
        }
        
        currentLength += wordLength;
        wordIndex = i + 1;
      }

      if (wordIndex === 0 && words[0].length > effectiveMaxLength) {
        // Handle case where even the first word is too long
        if (breakLongWords) {
          truncatedText = this.breakLongWord(words[0], effectiveMaxLength);
        } else {
          // If we can't break words, take the whole word anyway
          truncatedText = words[0];
        }
      } else {
        truncatedText = words.slice(0, wordIndex).join(' ');
      }

      // Ensure we don't end with a word character if we're adding ellipsis
      if (showEllipsis && truncatedText.length > 0) {
        // If the truncated text ends with a word character, add a space before ellipsis
        if (/\w$/.test(truncatedText)) {
          truncatedText = truncatedText.trimEnd();
        }
      }

      // Extract important words that were preserved
      const specialContent = this.extractSpecialContent(truncatedText);
      preservedKeywords = specialContent.importantWords;
    } else {
      // Character-based truncation with smart word breaking
      if (breakLongWords) {
        truncatedText = this.smartCharacterTruncate(text, effectiveMaxLength);
      } else {
        truncatedText = text.substring(0, effectiveMaxLength);
      }
    }

    const hiddenContent = text.substring(truncatedText.length);

    return {
      truncatedText: truncatedText + ellipsis,
      isTruncated: true,
      preservedKeywords,
      hiddenContent
    };
  }

  /**
   * Break a long word intelligently with hyphens
   */
  private breakLongWord(word: string, maxLength: number): string {
    if (word.length <= maxLength) {
      return word;
    }

    // For URLs, break at logical points
    if (CONTENT_PATTERNS.urls.test(word)) {
      return this.breakUrl(word, maxLength);
    }

    // For emails, break at @ or . if possible
    if (CONTENT_PATTERNS.emails.test(word)) {
      return this.breakEmail(word, maxLength);
    }

    // For regular words, try to break at syllable boundaries or use hyphens
    const breakPoint = Math.max(maxLength - 1, 1); // Leave space for hyphen
    
    // Try to find a good break point (vowel followed by consonant)
    const vowels = /[aeiouAEIOU]/;
    const consonants = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/;
    
    for (let i = Math.min(breakPoint, word.length - 2); i >= Math.max(breakPoint - 5, 1); i--) {
      if (vowels.test(word[i]) && consonants.test(word[i + 1])) {
        return word.substring(0, i + 1) + '-';
      }
    }
    
    // Fallback: break at the maximum length with hyphen
    return word.substring(0, breakPoint) + '-';
  }

  /**
   * Break URL at logical points
   */
  private breakUrl(url: string, maxLength: number): string {
    if (url.length <= maxLength) {
      return url;
    }

    // Try to break after protocol
    const protocolMatch = url.match(/^(https?:\/\/)/);
    if (protocolMatch && protocolMatch[1].length < maxLength - 5) {
      const afterProtocol = protocolMatch[1].length;
      if (afterProtocol < maxLength - 3) {
        return url.substring(0, Math.min(maxLength - 3, url.length)) + '...';
      }
    }

    // Try to break at path separators
    const pathSeparators = ['//', '/', '?', '&', '='];
    for (const separator of pathSeparators) {
      const index = url.lastIndexOf(separator, maxLength - 3);
      if (index > 10 && index < maxLength - 3) { // Ensure meaningful break
        return url.substring(0, index + separator.length) + '...';
      }
    }

    // Fallback: simple truncation
    return url.substring(0, maxLength - 3) + '...';
  }

  /**
   * Break email at logical points
   */
  private breakEmail(email: string, maxLength: number): string {
    if (email.length <= maxLength) {
      return email;
    }

    // Try to break at @ symbol
    const atIndex = email.indexOf('@');
    if (atIndex > 0 && atIndex < maxLength - 3) {
      return email.substring(0, Math.min(maxLength - 3, email.length)) + '...';
    }

    // Try to break at dots in domain
    const lastDotIndex = email.lastIndexOf('.', maxLength - 3);
    if (lastDotIndex > atIndex && lastDotIndex < maxLength - 3) {
      return email.substring(0, lastDotIndex) + '...';
    }

    // Fallback: simple truncation
    return email.substring(0, maxLength - 3) + '...';
  }

  /**
   * Smart character-based truncation that avoids breaking words awkwardly
   */
  private smartCharacterTruncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Try to find a space near the end
    const searchStart = Math.max(0, maxLength - 20);
    const searchEnd = Math.min(text.length, maxLength);
    
    for (let i = searchEnd; i >= searchStart; i--) {
      if (/\s/.test(text[i])) {
        return text.substring(0, i);
      }
    }

    // If no space found, look for punctuation
    for (let i = searchEnd; i >= searchStart; i--) {
      if (/[.,;:!?]/.test(text[i])) {
        return text.substring(0, i + 1);
      }
    }

    // Fallback: break at maxLength
    return text.substring(0, maxLength);
  }

  /**
   * Extract matches from text using a regex pattern
   */
  private extractMatches(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Check if special content exists
   */
  private hasSpecialContent(specialContent: SpecialContent): boolean {
    return Object.values(specialContent).some(arr => arr.length > 0);
  }

  /**
   * Highlight pattern matches in text with custom formatter
   */
  private highlightPattern(
    text: string,
    pattern: RegExp,
    formatter: (match: string) => string
  ): string {
    // Reset regex lastIndex to ensure consistent behavior
    pattern.lastIndex = 0;
    
    return text.replace(pattern, (match, offset, fullString) => {
      // Convert to string to ensure we have string methods
      const str = String(fullString);
      
      // Check if this match is inside an existing HTML tag
      const beforeMatch = str.substring(0, offset);
      const afterMatch = str.substring(offset + match.length);
      
      // Count unclosed tags before this match
      const openTags = (beforeMatch.match(/<[^/>][^>]*>/g) || []).length;
      const closeTags = (beforeMatch.match(/<\/[^>]+>/g) || []).length;
      
      // If we're inside a tag, don't format
      if (openTags > closeTags) {
        return match;
      }
      
      // Also check if the match is already inside a formatted span or link
      if (beforeMatch.includes('<span class="text-formatter-') && 
          !beforeMatch.includes('</span>') && 
          !afterMatch.startsWith('</span>')) {
        return match;
      }
      
      if (beforeMatch.includes('<a ') && 
          !beforeMatch.includes('</a>') && 
          !afterMatch.startsWith('</a>')) {
        return match;
      }
      
      return formatter(match);
    });
  }

  /**
   * Extract dates and times from text
   */
  private extractDates(text: string): ExtractedDate[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const dates: ExtractedDate[] = [];

    // Extract dates
    const dateMatches = this.extractMatches(text, CONTENT_PATTERNS.dates);
    dateMatches.forEach(date => {
      dates.push({
        text: date,
        type: 'date'
      });
    });

    // Extract times
    const timeMatches = this.extractMatches(text, CONTENT_PATTERNS.times);
    timeMatches.forEach(time => {
      dates.push({
        text: time,
        type: 'time'
      });
    });

    return dates;
  }

  /**
   * Extract contact information from text
   */
  private extractContacts(text: string): ExtractedContact[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const contacts: ExtractedContact[] = [];

    // Extract emails
    const emails = this.extractMatches(text, CONTENT_PATTERNS.emails);
    emails.forEach(email => {
      contacts.push({
        text: email,
        type: 'email',
        value: email
      });
    });

    // Extract phones
    const phones = this.extractMatches(text, CONTENT_PATTERNS.phones);
    phones.forEach(phone => {
      contacts.push({
        text: phone,
        type: 'phone',
        value: phone.replace(/[-.\s]/g, '')
      });
    });

    return contacts;
  }

  /**
   * Extract image references from original HTML text
   */
  private extractImages(text: string): ExtractedImage[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const images: ExtractedImage[] = [];
    // More flexible regex that handles different attribute orders
    const imgPattern = /<img[^>]*>/gi;
    
    let match;
    while ((match = imgPattern.exec(text)) !== null) {
      const imgTag = match[0];
      
      // Extract src attribute
      const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      
      // Extract alt attribute
      const altMatch = imgTag.match(/alt\s*=\s*["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : '';
      
      if (src) {
        images.push({
          src,
          alt
        });
      }
    }

    return images;
  }

  /**
   * Process text formatting including paragraphs, lists, and line breaks
   */
  private processTextFormatting(
    text: string,
    options: AdvancedFormattingOptions
  ): TextFormatting {
    const {
      preserveLineBreaks = true,
      formatParagraphs = true,
      formatLists = true,
      maxParagraphs = 10
    } = options;

    const formatting: TextFormatting = {
      paragraphs: [],
      lists: [],
      emphasis: [],
      lineBreaks: []
    };

    if (!text) {
      return formatting;
    }

    // Process paragraphs (clean each paragraph individually)
    if (formatParagraphs) {
      const rawParagraphs = this.extractParagraphs(text, maxParagraphs);
      formatting.paragraphs = rawParagraphs.map(p => this.cleanHtmlContent(p));
    }

    // Process lists (clean each list item individually)
    if (formatLists) {
      const rawLists = this.extractLists(text);
      formatting.lists = rawLists.map(item => ({
        ...item,
        content: this.cleanHtmlContent(item.content)
      }));
    }

    // Process line breaks
    if (preserveLineBreaks) {
      formatting.lineBreaks = this.findLineBreaks(text);
    }

    // Process emphasis (use cleaned text for this)
    const cleanedText = this.cleanHtmlContent(text);
    formatting.emphasis = this.extractEmphasis(cleanedText);

    return formatting;
  }

  /**
   * Extract paragraphs from text
   */
  private extractParagraphs(text: string, maxParagraphs: number): string[] {
    if (!text) {
      return [];
    }

    // Split by double line breaks or paragraph indicators
    const paragraphs = text
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .slice(0, maxParagraphs);

    return paragraphs;
  }

  /**
   * Extract list items from text
   */
  private extractLists(text: string): ListItem[] {
    if (!text) {
      return [];
    }

    const lists: ListItem[] = [];
    const lines = text.split(/\n|\r\n/);

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for bullet lists (-, *, •, ◦, etc.)
      const bulletMatch = trimmedLine.match(/^[-*•◦▪▫‣⁃]\s+(.+)$/);
      if (bulletMatch) {
        lists.push({
          type: 'bullet',
          content: bulletMatch[1].trim(),
          level: this.calculateIndentLevel(line),
          index: index
        });
        return;
      }

      // Check for numbered lists (1., 2., a), etc.)
      const numberedMatch = trimmedLine.match(/^(\d+|[a-zA-Z])[.)]\s+(.+)$/);
      if (numberedMatch) {
        lists.push({
          type: 'numbered',
          content: numberedMatch[2].trim(),
          level: this.calculateIndentLevel(line),
          index: index
        });
        return;
      }
    });

    return lists;
  }

  /**
   * Find line break positions in text
   */
  private findLineBreaks(text: string): number[] {
    if (!text) {
      return [];
    }

    const lineBreaks: number[] = [];
    const lines = text.split(/\n|\r\n/);
    let position = 0;

    lines.forEach((line, index) => {
      if (index > 0) {
        lineBreaks.push(position);
      }
      position += line.length + 1; // +1 for the line break character
    });

    return lineBreaks;
  }

  /**
   * Extract emphasis spans from text
   */
  private extractEmphasis(text: string): EmphasisSpan[] {
    if (!text) {
      return [];
    }

    const emphasis: EmphasisSpan[] = [];

    // Find important words
    const importantMatches = this.extractMatches(text, CONTENT_PATTERNS.importantWords);
    importantMatches.forEach(word => {
      const index = text.indexOf(word);
      if (index !== -1) {
        emphasis.push({
          start: index,
          end: index + word.length,
          type: 'important'
        });
      }
    });

    return emphasis;
  }

  /**
   * Calculate indentation level for list items
   */
  private calculateIndentLevel(line: string): number {
    const leadingSpaces = line.match(/^(\s*)/);
    if (!leadingSpaces) {
      return 0;
    }
    
    // Assume 2 spaces or 1 tab = 1 level
    const spaces = leadingSpaces[1];
    const tabCount = (spaces.match(/\t/g) || []).length;
    const spaceCount = spaces.replace(/\t/g, '').length;
    
    return tabCount + Math.floor(spaceCount / 2);
  }

  /**
   * Render formatted content as HTML
   */
  private renderFormattedContent(
    content: ProcessedContent,
    options: AdvancedFormattingOptions,
    originalText?: string
  ): string {
    const {
      paragraphSpacing = 'normal',
      listStyle = 'bullets',
      addVisualBullets = true
    } = options;

    let html = content.cleanText;

    // Determine the primary content type and render accordingly
    if (content.formatting.lists.length > 0) {
      // If we have lists, render them (they may include paragraphs)
      html = this.renderLists(content.formatting.lists, listStyle, addVisualBullets);
      
      // Add any remaining paragraphs that aren't part of lists
      if (content.formatting.paragraphs.length > content.formatting.lists.length) {
        const spacingClass = `text-formatter-paragraph-${paragraphSpacing}`;
        const remainingParagraphs = content.formatting.paragraphs
          .slice(content.formatting.lists.length)
          .map(p => `<p class="${spacingClass}">${this.formatWithHighlights(p)}</p>`)
          .join('');
        html += remainingParagraphs;
      }
    } else if (content.formatting.paragraphs.length > 1) {
      // Multiple paragraphs without lists
      const spacingClass = `text-formatter-paragraph-${paragraphSpacing}`;
      const paragraphsHtml = content.formatting.paragraphs
        .map(p => `<p class="${spacingClass}">${this.formatWithHighlights(p)}</p>`)
        .join('');
      html = paragraphsHtml;
    } else if (content.formatting.paragraphs.length === 1) {
      // Single paragraph
      html = this.formatWithHighlights(content.formatting.paragraphs[0]);
    } else {
      // No structured content, apply highlights to clean text
      html = this.formatWithHighlights(content.cleanText);
    }

    // Apply line break preservation for simple content
    const shouldPreserveLineBreaks = content.formatting.lineBreaks.length > 0 && 
        content.formatting.paragraphs.length <= 1 && 
        content.formatting.lists.length === 0 &&
        originalText;
        
    if (shouldPreserveLineBreaks) {
      // Use the original text to preserve line breaks, then clean and format
      const cleanedOriginal = this.cleanHtmlContent(originalText);
      html = this.formatWithHighlights(cleanedOriginal.replace(/\n/g, '<br>'));
    }

    return html;
  }

  /**
   * Render lists as HTML
   */
  private renderLists(lists: ListItem[], style: string, addVisualBullets: boolean): string {
    if (lists.length === 0) {
      return '';
    }

    const bulletSymbol = style === 'dashes' ? '–' : '•';
    const listClass = `text-formatter-list text-formatter-list-${style}`;

    return lists
      .map(item => {
        const levelClass = `text-formatter-list-level-${item.level}`;
        const symbol = item.type === 'bullet' && addVisualBullets ? bulletSymbol : '';
        const content = this.formatWithHighlights(item.content);
        
        return `<div class="${listClass} ${levelClass}">
          ${symbol ? `<span class="text-formatter-bullet">${symbol}</span>` : ''}
          <span class="text-formatter-list-content">${content}</span>
        </div>`;
      })
      .join('');
  }
}

// Export a singleton instance
export const textFormatter = new TextFormatter();