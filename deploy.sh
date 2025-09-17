#!/bin/bash

# Script de déploiement automatique pour le Calendrier Unifié UCLouvain

echo "🚀 Déploiement du Calendrier Unifié UCLouvain"

# Vérifier que nous sommes sur la branche main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Erreur: Vous devez être sur la branche main pour déployer"
    exit 1
fi

# Vérifier que le répertoire de travail est propre
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Erreur: Le répertoire de travail n'est pas propre. Commitez vos changements d'abord."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci

# Build du projet
echo "🔨 Build du projet..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le build a échoué"
    exit 1
fi

# Déployer sur GitHub Pages
echo "🌐 Déploiement sur GitHub Pages..."
git add .
git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "✅ Déploiement terminé!"
echo "🌍 Le site sera disponible à: https://rdgdeg.github.io/calendari-unite/"
echo "⏱️  Attendez quelques minutes pour que GitHub Pages traite le déploiement."