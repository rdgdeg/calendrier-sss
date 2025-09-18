-- Script pour corriger les politiques RLS en cas de conflit
-- Exécutez ce script si vous rencontrez des erreurs de politiques existantes

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow all operations on event_cache" ON event_cache;
DROP POLICY IF EXISTS "Allow all operations on calendar_syncs" ON calendar_syncs;

-- Recréer les politiques
CREATE POLICY "Allow all operations on event_cache" ON event_cache
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on calendar_syncs" ON calendar_syncs
    FOR ALL USING (true) WITH CHECK (true);

-- Vérifier que RLS est activé
ALTER TABLE event_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;