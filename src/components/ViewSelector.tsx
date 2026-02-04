import React from 'react';
import { Calendar, List } from 'lucide-react';
import { CalendarView, CalendarViewConfig } from '../types';

interface ViewSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const VIEW_CONFIGS: CalendarViewConfig[] = [
  { view: 'month', title: 'Mois', icon: 'month' },
  { view: 'agenda', title: 'Agenda', icon: 'agenda' }
];

const ViewIcon: React.FC<{ view: CalendarView }> = ({ view }) => {
  if (view === 'month') return <Calendar size={18} aria-hidden />;
  if (view === 'agenda') return <List size={18} aria-hidden />;
  return <Calendar size={18} aria-hidden />;
};

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
            <span className="view-icon"><ViewIcon view={config.view} /></span>
            <span className="view-label">{config.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};