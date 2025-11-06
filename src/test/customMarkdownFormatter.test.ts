import { describe, it, expect } from 'vitest';
import { CustomMarkdownFormatter } from '../utils/customMarkdownFormatter';

describe('CustomMarkdownFormatter', () => {
  describe('formatText', () => {
    it('should format bold text with +++ markers', () => {
      const input = 'This is +++bold text+++ in a sentence.';
      const result = CustomMarkdownFormatter.formatText(input);
      expect(result).toContain('<strong class="custom-bold">bold text</strong>');
    });

    it('should format italic text with ___ markers', () => {
      const input = 'This is ___italic text___ in a sentence.';
      const result = CustomMarkdownFormatter.formatText(input);
      expect(result).toContain('<em class="custom-italic">italic text</em>');
    });

    it('should format underlined text with ~~~ markers', () => {
      const input = 'This is ~~~underlined text~~~ in a sentence.';
      const result = CustomMarkdownFormatter.formatText(input);
      expect(result).toContain('<u class="custom-underline">underlined text</u>');
    });

    it('should convert ||| to line breaks', () => {
      const input = 'First line|||Second line|||Third line';
      const result = CustomMarkdownFormatter.formatText(input);
      expect(result).toContain('<br class="custom-break">');
      expect(result.split('<br class="custom-break">').length).toBe(3);
    });

    it('should convert === to horizontal separators', () => {
      const input = 'Section 1\n===\nSection 2';
      const result = CustomMarkdownFormatter.formatText(input);
      expect(result).toContain('<hr class="custom-separator">');
    });

    it('should handle multiple formatting types in one text', () => {
      const input = '+++Important+++: ___Please note___ that ~~~this is underlined~~~|||New line here';
      const result = CustomMarkdownFormatter.formatText(input);
      
      expect(result).toContain('<strong class="custom-bold">Important</strong>');
      expect(result).toContain('<em class="custom-italic">Please note</em>');
      expect(result).toContain('<u class="custom-underline">this is underlined</u>');
      expect(result).toContain('<br class="custom-break">');
    });

    it('should handle empty or invalid input', () => {
      expect(CustomMarkdownFormatter.formatText('')).toBe('');
      expect(CustomMarkdownFormatter.formatText(null as any)).toBe('');
      expect(CustomMarkdownFormatter.formatText(undefined as any)).toBe('');
    });

    it('should not format incomplete markers', () => {
      const input = 'This has +++incomplete bold and ___incomplete italic';
      const result = CustomMarkdownFormatter.formatText(input);
      expect(result).toBe(input); // Should remain unchanged
    });
  });

  describe('processEventDescription', () => {
    it('should process a complete event description with custom formatting', () => {
      const input = `+++Événement Important+++

___Conférencier___ : Dr. Smith
~~~Attention~~~ : Places limitées|||
Inscription obligatoire

===

Détails supplémentaires :
* Point 1
* Point 2`;

      const result = CustomMarkdownFormatter.processEventDescription(input);
      
      expect(result).toContain('<strong class="custom-bold">Événement Important</strong>');
      expect(result).toContain('<em class="custom-italic">Conférencier</em>');
      expect(result).toContain('<u class="custom-underline">Attention</u>');
      expect(result).toContain('<br class="custom-break">');
      expect(result).toContain('<hr class="custom-separator">');
      expect(result).toContain('• Point 1');
      expect(result).toContain('• Point 2');
    });

    it('should handle real-world event description', () => {
      const input = `+++IRSS: journée scientifique+++

___Intervenant___ : Pre Alison Pilnick|||
~~~Important~~~ : Accréditation demandée

* Matinée, 10-h12h. "It's all just words"
* Après-midi, 14h-16h. 'Between autonomy and abandonment'

===

Inscription : valerie.vanbutsele@uclouvain.be`;

      const result = CustomMarkdownFormatter.processEventDescription(input);
      
      expect(result).toContain('<strong class="custom-bold">IRSS: journée scientifique</strong>');
      expect(result).toContain('<em class="custom-italic">Intervenant</em>');
      expect(result).toContain('<u class="custom-underline">Important</u>');
      expect(result).toContain('<hr class="custom-separator">');
      expect(result).toContain('• Matinée');
      expect(result).toContain('• Après-midi');
    });
  });

  describe('getMarkersGuide', () => {
    it('should return a helpful guide for users', () => {
      const guide = CustomMarkdownFormatter.getMarkersGuide();
      expect(guide).toContain('+++texte+++');
      expect(guide).toContain('___texte___');
      expect(guide).toContain('~~~texte~~~');
      expect(guide).toContain('|||');
      expect(guide).toContain('===');
    });
  });
});