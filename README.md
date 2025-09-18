# 📅 Calendrier SSS - UCLouvain

Une application web moderne et responsive pour visualiser et gérer les événements du Secteur des Sciences de la Santé de l'UCLouvain.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff.svg)

## 🎯 Vue d'ensemble

L'application **Calendrier SSS** est une solution web complète qui agrège et affiche les événements provenant de multiples sources de calendriers (iCloud et Outlook) dans une interface unifiée, moderne et accessible.

### 🏢 Contexte

Développée pour le **Secteur des Sciences de la Santé de l'UCLouvain**, cette application centralise les événements académiques, administratifs et de recherche pour offrir une vue d'ensemble cohérente aux étudiants, professeurs et personnel administratif.

**Adresse du secteur :** Rue Martin V 40, Batiment Les Arches, 1200 Woluwe-Saint-Lambert

## 🚀 Fonctionnalités principales

### � Aegrégation multi-sources
- **Calendrier de Duve** (iCloud) - Événements académiques et de recherche
- **Calendrier Secteur SSS** (Outlook) - Événements administratifs et institutionnels
- Synchronisation automatique toutes les 10 minutes
- Gestion intelligente du cache pour des performances optimales

### 🎨 Interface utilisateur avancée
- **3 vues différentes :**
  - **Vue Mois** : Calendrier traditionnel avec aperçu mensuel
  - **Vue Agenda** : Liste détaillée avec pagination et filtres
  - **Vue Affichage** : Mode présentation pour écrans publics
- **Design responsive** adaptatif (mobile, tablette, desktop)
- **Thème UCLouvain** avec charte graphique officielle

### 🔍 Recherche et filtrage intelligents
- **Recherche en temps réel** dans tous les champs (titre, description, lieu)
- **Filtres avancés :**
  - Par source (de Duve / SSS)
  - Par catégorie d'événement
  - Par période (semaine, mois, personnalisée)
- **Mise en évidence** des résultats de recherche
- **Statistiques** en temps réel des résultats

### 📄 Export et impression
- **Export PDF** avec mise en page professionnelle
- **Export CSV** pour analyse dans Excel/Google Sheets
- **Options personnalisables :**
  - Période d'export (mois courant ou personnalisée)
  - Inclusion des lieux et descriptions
  - Groupement par jour
- **Impression optimisée** avec styles dédiés

### ♿ Accessibilité et ergonomie
- **Conformité WCAG 2.1** (Web Content Accessibility Guidelines)
- **Navigation clavier** complète
- **Contraste élevé** pour les daltoniens
- **Support du mode sombre** système
- **Réduction des animations** pour les utilisateurs sensibles
- **Zones tactiles optimisées** (44px minimum) pour mobile

## 🛠️ Technologies utilisées

### Frontend Core
- **React 18.2.0** - Framework JavaScript moderne avec hooks
- **TypeScript 5.2.2** - Typage statique pour une meilleure robustesse
- **Vite 5.0.8** - Build tool ultra-rapide et moderne
- **CSS3** avec variables CSS et Grid/Flexbox

### Librairies spécialisées
- **ical.js 1.5.0** - Parsing des fichiers iCalendar (.ics)
- **date-fns 2.30.0** - Manipulation des dates avec localisation française
- **@supabase/supabase-js 2.39.0** - Base de données et cache intelligent

### Outils de développement
- **ESLint** - Linting et qualité du code
- **Prettier** - Formatage automatique du code
- **Vite** - Hot reload et optimisations de build

### Déploiement
- **Vercel** - Hébergement avec déploiement automatique
- **GitHub** - Contrôle de version et CI/CD
- **CDN global** pour des performances optimales

## 🏗️ Architecture technique

### Structure du projet
```
src/
├── components/           # Composants React réutilisables
│   ├── views/           # Vues principales (Month, Agenda, Display)
│   ├── Calendar.tsx     # Composant principal
│   ├── ExportPrint.tsx  # Fonctionnalités d'export
│   ├── LoadingScreen.tsx # Écran de chargement
│   └── ...
├── hooks/               # Hooks React personnalisés
├── lib/                 # Intégrations externes (Supabase)
├── styles/              # Styles CSS modulaires
├── types/               # Définitions TypeScript
├── utils/               # Utilitaires et helpers
└── main.tsx            # Point d'entrée de l'application
```

### Gestion des données
- **Sources multiples** : Agrégation de calendriers iCloud et Outlook
- **Cache intelligent** : Stockage local avec Supabase pour des performances optimales
- **Synchronisation** : Mise à jour automatique en arrière-plan
- **Gestion d'erreur** : Fallbacks robustes et notifications utilisateur

### Résolution CORS
L'application utilise plusieurs proxies CORS pour contourner les restrictions :
1. **corsproxy.io** (priorité 1)
2. **codetabs.com** (priorité 2)
3. **thingproxy.freeboard.io** (priorité 3)
4. **allorigins.win** (fallback)
5. **Connexion directe** (dernier recours)

## 🎨 Design System

