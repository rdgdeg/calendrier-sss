# 📚 Guide des fonctionnalités - Calendrier SSS

## 🎯 Vue d'ensemble des fonctionnalités

Ce guide détaille toutes les fonctionnalités de l'application Calendrier SSS, leur utilisation et leur valeur ajoutée pour les utilisateurs du Secteur des Sciences de la Santé de l'UCLouvain.

## 📅 Vues du calendrier

### 1. Vue Mois (Vue par défaut)
**Description :** Affichage traditionnel du calendrier avec grille mensuelle

**Fonctionnalités :**
- ✅ **Grille 7x6** : Semaines complètes du lundi au dimanche
- ✅ **Événements visuels** : Jusqu'à 2 événements affichés par jour
- ✅ **Indicateur "+X autres"** : Pour les jours avec plus de 2 événements
- ✅ **Navigation mensuelle** : Boutons précédent/suivant
- ✅ **Mise en évidence** : Jour actuel surligné en bleu UCLouvain
- ✅ **Couleurs par source** : Rouge pour de Duve, Bleu pour SSS
- ✅ **Hover tooltips** : Aperçu rapide au survol

**Utilisation :**
- Idéale pour avoir une vue d'ensemble du mois
- Parfaite pour planifier et identifier les périodes chargées
- Navigation rapide entre les mois

### 2. Vue Agenda
**Description :** Liste détaillée des événements avec options avancées

**Fonctionnalités :**
- ✅ **Liste chronologique** : Événements triés par date/heure
- ✅ **Pagination intelligente** : 20 événements par page
- ✅ **Filtres avancés** :
  - Période : 7 jours, 2 semaines, 1-3 mois, ou tous
  - Événements passés : Inclusion optionnelle
- ✅ **Groupement par jour** : Organisation claire par date
- ✅ **Compteur d'événements** : Nombre visible par jour
- ✅ **Détails expandables** : Clic pour voir description complète
- ✅ **Actions rapides** : Boutons d'export par événement

**Utilisation :**
- Parfaite pour consulter les détails des événements
- Idéale pour la recherche et le filtrage
- Excellente pour la préparation d'agenda personnel

### 3. Vue Affichage (Mode présentation)
**Description :** Mode optimisé pour écrans publics et présentations

**Fonctionnalités :**
- ✅ **Interface épurée** : Sans éléments de navigation
- ✅ **Indicateur LIVE** : Mise à jour en temps réel
- ✅ **Affichage 5 jours** : Semaine de travail
- ✅ **Texte agrandi** : Lisibilité à distance
- ✅ **Auto-refresh** : Actualisation automatique
- ✅ **Retour facile** : Bouton retour au calendrier

**Utilisation :**
- Écrans d'affichage dans les couloirs
- Présentations en réunion
- Tableaux d'information publique

## 🔍 Recherche et filtrage

### Barre de recherche intelligente
**Fonctionnalités :**
- ✅ **Recherche en temps réel** : Résultats instantanés (300ms debounce)
- ✅ **Multi-champs** : Titre, description, lieu, catégorie
- ✅ **Recherche floue** : Tolérance aux fautes de frappe
- ✅ **Mots-clés multiples** : Recherche avec plusieurs termes
- ✅ **Effacement rapide** : Bouton X pour vider la recherche

### Filtres avancés
**Par source :**
- 🏥 **de Duve** : Événements du calendrier iCloud
- 📧 **SSS** : Événements du calendrier Outlook
- 📊 **Tous** : Agrégation complète

**Par catégorie :**
- 📚 **Cours et enseignement**
- 📝 **Examens et évaluations** 
- 👥 **Réunions et comités**
- 🎤 **Événements et conférences**
- 🔬 **Recherche et séminaires**
- 📋 **Tous les événements**

**Par période :**
- 📅 **Toutes** : Tous les événements
- ⏰ **À venir** : Événements futurs uniquement
- 📆 **Semaine** : 7 prochains jours
- 🗓️ **Mois** : 30 prochains jours

### Résultats de recherche
**Affichage :**
- ✅ **Mise en évidence** : Événements trouvés surlignés
- ✅ **Compteurs** : Nombre de résultats affiché
- ✅ **Navigation** : Bouton "Voir les résultats"
- ✅ **Statistiques** : Résumé des filtres actifs

## 📄 Export et impression

### Options d'export
**Formats disponibles :**
- 🖨️ **Impression/PDF** : Mise en page professionnelle
- 📊 **CSV** : Pour Excel/Google Sheets

**Périodes d'export :**
- 📅 **Mois courant** : Automatiquement sélectionné
- 📆 **Période personnalisée** : Sélection libre des dates

**Options d'inclusion :**
- 📍 **Lieux** : Inclure les emplacements
- 📝 **Descriptions** : Inclure les détails complets
- 📅 **Groupement par jour** : Organisation chronologique (PDF uniquement)

### Export PDF/Impression
**Caractéristiques :**
- ✅ **Mise en page professionnelle** : En-tête UCLouvain
- ✅ **Informations complètes** : Date, heure, titre, source, lieu, description
- ✅ **Adresse du secteur** : Contact complet en pied de page
- ✅ **Optimisation impression** : Marges et polices adaptées
- ✅ **Aperçu avant impression** : Fenêtre de prévisualisation

### Export CSV
**Structure des données :**
- 📅 **Date** : Format DD/MM/YYYY
- ⏰ **Heure début/fin** : Format HH:MM
- 📝 **Titre** : Nom de l'événement
- 🏢 **Source** : de Duve ou SSS
- 📍 **Lieu** : Emplacement (si disponible)
- 📄 **Description** : Détails complets (si disponible)

