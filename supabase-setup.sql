-- Script d'initialisation des tables Supabase pour le Calendrier Unifié UCLouvain

-- Table pour suivre les synchronisations de calendriers
CREATE TABLE IF NOT EXISTS calendar_syncs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    source_url TEXT NOT NULL,
    last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    events_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour mettre en cache les événements
CREATE TABLE IF NOT EXISTS event_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    location TEXT,
    source TEXT NOT NULL CHECK (source IN ('icloud', 'outlook')),
    color TEXT NOT NULL,
    category TEXT NOT NULL,
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

-- Triggers pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_calendar_syncs_updated_at ON calendar_syncs;
CREATE TRIGGER update_calendar_syncs_updated_at
    BEFORE UPDATE ON calendar_syncs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_cache_updated_at ON event_cache;
CREATE TRIGGER update_event_cache_updated_at
    BEFORE UPDATE ON event_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique de sécurité (RLS) - Lecture publique, écriture restreinte
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_cache ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique
CREATE POLICY "Allow public read access on calendar_syncs" ON calendar_syncs
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on event_cache" ON event_cache
    FOR SELECT USING (true);

-- Permettre l'écriture pour les utilisateurs authentifiés (ou service role)
CREATE POLICY "Allow authenticated insert on calendar_syncs" ON calendar_syncs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on calendar_syncs" ON calendar_syncs
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert on event_cache" ON event_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on event_cache" ON event_cache
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on event_cache" ON event_cache
    FOR DELETE USING (true);

-- Fonction pour nettoyer les anciens événements (appelée par un cron job)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
    DELETE FROM event_cache 
    WHERE start_date < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE calendar_syncs IS 'Table pour suivre les synchronisations des calendriers externes';
COMMENT ON TABLE event_cache IS 'Cache des événements pour améliorer les performances';
COMMENT ON FUNCTION cleanup_old_events() IS 'Fonction pour nettoyer les événements anciens (> 7 jours)';

-- Insérer des données de test (optionnel)
INSERT INTO calendar_syncs (source_name, source_url, events_count, status) 
VALUES 
    ('Calendrier iCloud', 'https://p25-caldav.icloud.com/published/2/...', 0, 'success'),
    ('Calendrier Outlook UCLouvain', 'https://outlook.office365.com/owa/calendar/...', 0, 'success')
ON CONFLICT (source_name) DO NOTHING;