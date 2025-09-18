# Document de Conception - Amélioration de l'Affichage Public

## Vue d'Ensemble

Cette conception vise à transformer l'affichage public des événements du Secteur SSS UCLouvain en une interface moderne, professionnelle et visuellement engageante. L'objectif est de créer une expérience visuelle optimisée pour la consultation à distance sur écran, tout en reflétant l'identité de l'UCLouvain.

## Architecture

### Structure des Composants

```
DisplayView (composant principal)
├── Header (en-tête avec branding UCLouvain)
├── CurrentTimeDisplay (affichage de l'heure en temps réel)
├── EventsGrid (grille d'événements)
│   ├── EventCard (carte d'événement individuelle)
│   │   ├── EventBadge (badge de date/source)
│   │   ├── EventIcon (icône contextuelle)
│   │   └── EventContent (contenu principal)
├── EmptyState (état vide attractif)
└── LoadingAnimation (animations de chargement)
```

### Système de Design

**Palette de Couleurs UCLouvain:**
- Primaire: Bleu UCLouvain (#003f7f)
- Secondaire: Gris moderne (#f8f9fa, #e9ecef)
- Accent: Orange UCLouvain (#ff6b35)
- Texte: Noir profond (#212529) et blanc (#ffffff)

**Typographie:**
- Titre principal: 3.5rem, poids 700
- Titres d'événements: 1.8rem, poids 600
- Texte descriptif: 1.2rem, poids 400
- Métadonnées: 1rem, poids 500

## Composants et Interfaces

### 1. Header Component
**Responsabilité:** Affichage du branding et de l'identité UCLouvain

**Design Decisions:**
- Logo UCLouvain proéminent en haut à gauche
- Titre "Événements à Venir - Secteur SSS" centré
- Gradient subtil en arrière-plan pour la modernité
- Hauteur fixe de 120px pour maintenir les proportions

### 2. CurrentTimeDisplay Component
**Responsabilité:** Affichage de l'heure actuelle en temps réel

**Design Decisions:**
- Position en haut à droite pour visibilité maximale
- Mise à jour toutes les secondes avec transition fade
- Format 24h avec date complète
- Taille de police importante (2rem) pour lecture à distance

### 3. EventsGrid Component
**Responsabilité:** Organisation et affichage des événements en grille

**Design Decisions:**
- Grille CSS responsive (auto-fit, minmax(400px, 1fr))
- Gap de 24px entre les cartes pour respiration visuelle
- Animation d'apparition échelonnée (stagger) de 100ms par carte
- Maximum 6 événements visibles simultanément

### 4. EventCard Component
**Responsabilité:** Affichage individuel d'un événement

**Design Decisions:**
- Carte avec border-radius de 16px pour modernité
- Box-shadow subtile avec effet hover plus prononcé
- Padding interne de 24px pour confort visuel
- Transition hover de 0.3s pour fluidité
- Hauteur minimale de 200px pour cohérence

**Structure interne:**
```css
.event-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  transform: translateY(0);
}

.event-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-4px);
}
```

### 5. EventBadge Component
**Responsabilité:** Affichage des badges de date et source

**Design Decisions:**
- Badge de date: fond bleu UCLouvain, texte blanc
- Badge de source: couleurs différenciées par source
- Border-radius de 8px pour cohérence avec le design
- Position absolute en haut à droite de la carte

### 6. EventIcon Component
**Responsabilité:** Icônes contextuelles pour les événements

**Design Decisions:**
- Bibliothèque d'icônes Lucide React pour cohérence
- Taille de 24px pour visibilité optimale
- Couleur adaptée au type d'événement
- Position à gauche du titre pour hiérarchie visuelle

### 7. EmptyState Component
**Responsabilité:** Affichage attractif quand aucun événement

**Design Decisions:**
- Illustration SVG personnalisée UCLouvain
- Message encourageant avec typographie élégante
- Animation subtile (pulse) pour maintenir l'intérêt
- Centrage vertical et horizontal parfait

## Modèles de Données

### EventDisplayData
```typescript
interface EventDisplayData {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  source: EventSource;
  category: EventCategory;
  isAllDay: boolean;
}

interface EventSource {
  name: string;
  color: string;
  icon?: string;
}

interface EventCategory {
  name: string;
  icon: string;
  color: string;
}
```

### DisplayConfiguration
```typescript
interface DisplayConfiguration {
  maxEvents: number;
  refreshInterval: number;
  animationDuration: number;
  theme: DisplayTheme;
}

interface DisplayTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}
```

## Gestion des Erreurs

### Stratégies d'Affichage
1. **Événements non disponibles:** Affichage de l'EmptyState avec message informatif
2. **Erreur de chargement:** Skeleton loader avec retry automatique
3. **Données corrompues:** Filtrage automatique et log des erreurs
4. **Perte de connexion:** Mode dégradé avec dernières données en cache

### Messages d'Erreur
- Ton professionnel et rassurant
- Cohérence avec l'identité UCLouvain
- Instructions claires si action utilisateur requise

## Stratégie de Test

### Tests Visuels
1. **Responsive Design:** Tests sur différentes résolutions d'écran
2. **Contraste:** Vérification WCAG AA pour accessibilité
3. **Animations:** Tests de performance et fluidité
4. **États:** Validation de tous les états (chargement, vide, erreur)

### Tests d'Intégration
1. **Mise à jour temps réel:** Vérification du rafraîchissement automatique
2. **Transitions:** Tests des animations entre états
3. **Performance:** Mesure des temps de rendu et d'animation
4. **Mémoire:** Tests de fuites mémoire pour affichage continu

### Tests d'Accessibilité
1. **Lecture d'écran:** Compatibilité avec technologies d'assistance
2. **Navigation clavier:** Bien que non interactive, structure sémantique
3. **Contraste couleurs:** Validation automatisée des ratios
4. **Tailles de police:** Tests de lisibilité à distance

## Considérations Techniques

### Performance
- Utilisation de CSS Grid et Flexbox pour layouts efficaces
- Animations CSS plutôt que JavaScript quand possible
- Lazy loading des images si présentes
- Optimisation des re-renders avec React.memo

### Accessibilité
- Structure sémantique HTML5 appropriée
- Attributs ARIA pour les éléments dynamiques
- Respect des guidelines WCAG 2.1 niveau AA
- Support des préférences utilisateur (prefers-reduced-motion)

### Maintenance
- Variables CSS pour thème centralisé
- Composants modulaires et réutilisables
- Documentation inline pour configurations
- Système de logging pour debugging en production

## Animations et Micro-interactions

### Animations d'Entrée
```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card {
  animation: slideInUp 0.6s ease-out forwards;
}
```

### Transitions d'État
- Fade in/out pour changements de contenu (300ms)
- Scale et shadow pour effets hover (200ms)
- Slide pour apparition/disparition d'événements (400ms)

### Animations Continues
- Pulse subtil pour l'heure actuelle (2s cycle)
- Rotation douce pour icônes de chargement (1s linear)
- Gradient animé pour états vides (3s ease-in-out)