## 🎨 Interface utilisateur

### Design responsive
**Adaptations automatiques :**
- 📱 **Mobile** (< 768px) : Interface tactile optimisée
- 📟 **Tablette** (768-1024px) : Layout hybride
- 💻 **Desktop** (> 1024px) : Interface complète
- 🖥️ **Large écran** (> 1400px) : Utilisation optimale de l'espace

### Thème UCLouvain
**Couleurs officielles :**
- 🔵 **Bleu primaire** (#003d7a) : Éléments principaux
- 🔷 **Bleu secondaire** (#0066cc) : Accents et hover
- 🟠 **Orange** (#ff6b35) : Événements de Duve
- ⚪ **Blanc/Gris** : Arrière-plans et textes

### Micro-interactions
**Animations fluides :**
- ✨ **Hover effects** : Survol des boutons et cartes
- 🎭 **Transitions** : Changements d'état fluides
- 📈 **Loading animations** : Indicateurs de progression
- 🎯 **Focus indicators** : Navigation clavier visible

## ♿ Accessibilité

### Conformité WCAG 2.1
**Niveau AA atteint :**
- ✅ **Contraste** : Ratio 4.5:1 minimum
- ✅ **Navigation clavier** : Tous les éléments accessibles
- ✅ **Lecteurs d'écran** : ARIA labels et descriptions
- ✅ **Zones tactiles** : 44px minimum sur mobile

### Fonctionnalités d'accessibilité
- 🎯 **Focus visible** : Contours bleus pour la navigation clavier
- 🔊 **Textes alternatifs** : Descriptions pour les éléments visuels
- 📱 **Responsive** : Adaptation à tous les appareils
- 🌙 **Mode sombre** : Support des préférences système
- ⚡ **Animations réduites** : Respect des préférences utilisateur

## 🔄 Synchronisation et cache

### Sources de données
**Calendriers agrégés :**
- 🏥 **Calendrier de Duve** (iCloud) : Événements académiques et recherche
- 📧 **Calendrier Secteur SSS** (Outlook) : Événements administratifs

### Synchronisation intelligente
**Fréquence :**
- ⏰ **Automatique** : Toutes les 10 minutes
- 🔄 **Manuelle** : Bouton "Actualiser"
- 💾 **Cache local** : Affichage immédiat des données en cache

**Gestion d'erreur :**
- 🔄 **Retry automatique** : 3 tentatives avec délai croissant
- 🌐 **Proxies CORS multiples** : 4 services de fallback
- ⚠️ **Notifications d'erreur** : Messages informatifs
- 📊 **Logs détaillés** : Diagnostic dans la console

## 🎛️ Paramètres et préférences

### Personnalisation
**Options disponibles :**
- 👁️ **Vue par défaut** : Mois, Agenda, ou Affichage
- 🔍 **Filtres sauvegardés** : Mémorisation des préférences
- 📅 **Date de démarrage** : Mois courant ou personnalisé

### Notifications
**Types de feedback :**
- ✅ **Succès** : Confirmations d'actions (vert)
- ⚠️ **Avertissements** : Informations importantes (orange)
- ❌ **Erreurs** : Problèmes à résoudre (rouge)
- ℹ️ **Informations** : Messages contextuels (bleu)

## 📊 Statistiques et métriques

### Informations affichées
**Compteurs en temps réel :**
- 📈 **Total événements** : Nombre global d'événements
- 🔍 **Résultats filtrés** : Événements correspondant aux critères
- 📅 **Événements du jour** : Compteur par jour dans la vue Agenda
- ⏰ **Événements à venir** : Dans la sidebar

### Performance
**Optimisations :**
- ⚡ **Chargement rapide** : < 2 secondes au premier accès
- 💾 **Cache intelligent** : Affichage instantané des données en cache
- 🔄 **Mise à jour progressive** : Actualisation en arrière-plan
- 📱 **Responsive** : Adaptation fluide à tous les écrans

## 🆘 Aide et support

### Système d'aide intégré
**Fonctionnalités :**
- ❓ **FAQ contextuelle** : Questions fréquentes
- 💡 **Conseils d'utilisation** : Tips pendant le chargement
- 🔧 **Diagnostic** : Logs pour résolution de problèmes
- 📞 **Contact** : Informations de support

### Messages d'aide
**Contextes d'aide :**
- 🔄 **Chargement initial** : Conseils pendant la synchronisation
- 🔍 **Recherche vide** : Suggestions d'amélioration
- ❌ **Erreurs de connexion** : Instructions de résolution
- 📱 **Première utilisation** : Guide de découverte

---

## 🏆 Avantages pour les utilisateurs

### Pour les étudiants
- 📚 **Vue unifiée** des cours et examens
- 📱 **Accès mobile** pour consultation nomade
- 🔍 **Recherche rapide** d'événements spécifiques
- 📄 **Export personnel** pour agenda privé

### Pour les professeurs
- 👥 **Coordination** des événements académiques
- 📊 **Vue d'ensemble** des activités du secteur
- 🖨️ **Impression** pour réunions et présentations
- 📅 **Planification** des activités de recherche

### Pour l'administration
- 📈 **Gestion centralisée** des événements
- 🖥️ **Affichage public** pour information générale
- 📊 **Export de données** pour rapports
- 🔄 **Synchronisation automatique** sans intervention

Cette application représente une solution complète et moderne pour la gestion et la consultation des événements du Secteur des Sciences de la Santé de l'UCLouvain.