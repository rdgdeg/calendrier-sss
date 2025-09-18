import React from 'react';
import { EVENT_TYPES } from '../utils/eventCategories';

const CALENDAR_SOURCES = [
  {
    name: 'de Duve',
    source: 'icloud',
    color: '#ff6b6b',
    icon: '🍎'
  },
  {
    name: 'Secteur SSS',
    source: 'outlook', 
    color: '#003d7a',
    icon: '📧'
  }
];

export const EventLegend: React.FC = () => {
  return (
    <div className="event-legend">
      <div className="legend-sections-inline">
        {/* Sources de calendrier */}
        <div className="legend-section-inline">
          <h5 className="legend-section-title-inline">📅 Sources :</h5>
          <div className="legend-items-inline">
            {CALENDAR_SOURCES.map((source) => (
              <div key={source.source} className="legend-item-inline">
                <span 
                  className="legend-color-inline"
                  style={{ backgroundColor: source.color }}
                ></span>
                <span className="legend-icon-inline">{source.icon}</span>
                <span className="legend-label-inline">{source.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories d'événements */}
        <div className="legend-section-inline">
          <h5 className="legend-section-title-inline">🏷️ Catégories :</h5>
          <div className="legend-items-inline">
            {EVENT_TYPES.filter(type => type.type !== 'all').map((eventType) => (
              <div key={eventType.type} className="legend-item-inline">
                <span className="legend-icon-inline">{eventType.icon}</span>
                <span className="legend-label-inline">{eventType.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};