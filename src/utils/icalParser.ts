import ICAL from 'ical.js';
import { CalendarEvent } from '../types';
import { determineEventCategoryWithColor } from './colorMapping';

// Fonction pour filtrer les événements non pertinents
const shouldExcludeEvent = (title: string, description: string = ''): boolean => {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const content = `${titleLower} ${descLower}`;
  
  // Filtrer les événements automatiques/système
  const excludePatterns = [
    // Événements système
    /^(busy|occupé|indisponible)$/i,
    /^(free|libre|disponible)$/i,
    /^(tentative|provisoire)$/i,
    
    // Événements répétitifs sans intérêt
    /^(pause|break|lunch|déjeuner)$/i,
    /^(meeting|réunion)\s*$/i, // Réunions sans titre spécifique
    
    // Événements de maintenance
    /maintenance/i,
    /test\s*$/i,
    
    // Événements privés génériques
    /^(privé|private|personnel|personal)$/i,
    
    // Événements de blocage de temps
    /^(blocked|bloqué|block)$/i,
    /^(no meeting|pas de réunion)$/i,
  ];
  
  return excludePatterns.some(pattern => pattern.test(content));
};

export class ICalParser {
  static async fetchAndParse(url: string, source: 'icloud' | 'outlook'): Promise<CalendarEvent[]> {
    try {
      
      // Utiliser plusieurs proxies CORS pour éviter les blocages
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://thingproxy.freeboard.io/fetch/${url}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        url // Essayer direct en dernier
      ];

      let icsData = '';
      let lastError = null;

      for (let i = 0; i < proxyUrls.length; i++) {
        const proxyUrl = proxyUrls[i];
        try {
          console.log(`🔄 Tentative ${i + 1}/${proxyUrls.length} pour ${source}:`, proxyUrl.includes('corsproxy') ? 'corsproxy.io' : proxyUrl.includes('codetabs') ? 'codetabs.com' : proxyUrl.includes('thingproxy') ? 'thingproxy' : proxyUrl.includes('allorigins') ? 'allorigins.win' : 'direct');
          
          // Timeout plus court pour les premiers essais
          const timeout = i < 2 ? 8000 : 15000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          // Pas d'en-têtes personnalisés avec les proxies : ils déclenchent un preflight
          // que certains proxies (ex. allorigins.win) rejettent (Cache-Control non autorisé).
          const isDirect = proxyUrl === url;
          const response = await fetch(proxyUrl, {
            headers: isDirect
              ? {
                  'Accept': 'text/calendar,text/plain,*/*',
                }
              : undefined,
            signal: controller.signal,
            mode: 'cors',
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            icsData = await response.text();
            console.log(`✅ Succès avec ${proxyUrl.includes('corsproxy') ? 'corsproxy.io' : proxyUrl.includes('codetabs') ? 'codetabs.com' : proxyUrl.includes('thingproxy') ? 'thingproxy' : proxyUrl.includes('allorigins') ? 'allorigins.win' : 'direct'} pour ${source}`);
            break;
          } else {
            console.warn(`⚠️ Échec HTTP ${response.status} avec proxy ${i + 1}`);
          }
        } catch (error) {
          console.warn(`⚠️ Erreur avec proxy ${i + 1}:`, error instanceof Error ? error.message : error);
          lastError = error;
          continue;
        }
      }

      if (!icsData) {
        throw lastError || new Error('Tous les proxies ont échoué');
      }



      // Parser avec ical.js
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

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
              
              // Filtrer les événements non pertinents
              if (shouldExcludeEvent(title, description)) {
                continue;
              }
              
              const category = determineEventCategoryWithColor(title, description, source);
              const eventUrl = (vevent as ICAL.Component).getFirstPropertyValue('url') ?? undefined;

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
                color: category.color,
                eventUrl: typeof eventUrl === 'string' && eventUrl.startsWith('http') ? eventUrl : undefined
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
                
                // Filtrer les événements non pertinents
                if (shouldExcludeEvent(title, description)) {
                  continue;
                }
                
                const category = determineEventCategoryWithColor(title, description, source);
                const eventUrl = (vevent as ICAL.Component).getFirstPropertyValue('url') ?? undefined;

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
                  color: category.color,
                  eventUrl: typeof eventUrl === 'string' && eventUrl.startsWith('http') ? eventUrl : undefined
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

      return events;

    } catch (error) {
      console.error(`❌ Error fetching ${source} calendar:`, error);
      return [];
    }
  }
}