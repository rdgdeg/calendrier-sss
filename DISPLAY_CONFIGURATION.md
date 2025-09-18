# Configuration et Maintenance de l'Affichage Public

## Vue d'ensemble

Ce document fournit des instructions complètes pour configurer, maintenir et dépanner l'affichage public des événements UCLouvain. L'affichage est optimisé pour fonctionner en continu sur des écrans de présentation.

## Configuration Initiale

### Prérequis Système

- **Résolution d'écran recommandée**: 1920x1080 (16:9) ou supérieure
- **Navigateur**: Chrome/Chromium 90+ (recommandé pour les performances)
- **Connexion réseau**: Stable pour la synchronisation des événements
- **Matériel**: Écran avec support HDMI/DisplayPort, ordinateur avec GPU dédié (recommandé)

### Configuration de l'Affichage

#### 1. Paramètres d'Écran

```bash
# Configuration recommandée pour écran dédié
# Résolution: 1920x1080 @ 60Hz
# Mode: Plein écran
# Orientation: Paysage
```

#### 2. Configuration du Navigateur

```javascript
// Paramètres Chrome recommandés pour affichage continu
const chromeFlags = [
  '--kiosk',                    // Mode kiosque plein écran
  '--no-first-run',            // Pas de configuration initiale
  '--disable-infobars',        // Masquer les barres d'information
  '--disable-notifications',   // Désactiver les notifications
  '--disable-extensions',      // Désactiver les extensions
  '--autoplay-policy=no-user-gesture-required' // Autoriser les animations
];
```

#### 3. Variables d'Environnement

```env
# .env.local
REACT_APP_DISPLAY_MODE=public
REACT_APP_MAX_EVENTS=6
REACT_APP_REFRESH_INTERVAL=300000  # 5 minutes en millisecondes
REACT_APP_ANIMATION_DURATION=600   # Durée des animations en ms
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

## Configuration des Événements

### Limite d'Affichage

L'affichage est optimisé pour **maximum 6 événements simultanés** :

```typescript
// Dans DisplayView.tsx
interface DisplayViewProps {
  daysToShow?: number; // Par défaut: 6
}

