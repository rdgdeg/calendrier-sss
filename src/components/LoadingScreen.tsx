import React from 'react';
import { Calendar, Search, Zap } from 'lucide-react';

interface LoadingScreenProps {
  progress: number;
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="ucl-logo">
            <Calendar size={48} aria-hidden />
          </div>
          <h1 className="loading-title">Événements SSS</h1>
          <p className="loading-subtitle">Secteur des Sciences de la Santé - UCLouvain</p>
        </div>

        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill"
              style={{ width: `${Math.min(Math.max(progress, 10), 100)}%` }}
            />
          </div>
          <div className="loading-percentage">{Math.min(Math.round(progress), 100)}%</div>
        </div>

        <div className="loading-message">
          <span className="loading-text">{message}</span>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="loading-tips">
          <div className="loading-tip">
            <Search size={20} className="tip-icon" aria-hidden />
            <span>Recherche en temps réel dans les événements</span>
          </div>
          <div className="loading-tip">
            <Zap size={20} className="tip-icon" aria-hidden />
            <span>Cache intelligent pour un chargement rapide</span>
          </div>
        </div>

        <div className="loading-footer">
          <p>Rue Martin V 40, Batiment Les Arches, 1200 Woluwe-Saint-Lambert</p>
        </div>
      </div>
    </div>
  );
};