import { EventCategory } from '../types';

// UCLouvain official color palette with enhanced event colors
export const UCLOUVAIN_COLORS = {
  primary: '#003d7a',    // Bleu UCLouvain principal
  secondary: '#6c757d',  // Gris UCLouvain
  accent: '#0056b3',     // Bleu secondaire
  success: '#28a745',    // Vert de validation
  warning: '#ffc107',    // Jaune d'avertissement
  danger: '#dc3545',     // Rouge d'alerte
  light: '#f8f9fa',     // Gris très clair
  white: '#ffffff'       // Blanc
} as const;

// Enhanced color palette for diverse calendar events
export const EVENT_COLORS = [
  '#ff6b6b',  // Rouge corail
  '#4ecdc4',  // Turquoise
  '#45b7d1',  // Bleu ciel
  '#f39c12',  // Orange
  '#9b59b6',  // Violet
  '#e74c3c',  // Rouge
  '#2ecc71',  // Vert
  '#f1c40f',  // Jaune
  '#e67e22',  // Orange foncé
  '#1abc9c',  // Vert turquoise
  '#3498db',  // Bleu
  '#e91e63',  // Rose
  '#795548',  // Marron
  '#607d8b',  // Bleu gris
  '#ff9800',  // Orange ambré
] as const;

// UCLouvain event categories with enhanced color mapping
export const UCLOUVAIN_CATEGORIES: Record<string, EventCategory> = {
  'icloud': {
    id: 'icloud',
    name: 'Calendrier Personnel',
    color: EVENT_COLORS[0], // Rouge corail
    source: 'icloud'
  },
  'outlook': {
    id: 'outlook', 
    name: 'Calendrier UCLouvain',
    color: EVENT_COLORS[1], // Turquoise
    source: 'outlook'
  },
  'cours': {
    id: 'cours',
    name: 'Cours',
    color: EVENT_COLORS[2], // Bleu ciel
    source: 'outlook'
  },
  'examens': {
    id: 'examens',
    name: 'Examens',
    color: EVENT_COLORS[3], // Orange
    source: 'outlook'
  },
  'reunions': {
    id: 'reunions',
    name: 'Réunions',
    color: EVENT_COLORS[4], // Violet
    source: 'outlook'
  },
  'evenements': {
    id: 'evenements',
    name: 'Événements',
    color: EVENT_COLORS[5], // Rouge
    source: 'outlook'
  }
} as const;

/**
 * Determines the category of an event based on its properties
 * @param title Event title
 * @param description Event description
 * @param source Event source (icloud or outlook)
 * @returns EventCategory
 */
export function determineEventCategory(
  title: string, 
  description: string = '', 
  source: 'icloud' | 'outlook'
): EventCategory {
  // For iCloud events, always use the personal calendar category
  if (source === 'icloud') {
    return UCLOUVAIN_CATEGORIES.icloud;
  }

  // For Outlook events, try to categorize based on content
  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();
  const content = `${titleLower} ${descriptionLower}`;

  // Check for course-related keywords
  if (content.includes('cours') || 
      content.includes('lecture') || 
      content.includes('séminaire') ||
      content.includes('tp') ||
      content.includes('td') ||
      content.includes('labo')) {
    return UCLOUVAIN_CATEGORIES.cours;
  }

  // Check for exam-related keywords
  if (content.includes('examen') || 
      content.includes('test') || 
      content.includes('évaluation') ||
      content.includes('contrôle') ||
      content.includes('partiel')) {
    return UCLOUVAIN_CATEGORIES.examens;
  }

  // Check for meeting-related keywords
  if (content.includes('réunion') || 
      content.includes('meeting') || 
      content.includes('rendez-vous') ||
      content.includes('entretien') ||
      content.includes('rdv')) {
    return UCLOUVAIN_CATEGORIES.reunions;
  }

  // Check for event-related keywords
  if (content.includes('événement') || 
      content.includes('conférence') || 
      content.includes('colloque') ||
      content.includes('symposium') ||
      content.includes('workshop') ||
      content.includes('atelier')) {
    return UCLOUVAIN_CATEGORIES.evenements;
  }

  // Default to general UCLouvain calendar
  return UCLOUVAIN_CATEGORIES.outlook;
}

/**
 * Gets all available categories
 * @returns Array of EventCategory
 */
export function getAllCategories(): EventCategory[] {
  return Object.values(UCLOUVAIN_CATEGORIES);
}

/**
 * Gets categories for a specific source
 * @param source The calendar source
 * @returns Array of EventCategory for the source
 */
