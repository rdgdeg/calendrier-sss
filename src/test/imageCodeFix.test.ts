import { describe, it, expect } from 'vitest';
import { extractImagesFromDescription } from '../utils/imageExtractor';

describe('Image Code Fix', () => {
  it('should remove Outlook/Exchange image codes (cid:)', () => {
    const textWithImageCode = `[cid:image001.png@01DC2D6C.934BF9A0]

Dr. Lara Houeis
défendra en séance publique sa thèse intitulée :
Chemotherapy and ovarian tissue:
From damage characterization to novel gona-
doprotection strategies
Promoteur : Pr. Marie-Madeleine Dolmans
Le vendredi 03 octobre 2025, à 17h00
Auditoire central B`;

    const result = extractImagesFromDescription(textWithImageCode);
    
    // Le code d'image doit être supprimé
    expect(result.cleanDescription).not.toContain('[cid:image001.png@01DC2D6C.934BF9A0]');
    
    // Le contenu principal doit être préservé
    expect(result.cleanDescription).toContain('Dr. Lara Houeis');
    expect(result.cleanDescription).toContain('défendra en séance publique');
    expect(result.cleanDescription).toContain('Chemotherapy and ovarian tissue');
    expect(result.cleanDescription).toContain('Pr. Marie-Madeleine Dolmans');
    expect(result.cleanDescription).toContain('Le vendredi 03 octobre 2025');
    expect(result.cleanDescription).toContain('Auditoire central B');
  });

  it('should handle multiple image codes', () => {
    const textWithMultipleCodes = `[cid:image001.png@01DC2D6C.934BF9A0]
Première partie du texte
[cid:image002.jpg@02DC2D6C.934BF9A1]
Deuxième partie du texte
[cid:logo.png@03DC2D6C.934BF9A2]
Troisième partie`;

    const result = extractImagesFromDescription(textWithMultipleCodes);
    
    // Tous les codes d'image doivent être supprimés
    expect(result.cleanDescription).not.toContain('[cid:image001.png@01DC2D6C.934BF9A0]');
    expect(result.cleanDescription).not.toContain('[cid:image002.jpg@02DC2D6C.934BF9A1]');
    expect(result.cleanDescription).not.toContain('[cid:logo.png@03DC2D6C.934BF9A2]');
    
    // Le contenu doit être préservé
    expect(result.cleanDescription).toContain('Première partie du texte');
    expect(result.cleanDescription).toContain('Deuxième partie du texte');
    expect(result.cleanDescription).toContain('Troisième partie');
  });

  it('should handle text without image codes', () => {
    const normalText = `Dr. Lara Houeis
défendra en séance publique sa thèse intitulée :
Chemotherapy and ovarian tissue`;

    const result = extractImagesFromDescription(normalText);
    
    // Le texte doit rester inchangé
    expect(result.cleanDescription).toContain('Dr. Lara Houeis');
    expect(result.cleanDescription).toContain('défendra en séance publique');
    expect(result.cleanDescription).toContain('Chemotherapy and ovarian tissue');
  });

  it('should handle mixed content with image codes and HTML', () => {
    const mixedContent = `<p>[cid:image001.png@01DC2D6C.934BF9A0]</p>
<p>Dr. Lara Houeis<br>
défendra en séance publique sa thèse intitulée :</p>
<p><strong>Chemotherapy and ovarian tissue:</strong><br>
From damage characterization to novel gona-<br>
doprotection strategies</p>`;

    const result = extractImagesFromDescription(mixedContent);
    
    // Le code d'image doit être supprimé
    expect(result.cleanDescription).not.toContain('[cid:image001.png@01DC2D6C.934BF9A0]');
    
    // Les balises HTML doivent être supprimées mais le contenu préservé
    expect(result.cleanDescription).not.toContain('<p>');
    expect(result.cleanDescription).not.toContain('<br>');
    expect(result.cleanDescription).not.toContain('<strong>');
    
    expect(result.cleanDescription).toContain('Dr. Lara Houeis');
    expect(result.cleanDescription).toContain('Chemotherapy and ovarian tissue');
  });
});