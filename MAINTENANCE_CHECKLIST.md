# Liste de Contrôle - Maintenance de l'Affichage Public

## Contrôles Quotidiens (5 minutes)

### ✅ Vérification Visuelle
- [ ] L'écran affiche correctement les événements
- [ ] L'heure actuelle se met à jour en temps réel
- [ ] Les animations fonctionnent correctement (pas de saccades)
- [ ] Aucun message d'erreur visible
- [ ] La mise en page est correcte (pas d'éléments tronqués)

### ✅ Vérification Technique
- [ ] Le navigateur fonctionne (pas de crash)
- [ ] La connexion réseau est stable
- [ ] L'utilisation CPU < 50%
- [ ] L'utilisation mémoire < 2GB
- [ ] Température système normale

### ✅ Vérification des Données
- [ ] Les événements affichés correspondent au calendrier
- [ ] Les dates et heures sont correctes
- [ ] Les sources d'événements sont synchronisées
- [ ] Maximum 6 événements affichés

**Actions si problème détecté:**
```bash
# Redémarrage rapide du navigateur
pkill -f chrome && sleep 5 && ./start-display.sh
```

---

## Contrôles Hebdomadaires (15 minutes)

### ✅ Maintenance Préventive
- [ ] Redémarrer le système complet
- [ ] Vider le cache du navigateur
- [ ] Vérifier les logs d'erreur
- [ ] Tester la récupération après coupure réseau
- [ ] Valider les sauvegardes de configuration

### ✅ Tests de Performance
- [ ] Lancer les tests automatisés
  ```bash
  npm run test:display-integration
  npm run test:visual-consistency
  npm run test:performance
  ```
- [ ] Vérifier les métriques de performance
- [ ] Contrôler l'utilisation mémoire sur 24h
- [ ] Tester les animations avec différents nombres d'événements

### ✅ Mise à Jour des Données
- [ ] Synchroniser les calendriers sources
- [ ] Vérifier les permissions d'accès
- [ ] Valider les filtres d'événements
- [ ] Tester l'affichage avec 0, 1, et 6+ événements

### ✅ Documentation
- [ ] Mettre à jour les logs de maintenance
- [ ] Noter les problèmes rencontrés
- [ ] Documenter les solutions appliquées

---

## Contrôles Mensuels (30 minutes)

### ✅ Maintenance Système
- [ ] Mise à jour du système d'exploitation
- [ ] Mise à jour du navigateur Chrome
- [ ] Mise à jour des dépendances npm
  ```bash
  npm audit
  npm update
  npm run build
  ```
- [ ] Vérification des certificats SSL
- [ ] Test de sauvegarde/restauration

### ✅ Optimisation Performance
- [ ] Analyser les métriques de performance mensuelle
- [ ] Optimiser la configuration si nécessaire
- [ ] Nettoyer les fichiers temporaires
- [ ] Défragmenter le disque si nécessaire
- [ ] Vérifier l'espace disque disponible

### ✅ Tests Complets
- [ ] Test de tous les scénarios d'affichage
  - [ ] Affichage vide (0 événements)
  - [ ] Affichage simple (1 événement)
  - [ ] Affichage dual (2 événements)
  - [ ] Affichage complet (6 événements)
  - [ ] Gestion du débordement (8+ événements)
- [ ] Test de la cohérence visuelle
- [ ] Test d'accessibilité
- [ ] Test de performance continue (24h)

### ✅ Sécurité
- [ ] Vérifier les mises à jour de sécurité
- [ ] Contrôler les accès réseau
- [ ] Valider les permissions de fichiers
- [ ] Tester la récupération après incident

---

## Contrôles Trimestriels (1 heure)

### ✅ Audit Complet
- [ ] Révision complète de la configuration
- [ ] Analyse des logs sur 3 mois
- [ ] Évaluation des performances
- [ ] Révision de la documentation

### ✅ Planification
- [ ] Planifier les mises à jour majeures
- [ ] Évaluer les besoins d'amélioration
- [ ] Réviser les procédures de maintenance
- [ ] Former le personnel si nécessaire

### ✅ Tests de Stress
- [ ] Test de charge avec événements multiples
- [ ] Test de fonctionnement continu (72h)
- [ ] Test de récupération après panne
- [ ] Test de basculement sur système de secours

---

## Procédures d'Urgence

### 🚨 Écran Noir ou Pas d'Affichage

**Diagnostic rapide:**
1. [ ] Vérifier l'alimentation de l'écran
2. [ ] Vérifier les câbles HDMI/DisplayPort
3. [ ] Vérifier que l'ordinateur fonctionne
4. [ ] Redémarrer le navigateur

**Actions:**
```bash
# Redémarrage complet
sudo reboot

# Ou redémarrage du service uniquement
pkill -f chrome
sleep 10
./start-display.sh
```

### 🚨 Événements Manquants ou Incorrects

**Diagnostic:**
1. [ ] Vérifier la connexion réseau
2. [ ] Tester l'accès aux calendriers sources
3. [ ] Vérifier les filtres de date
4. [ ] Contrôler les permissions

**Actions:**
```bash
# Forcer la synchronisation
curl -X POST http://localhost:3000/api/sync

# Vérifier les logs
tail -f /var/log/calendar-display.log
```

### 🚨 Performance Dégradée

**Diagnostic:**
1. [ ] Vérifier l'utilisation CPU/mémoire
2. [ ] Contrôler la température système
3. [ ] Vérifier l'espace disque
4. [ ] Analyser les processus actifs

**Actions:**
```bash
# Monitoring en temps réel
top -p $(pgrep chrome)
free -h
df -h

# Nettoyage si nécessaire
sudo apt-get clean
sudo apt-get autoremove
```

### 🚨 Animations Bloquées ou Saccadées

**Diagnostic:**
1. [ ] Vérifier les ressources GPU
2. [ ] Contrôler les pilotes graphiques
3. [ ] Tester avec animations réduites
4. [ ] Vérifier la configuration CSS

**Actions:**
```css
/* Mode dégradé temporaire */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Contacts d'Urgence

### Support Technique Niveau 1
- **Nom**: Équipe Support SSS
- **Téléphone**: +32 10 XX XX XX
- **Email**: support-sss@uclouvain.be
- **Disponibilité**: 8h-17h (jours ouvrables)

### Support Technique Niveau 2
- **Nom**: Équipe IT UCLouvain
- **Téléphone**: +32 10 XX XX XX
- **Email**: it-support@uclouvain.be
- **Disponibilité**: 24h/7j (urgences)

### Développeur Principal
- **Email**: dev-calendar@uclouvain.be
- **Disponibilité**: Sur demande

---

## Historique de Maintenance

### Template d'Entrée
```
Date: [YYYY-MM-DD]
Technicien: [Nom]
Type: [Quotidien/Hebdomadaire/Mensuel/Urgence]
Durée: [XX minutes]

Contrôles effectués:
- [ ] Item 1
- [ ] Item 2

Problèmes détectés:
- [Description du problème]

Actions correctives:
- [Actions prises]

Statut final: [OK/Attention/Critique]
Prochaine intervention: [Date]

Notes additionnelles:
[Commentaires libres]
```

### Exemple d'Entrée
```
Date: 2024-01-15
Technicien: Jean Dupont
Type: Hebdomadaire
Durée: 12 minutes

Contrôles effectués:
- [x] Redémarrage système
- [x] Tests automatisés
- [x] Vérification performance
- [x] Synchronisation calendriers

Problèmes détectés:
- Utilisation mémoire légèrement élevée (1.8GB)

Actions correctives:
- Nettoyage cache navigateur
- Redémarrage service

Statut final: OK
Prochaine intervention: 2024-01-22

Notes additionnelles:
RAS, système stable
```

---

## Métriques de Performance

### Seuils d'Alerte
- **CPU**: > 70% pendant > 5 minutes
- **Mémoire**: > 2GB
- **Température**: > 75°C
- **Espace disque**: < 10% libre
- **Temps de réponse**: > 2 secondes

### Métriques à Surveiller
- Temps de chargement initial
- Fluidité des animations (FPS)
- Utilisation mémoire dans le temps
- Nombre d'événements affichés
- Fréquence des erreurs JavaScript

### Outils de Monitoring
```bash
# Script de surveillance automatique
#!/bin/bash
while true; do
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  MEM=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
  
  echo "$(date): CPU=${CPU}% MEM=${MEM}%"
  
  if (( $(echo "$CPU > 70" | bc -l) )); then
    echo "ALERTE: CPU élevé"
  fi
  
  if (( $(echo "$MEM > 80" | bc -l) )); then
    echo "ALERTE: Mémoire élevée"
  fi
  
  sleep 300
done
```