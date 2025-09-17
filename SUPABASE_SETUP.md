# Configuration Supabase pour le Calendrier Unifié

## 📋 Prérequis

- Compte Supabase créé
- Projet Supabase configuré avec les identifiants fournis

## 🔧 Configuration

### 1. Identifiants Supabase

```
URL du projet: https://rslrjzlceadedjnzscre.supabase.co
Clé publique (anon): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHJqemxjZWFkZWRqbnpzY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjY5MTYsImV4cCI6MjA3MzcwMjkxNn0.XuFhPUvjZjEH2gKzSBGAs-CW0C1ckp5VsPNyMAz-SVc
Clé secrète (service_role): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHJqemxjZWFkZWRqbnpzY3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNjkxNiwiZXhwIjoyMDczNzAyOTE2fQ.PUw9XnvTJtGCNepUeYrZF6kgOSm8vhsQfwvKcODNUDk
```

### 2. Initialisation de la base de données

1. Connectez-vous à votre projet Supabase
2. Allez dans l'onglet "SQL Editor"
3. Exécutez le script `supabase-setup.sql`

### 3. Tables créées

#### `calendar_syncs`
- Suit les synchronisations des calendriers
- Stocke les statuts de succès/erreur
- Horodatage des dernières synchronisations

#### `event_cache`
- Cache des événements pour améliorer les performances
- Évite de recharger les calendriers à chaque visite
- Nettoyage automatique des anciens événements

## 🔄 Fonctionnalités automatiques

### Mise à jour automatique
- **GitHub Actions** : Synchronisation toutes les heures
- **Cache intelligent** : Chargement rapide depuis Supabase
- **Fallback** : Chargement direct si le cache échoue

### Monitoring
- Statut des synchronisations en temps réel
- Logs d'erreurs pour le debugging
- Métriques de performance

## 🛠️ Maintenance

### Nettoyage automatique
La fonction `cleanup_old_events()` supprime automatiquement les événements de plus de 7 jours.

### Monitoring des erreurs
Consultez la table `calendar_syncs` pour voir les erreurs de synchronisation :

```sql
SELECT * FROM calendar_syncs 
WHERE status = 'error' 
ORDER BY last_sync DESC;
```

### Statistiques d'utilisation
```sql
SELECT 
    source_name,
    events_count,
    last_sync,
    status
FROM calendar_syncs
ORDER BY last_sync DESC;
```

## 🔒 Sécurité

- **RLS activé** : Row Level Security pour protéger les données
- **Lecture publique** : Les événements sont accessibles en lecture seule
- **Écriture restreinte** : Seuls les services authentifiés peuvent modifier les données

## 🚀 Déploiement

Le déploiement se fait automatiquement via GitHub Actions :
- Push sur `main` → Build et déploiement
- Cron job toutes les heures → Mise à jour des données
- Variables d'environnement configurées dans GitHub Secrets

## 📊 Performance

- **Cache first** : Chargement depuis Supabase en priorité
- **Background sync** : Mise à jour en arrière-plan
- **Optimisations** : Index sur les dates et sources
- **Chunking** : Division du code pour un chargement plus rapide