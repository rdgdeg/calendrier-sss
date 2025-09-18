import { EventType, EventTypeConfig } from '../types';

export const EVENT_TYPES: EventTypeConfig[] = [
  {
    type: 'all',
    label: 'Tous les événements',
    code: '',
    color: '#6c757d',
    icon: '📅'
  },
  {
    type: 'colloque',
    label: 'Colloques',
    code: 'COL',
    color: '#003d7a',
    icon: '🎓'
  },
  {
    type: 'these',
    label: 'Thèses',
    code: 'THE',
    color: '#0066cc',
    icon: '📚'
  },
  {
    type: 'seminaire',
    label: 'Séminaires',
    code: 'SEM',
    color: '#4a90e2',
    icon: '💬'
  },
  {
    type: 'other',
    label: 'Autres événements',
    code: '',
    color: '#27ae60',
    icon: '📌'
  }
];

export const detectEventType = (title: string, description?: string): EventType => {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // Détecter par codes entre crochets (priorité haute)
  if (/\[col\]/i.test(title)) {
    return 'colloque';
  }
  
  if (/\[the\]/i.test(title)) {
    return 'these';
  }
  
  if (/\[sem\]/i.test(title)) {
    return 'seminaire';
  }
  
  // Détecter par mots-clés dans le titre et la description
  if (/colloque|symposium|congrès|conférence/i.test(text)) {
    return 'colloque';
  }
  
  if (/thèse|thesis|défense|defense|phd|doctorat|doctoral/i.test(text)) {
    return 'these';
  }
  
  if (/séminaire|seminar|formation|workshop|atelier/i.test(text)) {
    return 'seminaire';
  }
  
  return 'other';
};

export const getEventTypeConfig = (type: EventType): EventTypeConfig => {
  return EVENT_TYPES.find(config => config.type === type) || EVENT_TYPES[EVENT_TYPES.length - 1];
};

export const getEventTypeColor = (title: string, description?: string): string => {
  const type = detectEventType(title, description);
  return getEventTypeConfig(type).color;
};