import React, { useState } from 'react';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const HELP_TIPS: HelpTip[] = [
  {
    id: 'navigation',
    title: 'Navigation rapide',
    content: 'Utilisez les flèches ← → pour naviguer entre les mois, ou cliquez sur "Aujourd\'hui" pour revenir à la date actuelle.',
    position: 'bottom'
  },
  {
    id: 'search',
    title: 'Recherche intelligente',
    content: 'Tapez n\'importe quel mot-clé pour trouver des événements. La recherche fonctionne sur les titres, descriptions et lieux.',
    position: 'bottom'
  },
  {
    id: 'filters',
    title: 'Filtres avancés',
    content: 'Utilisez les filtres pour affiner votre vue : par source (de Duve ou SSS), par catégorie ou par période.',
    position: 'top'
  },
  {
    id: 'export',
    title: 'Export vers vos calendriers',
    content: 'Cliquez sur un événement puis utilisez les boutons d\'export pour l\'ajouter à Google Calendar, Outlook ou télécharger un fichier ICS.',
    position: 'left'
  },
  {
    id: 'views',
    title: 'Différentes vues',
    content: 'Basculez entre la vue Mois (aperçu général), Agenda (liste détaillée) et Affichage (mode présentation).',
    position: 'bottom'
  }
];

export const HelpSystem: React.FC = () => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasSeenHelp, setHasSeenHelp] = useState(
    localStorage.getItem('calendar-help-seen') === 'true'
  );

  const showHelp = () => {
    setIsHelpVisible(true);
    setCurrentTipIndex(0);
  };

  const hideHelp = () => {
    setIsHelpVisible(false);
    setHasSeenHelp(true);
    localStorage.setItem('calendar-help-seen', 'true');
  };

  const nextTip = () => {
    if (currentTipIndex < HELP_TIPS.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      hideHelp();
    }
  };

  const prevTip = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(currentTipIndex - 1);
    }
  };

  const currentTip = HELP_TIPS[currentTipIndex];

  return (
    <>
      {/* Bouton d'aide */}
      <button
        className={`help-button ${!hasSeenHelp ? 'pulse' : ''}`}
        onClick={showHelp}
        title="Aide et conseils d'utilisation"
      >
        <span className="help-icon">❓</span>
        {!hasSeenHelp && <span className="help-badge">Nouveau</span>}
      </button>

      {/* Tour guidé */}
      {isHelpVisible && (
        <div className="help-overlay">
          <div className="help-tooltip">
            <div className="help-header">
              <h3>{currentTip.title}</h3>
              <button className="help-close" onClick={hideHelp}>✕</button>
            </div>
            
            <div className="help-content">
              <p>{currentTip.content}</p>
            </div>
            
            <div className="help-footer">
              <div className="help-progress">
                <span>{currentTipIndex + 1} / {HELP_TIPS.length}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentTipIndex + 1) / HELP_TIPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="help-actions">
                <button 
                  className="help-btn secondary"
                  onClick={prevTip}
                  disabled={currentTipIndex === 0}
                >
                  Précédent
                </button>
                <button 
                  className="help-btn primary"
                  onClick={nextTip}
                >
                  {currentTipIndex === HELP_TIPS.length - 1 ? 'Terminer' : 'Suivant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Composant pour les tooltips contextuels
export const ContextualTooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`contextual-tooltip ${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};

// Composant FAQ intégré
export const FAQSection: React.FC<{ isVisible: boolean; onClose: () => void }> = ({
  isVisible,
  onClose
}) => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: 'sync',
      question: 'À quelle fréquence les calendriers sont-ils synchronisés ?',
      answer: 'Les calendriers sont automatiquement synchronisés toutes les 10 minutes. Vous pouvez aussi forcer une synchronisation en cliquant sur "Actualiser".'
    },
    {
      id: 'sources',
      question: 'Quelles sont les sources de calendriers disponibles ?',
      answer: 'Nous affichons le calendrier de Duve (iCloud) et le calendrier du secteur SSS (Outlook). Les événements sont identifiés par des couleurs différentes.'
    },
    {
      id: 'export',
      question: 'Comment ajouter un événement à mon calendrier personnel ?',
      answer: 'Cliquez sur l\'événement pour ouvrir ses détails, puis utilisez les boutons d\'export pour l\'ajouter à Google Calendar, Outlook ou télécharger un fichier ICS.'
    },
    {
      id: 'search',
      question: 'Comment fonctionne la recherche ?',
      answer: 'La recherche est intelligente et cherche dans les titres, descriptions et lieux des événements. Vous pouvez aussi utiliser les filtres pour affiner les résultats.'
    },
    {
      id: 'mobile',
      question: 'L\'application fonctionne-t-elle sur mobile ?',
      answer: 'Oui, l\'interface s\'adapte automatiquement aux écrans mobiles avec des zones tactiles optimisées et une navigation simplifiée.'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="faq-modal-backdrop" onClick={onClose}>
      <div className="faq-modal" onClick={e => e.stopPropagation()}>
        <div className="faq-header">
          <h3>❓ Questions fréquentes</h3>
          <button className="faq-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="faq-content">
          {faqs.map(faq => (
            <div key={faq.id} className="faq-item">
              <button
                className={`faq-question ${openFAQ === faq.id ? 'active' : ''}`}
                onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
              >
                <span>{faq.question}</span>
                <span className="faq-toggle">{openFAQ === faq.id ? '−' : '+'}</span>
              </button>
              {openFAQ === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};