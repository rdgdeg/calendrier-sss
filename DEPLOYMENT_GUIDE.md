# 🚀 Guide de déploiement - Calendrier SSS

## 📋 Prérequis

### Environnement de développement
- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 9.x ou supérieure
- **Git** : Pour le contrôle de version
- **Éditeur de code** : VS Code recommandé

### Comptes et services
- **GitHub** : Repository du code source
- **Vercel** : Plateforme de déploiement
- **Supabase** : Base de données et cache (optionnel)

## 🛠️ Installation locale

### 1. Clonage du repository
```bash
# Cloner le repository
git clone https://github.com/rdgdeg/calendrier-sss.git

# Accéder au dossier
cd calendrier-sss

# Installer les dépendances
npm install
```

### 2. Configuration de l'environnement
```bash
# Créer le fichier d'environnement
cp .env.example .env.local

# Éditer les variables d'environnement
nano .env.local
```

**Variables d'environnement (.env.local) :**
```env
# Supabase (optionnel pour le cache)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# URLs des calendriers (déjà configurées dans le code)
# Ces URLs sont publiques et peuvent rester dans le code
```

### 3. Démarrage en développement
```bash
# Lancer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:3000
```

## 🔧 Configuration Supabase (optionnel)

### 1. Création du projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme

### 2. Configuration des tables
```sql
-- Table pour le cache des événements
CREATE TABLE cached_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  location TEXT,
  source TEXT NOT NULL,
  color TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour le statut des calendriers
CREATE TABLE calendar_status (
  id SERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  events_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_cached_events_source ON cached_events(source);
CREATE INDEX idx_cached_events_start_date ON cached_events(start_date);
CREATE INDEX idx_calendar_status_source ON calendar_status(source_name);
```

### 3. Configuration des politiques RLS
```sql
-- Activer RLS
ALTER TABLE cached_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_status ENABLE ROW LEVEL SECURITY;

-- Politiques pour lecture publique
CREATE POLICY "Allow public read access" ON cached_events
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON calendar_status
  FOR SELECT USING (true);

-- Politiques pour écriture (si nécessaire)
CREATE POLICY "Allow public insert" ON cached_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON cached_events
  FOR UPDATE USING (true);
```

## 🌐 Déploiement sur Vercel

### 1. Préparation du repository
```bash
# S'assurer que le code est à jour
git add .
git commit -m "Préparation pour déploiement"
git push origin main
```

### 2. Configuration Vercel
**Fichier vercel.json :**
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
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 3. Déploiement automatique
1. **Connecter à Vercel :**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec GitHub
   - Importer le repository `calendrier-sss`

2. **Configuration du projet :**
   - **Framework Preset** : Vite
   - **Root Directory** : `./`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

3. **Variables d'environnement :**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Déploiement :**
   - Cliquer sur "Deploy"
   - Attendre la fin du build (2-3 minutes)
   - L'application sera accessible sur l'URL fournie

## 🔄 CI/CD et automatisation

### Workflow GitHub Actions (optionnel)
**Fichier .github/workflows/deploy.yml :**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Hooks de déploiement
**Scripts package.json :**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "pre-deploy": "npm run lint && npm run type-check && npm run build"
  }
}
```

## 🔍 Monitoring et maintenance

### 1. Monitoring des performances
**Outils recommandés :**
- **Vercel Analytics** : Métriques de performance intégrées
- **Google PageSpeed Insights** : Audit de performance
- **Lighthouse** : Tests d'accessibilité et performance

### 2. Monitoring des erreurs
**Configuration Sentry (optionnel) :**
```typescript
// src/utils/monitoring.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export { Sentry };
```

### 3. Logs et debugging
**Console logs structurés :**
```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }
};
```

## 🔒 Sécurité et bonnes pratiques

### 1. Headers de sécurité
**Configuration Vercel :**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.allorigins.win https://corsproxy.io https://api.codetabs.com https://thingproxy.freeboard.io"
        },
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

### 2. Variables d'environnement
**Bonnes pratiques :**
- ✅ Utiliser des variables d'environnement pour les secrets
- ✅ Préfixer les variables client avec `VITE_`
- ✅ Ne jamais commiter les fichiers `.env`
- ✅ Documenter toutes les variables nécessaires

### 3. Gestion des secrets
**Vercel Dashboard :**
1. Aller dans Project Settings
2. Section Environment Variables
3. Ajouter les variables nécessaires
4. Séparer par environnement (Development, Preview, Production)

## 📊 Optimisations de performance

### 1. Build optimisé
**Configuration Vite :**
```typescript
// vite.config.ts
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
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### 2. Optimisations réseau
**Headers de cache :**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

## 🔄 Mise à jour et maintenance

### 1. Processus de mise à jour
```bash
# 1. Créer une branche de feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester
npm run dev

# 3. Vérifier la qualité
npm run lint
npm run type-check
npm run build

# 4. Commiter et pousser
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request
# 6. Merger vers main après review
# 7. Déploiement automatique sur Vercel
```

### 2. Rollback en cas de problème
```bash
# Via Vercel Dashboard
# 1. Aller dans Deployments
# 2. Sélectionner un déploiement précédent
# 3. Cliquer sur "Promote to Production"

# Via Git
git revert HEAD
git push origin main
```

### 3. Monitoring post-déploiement
**Checklist :**
- ✅ Vérifier que l'application se charge
- ✅ Tester les fonctionnalités principales
- ✅ Vérifier les logs d'erreur
- ✅ Contrôler les métriques de performance
- ✅ Tester sur différents appareils

## 📞 Support et dépannage

### Problèmes courants

**1. Erreurs CORS :**
```
Solution : Vérifier que les proxies CORS sont fonctionnels
Diagnostic : Consulter la console pour voir quel proxy échoue
```

**2. Build qui échoue :**
```
Solution : Vérifier les erreurs TypeScript et ESLint
Commande : npm run lint && npm run type-check
```

**3. Variables d'environnement manquantes :**
```
Solution : Vérifier la configuration Vercel
Vérification : Project Settings > Environment Variables
```

### Contacts de support
- **Repository** : https://github.com/rdgdeg/calendrier-sss
- **Issues** : https://github.com/rdgdeg/calendrier-sss/issues
- **Documentation** : README.md et guides associés

---

Ce guide de déploiement assure une mise en production robuste et maintenable de l'application Calendrier SSS.