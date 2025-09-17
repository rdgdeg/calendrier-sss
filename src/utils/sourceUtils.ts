// Fonction utilitaire pour obtenir le nom d'affichage des sources
export const getSourceDisplayName = (source: 'icloud' | 'outlook'): string => {
  switch (source) {
    case 'icloud':
      return 'de Duve';
    case 'outlook':
      return 'Secteur SSS';
    default:
      return source;
  }
};

// Fonction utilitaire pour obtenir l'icône des sources
export const getSourceIcon = (source: 'icloud' | 'outlook'): string => {
  switch (source) {
    case 'icloud':
      return '🧬';
    case 'outlook':
      return '🏥';
    default:
      return '📅';
  }
};