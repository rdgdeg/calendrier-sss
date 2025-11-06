# Guide de Formatage Personnalisé pour les Événements

## Marqueurs de Formatage Disponibles

Le système de calendrier SSS supporte maintenant des marqueurs personnalisés pour améliorer la présentation des descriptions d'événements.

### 1. Texte en Gras
**Marqueur :** `+++texte+++`

**Exemple :**
```
+++IRSS: journée scientifique+++
```
**Résultat :** **IRSS: journée scientifique** (en gras avec mise en évidence)

### 2. Texte en Italique
**Marqueur :** `___texte___`

**Exemple :**
```
___Conférencier___ : Dr. Smith
```
**Résultat :** *Conférencier* : Dr. Smith (en italique)

### 3. Texte Souligné
**Marqueur :** `~~~texte~~~`

**Exemple :**
```
~~~Important~~~ : Places limitées
```
**Résultat :** <u>Important</u> : Places limitées (souligné)

### 4. Retour à la Ligne Forcé
**Marqueur :** `|||`

**Exemple :**
```
Première ligne|||Deuxième ligne|||Troisième ligne
```
**Résultat :**
```
Première ligne
Deuxième ligne
Troisième ligne
```

### 5. Ligne de Séparation
**Marqueur :** `===` (sur une ligne séparée)

**Exemple :**
```
Section 1

===

Section 2
```
**Résultat :**
```
Section 1
─────────────
Section 2
```

## Exemple Complet

### Saisie :
```
+++IRSS: journée scientifique avec la Pre Alison Pilnick+++

___Conférencier___ : Pre Alison Pilnick (Language, Health and Society à la Faculty of Health and Education, Manchester Metropolitan University)

~~~Important~~~ : Accréditation demandée|||

* Matinée, 10-h12h. "It's all just words": on the importance of studying healthcare interaction" (séminaire)
* Après-midi, 14h-16h. 'Between autonomy and abandonment: reconsidering patient centred care' (conférence)

===

Inscription : valerie.vanbutsele@uclouvain.be
```

### Résultat Affiché :
**IRSS: journée scientifique avec la Pre Alison Pilnick**

*Conférencier* : Pre Alison Pilnick (Language, Health and Society à la Faculty of Health and Education, Manchester Metropolitan University)

<u>Important</u> : Accréditation demandée

• Matinée, 10-h12h. "It's all just words": on the importance of studying healthcare interaction" (séminaire)
• Après-midi, 14h-16h. 'Between autonomy and abandonment: reconsidering patient centred care' (conférence)

─────────────────────────────────────

Inscription : valerie.vanbutsele@uclouvain.be

## Règles d'Utilisation

### ✅ Bonnes Pratiques
- Utilisez `+++` pour les titres et informations importantes
- Utilisez `___` pour les noms de personnes, lieux, ou concepts clés
- Utilisez `~~~` pour les avertissements et notes importantes
- Utilisez `|||` pour forcer des retours à la ligne dans un paragraphe
- Placez `===` sur une ligne séparée pour créer des sections

### ❌ À Éviter
- Ne pas fermer les marqueurs : `+++texte` (incorrect)
- Imbriquer les marqueurs : `+++___texte___+++` (non supporté)
- Utiliser `===` au milieu d'une ligne : `texte === suite` (ne fonctionnera pas)

## Compatibilité

- ✅ Fonctionne dans la vue liste des événements
- ✅ Fonctionne dans le popup modal des événements
- ✅ Compatible avec les puces automatiques (`*`, `-`)
- ✅ Compatible avec les listes numérotées
- ✅ Responsive sur tous les écrans
- ✅ Accessible aux lecteurs d'écran

## Support Technique

Le formatage personnalisé est automatiquement appliqué à toutes les descriptions d'événements. Aucune configuration supplémentaire n'est nécessaire.

Pour toute question ou problème, contactez l'équipe de développement.