// Configuration dans EventsGrid.tsx
const maxEvents = 6; // Limite stricte pour l'affichage
```

### Filtrage des Événements

Les événements sont filtrés et triés automatiquement :

```typescript
const getUpcomingEvents = (): CalendarEvent[] => {
  const now = new Date();
  return events
    .filter(event => event.start >= now)           // Événements futurs uniquement
    .sort((a, b) => a.start.getTime() - b.start.getTime()) // Tri chronologique
    .slice(0, maxEvents);                          // Limite à 6 événements
};
```

## Personnalisation Visuelle

### Système de Couleurs UCLouvain

```css
/* Variables CSS personnalisables */
:root {
  /* Couleurs primaires UCLouvain */
  --ucl-primary: #003f7f;
  --ucl-primary-light: #1a5a9a;
  --ucl-primary-dark: #002a55;
  
  /* Couleurs d'accent */
  --ucl-accent: #ff6b35;
  --ucl-secondary: #4a90e2;
  
  /* Couleurs des sources d'événements */
  --ucl-source-icloud: #007AFF;
  --ucl-source-outlook: #0078D4;
  --ucl-source-google: #4285F4;
  --ucl-source-teams: #6264A7;
}
```

### Typographie pour Lecture à Distance

```css
/* Tailles optimisées pour affichage public */
:root {
  --ucl-text-6xl: 3.75rem;    /* Titre principal (60px) */
  --ucl-text-4xl: 2.25rem;    /* Affichage de l'heure (36px) */
  --ucl-text-3xl: 1.875rem;   /* Titres d'événements (30px) */
  --ucl-text-xl: 1.25rem;     /* Texte descriptif (20px) */
  --ucl-text-base: 1rem;      /* Texte de base (16px) */
}
```

### Animations et Transitions

```css
/* Durées d'animation configurables */
:root {
  --ucl-duration-fast: 150ms;
  --ucl-duration-normal: 300ms;
  --ucl-duration-slow: 500ms;
  --ucl-duration-slower: 700ms;
  
  /* Délais échelonnés pour l'apparition des cartes */
  --ucl-stagger-1: 0ms;
  --ucl-stagger-2: 100ms;
  --ucl-stagger-3: 200ms;
  --ucl-stagger-4: 300ms;
  --ucl-stagger-5: 400ms;
  --ucl-stagger-6: 500ms;
}
```

## Optimisation des Performances

### Configuration pour Affichage Continu

#### 1. Gestion Mémoire

```typescript
// Optimisations React pour éviter les fuites mémoire
export const DisplayView = memo(DisplayViewComponent, (prevProps, nextProps) => {
  return (
    prevProps.events === nextProps.events &&
    prevProps.onEventClick === nextProps.onEventClick &&
    prevProps.daysToShow === nextProps.daysToShow
  );
});
```

#### 2. Optimisations CSS

```css
/* Accélération matérielle pour les animations */
.current-time-display,
.event-card {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Prévention du débordement pour stabilité */
.display-view,
.events-grid,
.events-grid-container {
  overflow: hidden;
}
```

#### 3. Surveillance des Performances

```typescript
// Monitoring automatique des performances
useEffect(() => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('event-card-animation')) {
          console.log(`Animation ${entry.name} took ${entry.duration}ms`);
        }
      });
    });
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }
}, []);
```

## Maintenance Préventive

### Vérifications Quotidiennes

1. **État de l'Affichage**
   - Vérifier que l'écran affiche correctement les événements
   - Contrôler la mise à jour de l'heure en temps réel
   - Valider l'affichage des animations

2. **Performance du Système**
   - Vérifier l'utilisation mémoire du navigateur
   - Contrôler la température du matériel
   - Valider la connexion réseau

3. **Synchronisation des Données**
   - Vérifier que les événements sont à jour
   - Contrôler les sources de données (calendriers)
   - Valider les filtres d'événements

### Vérifications Hebdomadaires

1. **Nettoyage du Cache**
   ```bash
   # Vider le cache du navigateur
   rm -rf ~/.cache/google-chrome/Default/Cache/*
   ```

2. **Mise à Jour des Dépendances**
   ```bash
   npm audit
   npm update
   ```

3. **Test de Performance**
   ```bash
   npm run test:performance
   npm run test:visual-consistency
   ```

### Vérifications Mensuelles

1. **Sauvegarde de Configuration**
2. **Mise à jour du Système d'Exploitation**
3. **Vérification des Certificats SSL**
4. **Test de Récupération après Panne**

## Dépannage

### Problèmes Courants

#### 1. Affichage Vide ou Événements Manquants

**Symptômes**: L'écran affiche "Aucun événement à venir" alors que des événements existent.

**Solutions**:
```typescript
// Vérifier le filtrage des événements
const debugEvents = () => {
  console.log('Événements bruts:', events);
  console.log('Événements filtrés:', getUpcomingEvents());
  console.log('Date actuelle:', new Date());
};
```

**Actions**:
1. Vérifier la synchronisation des calendriers
2. Contrôler les filtres de date
3. Valider les permissions d'accès aux calendriers

#### 2. Animations Saccadées ou Lentes

**Symptômes**: Les transitions et animations ne sont pas fluides.

**Solutions**:
```css
/* Forcer l'accélération GPU */
.event-card-placeholder {
  transform: translateZ(0);
  will-change: transform;
}

/* Réduire la complexité des animations */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Actions**:
1. Vérifier les ressources système (CPU, GPU)
2. Fermer les applications non nécessaires
3. Réduire la qualité des animations si nécessaire

#### 3. Problèmes de Mémoire

**Symptômes**: Le navigateur devient lent ou se ferme après plusieurs heures.

**Solutions**:
```typescript
// Nettoyage automatique des timers
useEffect(() => {
  const timer = setInterval(updateTime, 1000);
  return () => clearInterval(timer); // Nettoyage obligatoire
}, []);
```

**Actions**:
1. Redémarrer le navigateur quotidiennement
2. Surveiller l'utilisation mémoire
3. Configurer un redémarrage automatique

#### 4. Problèmes d'Affichage Responsive

**Symptômes**: La mise en page ne s'adapte pas correctement à la taille d'écran.

**Solutions**:
```css
/* Vérifier les media queries */
@media (max-width: 1200px) {
  .events-grid-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, minmax(200px, auto));
  }
}
```

