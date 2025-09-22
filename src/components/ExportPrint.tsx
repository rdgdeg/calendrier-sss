import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportPrintProps {
  events: CalendarEvent[];
  currentDate: Date;
  currentView: 'month' | 'agenda';
}

export const ExportPrint: React.FC<ExportPrintProps> = ({
  events,
  currentDate,
  currentView
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'print' as 'print' | 'pdf' | 'csv',
    dateRange: 'current' as 'current' | 'custom',
    startDate: format(currentDate, 'yyyy-MM-dd'),
    endDate: format(currentDate, 'yyyy-MM-dd'),
    includeDescription: true,
    includeLocation: true,
    groupByDay: true
  });

  // Fonction pour obtenir les événements selon la période sélectionnée
  const getEventsForExport = () => {
    let startDate: Date;
    let endDate: Date;

    if (exportOptions.dateRange === 'current') {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else {
      startDate = new Date(exportOptions.startDate);
      endDate = new Date(exportOptions.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin de journée
    }

    const filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const isInRange = eventStart >= startDate && eventStart <= endDate;
      return isInRange;
    }).sort((a, b) => a.start.getTime() - b.start.getTime());

    // Debug détaillé
    console.log('=== EXPORT DEBUG ===');
    console.log('Total events available:', events.length);
    console.log('Current date:', currentDate);
    console.log('Export options:', exportOptions);
    console.log('Date range:', {
      start: startDate.toLocaleDateString('fr-FR'),
      end: endDate.toLocaleDateString('fr-FR')
    });
    console.log('Filtered events:', filteredEvents.length);

    if (filteredEvents.length > 0) {
      console.log('First few events:');
      filteredEvents.slice(0, 3).forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} - ${event.start.toLocaleDateString('fr-FR')}`);
      });
    } else {
      console.log('No events found in date range');
      console.log('Available events dates:');
      events.slice(0, 5).forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} - ${event.start.toLocaleDateString('fr-FR')}`);
      });
    }
    console.log('===================');

    return filteredEvents;
  };

  // Fonction d'impression
  const handlePrint = () => {
    console.log('Starting print process...');
    const eventsToExport = getEventsForExport();

    if (eventsToExport.length === 0) {
      alert(`Aucun événement trouvé pour la période sélectionnée.\n\nVérifiez :\n- La période choisie\n- Que des événements existent dans cette période\n\nTotal d'événements disponibles : ${events.length}`);
      return;
    }

    console.log(`Generating print content for ${eventsToExport.length} events...`);

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour imprimer');
      return;
    }

    const printContent = generatePrintHTML(eventsToExport);
    console.log('Print content generated, writing to window...');

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Attendre que le contenu soit chargé
    printWindow.onload = () => {
      console.log('Print window loaded successfully');
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 1000);
    };

    // Fallback si onload ne fonctionne pas
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.focus();
      }
    }, 1500);
  };

  // Fonction d'export CSV
  const handleCSVExport = () => {
    const eventsToExport = getEventsForExport();
    const csvContent = generateCSV(eventsToExport);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `calendrier-sss-${format(currentDate, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Génération du HTML pour l'impression
  const generatePrintHTML = (eventsToExport: CalendarEvent[]) => {
    const title = exportOptions.dateRange === 'current'
      ? `Calendrier SSS - ${format(currentDate, 'MMMM yyyy', { locale: fr })}`
      : `Calendrier SSS - ${format(new Date(exportOptions.startDate), 'dd/MM/yyyy')} au ${format(new Date(exportOptions.endDate), 'dd/MM/yyyy')}`;

    // Trier les événements par date croissante
    const sortedEvents = [...eventsToExport].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Générer le contenu des événements
    const eventsHTML = sortedEvents.map(event => {
      const eventDate = format(event.start, 'EEEE d MMMM yyyy', { locale: fr });
      const eventTime = event.allDay ? 'Toute la journée' : format(event.start, 'HH:mm');
      const eventEndTime = event.allDay ? '' : ` - ${format(event.end, 'HH:mm')}`;
      const source = event.source === 'icloud' ? 'de Duve' : 'SSS';

      return `
        <div class="print-event">
          <div class="print-event-header">
            <div class="print-event-date">${eventDate}</div>
            <div class="print-event-time">${eventTime}${eventEndTime}</div>
          </div>
          <div class="print-event-content">
            <h4 class="print-event-title">${event.title}</h4>
            <div class="print-event-source">Source: ${source}</div>
            ${exportOptions.includeLocation && event.location ? `
              <div class="print-event-location"><strong>📍 Lieu:</strong> ${event.location}</div>
            ` : ''}
            ${exportOptions.includeDescription && event.description ? `
              <div class="print-event-description">
                <strong>📝 Description:</strong> 
                ${event.description.replace(/<[^>]*>/g, '').substring(0, 300)}${event.description.length > 300 ? '...' : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; }
              .print-event { page-break-inside: avoid; }
            }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 13px; 
              line-height: 1.4; 
              margin: 20px; 
              color: #000;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #003d7a; 
              padding-bottom: 15px; 
            }
            .print-title { 
              color: #003d7a; 
              font-size: 26px; 
              font-weight: bold; 
              margin: 0 0 10px 0; 
            }
            .print-subtitle { 
              color: #666; 
              font-size: 14px; 
              margin: 5px 0; 
            }
            .print-event { 
              margin-bottom: 20px; 
              padding: 15px; 
              border: 1px solid #ddd;
              border-left: 4px solid #003d7a; 
              background: #f9f9f9;
              page-break-inside: avoid;
            }
            .print-event-header {
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            .print-event-date { 
              font-weight: bold; 
              color: #003d7a; 
              font-size: 15px;
              text-transform: capitalize;
            }
            .print-event-time { 
              color: #666; 
              font-size: 13px; 
              margin-top: 3px;
            }
            .print-event-title { 
              font-size: 16px;
              font-weight: bold; 
              color: #000;
              margin: 8px 0;
            }
            .print-event-source { 
              font-size: 12px; 
              color: #666; 
              font-style: italic; 
              margin-bottom: 8px;
            }
            .print-event-location { 
              color: #333; 
              font-size: 12px; 
              margin: 5px 0; 
            }
            .print-event-description { 
              color: #333; 
              font-size: 12px; 
              margin: 8px 0;
              line-height: 1.4;
            }
            .print-footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 11px; 
              color: #666; 
              border-top: 2px solid #003d7a; 
              padding-top: 15px; 
            }
            .print-footer p {
              margin: 3px 0;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">${title}</h1>
            <p class="print-subtitle">Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
            <p class="print-subtitle">${sortedEvents.length} événement(s) trouvé(s)</p>
          </div>
          
          <div class="print-events-container">
            ${eventsHTML}
          </div>
          
          <div class="print-footer">
            <p><strong>Secteur des Sciences de la Santé - UCLouvain</strong></p>
            <p>Rue Martin V 40, Batiment Les Arches, 1200 Woluwe-Saint-Lambert</p>
            <p>${sortedEvents.length} événement(s) | Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
          </div>
        </body>
      </html>
    `;
  };

  // Génération du CSV
  const generateCSV = (eventsToExport: CalendarEvent[]) => {
    const headers = [
      'Date',
      'Heure début',
      'Heure fin',
      'Titre',
      'Source',
      ...(exportOptions.includeLocation ? ['Lieu'] : []),
      ...(exportOptions.includeDescription ? ['Description'] : [])
    ];

    const rows = eventsToExport.map(event => {
      const row = [
        format(event.start, 'dd/MM/yyyy'),
        event.allDay ? 'Toute la journée' : format(event.start, 'HH:mm'),
        event.allDay ? 'Toute la journée' : format(event.end, 'HH:mm'),
        `"${event.title.replace(/"/g, '""')}"`,
        event.source === 'icloud' ? 'de Duve' : 'SSS'
      ];

      if (exportOptions.includeLocation) {
        row.push(`"${(event.location || '').replace(/"/g, '""')}"`);
      }

      if (exportOptions.includeDescription) {
        const cleanDescription = (event.description || '').replace(/<[^>]*>/g, '').replace(/"/g, '""');
        row.push(`"${cleanDescription}"`);
      }

      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const executeExport = () => {
    switch (exportOptions.format) {
      case 'print':
        handlePrint();
        break;
      case 'csv':
        handleCSVExport();
        break;
    }
    setIsExportModalOpen(false);
  };

  return (
    <>
      <button
        className="nav-button export-button compact"
        onClick={() => setIsExportModalOpen(true)}
        title="Exporter ou imprimer le calendrier"
      >
        📄 Exporter
      </button>

      {isExportModalOpen && (
        <div className="export-modal-backdrop" onClick={() => setIsExportModalOpen(false)}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>📄 Exporter le calendrier</h3>
              <button className="export-modal-close" onClick={() => setIsExportModalOpen(false)}>✕</button>
            </div>

            <div className="export-modal-content">
              <div className="export-option-group">
                <label>Format d'export</label>
                <div className="export-format-options">
                  <label className="export-radio-option">
                    <input
                      type="radio"
                      name="format"
                      value="print"
                      checked={exportOptions.format === 'print'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    />
                    <div className="export-option-content">
                      <span className="export-option-title">🖨️ Imprimer / PDF</span>
                      <div className="export-option-description">Génère une version imprimable avec mise en page professionnelle</div>
                    </div>
                  </label>
                  <label className="export-radio-option">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportOptions.format === 'csv'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    />
                    <div className="export-option-content">
                      <span className="export-option-title">📊 Fichier CSV</span>
                      <div className="export-option-description">Exporte les données pour Excel ou Google Sheets</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="export-option-group">
                <label>Période</label>
                <div className="export-format-options">
                  <label className="export-radio-option">
                    <input
                      type="radio"
                      name="dateRange"
                      value="current"
                      checked={exportOptions.dateRange === 'current'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    />
                    <span>
                      {currentView === 'month'
                        ? `📅 Mois courant (${format(currentDate, 'MMMM yyyy', { locale: fr })})`
                        : `📅 Mois courant (${format(currentDate, 'MMMM yyyy', { locale: fr })})`
                      }
                    </span>
                  </label>
                  <label className="export-radio-option">
                    <input
                      type="radio"
                      name="dateRange"
                      value="custom"
                      checked={exportOptions.dateRange === 'custom'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    />
                    <span>📆 Période personnalisée</span>
                  </label>
                </div>
              </div>

              {exportOptions.dateRange === 'custom' && (
                <div className="export-date-range">
                  <div className="export-date-field">
                    <label>Du</label>
                    <input
                      type="date"
                      value={exportOptions.startDate}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="export-date-field">
                    <label>Au</label>
                    <input
                      type="date"
                      value={exportOptions.endDate}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="export-option-group">
                <label>Options d'inclusion</label>
                <div className="export-checkboxes">
                  <label className="export-checkbox-option">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeLocation}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeLocation: e.target.checked }))}
                    />
                    <span>📍 Inclure les lieux</span>
                  </label>
                  <label className="export-checkbox-option">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDescription}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeDescription: e.target.checked }))}
                    />
                    <span>📝 Inclure les descriptions</span>
                  </label>
                  {exportOptions.format === 'print' && (
                    <label className="export-checkbox-option">
                      <input
                        type="checkbox"
                        checked={exportOptions.groupByDay}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, groupByDay: e.target.checked }))}
                      />
                      <span>📅 Grouper par jour</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="export-preview">
                <p><strong>Aperçu :</strong> {getEventsForExport().length} événement(s) seront exportés</p>
                {getEventsForExport().length > 0 && (
                  <div className="export-preview-events">
                    <p><strong>Premiers événements :</strong></p>
                    <ul>
                      {getEventsForExport().slice(0, 3).map((event, index) => (
                        <li key={index}>
                          {format(event.start, 'dd/MM/yyyy')} - {event.title}
                        </li>
                      ))}
                      {getEventsForExport().length > 3 && (
                        <li>... et {getEventsForExport().length - 3} autres</li>
                      )}
                    </ul>
                  </div>
                )}
                {getEventsForExport().length === 0 && (
                  <div className="export-preview-empty">
                    <p style={{ color: '#ef4444' }}>⚠️ Aucun événement trouvé pour cette période</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Total disponible : {events.length} événements
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="export-modal-footer">
              <button className="export-btn-cancel" onClick={() => setIsExportModalOpen(false)}>
                Annuler
              </button>
              <button className="export-btn-confirm" onClick={executeExport}>
                {exportOptions.format === 'print' ? '🖨️ Imprimer' : '📊 Télécharger CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};