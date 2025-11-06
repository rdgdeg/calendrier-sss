import React, { useState, useEffect } from 'react';
import { getVisitStats } from '../utils/analytics';

interface VisitStats {
  total_visits: number;
  unique_sessions: number;
  today_visits: number;
  this_week_visits: number;
  this_month_visits: number;
}

interface VisitStatsProps {
  showDetailed?: boolean;
  className?: string;
}

export const VisitStats: React.FC<VisitStatsProps> = ({ 
  showDetailed = false, 
  className = '' 
}) => {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const visitStats = await getVisitStats();
        setStats(visitStats);
        setError(null);
      } catch (err) {
        setError('Impossible de charger les statistiques');
        console.warn('Erreur stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Actualiser les stats toutes les 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`visit-stats loading ${className}`}>
        <span className="stats-icon">📊</span>
        <span className="stats-text">Chargement des stats...</span>
      </div>
    );
  }

  if (error || !stats) {
    return null; // Ne pas afficher en cas d'erreur
  }

  if (showDetailed) {
    return (
      <div className={`visit-stats detailed ${className}`}>
        <div className="stats-header">
          <span className="stats-icon">📊</span>
          <h4>Statistiques de visite</h4>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{stats.total_visits.toLocaleString()}</span>
            <span className="stat-label">Visites totales</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.unique_sessions.toLocaleString()}</span>
            <span className="stat-label">Sessions uniques</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.today_visits.toLocaleString()}</span>
            <span className="stat-label">Aujourd'hui</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.this_week_visits.toLocaleString()}</span>
            <span className="stat-label">Cette semaine</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.this_month_visits.toLocaleString()}</span>
            <span className="stat-label">Ce mois</span>
          </div>
        </div>
      </div>
    );
  }

  // Version compacte pour le footer
  return (
    <div className={`visit-stats compact ${className}`}>
      <span className="stats-icon">👥</span>
      <span className="stats-text">
        {stats.total_visits.toLocaleString()} visites
        {stats.today_visits > 0 && (
          <span className="today-badge">+{stats.today_visits} aujourd'hui</span>
        )}
      </span>
    </div>
  );
};