### Outils de Diagnostic

#### 1. Console de Développement

```javascript
// Commandes utiles pour le diagnostic
console.log('Performance:', performance.getEntriesByType('navigation'));
console.log('Mémoire:', performance.memory);
console.log('Événements actifs:', document.querySelectorAll('.event-card').length);
```

#### 2. Tests Automatisés

```bash
# Lancer les tests de validation
npm run test:display-integration
npm run test:visual-consistency
npm run test:performance
```

#### 3. Monitoring en Temps Réel

```typescript
// Surveillance continue des métriques
const monitorPerformance = () => {
  setInterval(() => {
    const memory = (performance as any).memory;
    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      console.warn('Utilisation mémoire élevée:', memory.usedJSHeapSize);
    }
  }, 60000); // Vérification chaque minute
};
```

## Scripts de Maintenance

### Script de Démarrage Automatique

```bash
#!/bin/bash
# start-display.sh

# Attendre que le système soit prêt
sleep 30

# Lancer Chrome en mode kiosque
google-chrome \
  --kiosk \
  --no-first-run \
  --disable-infobars \
  --disable-notifications \
  --disable-extensions \
  --autoplay-policy=no-user-gesture-required \
  "http://localhost:3000/display"
```

### Script de Redémarrage Quotidien

```bash
#!/bin/bash
# daily-restart.sh

# Arrêter Chrome
pkill -f chrome

# Attendre 5 secondes
sleep 5

# Relancer l'affichage
./start-display.sh
```

### Script de Surveillance

```bash
#!/bin/bash
# monitor-display.sh

while true; do
  # Vérifier si Chrome fonctionne
  if ! pgrep -f chrome > /dev/null; then
    echo "$(date): Chrome non détecté, redémarrage..."
    ./start-display.sh
  fi
  
  # Vérifier l'utilisation mémoire
  MEMORY=$(ps -o pid,vsz,comm -p $(pgrep chrome) | awk '{sum+=$2} END {print sum}')
  if [ "$MEMORY" -gt 2000000 ]; then # 2GB
    echo "$(date): Utilisation mémoire élevée ($MEMORY KB), redémarrage..."
    pkill -f chrome
    sleep 5
    ./start-display.sh
  fi
  
  sleep 300 # Vérification toutes les 5 minutes
done
```

## Configuration Avancée

### Personnalisation des Layouts

```typescript
// Configuration des layouts par nombre d'événements
const getGridLayoutClass = (eventCount: number): string => {
  switch (eventCount) {
    case 1: return 'events-grid-single';    // Centré, grande taille
    case 2: return 'events-grid-dual';      // 2 colonnes
    case 3:
    case 4: return 'events-grid-quad';      // 2x2
    default: return 'events-grid-full';     // 3x2 (maximum)
  }
};
```

### Intégration avec Systèmes Externes

```typescript
// Configuration pour intégration avec systèmes de gestion d'événements
interface ExternalSystemConfig {
  apiEndpoint: string;
  refreshInterval: number;
  authToken?: string;
  filters?: EventFilter[];
}

const externalConfig: ExternalSystemConfig = {
  apiEndpoint: process.env.REACT_APP_EVENTS_API || '/api/events',
  refreshInterval: parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '300000'),
  authToken: process.env.REACT_APP_API_TOKEN,
  filters: [
    { type: 'source', values: ['uclouvain', 'secteur-sss'] },
    { type: 'status', values: ['confirmed', 'tentative'] }
  ]
};
```

## Support et Contact

### Équipe de Support Technique
- **Email**: support-technique@uclouvain.be
- **Téléphone**: +32 10 XX XX XX
- **Heures**: Lundi-Vendredi 8h-17h

### Documentation Technique
- **Repository**: https://github.com/uclouvain/calendar-display
- **Wiki**: https://wiki.uclouvain.be/display-public
- **Issues**: https://github.com/uclouvain/calendar-display/issues

### Ressources Additionnelles
- [Guide d'Installation](./INSTALLATION.md)
- [Documentation API](./API_DOCUMENTATION.md)
- [Guide de Développement](./DEVELOPMENT_GUIDE.md)
- [Changelog](./CHANGELOG.md)