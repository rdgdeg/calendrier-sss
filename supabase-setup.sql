-- Script SQL pour créer la table des statistiques de visite dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table des visites
CREATE TABLE IF NOT EXISTS calendar_visits (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT NOT NULL DEFAULT '/',
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_calendar_visits_timestamp ON calendar_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_calendar_visits_session_id ON calendar_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_calendar_visits_date ON calendar_visits(DATE(timestamp));

-- Activer RLS (Row Level Security) pour la sécurité
ALTER TABLE calendar_visits ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion (tout le monde peut enregistrer une visite)
CREATE POLICY "Allow insert visits" ON calendar_visits
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture (tout le monde peut voir les stats)
CREATE POLICY "Allow read visits" ON calendar_visits
  FOR SELECT USING (true);

-- Fonction pour nettoyer les anciennes visites (optionnel - garder seulement 1 an)
CREATE OR REPLACE FUNCTION cleanup_old_visits()
RETURNS void AS $$
BEGIN
  DELETE FROM calendar_visits 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction pour obtenir des statistiques rapides
CREATE OR REPLACE FUNCTION get_visit_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_visits', (SELECT COUNT(*) FROM calendar_visits),
    'unique_sessions', (SELECT COUNT(DISTINCT session_id) FROM calendar_visits),
    'today_visits', (SELECT COUNT(*) FROM calendar_visits WHERE DATE(timestamp) = CURRENT_DATE),
    'week_visits', (SELECT COUNT(*) FROM calendar_visits WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'),
    'month_visits', (SELECT COUNT(*) FROM calendar_visits WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE))
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE calendar_visits IS 'Table pour stocker les statistiques de visite du calendrier SSS';
COMMENT ON COLUMN calendar_visits.session_id IS 'Identifiant unique de session pour éviter les doublons';
COMMENT ON COLUMN calendar_visits.user_agent IS 'Information sur le navigateur (limitée pour la confidentialité)';
COMMENT ON COLUMN calendar_visits.referrer IS 'Site de provenance de la visite';
COMMENT ON COLUMN calendar_visits.page_path IS 'Chemin de la page visitée';