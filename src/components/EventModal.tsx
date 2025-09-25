import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSourceDisplayName } from '../utils/sourceUtils';
import { extractImagesFromDescription } from '../utils/imageExtractor';
import { EventImagesPreview } from './EventImagesPreview';
import { EventDescription } from './EventDescription';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onExportToGoogle?: (event: CalendarEvent) => void;
  onExportToOutlook?: (event: CalendarEvent) => void;
  onExportToICS?: (event: CalendarEvent) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onExportToGoogle, 
  onExportToOutlook, 
  onExportToICS 
}) => {
  if (!isOpen || !event) return null;

  // Traitement des images dans la description
  const processedContent = event.description ? extractImagesFromDescription(event.description) : null;
  const descriptionToRender = processedContent?.cleanDescription ?? event.description ?? '';
  const hasDescription = descriptionToRender.trim().length > 0;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="event-modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="event-modal" role="dialog" aria-labelledby="event-title" aria-modal="true">
        <div className="event-modal-header">
          <h2 id="event-title" className="event-modal-title">{event.title}</h2>
          <button 
            className="event-modal-close" 
            onClick={onClose}
            aria-label="Fermer les détails de l'événement"
          >
            ✕
          </button>
        </div>
        
        <div className="event-modal-content">
          <div className="event-modal-details">
            {/* Date et heure */}
            <div className="event-detail-row">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <strong>Date et heure</strong>
                <span>
                  {event.allDay ? (
                    `${format(event.start, 'EEEE d MMMM yyyy', { locale: fr })} - Toute la journée`
                  ) : (
                    `${format(event.start, 'EEEE d MMMM yyyy', { locale: fr })} de ${format(event.start, 'HH:mm')} à ${format(event.end, 'HH:mm')}`
                  )}
                </span>
              </div>
            </div>

            {/* Lieu */}
            {event.location && (
              <div className="event-detail-row">
                <div className="detail-icon">📍</div>
                <div className="detail-content">
                  <strong>Lieu</strong>
                  <span>{event.location}</span>
                </div>
              </div>
            )}



            {/* Source */}
            <div className="event-detail-row">
              <div className="detail-icon">📊</div>
              <div className="detail-content">
                <strong>Source</strong>
                <span>{getSourceDisplayName(event.source)}</span>
              </div>
            </div>

            {/* Images extraites */}
            {processedContent && processedContent.hasImages && (
              <div className="event-detail-row">
                <div className="detail-icon">🖼️</div>
                <div className="detail-content">
                  <strong>Images</strong>
                  <EventImagesPreview 
                    images={processedContent.images}
                    maxImages={6}
                  />
                </div>
              </div>
            )}

            {/* Description nettoyée */}
            {hasDescription && (
              <div className="event-detail-row description-row">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <strong>Description</strong>
                  <div className="description-content">
                    <EventDescription
                      description={descriptionToRender}
                      className="event-description-modal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'export */}
            <div className="event-detail-row">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <strong>Ajouter à mon calendrier</strong>
                <div className="export-buttons-modal">
                  {onExportToGoogle && (
                    <button
                      className="btn-export-modal btn-export-google-modal"
                      onClick={() => onExportToGoogle(event)}
                      title="Ajouter à Google Calendar"
                    >
                      <span className="export-icon">📅</span>
                      Google Calendar
                    </button>
                  )}
                  {onExportToOutlook && (
                    <button
                      className="btn-export-modal btn-export-outlook-modal"
                      onClick={() => onExportToOutlook(event)}
                      title="Ajouter à Outlook"
                    >
                      <span className="export-icon">📆</span>
                      Outlook
                    </button>
                  )}
                  {onExportToICS && (
                    <button
                      className="btn-export-modal btn-export-ics-modal"
                      onClick={() => onExportToICS(event)}
                      title="Télécharger fichier ICS"
                    >
                      <span className="export-icon">💾</span>
                      Fichier ICS
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};