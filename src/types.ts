export interface EventCategory {
  id: string;
  name: string;
  color: string;
  source: 'icloud' | 'outlook';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  source: 'icloud' | 'outlook';
  allDay?: boolean;
  category: EventCategory;
  color: string;
  /** URL de l'événement dans le calendrier source (si présente dans l'ICS) */
  eventUrl?: string;
}

export interface CalendarSource {
  name: string;
  url: string;
  source: 'icloud' | 'outlook';
  color: string;
}

export type CalendarView = 'month' | 'agenda' | 'screen';

export interface CalendarViewConfig {
  view: CalendarView;
  title: string;
  icon: string;
}

export type EventType = 'all' | 'colloque' | 'these' | 'seminaire' | 'other';

export interface EventTypeConfig {
  type: EventType;
  label: string;
  code: string;
  color: string;
  icon: string;
}