# Calendrier SSS UCLouvain

Un calendrier moderne et élégant pour visualiser les événements UCLouvain avec synchronisation automatique des calendriers iCloud et Outlook.

## 🌟 Fonctionnalités

- **Interface moderne** avec la police Montserrat et les couleurs UCLouvain
- **Synchronisation automatique** des calendriers iCloud et Outlook
- **Système de couleurs intelligent** :
  - Couleur spécifique pour "de duve" (violet)
  - Couleurs automatiques basées sur le contenu entre crochets
  - Palette de 15 couleurs distinctes pour une meilleure lisibilité
- **Tooltips au survol** pour voir les titres complets
- **Formatage HTML intelligent** des descriptions d'événements
- **Design responsive** optimisé pour mobile et desktop
- **Mise à jour automatique** via Supabase

## 🚀 Démo en ligne

[Voir le calendrier en direct](https://rdgdeg.github.io/calendrier-sss/)

## 🛠️ Technologies utilisées

- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **date-fns** pour la gestion des dates
- **ical.js** pour le parsing des calendriers
- **Supabase** pour la synchronisation automatique
- **GitHub Pages** pour l'hébergement

## 📅 Sources de calendriers

- Calendrier personnel iCloud
- Calendrier Outlook UCLouvain

## 🎨 Système de couleurs

### Couleurs spéciales
- **"de duve"** → Violet (`#8e44ad`)

### Couleurs par contenu entre crochets
Les événements avec du contenu entre crochets `[MATH101]`, `[PHYS201]`, etc. reçoivent automatiquement une couleur consistante basée sur ce contenu.

### Palette générale
15 couleurs distinctes sont utilisées pour assurer une bonne lisibilité et différenciation des événements.

## 🔄 Mise à jour automatique

Le calendrier se synchronise automatiquement avec Supabase pour maintenir les données à jour sans intervention manuelle.

## 📱 Responsive Design

- **Desktop** : Vue complète avec tous les détails
- **Tablet** : Adaptation de la mise en page
- **Mobile** : Interface optimisée pour les petits écrans

## 🚀 Installation locale

```bash
# Cloner le repository
git clone https://github.com/rdgdeg/calendari-unite.git

# Installer les dépendances
cd calendari-unite
npm install

# Lancer en développement
npm run dev

# Build pour la production
npm run build
```

## 📝 Configuration

Les URLs des calendriers sont configurées dans `src/components/Calendar.tsx`. Pour ajouter de nouveaux calendriers, modifiez le tableau `CALENDAR_SOURCES`.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

Développé avec ❤️ pour la communauté UCLouvain