### Palette de couleurs UCLouvain
- **Primaire** : #003d7a (Bleu UCLouvain)
- **Secondaire** : #0066cc (Bleu clair)
- **Accent** : #4a90e2 (Bleu accent)
- **Succès** : #10b981 (Vert)
- **Attention** : #f59e0b (Orange)
- **Erreur** : #ef4444 (Rouge)

### Typographie
- **Police principale** : Montserrat (Google Fonts)
- **Hiérarchie** : 6 niveaux de taille avec poids variables
- **Lisibilité** : Line-height optimisé et espacement cohérent

### Composants UI
- **Boutons** : 3 variantes (primaire, secondaire, ghost)
- **Cartes** : Ombres subtiles et bordures arrondies
- **Modales** : Backdrop blur et animations fluides
- **Formulaires** : États focus et validation visuels

## 🔧 Fonctionnalités avancées

### Parsing iCalendar intelligent
- **Support complet** des événements récurrents
- **Filtrage automatique** des événements non pertinents
- **Gestion des fuseaux horaires**
- **Optimisation des performances** (limite de 500 occurrences)

### Catégorisation automatique
Les événements sont automatiquement catégorisés selon leur contenu :
- **Cours et enseignement** (bleu)
- **Examens et évaluations** (orange)
- **Réunions et comités** (violet)
- **Événements et conférences** (rouge)
- **Recherche et séminaires** (vert)

### Cache et performance
- **Cache local** avec Supabase
- **Chargement progressif** avec skeleton loaders
- **Optimisation des images** et assets
- **Lazy loading** des composants non critiques

### Notifications et feedback
- **Toast notifications** avec auto-dismiss
- **Messages d'erreur** contextuels
- **Indicateurs de chargement** avec progression
- **Confirmations d'actions** utilisateur

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px
- **Large Desktop** : > 1400px

### Adaptations mobiles
- **Navigation simplifiée** avec menu hamburger
- **Cartes empilées** au lieu de grilles
- **Boutons tactiles** optimisés
- **Sidebar repositionnée** en bas d'écran

## 🔒 Sécurité et confidentialité

### Mesures de sécurité
- **HTTPS obligatoire** en production
- **Validation côté client** et serveur
- **Sanitisation** des données utilisateur
- **Headers de sécurité** configurés

### Confidentialité
- **Pas de tracking** utilisateur
- **Données locales** uniquement
- **Cache temporaire** avec expiration
- **Conformité RGPD** par design

## 🚀 Déploiement et CI/CD

### Pipeline de déploiement
1. **Push sur GitHub** déclenche le build
2. **Tests automatiques** (linting, TypeScript)
3. **Build optimisé** avec Vite
4. **Déploiement automatique** sur Vercel
5. **Invalidation CDN** pour mise à jour immédiate

### Environnements
- **Développement** : Local avec hot reload
- **Staging** : Branches de feature sur Vercel
- **Production** : Branch main sur domaine personnalisé

## 📊 Métriques et performance

### Core Web Vitals
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1

### Optimisations
- **Code splitting** automatique
- **Tree shaking** pour réduire la taille
- **Compression gzip/brotli**
- **Cache headers** optimisés

## 🧪 Tests et qualité

### Stratégie de test
- **Tests unitaires** pour les utilitaires
- **Tests d'intégration** pour les composants
- **Tests E2E** pour les parcours critiques
- **Tests d'accessibilité** automatisés

### Qualité du code
- **ESLint** avec règles strictes
- **Prettier** pour la cohérence
- **TypeScript** pour la robustesse
- **Husky** pour les pre-commit hooks

## 🔮 Évolutions futures

### Fonctionnalités prévues
- **Notifications push** pour les nouveaux événements
- **Synchronisation bidirectionnelle** avec les calendriers
- **Mode hors ligne** avec service worker
- **Intégration Teams/Zoom** pour les liens de réunion

### Améliorations techniques
- **Migration vers React 19** quand disponible
- **Adoption de CSS Container Queries**
- **Optimisation avec React Server Components**
- **PWA complète** avec installation

## 📞 Support et maintenance

### Contact technique
- **Développeur** : [Votre nom]
- **Email** : [Votre email]
- **Repository** : https://github.com/rdgdeg/calendrier-sss

### Documentation
- **README** : Instructions d'installation et utilisation
- **CHANGELOG** : Historique des versions
- **API Docs** : Documentation des composants
- **Deployment Guide** : Guide de déploiement

---

## 🏆 Points forts de l'implémentation

### Innovation technique
- **Agrégation multi-sources** avec gestion CORS avancée
- **Cache intelligent** pour performances optimales
- **Design system** cohérent et professionnel
- **Accessibilité** de niveau entreprise

### Expérience utilisateur
- **Interface intuitive** et moderne
- **Performance** exceptionnelle
- **Responsive design** parfait
- **Fonctionnalités** complètes et utiles

### Qualité du code
- **Architecture** modulaire et maintenable
- **TypeScript** pour la robustesse
- **Tests** et documentation complète
- **CI/CD** automatisé et fiable

Cette application représente un excellent exemple d'application web moderne, alliant performance, accessibilité et expérience utilisateur exceptionnelle pour répondre aux besoins spécifiques du secteur académique.