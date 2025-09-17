# Design Document - UCLouvain Calendar Enhancement

## Overview

Cette conception décrit l'amélioration de l'application de calendrier UCLouvain existante pour créer une interface moderne et fonctionnelle. L'application actuelle utilise React avec TypeScript, ical.js pour le parsing des calendriers, et date-fns pour la manipulation des dates. Les améliorations se concentrent sur l'expérience utilisateur, la charte graphique UCLouvain, et l'ajout de fonctionnalités avancées de recherche et filtrage.

### Objectifs de conception
- Moderniser l'interface utilisateur selon la charte graphique UCLouvain
- Améliorer la lisibilité et l'organisation des événements
- Ajouter des fonctionnalités de recherche et filtrage
- Optimiser l'expérience responsive
- Maintenir les performances avec une pagination intelligente

## Architecture

### Architecture actuelle
L'application suit une architecture React simple avec:
- **Frontend**: React 18 + TypeScript + Vite
- **Parsing**: ical.js pour les calendriers iCal
- **Dates**: date-fns avec localisation française
- **Sources**: Calendriers iCloud et Outlook UCLouvain via proxies CORS

### Améliorations architecturales proposées

#### 1. Gestion d'état centralisée
**Décision**: Introduire React Context pour la gestion d'état globale
**Rationale**: Faciliter le partage d'état entre les composants (événements, filtres, recherche)

#### 2. Système de catégorisation
**Décision**: Étendre le système de sources existant avec un mapping couleurs UCLouvain
**Rationale**: Réutiliser la logique existante tout en appliquant la charte graphique

#### 3. Architecture modulaire des composants
```
src/
├── components/
│   ├── Calendar/
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarHeader.tsx
│   │   ├── EventPagination.tsx
│   │   └── index.tsx
│   ├── Search/
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   ├── Events/
│   │   ├── EventCard.tsx
│   │   ├── EventDetails.tsx
│   │   └── EventTooltip.tsx
│   └── UI/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── contexts/
│   ├── CalendarContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useCalendarEvents.ts
│   ├── useSearch.ts
│   └── useFilters.ts
├── styles/
│   ├── uclouvain-theme.css
│   └── components/
└── utils/
    ├── icalParser.ts (existant)
    ├── colorMapping.ts
    └── searchUtils.ts
```

## Components and Interfaces

### 1. CalendarContext (Nouveau)
```typescript
interface CalendarContextType {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  currentDate: Date;
  selectedEvent: CalendarEvent | null;
  searchQuery: string;
  activeFilters: string[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setSearchQuery: (query: string) => void;
  toggleFilter: (category: string) => void;
  clearFilters: () => void;
  refreshEvents: () => Promise<void>;
}
```

### 2. Enhanced CalendarEvent Interface
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  location: string;
  source: 'icloud' | 'outlook';
  allDay: boolean;
  category: EventCategory; // Nouveau
  color: string; // Nouveau - couleur UCLouvain
}

