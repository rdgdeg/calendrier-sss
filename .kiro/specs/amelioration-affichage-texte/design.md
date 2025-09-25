# Design Document

## Overview

Cette conception détaille l'amélioration de l'affichage du texte dans le calendrier UCLouvain pour résoudre les problèmes de lisibilité identifiés. La solution se concentre sur trois axes principaux : la typographie adaptative, le formatage intelligent du contenu, et l'optimisation de l'espace d'affichage.

## Architecture

### Composants Principaux

1. **TextFormatter** - Service central de formatage du texte
2. **ResponsiveText** - Composant pour l'adaptation automatique des tailles
3. **SmartTruncation** - Système de troncature intelligente
4. **ContentProcessor** - Traitement et nettoyage du contenu
5. **TypographySystem** - Système de typographie adaptatif

### Flux de Données

```
Texte brut → ContentProcessor → TextFormatter → ResponsiveText → Affichage optimisé
```

## Components and Interfaces

### 1. TextFormatter Service

```typescript
interface TextFormatterOptions {
  maxLength?: number;
  preserveWords?: boolean;
  showEllipsis?: boolean;
  breakLongWords?: boolean;
  highlightPatterns?: string[];
}

interface FormattedText {
  content: string | JSX.Element;
  isTruncated: boolean;
  originalLength: number;
  hasSpecialContent: boolean;
}

class TextFormatter {
  formatTitle(text: string, options: TextFormatterOptions): FormattedText
  formatDescription(text: string, options: TextFormatterOptions): FormattedText
  cleanHtmlContent(html: string): string
  extractSpecialContent(text: string): SpecialContent
}
```

### 2. ResponsiveText Component

```typescript
interface ResponsiveTextProps {
  text: string;
  variant: 'title' | 'description' | 'metadata';
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'tv';
  maxLines?: number;
  className?: string;
}

interface TypographyScale {
  mobile: { fontSize: string; lineHeight: string; };
  tablet: { fontSize: string; lineHeight: string; };
  desktop: { fontSize: string; lineHeight: string; };
  tv: { fontSize: string; lineHeight: string; };
}
```

### 3. SmartTruncation System

```typescript
interface TruncationConfig {
  strategy: 'word' | 'character' | 'sentence';
  maxLength: number;
  ellipsisText: string;
  preserveImportantWords: boolean;
  importantPatterns: string[];
}

interface TruncationResult {
  truncatedText: string;
  isTruncated: boolean;
  preservedKeywords: string[];
  hiddenContent: string;
}
```

### 4. ContentProcessor

```typescript
interface ProcessedContent {
  cleanText: string;
  links: ExtractedLink[];
  dates: ExtractedDate[];
  contacts: ExtractedContact[];
  images: ExtractedImage[];
  formatting: TextFormatting;
}

interface TextFormatting {
  paragraphs: string[];
  lists: ListItem[];
  emphasis: EmphasisSpan[];
  lineBreaks: number[];
}
```

## Data Models

### Typography System

```typescript
// Échelle typographique adaptative
const TYPOGRAPHY_SCALES = {
  title: {
    mobile: { fontSize: '16px', lineHeight: '1.3', fontWeight: '600' },
    tablet: { fontSize: '18px', lineHeight: '1.3', fontWeight: '600' },
    desktop: { fontSize: '20px', lineHeight: '1.3', fontWeight: '600' },
    tv: { fontSize: '28px', lineHeight: '1.2', fontWeight: '700' }
  },
  description: {
    mobile: { fontSize: '13px', lineHeight: '1.4', fontWeight: '400' },
    tablet: { fontSize: '14px', lineHeight: '1.5', fontWeight: '400' },
    desktop: { fontSize: '15px', lineHeight: '1.5', fontWeight: '400' },
    tv: { fontSize: '18px', lineHeight: '1.4', fontWeight: '400' }
  },
  metadata: {
    mobile: { fontSize: '11px', lineHeight: '1.3', fontWeight: '500' },
    tablet: { fontSize: '12px', lineHeight: '1.3', fontWeight: '500' },
    desktop: { fontSize: '13px', lineHeight: '1.3', fontWeight: '500' },
    tv: { fontSize: '16px', lineHeight: '1.3', fontWeight: '500' }
  }
};
```

### Troncature Intelligente

```typescript
// Configuration de troncature par contexte
const TRUNCATION_CONFIGS = {
  eventCardTitle: {
    mobile: { maxLength: 60, strategy: 'word' },
    tablet: { maxLength: 80, strategy: 'word' },
    desktop: { maxLength: 120, strategy: 'word' },
    tv: { maxLength: 200, strategy: 'word' }
  },
  eventCardDescription: {
    mobile: { maxLines: 2, strategy: 'sentence' },
    tablet: { maxLines: 3, strategy: 'sentence' },
    desktop: { maxLines: 3, strategy: 'sentence' },
    tv: { maxLines: 4, strategy: 'sentence' }
  }
};
```

