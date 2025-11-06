# 📺 Vue Écran - Affichage TV/Écran large

## 🎯 Objectif

Créer une vue spécialement optimisée pour l'affichage sur écrans de télévision ou moniteurs larges, permettant de diffuser les événements SSS de manière claire et lisible à distance.

## ✨ Fonctionnalités

### 📋 Affichage des événements
- **5 prochains événements** maximum pour une lisibilité optimale
- **Tri automatique** par date et heure
- **Mise à jour en temps réel** de l'horloge (toutes les minutes)
- **Statut des événements** : En cours, Aujourd'hui, À venir

### 🎨 Design optimisé TV
- **Typographie grande** : Titres jusqu'à 3.5rem, textes lisibles à distance
- **Contraste élevé** : Couleurs UCLouvain avec arrière-plans contrastés
- **Animations subtiles** : Entrée progressive des événements
- **Indicateurs visuels** : Points colorés, badges de source, numérotation

### ⏰ Informations affichées
- **Date intelligente** : "Aujourd'hui", "Demain", jour de la semaine
- **Heure précise** : Format 24h avec plage horaire
- **Titre complet** de l'événement
- **Lieu** si disponible
- **Source** : iCloud ou Outlook avec badges colorés
- **Statut EN COURS** pour les événements actuels

## 🏗️ Architecture technique

### Composant ScreenView.tsx
```typescript
interface ScreenViewProps {
  events: CalendarEvent[];
}

// Fonctionnalités principales :
- getUpcomingEvents(): Filtre et trie les 5 prochains événements
- formatEventDate(): Formatage intelligent des dates
- formatEventTime(): Gestion des heures et événements multi-jours
- getEventStatus(): Détermine le statut (current/today/upcoming)
```

### Mise à jour temps réel
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000); // Mise à jour chaque minute
  
  return () => clearInterval(timer);
}, []);
```

## 🎨 Design System

### Layout principal
```css
.screen-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
```

### Header avec horloge
- **Titre** : "📅 Prochains événements SSS"
- **Branding** : "UCLouvain"
- **Horloge** : Heure actuelle (4rem) + Date complète
- **Dégradé UCLouvain** : Bleu primaire vers secondaire

### Événements
```css
.screen-event {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 3rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  border-left: 8px solid var(--event-color);
}
```

### Typographie
- **Titre événement** : 2.2rem, font-weight 600
- **Date** : 1.8rem, couleur UCL primaire
- **Heure** : 1.4rem, font-variant-numeric tabular-nums
- **Lieu** : 1.3rem avec icône 📍

## 📱 Responsive Design

### Écrans 4K (2560px+)
```css
.screen-title h1 { font-size: 4.5rem; }
.current-time { font-size: 5rem; }
.event-title { font-size: 2.8rem; }
```

### Full HD (1920px)
```css
.screen-title h1 { font-size: 3.5rem; }
.current-time { font-size: 4rem; }
.event-title { font-size: 2.2rem; }
```

### HD (1366px)
```css
.screen-title h1 { font-size: 2.5rem; }
.current-time { font-size: 3rem; }
.event-title { font-size: 1.8rem; }
```

## 🎯 Statuts des événements

### 🔴 EN COURS
```css
.screen-event.current {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-left-color: #ef4444;
  animation: currentEventPulse 2s ease-in-out infinite;
}

.live-indicator {
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  animation: livePulse 1.5s ease-in-out infinite;
}
```

### 📅 AUJOURD'HUI
```css
.screen-event.today {
  background: linear-gradient(135deg, rgba(0, 61, 122, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-left-color: var(--ucl-primary);
}
```

### ⏳ À VENIR
- Style par défaut avec couleur de l'événement
- Animation d'entrée progressive (slideInUp)

## 🎨 Éléments visuels

### Indicateur d'événement
- **Point coloré** : Couleur de la source (24px)
- **Numéro** : Position dans la liste (1-5)
- **Badge source** : iCloud (🍎) ou Outlook (📧)

### Animations
```css
@keyframes slideInUp {
  0% { opacity: 0; transform: translateY(50px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes currentEventPulse {
  0%, 100% { box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2); }
  50% { box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4); }
}
```

## 🌙 Mode sombre

Support automatique du mode sombre système :
```css
@media (prefers-color-scheme: dark) {
  .screen-view {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .screen-event {
    background: rgba(30, 41, 59, 0.95);
    color: var(--ucl-text-primary);
  }
}
```

## 🎛️ Contrôles

### Sélecteur de vue
- **Position** : Coin supérieur droit (fixed)
- **Style** : Glassmorphism avec backdrop-filter
- **Boutons** : Mois, Agenda, Écran
- **Actualisation** : Bouton de refresh intégré

### Interface épurée
- **Navigation** : Masquée en vue écran
- **Recherche** : Masquée en vue écran
- **Footer** : Masqué en vue écran
- **Modales** : Désactivées en vue écran

## ♿ Accessibilité

### Réduction d'animations
```css
@media (prefers-reduced-motion: reduce) {
  .screen-event { animation: none !important; }
  .live-indicator { animation: none !important; }
}
```

### Contraste élevé
- Textes avec text-shadow pour la lisibilité
- Bordures colorées pour la distinction
- Couleurs UCLouvain respectées

## 🚀 Utilisation

### Activation
1. Cliquer sur le bouton "📺 Écran" dans le sélecteur de vue
2. L'interface se simplifie automatiquement
3. Seuls les 5 prochains événements sont affichés
4. Mise à jour automatique de l'horloge

### Cas d'usage
- **Écrans d'accueil** dans les bâtiments UCLouvain
- **Salles de réunion** pour afficher les événements du jour
- **Espaces communs** pour informer sur les activités SSS
- **Événements** pour afficher le programme en temps réel

### Format recommandé
- **Ratio** : 16:9 (format TV standard)
- **Résolution** : Full HD (1920x1080) minimum
- **Distance** : Optimisé pour lecture à 2-5 mètres
- **Orientation** : Paysage uniquement

## 📊 Avantages

### Pour les utilisateurs
- **Lisibilité maximale** à distance
- **Information essentielle** sans surcharge
- **Mise à jour temps réel** de l'horloge
- **Statut visuel** des événements en cours

### Pour l'administration
- **Déploiement simple** : URL unique
- **Maintenance automatique** : Synchronisation des calendriers
- **Branding UCLouvain** : Identité visuelle respectée
- **Responsive** : Adaptation automatique aux écrans

La vue écran transforme le calendrier SSS en un affichage professionnel parfait pour la diffusion sur écrans larges ! 📺✨