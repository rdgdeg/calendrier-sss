import React, { memo } from 'react';

interface HeaderProps {
  title?: string;
}

const HeaderComponent: React.FC<HeaderProps> = ({ 
  title = "Événements à Venir - Secteur SSS" 
}) => {
  return (
    <header 
      className="display-header"
      role="banner"
      aria-label="En-tête UCLouvain"
    >
      <div className="display-header-content">
        <h1 className="display-title">🎓 {title}</h1>
      </div>
      <div className="display-header-gradient" aria-hidden="true"></div>
    </header>
  );
};

// Memoize the component since title rarely changes
export const Header = memo(HeaderComponent);