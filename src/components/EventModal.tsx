import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Calendar, MapPin, FileText, Download, X, Info, ExternalLink } from 'lucide-react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { customMarkdownFormatter } from '../utils/customMarkdownFormatter';
import { extractImagesFromDescription } from '../utils/imageExtractor';
import { ResponsiveText } from './display/ResponsiveText';
import { ErrorBoundary } from './ErrorBoundary';

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
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
    isScrollable: false
  });

  const processedContent = useMemo(
    () => (event?.description ? extractImagesFromDescription(event.description) : null),
    [event?.description]
  );

  const processedDescription = useMemo(() => {
    const text = processedContent?.cleanDescription ?? event?.description;
    if (!text) return null;

    let processedText = text
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<!--.*?-->/gs, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    return customMarkdownFormatter.processEventDescription(processedText);
  }, [processedContent?.cleanDescription, event?.description]);

  // Stable scroll state update function - no dependencies to avoid re-creation
  const updateScrollState = useCallback(() => {
    const descriptionElement = descriptionRef.current;
    if (!descriptionElement) return;

    // Direct update without requestAnimationFrame to avoid timing issues
    const { scrollTop, scrollHeight, clientHeight } = descriptionElement;
    const isScrollable = scrollHeight > clientHeight + 5; // Larger buffer
    const canScrollUp = scrollTop > 15; // Higher threshold
    const canScrollDown = scrollTop < scrollHeight - clientHeight - 15; // Higher threshold

    // Only update state if values actually changed
    setScrollState(prevState => {
      if (
        prevState.canScrollUp === canScrollUp &&
        prevState.canScrollDown === canScrollDown &&
        prevState.isScrollable === isScrollable
      ) {
        return prevState;
      }
      
      return {
        canScrollUp,
        canScrollDown,
        isScrollable
      };
    });
  }, []); // Empty dependencies to ensure stability

  // Simplified scroll detection - avoid dependencies that cause re-runs
  useEffect(() => {
    if (!isOpen || !processedDescription) return;

    const descriptionElement = descriptionRef.current;
    if (!descriptionElement) return;

    // Initial scroll state check with delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      updateScrollState();
    }, 300);

    // Simple scroll listener without complex logic
    let scrollTimeout: NodeJS.Timeout | null = null;
    const throttledScrollHandler = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateScrollState, 200); // Increased delay
    };

    descriptionElement.addEventListener('scroll', throttledScrollHandler, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      descriptionElement.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [isOpen]); // Remove processedDescription and updateScrollState from dependencies

  // Early return AFTER all hooks are called
  if (!isOpen || !event || !event.id) return null;

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
          <ErrorBoundary fallback={<h2 className="event-modal-title">{event.title}</h2>}>
            <ResponsiveText
              text={event.title}
              variant="title"
              className="event-modal-title"
            />
          </ErrorBoundary>
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
              <div className="detail-icon"><Calendar size={20} aria-hidden /></div>
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
                <div className="detail-icon"><MapPin size={20} aria-hidden /></div>
                <div className="detail-content">
                  <strong>Lieu</strong>
                  <span>{event.location}</span>
                </div>
              </div>
            )}

            {/* Notice pièce jointe non accessible (ex. CID Outlook) */}
            {processedContent?.hadUnavailableAttachments && (
              <div className="event-modal-attachment-notice" role="status">
                <Info size={18} className="event-modal-attachment-notice-icon" aria-hidden />
                <div className="event-modal-attachment-notice-content">
                  <p className="event-modal-attachment-notice-text">
                    La pièce jointe concernant les détails n'est pas accessible ici. Consultez l'événement dans votre calendrier (Outlook, Google, etc.) pour voir les pièces jointes.
                  </p>
                  {event.eventUrl && (
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-modal-calendar-link"
                    >
                      <ExternalLink size={16} aria-hidden />
                      Voir l'événement dans le calendrier
                    </a>
                  )}
                </div>
              </div>
            )}




            {/* Description formatée avec indicateurs de scroll */}
            {processedDescription && (
              <div className="event-detail-row description-row">
                <div className="detail-icon"><FileText size={20} aria-hidden /></div>
                <div className="detail-content">
                  <strong>Description</strong>
                  <div className="description-content-wrapper">
                    <div 
                      ref={descriptionRef}
                      className="description-content" 
                      data-has-scroll={scrollState.isScrollable ? "true" : "false"}
                    >
                      <div 
                        className="event-description-modal"
                        dangerouslySetInnerHTML={{ __html: processedDescription }}
                      />
                    </div>
                    {scrollState.isScrollable && (
                      <>
                        <div 
                          className={`scroll-indicator scroll-indicator--top ${scrollState.canScrollUp ? 'scroll-indicator--visible' : ''}`}
                          aria-hidden="true"
                        >
                          <div className="scroll-fade"></div>
                        </div>
                        <div 
                          className={`scroll-indicator scroll-indicator--bottom ${scrollState.canScrollDown ? 'scroll-indicator--visible' : ''}`}
                          aria-hidden="true"
                        >
                          <div className="scroll-fade"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'export */}
            <div className="event-detail-row export-row">
              <div className="detail-icon"><Download size={20} aria-hidden /></div>
              <div className="detail-content">
                <strong>Ajouter à mon calendrier</strong>
                <div className="export-buttons">
                  {onExportToGoogle && (
                    <button
                      className="export-button google"
                      onClick={() => onExportToGoogle(event)}
                      title="Ajouter à Google Calendar"
                    >
                      <Calendar size={18} className="export-icon" aria-hidden />
                      <span className="export-label">Google</span>
                    </button>
                  )}
                  {onExportToOutlook && (
                    <button
                      className="export-button outlook"
                      onClick={() => onExportToOutlook(event)}
                      title="Ajouter à Outlook"
                    >
                      <Calendar size={18} className="export-icon" aria-hidden />
                      <span className="export-label">Outlook</span>
                    </button>
                  )}
                  {onExportToICS && (
                    <button
                      className="export-button ics"
                      onClick={() => onExportToICS(event)}
                      title="Télécharger fichier ICS"
                    >
                      <Download size={18} className="export-icon" aria-hidden />
                      <span className="export-label">Fichier ICS</span>
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