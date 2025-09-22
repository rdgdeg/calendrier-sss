// Utilitaire pour extraire et traiter les images dans les descriptions d'événements

export interface ExtractedImage {
  src: string;
  alt?: string;
  title?: string;
  isBase64: boolean;
  isUrl: boolean;
}

export interface ProcessedEventContent {
  cleanDescription: string;
  images: ExtractedImage[];
  hasImages: boolean;
}

/**
 * Extrait les images des descriptions d'événements
 */
export const extractImagesFromDescription = (description: string): ProcessedEventContent => {
  if (!description) {
    return {
      cleanDescription: '',
      images: [],
      hasImages: false
    };
  }

  const images: ExtractedImage[] = [];
  let cleanDescription = description;

  // Regex pour détecter les images HTML
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*(?:title=["']([^"']*)["'])?[^>]*>/gi;
  
  // Regex pour détecter les URLs d'images directes
  const urlImageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi;
  
  // Regex pour détecter les images base64
  const base64ImageRegex = /data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/gi;

  // Extraire les images HTML
  let match;
  while ((match = imgRegex.exec(description)) !== null) {
    const src = match[1];
    const alt = match[2] || '';
    const title = match[3] || '';
    
    images.push({
      src,
      alt,
      title,
      isBase64: src.startsWith('data:image/'),
      isUrl: src.startsWith('http')
    });

    // Remplacer l'image par un placeholder dans la description
    cleanDescription = cleanDescription.replace(match[0], `[Image: ${alt || title || 'Image'}]`);
  }

  // Extraire les URLs d'images directes
  imgRegex.lastIndex = 0; // Reset regex
  while ((match = urlImageRegex.exec(description)) !== null) {
    const src = match[1];
    
    // Éviter les doublons
    if (!images.some(img => img.src === src)) {
      images.push({
        src,
        alt: 'Image',
        isBase64: false,
        isUrl: true
      });

      // Remplacer l'URL par un placeholder
      cleanDescription = cleanDescription.replace(src, '[Image]');
    }
  }

  // Extraire les images base64
  urlImageRegex.lastIndex = 0; // Reset regex
  while ((match = base64ImageRegex.exec(description)) !== null) {
    const src = match[0];
    
    images.push({
      src,
      alt: 'Image intégrée',
      isBase64: true,
      isUrl: false
    });

    // Remplacer l'image base64 par un placeholder
    cleanDescription = cleanDescription.replace(src, '[Image intégrée]');
  }

  // Nettoyer les balises HTML restantes
  cleanDescription = cleanDescription
    .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();

  return {
    cleanDescription,
    images,
    hasImages: images.length > 0
  };
};

/**
 * Vérifie si une image est accessible (pas de CORS)
 */
export const isImageAccessible = (src: string): boolean => {
  // Images base64 toujours accessibles
  if (src.startsWith('data:image/')) {
    return true;
  }

  // URLs publiques généralement accessibles
  const publicDomains = [
    'imgur.com',
    'i.imgur.com',
    'github.com',
    'githubusercontent.com',
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
    'wikimedia.org',
    'wikipedia.org'
  ];

  return publicDomains.some(domain => src.includes(domain));
};

/**
 * Génère un aperçu textuel des images pour les cas où elles ne sont pas accessibles
 */
export const generateImagePreview = (images: ExtractedImage[]): string => {
  if (images.length === 0) return '';

  const previews = images.map((img, index) => {
    if (img.isBase64) {
      return `📷 Image intégrée ${index + 1}`;
    } else if (img.alt || img.title) {
      return `🖼️ ${img.alt || img.title}`;
    } else {
      return `🖼️ Image ${index + 1}`;
    }
  });

  return previews.join(' • ');
};