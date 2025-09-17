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
}

export interface CalendarSource {
  name: string;
  url: string;
  source: 'icloud' | 'outlook';
  color: string;
}

export type CalendarView = 'month' | 'week' | 'agenda' | 'compact';

export interface CalendarViewConfig {
  view: CalendarView;
  title: string;
  icon: string;
}