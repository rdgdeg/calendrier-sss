# Guide de Contribution

Merci de votre intérêt pour contribuer au Calendrier Unifié UCLouvain ! 🎉

## 🚀 Comment contribuer

### 1. Fork et Clone
```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/calendari-unite.git
cd calendari-unite
```

### 2. Installation
```bash
npm install
```

### 3. Développement
```bash
# Lancer en mode développement
npm run dev

# Build pour tester
npm run build
```

### 4. Créer une branche
```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 5. Faire vos modifications
- Respectez le style de code existant
- Ajoutez des commentaires si nécessaire
- Testez vos modifications

### 6. Commit et Push
```bash
git add .
git commit -m "✨ Ajouter nouvelle fonctionnalité"
git push origin feature/ma-nouvelle-fonctionnalite
```

### 7. Créer une Pull Request
- Décrivez clairement vos modifications
- Ajoutez des captures d'écran si pertinent
- Référencez les issues liées

## 📝 Standards de code

### Style
- Utilisez TypeScript
- Suivez les conventions React/Hooks
- Utilisez les variables CSS UCLouvain existantes
- Commentez le code complexe

### Commits
Utilisez des messages de commit clairs avec des emojis :
- ✨ `:sparkles:` Nouvelle fonctionnalité
- 🐛 `:bug:` Correction de bug
- 📝 `:memo:` Documentation
- 🎨 `:art:` Amélioration du style/UI
- ⚡ `:zap:` Amélioration des performances
- 🔧 `:wrench:` Configuration

### Structure des fichiers
```
src/
├── components/     # Composants React
├── utils/         # Utilitaires et helpers
├── lib/           # Intégrations externes (Supabase)
├── types/         # Types TypeScript
└── assets/        # Images, fonts, etc.
```

## 🎯 Types de contributions

### Bugs 🐛
- Reportez les bugs via les GitHub Issues
- Incluez les étapes de reproduction
- Précisez votre environnement (OS, navigateur)

### Fonctionnalités ✨
- Discutez d'abord via une issue
- Assurez-vous que ça correspond à la vision du projet
- Implémentez avec des tests si possible

### Documentation 📝
- Améliorez le README
- Ajoutez des commentaires dans le code
- Créez des guides d'utilisation

### Design 🎨
- Respectez la charte graphique UCLouvain
- Maintenez la cohérence visuelle
- Optimisez pour mobile et desktop

## 🔧 Configuration de développement

### Variables d'environnement
Copiez `.env.example` vers `.env` et configurez :
```bash
cp .env.example .env
```

### Supabase local (optionnel)
Pour tester avec Supabase localement :
```bash
# Installer Supabase CLI
npm install -g @supabase/cli

# Initialiser le projet local
supabase init
supabase start
```

## 🧪 Tests

### Tests manuels
- Testez sur différents navigateurs
- Vérifiez la responsivité mobile
- Testez les fonctionnalités de calendrier

### Tests automatisés (à venir)
Nous prévoyons d'ajouter :
- Tests unitaires avec Jest
- Tests d'intégration avec Cypress
- Tests de performance

## 📋 Checklist avant PR

- [ ] Le code compile sans erreurs
- [ ] Les fonctionnalités marchent comme attendu
- [ ] Le design est responsive
- [ ] Les couleurs UCLouvain sont respectées
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les messages de commit sont clairs

## 🤝 Code de conduite

- Soyez respectueux et inclusif
- Aidez les nouveaux contributeurs
- Focalisez sur le code, pas sur la personne
- Acceptez les critiques constructives

## 💡 Idées de contributions

### Faciles pour débuter
- Corriger des typos
- Améliorer les messages d'erreur
- Ajouter des tooltips
- Optimiser les performances

### Moyennes
- Ajouter de nouveaux types d'événements
- Améliorer l'accessibilité
- Ajouter des animations
- Optimiser le cache

### Avancées
- Intégration avec d'autres calendriers
- Mode hors-ligne avec Service Workers
- Notifications push
- Export/import d'événements

## 📞 Contact

- GitHub Issues pour les bugs et fonctionnalités
- Discussions GitHub pour les questions générales
- Email : [votre-email] pour les questions privées

Merci de contribuer au Calendrier Unifié UCLouvain ! 🎓✨