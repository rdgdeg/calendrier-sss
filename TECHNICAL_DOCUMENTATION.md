# 🔧 Documentation technique - Calendrier SSS

## 📋 Table des matières

1. [Architecture générale](#architecture-générale)
2. [Technologies et dépendances](#technologies-et-dépendances)
3. [Structure du code](#structure-du-code)
4. [Composants principaux](#composants-principaux)
5. [Gestion des données](#gestion-des-données)
6. [Styles et design system](#styles-et-design-system)
7. [Performance et optimisations](#performance-et-optimisations)
8. [Sécurité et CORS](#sécurité-et-cors)
9. [Déploiement](#déploiement)
10. [Maintenance et évolutions](#maintenance-et-évolutions)

## 🏗️ Architecture générale

### Pattern architectural
L'application suit une architecture **Component-Based** avec React, organisée selon les principes suivants :

- **Séparation des responsabilités** : UI, logique métier, et gestion d'état séparées
- **Composition over inheritance** : Composants réutilisables et composables
- **Unidirectional data flow** : Flux de données descendant avec callbacks
- **Custom hooks** : Logique réutilisable encapsulée

### Flux de données
```
Sources iCal → Parser → Cache (Supabase) → State React → UI Components
     ↓              ↓           ↓              ↓            ↓
  iCloud/Outlook → ical.js → Local Storage → useState → Render
```

## 🛠️ Technologies et dépendances

### Core Framework
```json
{
  "react": "^18.2.0",           // Framework UI avec hooks
  "react-dom": "^18.2.0",       // Rendu DOM
  "typescript": "^5.2.2",       // Typage statique
  "vite": "^5.0.8"              // Build tool moderne
}
```

### Librairies métier
```json
{
  "ical.js": "^1.5.0",          // Parsing iCalendar
  "date-fns": "^2.30.0",        // Manipulation dates
  "@supabase/supabase-js": "^2.39.0"  // Base de données
}
```

### Outils de développement
```json
{
  "@typescript-eslint/eslint-plugin": "^6.14.0",
  "@typescript-eslint/parser": "^6.14.0",
  "eslint": "^8.55.0",
  "eslint-plugin-react-hooks": "^4.6.0"
}
```

## 📁 Structure du code

### Organisation des fichiers
```
src/
├── components/              # Composants React
│   ├── views/              # Vues principales
│   │   ├── MonthView.tsx   # Vue calendrier mensuel
│   │   ├── AgendaView.tsx  # Vue liste agenda
│   │   └── DisplayView.tsx # Vue affichage public
│   ├── Calendar.tsx        # Composant racine
│   ├── ExportPrint.tsx     # Export PDF/CSV
│   ├── LoadingScreen.tsx   # Écran de chargement
│   ├── EventModal.tsx      # Modal détails événement
│   ├── SearchBar.tsx       # Barre de recherche
│   ├── UniversalSidebar.tsx # Sidebar événements
│   ├── HelpSystem.tsx      # Système d'aide
│   └── LoadingStates.tsx   # États de chargement
├── hooks/                  # Hooks personnalisés
│   └── useSearch.ts        # Hook recherche/filtrage
├── lib/                    # Intégrations externes
│   └── supabase.ts         # Client Supabase
├── styles/                 # Styles CSS modulaires
│   ├── accessibility-improvements.css
│   ├── mobile-improvements.css
│   ├── micro-interactions.css
│   ├── new-components.css
│   └── loading-screen.css
├── types/                  # Définitions TypeScript
│   ├── index.ts           # Types principaux
│   └── calendar.ts        # Types calendrier
├── utils/                  # Utilitaires
│   ├── icalParser.ts      # Parser iCalendar
│   ├── colorUtils.ts      # Utilitaires couleurs
│   ├── colorMapping.ts    # Mapping catégories
│   └── sourceUtils.ts     # Utilitaires sources
└── main.tsx               # Point d'entrée
```

## 🧩 Composants principaux

### Calendar.tsx - Composant racine
```typescript
interface CalendarProps {
  // Pas de props, composant autonome
}

// États principaux
const [currentDate, setCurrentDate] = useState<Date>()
const [currentView, setCurrentView] = useState<CalendarView>()
const [events, setEvents] = useState<CalendarEvent[]>()
const [loading, setLoading] = useState<boolean>()

// Fonctions principales
const loadEvents = async () => Promise<void>
const navigateDate = (direction: 'prev' | 'next') => void
const exportToCalendar = (event: CalendarEvent) => void
```

### ExportPrint.tsx - Export et impression
```typescript
interface ExportPrintProps {
  events: CalendarEvent[]
  currentDate: Date
  currentView: CalendarView
}

// Fonctionnalités
- generatePrintHTML(): string     // Génère HTML pour impression
- generateCSV(): string           // Génère contenu CSV
- handlePrint(): void            // Gère l'impression
- handleCSVExport(): void        // Gère l'export CSV
```

### SearchBar.tsx - Recherche intelligente
```typescript
interface SearchBarProps {
  events: CalendarEvent[]
  onSearchResults: (results: CalendarEvent[], query: string) => void
  onClearSearch: () => void
}

// Fonctionnalités
- Recherche en temps réel (debounce 300ms)
- Recherche multi-champs (titre, description, lieu)
- Suggestions intelligentes
- Historique de recherche
```

## 📊 Gestion des données

### Types principaux
```typescript
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
  source: 'icloud' | 'outlook'
  allDay: boolean
  category: EventCategory
  color: string
}

interface EventCategory {
  id: string
  name: string
  color: string
  source: 'icloud' | 'outlook'
}

interface CalendarSource {
  name: string
  url: string
  source: 'icloud' | 'outlook'
  color: string
}
```

### Parser iCalendar (icalParser.ts)
```typescript
class ICalParser {
  static async fetchAndParse(
    url: string, 
    source: 'icloud' | 'outlook'
  ): Promise<CalendarEvent[]> {
    // 1. Résolution CORS avec proxies multiples
    // 2. Parsing avec ical.js
    // 3. Gestion événements récurrents
    // 4. Filtrage événements non pertinents
    // 5. Catégorisation automatique
    // 6. Optimisation performances
  }
}
```

### Cache intelligent (supabase.ts)
```typescript
// Fonctions de cache
export const cacheEvents = async (events: CachedEvent[]) => Promise<void>
export const getCachedEvents = async () => Promise<CachedEvent[]>
export const clearCache = async () => Promise<void>
export const syncCalendarStatus = async (status: CalendarStatus) => Promise<void>

// Stratégie de cache
- Cache local avec Supabase
- TTL de 10 minutes
- Invalidation intelligente
- Fallback en cas d'erreur
```

## 🎨 Styles et design system

### Variables CSS (index.css)
```css
:root {
  /* Couleurs UCLouvain */
  --ucl-primary: #003d7a;
  --ucl-secondary: #0066cc;
  --ucl-accent: #4a90e2;
  
  /* Couleurs fonctionnelles */
  --ucl-success: #10b981;
  --ucl-warning: #f59e0b;
  --ucl-danger: #ef4444;
  --ucl-info: #06b6d4;
  
  /* Typographie */
  --ucl-font-family: 'Montserrat', sans-serif;
  --ucl-font-size-base: 16px;
  --ucl-font-weight-normal: 400;
  --ucl-font-weight-bold: 700;
  
  /* Espacement */
  --ucl-spacing-xs: 0.25rem;
  --ucl-spacing-sm: 0.5rem;
  --ucl-spacing-md: 1rem;
  --ucl-spacing-lg: 1.5rem;
  --ucl-spacing-xl: 2rem;
  
  /* Ombres */
  --ucl-shadow-sm: 0 1px 2px rgba(0,0,0,0.03);
  --ucl-shadow-md: 0 4px 6px rgba(0,0,0,0.08);
  --ucl-shadow-lg: 0 10px 15px rgba(0,0,0,0.08);
}
```

### Architecture CSS modulaire
- **index.css** : Variables globales et base
- **mobile-improvements.css** : Responsive mobile
- **accessibility-improvements.css** : Accessibilité
- **micro-interactions.css** : Animations et transitions
- **new-components.css** : Composants spécifiques
- **loading-screen.css** : Écran de chargement

### Système de grille
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 140px);
  gap: 0;
}

.calendar-day {
  min-height: 140px;
  padding: 8px;
  display: flex;
  flex-direction: column;
}
```

## ⚡ Performance et optimisations

### Optimisations React
```typescript
// Mémoisation des composants coûteux
const MemoizedEventCard = React.memo(EventCard)

// Hooks optimisés
const memoizedEvents = useMemo(() => 
  filterEvents(events, filters), [events, filters]
)

// Lazy loading des composants
const LazyAgendaView = lazy(() => import('./views/AgendaView'))
```

### Optimisations de rendu
- **Virtualisation** pour les longues listes
- **Pagination** intelligente (20 événements/page)
- **Debouncing** pour la recherche (300ms)
- **Throttling** pour le scroll et resize

### Optimisations réseau
```typescript
// Cache avec TTL
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Compression des requêtes
headers: {
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'max-age=300'
}

// Retry logic avec backoff exponentiel
const retryWithBackoff = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      )
    }
  }
}
```

## 🔒 Sécurité et CORS

### Résolution CORS
```typescript
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.allorigins.win/raw?url='
]

// Stratégie de fallback
for (const proxy of CORS_PROXIES) {
  try {
    const response = await fetch(`${proxy}${encodeURIComponent(url)}`)
    if (response.ok) return await response.text()
  } catch (error) {
    continue // Essayer le proxy suivant
  }
}
```

### Sécurisation des données
```typescript
// Sanitisation des entrées
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

// Validation des URLs
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
```

## 🚀 Déploiement

### Configuration Vercel (vercel.json)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Build optimisé (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          calendar: ['ical.js', 'date-fns'],
          ui: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

## 🔧 Maintenance et évolutions

### Monitoring et logs
```typescript
// Logging structuré
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data)
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data)
  }
}

// Métriques de performance
const trackPerformance = (name: string, fn: Function) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  logger.info(`Performance: ${name}`, { duration: end - start })
  return result
}
```

### Tests et qualité
```typescript
// Tests unitaires (Jest/Vitest)
describe('ICalParser', () => {
  test('should parse iCal events correctly', async () => {
    const mockIcal = 'BEGIN:VCALENDAR...'
    const events = await ICalParser.parse(mockIcal, 'icloud')
    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('Test Event')
  })
})

// Tests d'intégration
describe('Calendar Component', () => {
  test('should load and display events', async () => {
    render(<Calendar />)
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })
  })
})
```

### Évolutions prévues
1. **PWA** : Service Worker pour mode hors ligne
2. **Notifications** : Push notifications pour nouveaux événements
3. **Sync bidirectionnelle** : Modification des événements
4. **API REST** : Backend dédié pour performances
5. **Tests E2E** : Cypress pour tests complets
6. **Monitoring** : Sentry pour tracking d'erreurs

---

Cette documentation technique fournit une vue complète de l'architecture et de l'implémentation de l'application Calendrier SSS, permettant une maintenance efficace et des évolutions futures maîtrisées.