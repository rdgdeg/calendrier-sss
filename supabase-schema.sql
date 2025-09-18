-- Script SQL pour créer les tables nécessaires dans Supabase
-- Exécutez ces commandes dans l'éditeur SQL de votre projet Supabase

-- Table pour le cache des événements
CREATE TABLE IF NOT EXISTS event_cache (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT NOT NULL,
    title TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    location TEXT,
    source TEXT NOT NULL,
    color TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour le statut de synchronisation des calendriers
CREATE TABLE IF NOT EXISTS calendar_syncs (
    id BIGSERIAL PRIMARY KEY,
    source_name TEXT UNIQUE NOT NULL,
    source_url TEXT NOT NULL,
    last_sync TIMESTAMPTZ NOT NULL,
    events_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_cache_start_date ON event_cache(start_date);
CREATE INDEX IF NOT EXISTS idx_event_cache_source ON event_cache(source);
CREATE INDEX IF NOT EXISTS idx_calendar_syncs_source_name ON calendar_syncs(source_name);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_event_cache_updated_at ON event_cache;
CREATE TRIGGER update_event_cache_updated_at
    BEFORE UPDATE ON event_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_syncs_updated_at ON calendar_syncs;
CREATE TRIGGER update_calendar_syncs_updated_at
    BEFORE UPDATE ON calendar_syncs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security) - permettre l'accès public en lecture/écriture
-- ATTENTION: En production, vous devriez restreindre ces politiques selon vos besoins de sécurité

ALTER TABLE event_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (à adapter selon vos besoins)
DROP POLICY IF EXISTS "Allow all operations on event_cache" ON event_cache;
CREATE POLICY "Allow all operations on event_cache" ON event_cache
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on calendar_syncs" ON calendar_syncs;
CREATE POLICY "Allow all operations on calendar_syncs" ON calendar_syncs
    FOR ALL USING (true) WITH CHECK (true);

-- Commentaires pour la documentation
COMMENT ON TABLE event_cache IS 'Cache des événements de calendrier pour améliorer les performances';
COMMENT ON TABLE calendar_syncs IS 'Statut de synchronisation des différentes sources de calendrier';