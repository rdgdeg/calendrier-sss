import React from 'react';

interface EventDescriptionProps {
  description: string;
  className?: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({ 
  description, 
  className = '' 
}) => {
  const formatDescription = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    // Diviser le texte en paragraphes
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lines = paragraph.split('\n');
      const formattedLines: JSX.Element[] = [];
      
      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        // Traiter chaque ligne pour détecter les liens, emails, etc.
        const processedLine = processLineContent(trimmedLine, `${paragraphIndex}-${lineIndex}`);
        formattedLines.push(
          <span key={`line-${paragraphIndex}-${lineIndex}`}>
            {processedLine}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        );
      });
      
      if (formattedLines.length > 0) {
        elements.push(
          <div key={`paragraph-${paragraphIndex}`} className="description-paragraph">
            {formattedLines}
          </div>
        );
      }
    });
    
    return elements;
  };

  const processLineContent = (line: string, key: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let currentIndex = 0;
    
    // Regex pour détecter différents types de contenu
    const patterns = [
      {
        // URLs (http, https, www)
        regex: /(https?:\/\/[^\s]+|www\.[^\s]+)/gi,
        type: 'url'
      },
      {
        // Emails
        regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
        type: 'email'
      },
      {
        // Numéros de téléphone (formats français et internationaux)
        regex: /(\+?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4})/gi,
        type: 'phone'
      },
      {
        // Dates (format français et international)
        regex: /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/gi,
        type: 'date'
      }
    ];
    
    // Trouver tous les matches
    const allMatches: Array<{
      match: string;
      index: number;
      type: string;
      endIndex: number;
    }> = [];
    
    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex);
      while ((match = regex.exec(line)) !== null) {
        allMatches.push({
          match: match[0],
          index: match.index,
          type: pattern.type,
          endIndex: match.index + match[0].length
        });
      }
    });
    
    // Trier par index pour traiter dans l'ordre
    allMatches.sort((a, b) => a.index - b.index);
    
    // Traiter le texte avec les matches
    allMatches.forEach((matchObj, matchIndex) => {
      // Ajouter le texte avant le match
      if (matchObj.index > currentIndex) {
        const textBefore = line.substring(currentIndex, matchObj.index);
        elements.push(
          <span key={`${key}-text-${matchIndex}`}>{textBefore}</span>
        );
      }
      
      // Ajouter l'élément formaté selon le type
      elements.push(createFormattedElement(matchObj, `${key}-${matchIndex}`));
      
      currentIndex = matchObj.endIndex;
    });
    
    // Ajouter le texte restant
    if (currentIndex < line.length) {
      const remainingText = line.substring(currentIndex);
      elements.push(
        <span key={`${key}-remaining`}>{remainingText}</span>
      );
    }
    
    // Si aucun match trouvé, retourner le texte original
    if (elements.length === 0) {
      elements.push(<span key={key}>{line}</span>);
    }
    
    return elements;
  };

  const createFormattedElement = (
    matchObj: { match: string; type: string }, 
    key: string
  ): JSX.Element => {
    const { match, type } = matchObj;
    
    switch (type) {
      case 'url':
        const url = match.startsWith('http') ? match : `https://${match}`;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="description-link url-link"
            title={`Ouvrir ${match} dans un nouvel onglet`}
          >
            {match}
          </a>
        );
        
      case 'email':
        return (
          <a
            key={key}
            href={`mailto:${match}`}
            className="description-link email-link"
            title={`Envoyer un email à ${match}`}
          >
            {match}
          </a>
        );
        
      case 'phone':
        // Nettoyer le numéro pour le lien tel:
        const cleanPhone = match.replace(/[-.\s]/g, '');
        return (
          <a
            key={key}
            href={`tel:${cleanPhone}`}
            className="description-link phone-link"
            title={`Appeler ${match}`}
          >
            {match}
          </a>
        );
        
      case 'date':
        return (
          <span
            key={key}
            className="description-date"
            title="Date"
          >
            {match}
          </span>
        );
        
      default:
        return <span key={key}>{match}</span>;
    }
  };

  if (!description || !description.trim()) {
    return null;
  }

  return (
    <div className={`event-description-formatted ${className}`}>
      {formatDescription(description)}
    </div>
  );
};