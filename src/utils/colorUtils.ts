/**
 * Calcule la luminosité d'une couleur hexadécimale
 * @param hex - Couleur au format hexadécimal (#RRGGBB)
 * @returns Valeur de luminosité entre 0 et 255
 */
export const getLuminance = (hex: string): number => {
  // Supprimer le # si présent
  const color = hex.replace('#', '');
  
  // Convertir en RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calculer la luminosité selon la formule W3C
  return (0.299 * r + 0.587 * g + 0.114 * b);
};

/**
 * Détermine la couleur de texte optimale (noir ou blanc) selon la couleur de fond
 * @param backgroundColor - Couleur de fond au format hexadécimal
 * @returns '#000000' pour texte noir ou '#ffffff' pour texte blanc
 */
export const getOptimalTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  // Seuil ajusté pour favoriser le texte blanc sur les couleurs moyennes à sombres
  return luminance > 180 ? '#000000' : '#ffffff';
};

/**
 * Génère une version plus sombre d'une couleur pour les bordures
 * @param hex - Couleur au format hexadécimal
 * @param factor - Facteur d'assombrissement (0.8 = 20% plus sombre)
 * @returns Couleur assombrie au format hexadécimal
 */
export const darkenColor = (hex: string, factor: number = 0.8): string => {
  const color = hex.replace('#', '');
  const r = Math.floor(parseInt(color.substring(0, 2), 16) * factor);
  const g = Math.floor(parseInt(color.substring(2, 4), 16) * factor);
  const b = Math.floor(parseInt(color.substring(4, 6), 16) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Génère une version plus claire (pastel) d'une couleur pour améliorer la lisibilité
 * @param hex - Couleur au format hexadécimal
 * @param factor - Facteur d'éclaircissement (0.3 = mélange avec 30% de blanc)
 * @returns Couleur éclaircie au format hexadécimal
 */
export const lightenColor = (hex: string, factor: number = 0.3): string => {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Mélanger avec du blanc pour créer un effet pastel
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

/**
 * Génère une couleur de fond optimale pour la lisibilité du texte
 * @param originalColor - Couleur originale au format hexadécimal
 * @returns Couleur de fond optimisée pour la lisibilité
 */
export const getReadableBackgroundColor = (originalColor: string): string => {
  const luminance = getLuminance(originalColor);
  
  // Toujours créer un fond suffisamment clair pour du texte noir
  // ou suffisamment sombre pour du texte blanc
  if (luminance < 60) {
    // Couleur très sombre -> fond très clair avec une teinte de la couleur originale
    return lightenColor(originalColor, 0.8);
  }
  else if (luminance < 120) {
    // Couleur sombre -> fond clair
    return lightenColor(originalColor, 0.7);
  }
  else if (luminance < 180) {
    // Couleur moyenne -> fond plus clair
    return lightenColor(originalColor, 0.5);
  }
  else {
    // Couleur déjà claire -> fond encore plus clair
    return lightenColor(originalColor, 0.3);
  }
};

/**
 * Génère une couleur de fond avec contraste élevé pour une lisibilité maximale
 * @param originalColor - Couleur originale au format hexadécimal
 * @returns Couleur de fond avec contraste élevé
 */
export const getHighContrastBackgroundColor = (originalColor: string): string => {
  const luminance = getLuminance(originalColor);
  
  // Garder les couleurs plus saturées pour un meilleur contraste avec le texte blanc
  if (luminance < 80) {
    // Couleurs très sombres -> éclaircir légèrement pour garder la couleur
    return lightenColor(originalColor, 0.2);
  } else if (luminance < 150) {
    // Couleurs moyennes -> garder la couleur originale ou légèrement assombrie
    return darkenColor(originalColor, 0.9);
  } else {
    // Couleurs claires -> assombrir pour permettre le texte blanc
    return darkenColor(originalColor, 0.6);
  }
};

/**
 * Génère une couleur de titre lisible basée sur la couleur originale
 * @param originalColor - Couleur originale au format hexadécimal
 * @returns Couleur de titre optimisée pour la lisibilité
 */
export const getReadableTitleColor = (originalColor: string): string => {
  const luminance = getLuminance(originalColor);
  
  // Pour les titres, on veut une couleur suffisamment sombre pour être lisible
  if (luminance > 150) {
    // Couleur claire -> assombrir significativement
    return darkenColor(originalColor, 0.4);
  } else if (luminance > 100) {
    // Couleur moyenne -> assombrir modérément
    return darkenColor(originalColor, 0.6);
  } else {
    // Couleur déjà sombre -> utiliser telle quelle ou légèrement éclaircie
    return originalColor;
  }
};

/**
 * Génère une couleur de titre avec contraste élevé pour une lisibilité maximale
 * @param originalColor - Couleur originale au format hexadécimal
 * @returns Couleur de titre avec contraste élevé
 */
export const getHighContrastTitleColor = (originalColor: string): string => {
  const luminance = getLuminance(originalColor);
  
  // Toujours retourner une couleur sombre pour les titres
  if (luminance > 120) {
    // Couleur claire -> très sombre
    return darkenColor(originalColor, 0.3);
  } else if (luminance > 80) {
    // Couleur moyenne -> sombre
    return darkenColor(originalColor, 0.5);
  } else {
    // Couleur déjà sombre -> garder mais s'assurer qu'elle est assez sombre
    const darkened = darkenColor(originalColor, 0.8);
    return getLuminance(darkened) < 80 ? darkened : '#2d3748';
  }
};