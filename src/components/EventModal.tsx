import React, { useEffect, useRef, useState } from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSourceDisplayName } from '../utils/sourceUtils';
import { extractImagesFromDescription } from '../utils/imageExtractor';
import { EventImagesPreview } from './EventImagesPreview';
import { textFormatter } from '../utils/textFormatter';
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

  // Advanced content processing with text formatter - using useState to avoid useMemo issues
  const [processedContent, setProcessedContent] = useState<any>(null);

  // Process content when event changes - ALWAYS call this hook
  useEffect(() => {
    if (!isOpen || !event?.description) {
      setProcessedContent(null);
      return;
    }

    try {
      // Extract images first (legacy support)
      const imageContent = extractImagesFromDescription(event.description);
      
      // Simple HTML cleaning without link extraction or automatic formatting
      const cleanedHtml = textFormatter.cleanHtmlContent(event.description);
      
      // Basic paragraph formatting without link generation
      const paragraphs = cleanedHtml.split(/\n\s*\n/).filter(p => p.trim());
      let formattedHtml = cleanedHtml;
      
      if (paragraphs.length > 1) {
        formattedHtml = paragraphs
          .map(p => `<p class="text-formatter-paragraph-normal">${p.trim()}</p>`)
          .join('');
      }

      setProcessedContent({
        ...imageContent,
        cleanText: cleanedHtml,
        formattedHtml: formattedHtml,
        hasAdvancedFormatting: paragraphs.length > 1
      });
    } catch (error) {
      console.warn('Error processing event description:', error);
      
      // Fallback to basic image extraction
      const imageContent = extractImagesFromDescription(event.description);
      
      const cleanText = event.description.replace(/<[^>]*>/g, '');
      setProcessedContent({
        ...imageContent,
        cleanText: cleanText,
        images: imageContent?.images || [],
        formattedHtml: cleanText,
        hasAdvancedFormatting: false
      });
    }
  }, [isOpen, event?.id, event?.description]);

  // Scroll detection for description content - ALWAYS call this hook
  useEffect(() => {
    if (!isOpen) return;

    const descriptionElement = descriptionRef.current;
    if (!descriptionElement || !processedContent) return;

    const updateScrollState = () => {
      const { scrollTop, scrollHeight, clientHeight } = descriptionElement;
      const isScrollable = scrollHeight > clientHeight;
      const canScrollUp = scrollTop > 5;
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 5;

      setScrollState({
        canScrollUp,
        canScrollDown,
        isScrollable
      });
    };

    // Use a timeout to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      updateScrollState();
    }, 0);

    // Add scroll listener
    descriptionElement.addEventListener('scroll', updateScrollState);
    
    // Add resize observer to handle content changes
    let resizeObserver: ResizeObserver | null = null;
    try {
      resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(descriptionElement);
    } catch (error) {
      console.warn('ResizeObserver not available:', error);
    }

    return () => {
      clearTimeout(timeoutId);
      descriptionElement.removeEventListener('scroll', updateScrollState);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isOpen, processedContent?.formattedHtml]); // Only depend on the actual content that affects layout

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
                    images={processedContent.images.map((img: any) => ({
                      src: img.src,
                      alt: img.alt || '',
                      title: img.alt || '',
                      isBase64: img.src.startsWith('data:'),
                      isUrl: !img.src.startsWith('data:')
                    }))}
                    maxImages={6}
                  />
                </div>
              </div>
            )}

            {/* Description formatée avec indicateurs de scroll */}
            {processedContent && (processedContent.formattedHtml || processedContent.cleanDescription) && (
              <div className="event-detail-row description-row">
                <div className="detail-icon">📝</div>
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
                        dangerouslySetInnerHTML={{ 
                          __html: processedContent.formattedHtml || processedContent.cleanDescription || ''
                        }}
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