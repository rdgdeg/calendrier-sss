# Système de Couleurs du Calendrier

## Vue d'ensemble

Le système de couleurs du calendrier utilise une logique hiérarchique pour assigner des couleurs aux événements :

1. **Couleurs spécifiques pour les professeurs/personnes**
2. **Couleurs basées sur le contenu entre crochets**
3. **Couleurs par défaut basées sur le hash du titre**

## Règles de Couleurs

### 1. Professeurs/Personnes Spécifiques

Certains noms ont des couleurs dédiées :
- **"de duve"** → Violet (`#8e44ad`)

### 2. Contenu entre Crochets

Les événements avec du contenu entre crochets `[...]` reçoivent une couleur basée sur ce contenu :
- `[MATH101]` → Couleur consistante basée sur "MATH101"
- `[PHYS201]` → Couleur consistante basée sur "PHYS201"
- `[INFO301]` → Couleur consistante basée sur "INFO301"

### 3. Couleur par Défaut

Les autres événements reçoivent une couleur basée sur le hash de leur titre complet.

## Exemples

```
"Cours avec de duve" → Violet (#8e44ad)
"Cours [MATH101]" → Couleur basée sur "MATH101"
"Examen [PHYS201]" → Couleur basée sur "PHYS201"
"Réunion générale" → Couleur basée sur le hash du titre
```

## Ajouter de Nouvelles Couleurs

Pour ajouter une couleur spécifique pour un nouveau professeur :

```typescript
import { addProfessorColor } from './src/utils/colorMapping';

// Ajouter une couleur pour "martin"
addProfessorColor('martin', '#2c3e50');
```

## Couleurs Disponibles

### Couleurs pour Crochets
- Rouge (`#e74c3c`)
- Bleu (`#3498db`)
- Vert (`#2ecc71`)
- Orange (`#f39c12`)
- Violet (`#9b59b6`)
- Turquoise (`#1abc9c`)
- Et 9 autres couleurs...

### Palette Générale
15 couleurs distinctes sont utilisées pour la palette générale des événements.