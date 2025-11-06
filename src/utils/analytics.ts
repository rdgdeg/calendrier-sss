import { supabase } from '../lib/supabase';

interface VisitData {
  timestamp: string;
  user_agent?: string;
  referrer?: string;
  page_path: string;
  session_id: string;
}

interface VisitStats {
  total_visits: number;
  unique_sessions: number;
  today_visits: number;
  this_week_visits: number;
  this_month_visits: number;
}

// Générer un ID de session unique (stocké dans sessionStorage)
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('calendar_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('calendar_session_id', sessionId);
  }
  return sessionId;
};

// Enregistrer une visite
export const trackVisit = async (): Promise<void> => {
  try {
    const visitData: VisitData = {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent.substring(0, 200), // Limité pour la confidentialité
      referrer: document.referrer || 'direct',
      page_path: window.location.pathname,
      session_id: getSessionId()
    };

    const { error } = await supabase
      .from('calendar_visits')
      .insert([visitData]);

    if (error) {
      console.warn('Erreur lors de l\'enregistrement de la visite:', error);
    }
  } catch (error) {
    console.warn('Analytics non disponible:', error);
  }
};

// Récupérer les statistiques de visite
export const getVisitStats = async (): Promise<VisitStats | null> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total des visites
    const { count: totalVisits } = await supabase
      .from('calendar_visits')
      .select('*', { count: 'exact', head: true });

    // Sessions uniques
    const { data: uniqueSessions } = await supabase
      .from('calendar_visits')
      .select('session_id')
      .not('session_id', 'is', null);

    const uniqueSessionsCount = new Set(uniqueSessions?.map(v => v.session_id)).size;

    // Visites aujourd'hui
    const { count: todayVisits } = await supabase
      .from('calendar_visits')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Visites cette semaine
    const { count: weekVisits } = await supabase
      .from('calendar_visits')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', thisWeek.toISOString());

    // Visites ce mois
    const { count: monthVisits } = await supabase
      .from('calendar_visits')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', thisMonth.toISOString());

    return {
      total_visits: totalVisits || 0,
      unique_sessions: uniqueSessionsCount,
      today_visits: todayVisits || 0,
      this_week_visits: weekVisits || 0,
      this_month_visits: monthVisits || 0
    };
  } catch (error) {
    console.warn('Erreur lors de la récupération des stats:', error);
    return null;
  }
};

// Fonction pour créer la table (à exécuter une fois)
export const createVisitsTable = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('create_visits_table');
    if (error) {
      console.warn('Table visits peut-être déjà créée:', error);
    }
  } catch (error) {
    console.warn('Création de table non disponible:', error);
  }
};