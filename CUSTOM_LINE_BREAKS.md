# Marqueurs de Saut de Ligne Personnalisés

## Vue d'ensemble

Le système de calendrier UCLouvain supporte maintenant des marqueurs personnalisés pour contrôler les sauts de ligne dans les descriptions d'événements.

## Fonctionnalité

### Marqueur par défaut : `***`

Utilisez trois astérisques (`***`) dans vos descriptions d'événements pour créer des sauts de ligne avec espacement.

### Exemples d'utilisation

#### Exemple simple
```
Première partie de la description.***Deuxième partie après un saut de ligne.***Troisième partie.
```

**Résultat affiché :**
```
Première partie de la description.

Deuxième partie après un saut de ligne.

Troisième partie.
```

#### Exemple avec contenu structuré
```
Séminaire IREC - Recherche Avancée***

Détails de l'événement:
- Date: 26 septembre 2025
- Heure: 14h00 - 16h30***

Contact: irec@uclouvain.be***

Important: Inscription obligatoire avant le 25/09/2025.
```

**Résultat affiché :**
```
Séminaire IREC - Recherche Avancée

Détails de l'événement:
- Date: 26 septembre 2025
- Heure: 14h00 - 16h30

Contact: irec@uclouvain.be

Important: Inscription obligatoire avant le 25/09/2025.
```

## Où ça fonctionne

✅ **EventModal** : Descriptions complètes dans les modals d'événements
✅ **EventCard** : Descriptions courtes dans les cartes d'événements (avec troncature)
✅ **Tous les types d'événements** : iCloud et Outlook

## Avantages

- **🎯 Contrôle précis** : Vous décidez exactement où placer les sauts de ligne
- **📱 Responsive** : Fonctionne sur tous les types d'écrans
- **🔄 Compatible** : Fonctionne avec le HTML existant et le nettoyage automatique
- **⚡ Performance** : Traitement optimisé avec mise en cache

## Règles d'utilisation

1. **Marqueur standard** : Utilisez `***` (trois astérisques)
2. **Placement flexible** : Peut être placé n'importe où dans le texte
3. **Multiples marqueurs** : Vous pouvez utiliser plusieurs `***` dans une même description
4. **Combinaison** : Fonctionne avec du HTML existant et d'autres formatages

## Exemples pratiques

### Événement de séminaire
```
IREC Seminar - Prof. Élise Belaidi***

📅 Date: 26 septembre 2025
🕐 Heure: 14h00 - 16h30
📍 Lieu: Auditoire MEDI 91***

📧 Contact: irec@uclouvain.be
📞 Téléphone: +32 10 47 43 02***

⚠️ Important: Inscription obligatoire avant le 25/09/2025. Places limitées.
```

### Événement de réunion
```
Réunion équipe SSS***

Ordre du jour:
1. Point sur les projets en cours
2. Planning septembre-octobre
3. Questions diverses***

Merci de confirmer votre présence.
```

## Notes techniques

- Les marqueurs `***` sont convertis en `<br><br>` (double saut de ligne avec espacement)
- Le traitement se fait avant le nettoyage HTML
- Compatible avec la troncature intelligente des textes longs
- Fonctionne dans tous les composants d'affichage de texte

## Compatibilité

- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ✅ Appareils mobiles et tablettes
- ✅ Écrans TV et grands écrans
- ✅ Mode sombre et clair
- ✅ Toutes les tailles de police responsive