export function getCategoriesForSource(source: 'icloud' | 'outlook'): EventCategory[] {
  return Object.values(UCLOUVAIN_CATEGORIES).filter(category => category.source === source);
}

/**
 * Gets a category by its ID
 * @param categoryId The category ID
 * @returns EventCategory or undefined if not found
 */
export function getCategoryById(categoryId: string): EventCategory | undefined {
  return UCLOUVAIN_CATEGORIES[categoryId];
}

// Couleurs spécifiques pour les professeurs/personnes
const PROFESSOR_COLORS: Record<string, string> = {
  'de duve': '#8e44ad',  // Violet spécifique pour "de duve"
} as const;

// Couleurs pour le contenu entre crochets
const BRACKET_COLORS = [
  '#e74c3c',  // Rouge
  '#3498db',  // Bleu
  '#2ecc71',  // Vert
  '#f39c12',  // Orange
  '#9b59b6',  // Violet
  '#1abc9c',  // Turquoise
  '#e67e22',  // Orange foncé
  '#f1c40f',  // Jaune
  '#e91e63',  // Rose
  '#795548',  // Marron
  '#607d8b',  // Bleu gris
  '#ff9800',  // Orange ambré
  '#673ab7',  // Violet profond
  '#009688',  // Teal
  '#ff5722',  // Rouge orangé
] as const;

/**
 * Extrait le contenu entre crochets d'un titre
 * @param title Titre de l'événement
 * @returns Contenu entre crochets ou null si aucun
 */
function extractBracketContent(title: string): string | null {
  const match = title.match(/\[([^\]]+)\]/);
  return match ? match[1].toLowerCase().trim() : null;
}

/**
 * Génère une couleur basée sur le contenu entre crochets
 * @param bracketContent Contenu entre crochets
 * @returns Couleur hex
 */
function getBracketColor(bracketContent: string): string {
  // Créer un hash simple du contenu entre crochets
  let hash = 0;
  for (let i = 0; i < bracketContent.length; i++) {
    const char = bracketContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const colorIndex = Math.abs(hash) % BRACKET_COLORS.length;
  return BRACKET_COLORS[colorIndex];
}

/**
 * Generates a consistent color for an event based on its title
 * This ensures the same event always gets the same color
 * @param title Event title
 * @param source Event source
 * @returns Color hex string
 */
export function getEventColor(title: string, _source: 'icloud' | 'outlook'): string {
  const titleLower = title.toLowerCase();
  
  // 1. Vérifier d'abord les couleurs spécifiques pour les professeurs
  for (const [professor, color] of Object.entries(PROFESSOR_COLORS)) {
    if (titleLower.includes(professor)) {
      return color;
    }
  }
  
  // 2. Vérifier s'il y a du contenu entre crochets
  const bracketContent = extractBracketContent(title);
  if (bracketContent) {
    return getBracketColor(bracketContent);
  }
  
  // 3. Couleur par défaut basée sur le hash du titre complet
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a color index
  const colorIndex = Math.abs(hash) % EVENT_COLORS.length;
  return EVENT_COLORS[colorIndex];
}

/**
 * Ajoute une couleur spécifique pour un professeur ou une personne
 * @param name Nom de la personne (sera converti en minuscules)
 * @param color Couleur hex
 */
export function addProfessorColor(name: string, color: string): void {
  (PROFESSOR_COLORS as any)[name.toLowerCase()] = color;
}

/**
 * Obtient toutes les couleurs de professeurs configurées
 * @returns Objet avec les noms et couleurs des professeurs
 */
export function getProfessorColors(): Record<string, string> {
  return { ...PROFESSOR_COLORS };
}

/**
 * Obtient les couleurs disponibles pour les crochets
 * @returns Array des couleurs pour les crochets
 */
export function getBracketColors(): readonly string[] {
  return BRACKET_COLORS;
}

/**
 * Enhanced event categorization with dynamic color assignment
 * @param title Event title
 * @param description Event description
 * @param source Event source
 * @returns EventCategory with potentially dynamic color
 */
export function determineEventCategoryWithColor(
  title: string, 
  description: string = '', 
  source: 'icloud' | 'outlook'
): EventCategory {
  const baseCategory = determineEventCategory(title, description, source);
  
  // For more visual diversity, assign a unique color based on the event title
  // while keeping the category logic intact
  const dynamicColor = getEventColor(title, source);
  
  return {
    ...baseCategory,
    color: dynamicColor
  };
}