-- Script de nettoyage complet pour repartir de zéro
-- ATTENTION: Ce script supprime toutes les données existantes !

-- Supprimer les politiques
DROP POLICY IF EXISTS "Allow all operations on event_cache" ON event_cache;
DROP POLICY IF EXISTS "Allow all operations on calendar_syncs" ON calendar_syncs;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_event_cache_updated_at ON event_cache;
DROP TRIGGER IF EXISTS update_calendar_syncs_updated_at ON calendar_syncs;

-- Supprimer les tables (avec CASCADE pour supprimer les dépendances)
DROP TABLE IF EXISTS event_cache CASCADE;
DROP TABLE IF EXISTS calendar_syncs CASCADE;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;