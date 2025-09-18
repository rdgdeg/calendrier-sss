-- Quick fix: Create missing tables for event_cache and calendar_syncs

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

-- Politique RLS (Row Level Security) - permettre l'accès public
ALTER TABLE event_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (avec DROP IF EXISTS pour éviter les conflits)
DROP POLICY IF EXISTS "Allow all operations on event_cache" ON event_cache;
CREATE POLICY "Allow all operations on event_cache" ON event_cache
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on calendar_syncs" ON calendar_syncs;
CREATE POLICY "Allow all operations on calendar_syncs" ON calendar_syncs
    FOR ALL USING (true) WITH CHECK (true);