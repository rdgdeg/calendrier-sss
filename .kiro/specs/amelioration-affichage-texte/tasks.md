# Implementation Plan

- [x] 1. Créer le service TextFormatter avec nettoyage HTML et troncature intelligente
  - Implémenter la classe TextFormatter avec méthodes de formatage de base
  - Créer les fonctions de nettoyage HTML sécurisé
  - Développer l'algorithme de troncature intelligente préservant les mots
  - Écrire les tests unitaires pour toutes les fonctions de formatage
  - _Requirements: 1.2, 1.4, 5.1, 5.3_

- [x] 2. Développer le système de détection et formatage du contenu spécial
  - Créer les regex patterns pour URLs, emails, téléphones et dates
  - Implémenter les fonctions d'extraction et de formatage des liens
  - Développer le système de mise en évidence des contenus importants
  - Créer les tests pour la détection de tous types de contenu spécial
  - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4_

- [x] 3. Implémenter le composant ResponsiveText avec échelles typographiques
  - Créer le composant ResponsiveText avec props pour différents variants
  - Définir les échelles typographiques pour mobile, tablet, desktop et TV
  - Implémenter la détection automatique de la taille d'écran
  - Créer les tests de rendu pour toutes les tailles d'écran
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Créer le système de formatage avancé des descriptions
  - Développer le processeur de paragraphes avec espacement approprié
  - Implémenter le formatage des listes avec puces visuelles
  - Créer le système de préservation des retours à la ligne
  - Écrire les tests pour le formatage de descriptions complexes
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 5. Améliorer le composant EventCard avec le nouveau système de texte
  - Intégrer ResponsiveText dans le titre des cartes d'événements
  - Appliquer la troncature intelligente aux titres longs
  - Implémenter l'affichage optimisé des descriptions courtes
  - Créer les tests d'intégration pour les cartes d'événements
  - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [x] 6. Optimiser l'affichage dans EventModal avec formatage complet
  - Intégrer le formatage avancé des descriptions dans la modal
  - Implémenter la zone scrollable avec indicateurs visuels
  - Créer l'extraction et affichage séparé des images et liens
  - Développer les tests pour l'affichage modal complet
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Implémenter la gestion intelligente des textes longs
  - Créer le système "voir plus" pour les descriptions tronquées
  - Développer les indicateurs visuels de contenu supplémentaire
  - Implémenter la coupure appropriée des mots très longs
  - Écrire les tests pour tous les cas de débordement de texte
  - _Requirements: 5.2, 5.4, 2.3_

- [x] 8. Créer les styles CSS adaptatifs pour la typographie responsive
  - Définir les variables CSS pour les échelles typographiques
  - Créer les media queries pour l'adaptation automatique
  - Implémenter les styles pour les contenus spéciaux (liens, dates)
  - Optimiser les styles pour les écrans haute résolution
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 6.3, 6.4_

- [x] 9. Optimiser les performances avec memoization et lazy loading
  - Implémenter la mise en cache des résultats de formatage
  - Créer le système de traitement différé pour les descriptions longues
  - Développer la gestion optimisée des changements de taille d'écran
  - Écrire les tests de performance pour les opérations de formatage
  - _Requirements: 4.4, 5.4_

- [x] 10. Intégrer et tester l'ensemble du système
  - Intégrer tous les composants dans l'application principale
  - Effectuer les tests d'intégration sur tous les types d'événements
  - Valider l'affichage sur tous les types d'écrans supportés
  - Créer les tests de régression visuelle pour éviter les régressions futures
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 11. Corrections des problèmes d'affichage identifiés
  - **Problème 1**: Titre invisible dans l'en-tête de la modal (texte bleu sur fond bleu)
    - ✅ Ajout de `color: var(--ucl-white) !important;` dans `.event-modal-title`
    - ✅ Force l'affichage du texte en blanc pour assurer la visibilité
  - **Problème 2**: Codes d'image Outlook/Exchange non traités dans les descriptions
    - ✅ Ajout de la regex `cidImageRegex` pour détecter les codes `[cid:image@id]`
    - ✅ Suppression automatique des codes d'image dans `extractImagesFromDescription`
    - ✅ Préservation du contenu textuel principal
  - Tests créés pour valider les corrections
    - ✅ `src/test/imageCodeFix.test.ts` - Tests de suppression des codes d'image
    - ✅ `src/test/modalTitleFix.test.tsx` - Tests de visibilité du titre modal