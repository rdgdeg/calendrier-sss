import React, { useEffect } from 'react';
import { CalendarView } from '../types';

interface KeyboardNavigationProps {
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onRefresh: () => void;
  currentView: CalendarView;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  onNavigateDate,
  onGoToToday,
  onViewChange,
  onRefresh,
  currentView
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si l'utilisateur tape dans un input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Raccourcis avec Ctrl/Cmd pour éviter les conflits
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'arrowleft':
            event.preventDefault();
            onNavigateDate('prev');
            break;
          case 'arrowright':
            event.preventDefault();
            onNavigateDate('next');
            break;
          case 't':
            event.preventDefault();
            onGoToToday();
            break;
          case 'r':
            event.preventDefault();
            onRefresh();
            break;
          case '1':
            event.preventDefault();
            onViewChange('month');
            break;
          case '2':
            event.preventDefault();
            onViewChange('agenda');
            break;
          case '3':
            event.preventDefault();
            onViewChange('display');
            break;
        }
      }

      // Raccourcis simples pour la navigation
      switch (event.key) {
        case 'Escape':
          // Fermer les modales ou désactiver la recherche
          const modal = document.querySelector('.event-modal-backdrop');
          if (modal) {
            const closeButton = modal.querySelector('.event-modal-close') as HTMLButtonElement;
            closeButton?.click();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateDate, onGoToToday, onViewChange, onRefresh]);

  return (
    <div className="keyboard-shortcuts-info" style={{ display: 'none' }}>
      {/* Composant invisible pour la logique des raccourcis */}
    </div>
  );
};

// Composant d'aide pour afficher les raccourcis
export const KeyboardShortcutsHelp: React.FC<{ isVisible: boolean; onClose: () => void }> = ({
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="shortcuts-modal-backdrop" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h3>⌨️ Raccourcis clavier</h3>
          <button onClick={onClose} className="shortcuts-close">✕</button>
        </div>
        <div className="shortcuts-content">
          <div className="shortcuts-section">
            <h4>Navigation</h4>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>←</kbd> <span>Période précédente</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>→</kbd> <span>Période suivante</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>T</kbd> <span>Aller à aujourd'hui</span>
            </div>
          </div>
          <div className="shortcuts-section">
            <h4>Vues</h4>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>1</kbd> <span>Vue Mois</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>2</kbd> <span>Vue Agenda</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>3</kbd> <span>Vue Affichage</span>
            </div>
          </div>
          <div className="shortcuts-section">
            <h4>Actions</h4>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>R</kbd> <span>Actualiser</span>
            </div>
            <div className="shortcut-item">
              <kbd>Échap</kbd> <span>Fermer modal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};