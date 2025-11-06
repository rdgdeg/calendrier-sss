# Implémentation du Système d'Analytics

## Vue d'ensemble

Ce système d'analytics respectueux de la vie privée permet de suivre les statistiques de visite du calendrier SSS sans compromettre la confidentialité des utilisateurs.

## 🎯 Fonctionnalités

### Statistiques collectées
- **Visites totales** : Nombre total de pages vues
- **Sessions uniques** : Nombre de sessions distinctes
- **Visites aujourd'hui** : Visites du jour en cours
- **Visites cette semaine** : Visites des 7 derniers jours
- **Visites ce mois** : Visites du mois en cours

### Respect de la vie privée
- ✅ **Pas d'IP tracking** : Aucune adresse IP stockée
- ✅ **Pas de cookies** : Utilisation de sessionStorage uniquement
- ✅ **Données anonymes** : Aucune information personnelle
- ✅ **User-Agent limité** : Tronqué à 200 caractères
- ✅ **Conformité RGPD** : Données minimales et anonymes

## 🛠️ Architecture technique

### Composants principaux

#### 1. `src/utils/analytics.ts`
```typescript
// Fonctions principales
trackVisit()          // Enregistre une visite
getVisitStats()       // Récupère les statistiques
getSessionId()        // Génère un ID de session unique
```

#### 2. `src/components/VisitStats.tsx`
```typescript
// Composant d'affichage
<VisitStats />                    // Version compacte
<VisitStats showDetailed={true} /> // Version détaillée
```

#### 3. Base de données Supabase
```sql
-- Table calendar_visits
id, timestamp, user_agent, referrer, page_path, session_id
```

### Flux de données

1. **Visite de page** → `trackVisit()` appelé
2. **Génération session** → ID unique créé si nécessaire
3. **Enregistrement** → Données anonymes stockées dans Supabase
4. **Affichage stats** → `getVisitStats()` récupère et calcule
5. **Mise à jour** → Actualisation automatique toutes les 5 minutes

## 📊 Affichage des statistiques

### Version compacte (Footer)
```
👥 1,234 visites +12 aujourd'hui
```

### Version détaillée
```
📊 Statistiques de visite
┌─────────────────┬─────────────────┐
│ 1,234           │ 567             │
│ Visites totales │ Sessions uniques│
├─────────────────┼─────────────────┤
│ 12              │ 89              │
│ Aujourd'hui     │ Cette semaine   │
├─────────────────┼─────────────────┤
│ 345             │                 │
│ Ce mois         │                 │
└─────────────────┴─────────────────┘
```

## 🔧 Installation et configuration

### 1. Configuration Supabase

Exécuter le script SQL dans l'éditeur Supabase :
```sql
-- Voir supabase-setup.sql pour le script complet
CREATE TABLE calendar_visits (...)
```

### 2. Variables d'environnement

Aucune variable supplémentaire nécessaire si Supabase est déjà configuré.

### 3. Intégration dans l'application

```typescript
// Dans Calendar.tsx
import { trackVisit } from '../utils/analytics';

useEffect(() => {
  trackVisit(); // Enregistre la visite
}, []);
```

```typescript
// Dans Footer.tsx
import { VisitStats } from './VisitStats';

<VisitStats className="footer-stats" />
```

## 🎨 Personnalisation

### Styles CSS
```css
/* src/styles/visit-stats.css */
.visit-stats.compact { /* Version footer */ }
.visit-stats.detailed { /* Version complète */ }
.stats-grid { /* Grille des statistiques */ }
```

### Configuration
```typescript
// Modifier dans analytics.ts
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const USER_AGENT_LIMIT = 200; // Caractères max
const DATA_RETENTION = '1 year'; // Rétention des données
```

## 📱 Responsive design

### Breakpoints
- **Desktop** : Grille 5 colonnes
- **Tablette** : Grille 2 colonnes  
- **Mobile** : Grille 1 colonne

### Adaptations mobiles
- Texte plus petit
- Badge "aujourd'hui" sur nouvelle ligne
- Espacement réduit

## 🧪 Tests

### Tests unitaires
```bash
npm test analytics.test.tsx
```

### Tests couverts
- ✅ Enregistrement de visite
- ✅ Récupération des statistiques
- ✅ Affichage compact et détaillé
- ✅ Gestion des erreurs
- ✅ Formatage des nombres
- ✅ États de chargement

## 🔒 Sécurité et confidentialité

### Données collectées (minimales)
```typescript
{
  timestamp: "2025-11-06T10:30:00Z",
  user_agent: "Mozilla/5.0 Chrome/119.0...", // Tronqué
  referrer: "https://google.com",
  page_path: "/",
  session_id: "session_1699267800_abc123"
}
```

### Données NON collectées
- ❌ Adresses IP
- ❌ Informations personnelles
- ❌ Cookies persistants
- ❌ Données de navigation détaillées
- ❌ Géolocalisation

### Conformité RGPD
- **Base légale** : Intérêt légitime (statistiques anonymes)
- **Minimisation** : Données strictement nécessaires
- **Anonymisation** : Aucune donnée personnelle
- **Rétention** : 1 an maximum (configurable)

## 📈 Métriques et performance

### Impact sur les performances
- **Taille bundle** : +3KB gzippé
- **Requêtes réseau** : 1 insertion + 1 lecture/5min
- **Stockage local** : Session ID uniquement
- **Temps de chargement** : <50ms

### Optimisations
- Requêtes en arrière-plan
- Cache des statistiques
- Gestion d'erreur silencieuse
- Pas de blocage de l'interface

## 🚀 Déploiement

### Checklist de déploiement
1. ✅ Script SQL exécuté dans Supabase
2. ✅ Permissions RLS configurées
3. ✅ Tests passés
4. ✅ Composants intégrés
5. ✅ Styles appliqués

### Monitoring
- Vérifier les logs Supabase
- Surveiller les erreurs JavaScript
- Contrôler la croissance de la table
- Valider les statistiques affichées

## 🔮 Évolutions futures

### Fonctionnalités possibles
- **Graphiques temporels** : Évolution des visites
- **Statistiques par page** : Détail par section
- **Export des données** : CSV pour analyse
- **Alertes** : Notifications de pics de trafic
- **Comparaisons** : Périodes précédentes

### Améliorations techniques
- **Cache Redis** : Pour de meilleures performances
- **Agrégation** : Pré-calcul des statistiques
- **Real-time** : Mise à jour en temps réel
- **Dashboard admin** : Interface de gestion

## 📞 Support

### Dépannage courant

**Statistiques non affichées**
```typescript
// Vérifier la console pour les erreurs
console.log('Analytics error:', error);
```

**Données manquantes**
```sql
-- Vérifier la table Supabase
SELECT COUNT(*) FROM calendar_visits;
```

**Permissions Supabase**
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'calendar_visits';
```

Cette implémentation offre un système d'analytics complet, respectueux de la vie privée et parfaitement intégré à l'application existante.