interface EventCategory {
  id: string;
  name: string;
  color: string;
  source: 'icloud' | 'outlook';
}
```

### 3. Composants principaux

#### CalendarGrid (Refactorisé)
- **Responsabilité**: Affichage de la grille mensuelle avec événements colorés
- **Améliorations**: 
  - Gestion améliorée du chevauchement d'événements
  - Tooltips au survol
  - Indicateurs visuels pour les événements filtrés

#### EventPagination (Nouveau)
- **Responsabilité**: Pagination des événements sous le calendrier
- **Fonctionnalités**:
  - Affichage par pages avec navigation
  - Indicateurs de catégorie colorés
  - Détails d'événements au clic

#### SearchBar (Nouveau)
- **Responsabilité**: Recherche en temps réel dans les événements
- **Fonctionnalités**:
  - Recherche dans titre, description, lieu
  - Mise en évidence des résultats
  - Suggestions de recherche

#### FilterPanel (Nouveau)
- **Responsabilité**: Filtrage par catégorie/source
- **Fonctionnalités**:
  - Sélection multiple de catégories
  - Indicateurs visuels des filtres actifs
  - Bouton "Tout afficher"

## Data Models

### Système de catégorisation
```typescript
const UCLOUVAIN_CATEGORIES: Record<string, EventCategory> = {
  'icloud': {
    id: 'icloud',
    name: 'Calendrier Personnel',
    color: '#003d7a', // Bleu UCLouvain principal
    source: 'icloud'
  },
  'outlook': {
    id: 'outlook', 
    name: 'Calendrier UCLouvain',
    color: '#6c757d', // Gris UCLouvain
    source: 'outlook'
  },
  'cours': {
    id: 'cours',
    name: 'Cours',
    color: '#0056b3', // Bleu UCLouvain secondaire
    source: 'outlook'
  },
  'examens': {
    id: 'examens',
    name: 'Examens',
    color: '#dc3545', // Rouge d'alerte
    source: 'outlook'
  }
};
```

### Gestion des couleurs UCLouvain
```typescript
const UCLOUVAIN_COLORS = {
  primary: '#003d7a',    // Bleu UCLouvain principal
  secondary: '#6c757d',  // Gris UCLouvain
  accent: '#0056b3',     // Bleu secondaire
  success: '#28a745',    // Vert de validation
  warning: '#ffc107',    // Jaune d'avertissement
  danger: '#dc3545',     // Rouge d'alerte
  light: '#f8f9fa',     // Gris très clair
  white: '#ffffff'       // Blanc
};
```

## Error Handling

### Stratégie de gestion d'erreurs
1. **Erreurs de réseau**: Retry automatique avec fallback vers proxies alternatifs
2. **Erreurs de parsing**: Logging détaillé avec continuation du traitement
3. **Erreurs d'interface**: Messages utilisateur en français avec actions de récupération

### Composant ErrorBoundary
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

## Testing Strategy

### Tests unitaires
- **Composants**: Tests de rendu et interactions utilisateur
- **Hooks**: Tests de logique métier (recherche, filtrage)
- **Utils**: Tests des fonctions de parsing et transformation

### Tests d'intégration
- **Flux utilisateur**: Navigation, recherche, filtrage
- **Gestion d'état**: Synchronisation entre composants
- **Responsive**: Tests sur différentes tailles d'écran

### Tests de performance
- **Rendu**: Optimisation avec React.memo et useMemo
- **Pagination**: Tests de charge avec nombreux événements
- **Recherche**: Performance de la recherche en temps réel

## Responsive Design

### Breakpoints UCLouvain
```css
/* Mobile first approach */
.calendar-container {
  /* Mobile: < 768px */
  padding: 1rem;
  
  /* Tablet: 768px - 1024px */
  @media (min-width: 768px) {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
  
  /* Desktop: > 1024px */
  @media (min-width: 1024px) {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Adaptations par appareil
- **Mobile**: Vue compacte avec navigation tactile optimisée
- **Tablet**: Sidebar pour les filtres, grille adaptée
- **Desktop**: Pleine utilisation de l'espace, tooltips avancés

## Performance Optimizations

### Virtualisation des événements
**Décision**: Implémenter une pagination intelligente plutôt que la virtualisation
**Rationale**: Simplicité d'implémentation et performance suffisante pour le volume d'événements attendu

### Memoization
```typescript
// Optimisation du rendu des événements
const MemoizedEventCard = React.memo(EventCard);

// Optimisation des calculs de filtrage
const filteredEvents = useMemo(() => {
  return filterEvents(events, searchQuery, activeFilters);
}, [events, searchQuery, activeFilters]);
```

### Lazy loading
- **Composants**: Chargement différé des modales et panneaux
- **Images**: Si ajout d'avatars ou icônes
- **Données**: Chargement progressif des événements distants

## Security Considerations

### CORS et proxies
- **Problème actuel**: Dépendance aux proxies CORS publics
- **Solution**: Maintenir plusieurs proxies de fallback
- **Amélioration future**: Proxy backend dédié pour la production

### Validation des données
```typescript
const validateEvent = (event: any): CalendarEvent | null => {
  if (!event.title || !event.start) return null;
  // Validation et sanitisation des données
  return sanitizedEvent;
};
```

## Migration Strategy

### Phase 1: Refactoring de base
1. Extraction des composants existants
2. Introduction du CalendarContext
3. Application de la charte graphique UCLouvain

### Phase 2: Nouvelles fonctionnalités
1. Implémentation de la recherche
2. Système de filtrage
3. Pagination des événements

### Phase 3: Optimisations
1. Tests et optimisations de performance
2. Amélioration de l'accessibilité
3. Tests utilisateur et ajustements

### Compatibilité
- **Données**: Maintien de la compatibilité avec les sources iCal existantes
- **API**: Pas de breaking changes dans l'interface utilisateur
- **Configuration**: Migration transparente des paramètres existants