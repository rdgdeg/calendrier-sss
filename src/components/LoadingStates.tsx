import React from 'react';

// Skeleton loader amélioré
export const ImprovedSkeletonLoader: React.FC = () => {
  return (
    <div className="improved-skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-nav">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
      
      <div className="skeleton-calendar">
        <div className="skeleton-weekdays">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton-weekday"></div>
          ))}
        </div>
        <div className="skeleton-days">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="skeleton-day">
              <div className="skeleton-day-number"></div>
              <div className="skeleton-events">
                {Math.random() > 0.5 && <div className="skeleton-event"></div>}
                {Math.random() > 0.7 && <div className="skeleton-event"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Indicateur de chargement en temps réel
export const RealTimeLoadingIndicator: React.FC<{
  isLoading: boolean;
  message?: string;
}> = ({ isLoading, message = "Chargement..." }) => {
  if (!isLoading) return null;

  return (
    <div className="realtime-loading">
      <div className="loading-spinner"></div>
      <span className="loading-message">{message}</span>
    </div>
  );
};

// Toast notifications pour les actions
export const ToastNotification: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ type, message, isVisible, onClose }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
};

// Indicateur de connexion réseau
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="network-status offline">
      <span className="network-icon">📡</span>
      <span>Mode hors ligne - Les données peuvent ne pas être à jour</span>
    </div>
  );
};