### Patterns de Contenu Spécial

```typescript
const CONTENT_PATTERNS = {
  urls: /https?:\/\/[^\s]+/gi,
  emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  phones: /(\+?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4})/gi,
  dates: /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/gi,
  times: /\d{1,2}[h:]\d{2}/gi,
  importantWords: /\b(urgent|important|annulé|reporté|nouveau|attention)\b/gi
};
```

## Error Handling

### Stratégies de Fallback

1. **Texte Malformé** : Nettoyage automatique et affichage du contenu récupérable
2. **Contenu Trop Long** : Troncature progressive avec préservation du sens
3. **Caractères Spéciaux** : Échappement et conversion en entités HTML sûres
4. **Images Cassées** : Remplacement par des placeholders textuels
5. **Liens Invalides** : Désactivation des liens et affichage en texte simple

### Gestion des Erreurs

```typescript
interface TextProcessingError {
  type: 'truncation' | 'formatting' | 'content' | 'display';
  message: string;
  fallbackContent: string;
  originalContent: string;
}

class ErrorHandler {
  handleTruncationError(error: Error, content: string): string
  handleFormattingError(error: Error, content: string): string
  logProcessingError(error: TextProcessingError): void
}
```

## Testing Strategy

### Tests Unitaires

1. **TextFormatter**
   - Troncature de titres de différentes longueurs
   - Formatage de descriptions avec contenu spécial
   - Nettoyage de contenu HTML malformé
   - Préservation des mots importants

2. **ResponsiveText**
   - Adaptation aux différentes tailles d'écran
   - Application correcte des échelles typographiques
   - Gestion des changements de taille d'écran

3. **SmartTruncation**
   - Troncature au niveau des mots vs caractères
   - Préservation du sens avec des phrases courtes
   - Gestion des mots très longs

### Tests d'Intégration

1. **Cartes d'Événements**
   - Affichage correct sur tous les types d'écrans
   - Troncature appropriée selon l'espace disponible
   - Formatage cohérent des différents types de contenu

2. **Vue Détaillée**
   - Affichage complet des descriptions longues
   - Formatage correct des liens et contenus spéciaux
   - Scroll fluide pour le contenu débordant

### Tests Visuels

1. **Régression Visuelle**
   - Comparaison avant/après sur différents événements types
   - Vérification de la lisibilité à différentes distances
   - Cohérence typographique sur tous les composants

2. **Tests d'Accessibilité**
   - Contraste suffisant pour tous les textes
   - Tailles de police respectant les standards WCAG
   - Navigation au clavier pour les liens formatés

### Cas de Test Spécifiques

```typescript
const TEST_CASES = {
  longTitle: "IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie",
  htmlContent: "<p>Description avec <strong>HTML</strong> et <a href='http://example.com'>liens</a></p>",
  specialCharacters: "Événement avec caractères spéciaux: é, à, ç, €, ™",
  mixedContent: "Rendez-vous le 26/09/2025 à 12h00 - Contact: prof.belaidi@uclouvain.be - Tél: +32 10 47 43 02",
  veryLongDescription: "Description très longue avec plusieurs paragraphes...",
  emptyContent: "",
  malformedHtml: "<p>Contenu <strong>mal fermé <em>avec balises</p> imbriquées</em>"
};
```

## Implementation Details

### Phase 1: Core Text Processing
- Implémentation du TextFormatter avec nettoyage HTML
- Création du système de troncature intelligente
- Mise en place des patterns de détection de contenu spécial

### Phase 2: Responsive Typography
- Implémentation du composant ResponsiveText
- Configuration des échelles typographiques
- Adaptation automatique selon la taille d'écran

### Phase 3: Enhanced Formatting
- Amélioration du formatage des descriptions
- Mise en évidence des contenus spéciaux (liens, dates, contacts)
- Optimisation de l'affichage des listes et paragraphes

### Phase 4: Integration & Polish
- Intégration dans les composants existants (EventCard, EventModal)
- Tests et optimisations de performance
- Ajustements finaux basés sur les retours utilisateurs

### Considérations de Performance

1. **Memoization** : Cache des résultats de formatage pour éviter les recalculs
2. **Lazy Processing** : Traitement différé pour les descriptions longues
3. **Debounced Resize** : Gestion optimisée des changements de taille d'écran
4. **Virtual Scrolling** : Pour les listes longues d'événements avec descriptions

### Compatibilité

- Support des navigateurs modernes (Chrome 90+, Firefox 88+, Safari 14+)
- Fallbacks gracieux pour les navigateurs plus anciens
- Optimisation pour les écrans tactiles et non-tactiles
- Support des préférences d'accessibilité système