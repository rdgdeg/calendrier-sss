import React from 'react';

interface LoadingScreenProps {
  progress: number;
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Logo/Icône UCLouvain */}
        <div className="loading-logo">
          <div className="ucl-logo">
            📅
          </div>
          <h1 className="loading-title">Événements SSS</h1>
          <p className="loading-subtitle">Secteur des Sciences de la Santé - UCLouvain</p>
        </div>

        {/* Barre de progression animée */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill"
              style={{ width: `${Math.max(progress, 10)}%` }}
            />
          </div>
          <div className="loading-percentage">{Math.round(progress)}%</div>
        </div>

        {/* Message de chargement */}
        <div className="loading-message">
          <span className="loading-text">{message}</span>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Conseils utiles pendant le chargement */}
        <div className="loading-tips">
          <div className="loading-tip">
            <span className="tip-icon">💡</span>
            <span>Synchronisation des calendriers de Duve et SSS en cours...</span>
          </div>
          <div className="loading-tip">
            <span className="tip-icon">🔍</span>
            <span>Utilisez la recherche pour trouver rapidement vos événements</span>
          </div>
          <div className="loading-tip">
            <span className="tip-icon">📱</span>
            <span>L'interface s'adapte automatiquement à votre écran</span>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="loading-footer">
          <p>Rue Martin V 40, Bâtiment Les Arches, 1200 Woluwe-Saint-Lambert</p>
        </div>
      </div>
    </div>
  );
};