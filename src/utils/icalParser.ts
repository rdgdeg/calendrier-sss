import ICAL from 'ical.js';
import { CalendarEvent } from '../types';
import { determineEventCategoryWithColor } from './colorMapping';

export class ICalParser {
  static async fetchAndParse(url: string, source: 'icloud' | 'outlook'): Promise<CalendarEvent[]> {
    try {
      console.log(`🔍 Fetching ${source} calendar from:`, url);
      
      // Utiliser un proxy CORS pour éviter les blocages
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        url // Essayer direct en dernier
      ];

      let icsData = '';
      let lastError = null;

      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'CalendrierUnifie/1.0'
            }
          });
          
          if (response.ok) {
            icsData = await response.text();
            console.log(`✅ Successfully fetched ${source} via proxy`);
            break;
          }
        } catch (error) {
          lastError = error;
          console.log(`❌ Proxy failed for ${source}:`, error);
          continue;
        }
      }

      if (!icsData) {
        throw lastError || new Error('Tous les proxies ont échoué');
      }

      console.log(`📄 Raw iCal data length for ${source}:`, icsData.length);

      // Parser avec ical.js
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      console.log(`📝 Found ${vevents.length} VEVENT components for ${source}`);

      const events: CalendarEvent[] = [];
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), 0);

      for (const vevent of vevents) {
        try {
          const event = new ICAL.Event(vevent);
          
          // Gérer les événements non récurrents
          if (!event.isRecurring()) {
            const startDate = event.startDate.toJSDate();
            const endDate = event.endDate ? event.endDate.toJSDate() : startDate;
            
            if (endDate >= sixMonthsAgo && startDate <= oneYearLater) {
              const title = event.summary || 'Sans titre';
              const description = event.description || '';
              const category = determineEventCategoryWithColor(title, description, source);
              
              events.push({
                id: event.uid,
                title,
                start: startDate,
                end: endDate,
                description,
                location: event.location || '',
                source,
                allDay: event.startDate.isDate,
                category,
                color: category.color
              });
            }
          } else {
            // Gérer les événements récurrents
            const iterator = event.iterator();
            let occurrence;
            let count = 0;
            const maxOccurrences = 500; // Limite de sécurité

            while ((occurrence = iterator.next()) && count < maxOccurrences) {
              const occurrenceStart = occurrence.toJSDate();
              
              // Arrêter si on dépasse la fenêtre
              if (occurrenceStart > oneYearLater) break;
              
              if (occurrenceStart >= sixMonthsAgo) {
                const details = event.getOccurrenceDetails(occurrence);
                const occurrenceEnd = details.endDate.toJSDate();
                const title = event.summary || 'Sans titre';
                const description = event.description || '';
                const category = determineEventCategoryWithColor(title, description, source);
                
                events.push({
                  id: `${event.uid}_${occurrence.toString()}`,
                  title,
                  start: occurrenceStart,
                  end: occurrenceEnd,
                  description,
                  location: event.location || '',
                  source,
                  allDay: event.startDate.isDate,
                  category,
                  color: category.color
                });
              }
              count++;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing event in ${source}:`, error);
        }
      }

      // Trier par date de début
      events.sort((a, b) => a.start.getTime() - b.start.getTime());

      console.log(`✅ Parsed ${events.length} events from ${source}`);
      
      // Log des événements de septembre 2025 pour debug
      const sept2025Events = events.filter(e => 
        e.start.getFullYear() === 2025 && e.start.getMonth() === 8
      );
      console.log(`🗓️ September 2025 events for ${source} (${sept2025Events.length}):`, 
        sept2025Events.map(e => ({ title: e.title, date: e.start.toLocaleDateString('fr-FR') }))
      );

      return events;

    } catch (error) {
      console.error(`❌ Error fetching ${source} calendar:`, error);
      return [];
    }
  }
}