import React, { useState } from 'react';
import { ExtractedImage, isImageAccessible } from '../utils/imageExtractor';

interface EventImagesPreviewProps {
  images: ExtractedImage[];
  maxImages?: number;
}

export const EventImagesPreview: React.FC<EventImagesPreviewProps> = ({ 
  images, 
  maxImages = 3 
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  if (images.length === 0) return null;

  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => new Set(prev).add(src));
  };

  const handleImageError = (src: string) => {
    setFailedImages(prev => new Set(prev).add(src));
  };

  const displayImages = images.slice(0, maxImages);
  const remainingCount = images.length - maxImages;

  return (
    <div className="event-images-preview">
      <div className="images-grid">
        {displayImages.map((image, index) => {
          const isAccessible = isImageAccessible(image.src);
          const hasLoaded = loadedImages.has(image.src);
          const hasFailed = failedImages.has(image.src);

          return (
            <div key={index} className="image-container">
              {isAccessible && !hasFailed ? (
                <div className="image-wrapper">
                  <img
                    src={image.src}
                    alt={image.alt || `Image ${index + 1}`}
                    title={image.title || image.alt}
                    className={`event-image ${hasLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => handleImageLoad(image.src)}
                    onError={() => handleImageError(image.src)}
                    loading="lazy"
                  />
                  {!hasLoaded && (
                    <div className="image-placeholder loading">
                      <span>📷</span>
                      <span>Chargement...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="image-placeholder unavailable">
                  <span>🖼️</span>
                  <span>{image.alt || 'Image non accessible'}</span>
                  <small>Cliquez "Voir en ligne" pour l'afficher</small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {remainingCount > 0 && (
        <div className="remaining-images">
          <span>+{remainingCount} image{remainingCount > 1 ? 's' : ''} supplémentaire{remainingCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {images.some(img => !isImageAccessible(img.src)) && (
        <div className="images-note">
          <small>💡 Certaines images nécessitent "Voir en ligne" pour être affichées</small>
        </div>
      )}
    </div>
  );
};