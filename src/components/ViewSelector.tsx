import React from 'react';
import { CalendarView, CalendarViewConfig } from '../types';

interface ViewSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const VIEW_CONFIGS: CalendarViewConfig[] = [
  { view: 'month', title: 'Mois', icon: '📅' },
  { view: 'agenda', title: 'Agenda', icon: '📋' }
  // Vue écran temporairement désactivée - Décommenter pour activer :
  // { view: 'screen', title: 'Écran', icon: '📺' }
];

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <div className="view-selector">
      <div className="view-buttons">
        {VIEW_CONFIGS.map(config => (
          <button
            key={config.view}
            className={`view-button ${currentView === config.view ? 'active' : ''}`}
            onClick={() => onViewChange(config.view)}
            title={config.title}
          >
            <span className="view-icon">{config.icon}</span>
            <span className="view-label">{config.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};