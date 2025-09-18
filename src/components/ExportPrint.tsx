import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportPrintProps {
  events: CalendarEvent[];
  currentDate: Date;
  currentView: 'month' | 'agenda' | 'display';
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
      if (currentView === 'month') {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else {
        // Pour la vue agenda, prendre le mois courant par défaut
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }
    } else {
      startDate = new Date(exportOptions.startDate);
      endDate = new Date(exportOptions.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin de journée
    }

    return events.filter(event => 
      event.start >= startDate && event.start <= endDate
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  // Fonction d'impression
  const handlePrint = () => {
    const eventsToExport = getEventsForExport();
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour imprimer');
      return;
    }

    const printContent = generatePrintHTML(eventsToExport);
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
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

    let content = '';

    if (exportOptions.groupByDay) {
      // Grouper par jour
      const days = eachDayOfInterval({
        start: new Date(exportOptions.startDate),
        end: new Date(exportOptions.endDate)
      });

      content = days.map(day => {
        const dayEvents = eventsToExport.filter(event => isSameDay(event.start, day));
        
        if (dayEvents.length === 0) return '';

        return `
          <div class="print-day-section">
            <h3 class="print-day-title">${format(day, 'EEEE d MMMM yyyy', { locale: fr })}</h3>
            <div class="print-events">
              ${dayEvents.map(event => `
                <div class="print-event">
                  <div class="print-event-header">
                    <span class="print-event-time">${event.allDay ? 'Toute la journée' : format(event.start, 'HH:mm')}</span>
                    <span class="print-event-title">${event.title}</span>
                    <span class="print-event-source">[${event.source === 'icloud' ? 'de Duve' : 'SSS'}]</span>
                  </div>
                  ${exportOptions.includeLocation && event.location ? `
                    <div class="print-event-location">📍 ${event.location}</div>
                  ` : ''}
                  ${exportOptions.includeDescription && event.description ? `
                    <div class="print-event-description">${event.description.replace(/<[^>]*>/g, '').substring(0, 200)}${event.description.length > 200 ? '...' : ''}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    } else {
      // Liste simple
      content = `
        <div class="print-events-list">
          ${eventsToExport.map(event => `
            <div class="print-event">
              <div class="print-event-header">
                <span class="print-event-date">${format(event.start, 'dd/MM/yyyy')}</span>
                <span class="print-event-time">${event.allDay ? 'Toute la journée' : format(event.start, 'HH:mm')}</span>
                <span class="print-event-title">${event.title}</span>
                <span class="print-event-source">[${event.source === 'icloud' ? 'de Duve' : 'SSS'}]</span>
              </div>
              ${exportOptions.includeLocation && event.location ? `
                <div class="print-event-location">📍 ${event.location}</div>
              ` : ''}
              ${exportOptions.includeDescription && event.description ? `
                <div class="print-event-description">${event.description.replace(/<[^>]*>/g, '').substring(0, 200)}${event.description.length > 200 ? '...' : ''}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
            }
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #003d7a; padding-bottom: 15px; }
            .print-title { color: #003d7a; font-size: 24px; font-weight: bold; margin: 0; }
            .print-subtitle { color: #666; font-size: 14px; margin: 5px 0 0 0; }
            .print-day-section { margin-bottom: 25px; page-break-inside: avoid; }
            .print-day-title { color: #003d7a; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .print-event { margin-bottom: 15px; padding: 10px; border-left: 3px solid #003d7a; background: #f8f9fa; }
            .print-event-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
            .print-event-time { font-weight: bold; color: #003d7a; min-width: 80px; }
            .print-event-date { font-weight: bold; color: #003d7a; min-width: 80px; }
            .print-event-title { font-weight: bold; flex: 1; }
            .print-event-source { font-size: 12px; color: #666; font-style: italic; }
            .print-event-location { color: #666; font-size: 12px; margin-bottom: 5px; }
            .print-event-description { color: #333; font-size: 12px; }
            .print-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">${title}</h1>
            <p class="print-subtitle">Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
            <p class="print-subtitle">${eventsToExport.length} événement(s)</p>
          </div>
          ${content}
          <div class="print-footer">
            <p><strong>Secteur des Sciences de la Santé - UCLouvain</strong></p>
            <p>Rue Martin V 40, Bâtiments Les Arches, 1200 Woluwe-Saint-Lambert</p>
            <p>${eventsToExport.length} événement(s) | Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
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