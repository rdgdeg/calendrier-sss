import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rslrjzlceadedjnzscre.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHJqemxjZWFkZWRqbnpzY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjY5MTYsImV4cCI6MjA3MzcwMjkxNn0.XuFhPUvjZjEH2gKzSBGAs-CW0C1ckp5VsPNyMAz-SVc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour Supabase
export interface CalendarSync {
  id?: string
  source_name: string
  source_url: string
  last_sync: string
  events_count: number
  status: 'success' | 'error'
  error_message?: string
}

export interface EventCache {
  id?: string
  event_id: string
  title: string
  start_date: string
  end_date: string
  description?: string
  location?: string
  source: string
  color: string
  category: string
  created_at?: string
  updated_at?: string
}

// Fonctions utilitaires pour Supabase
export const syncCalendarStatus = async (syncData: Omit<CalendarSync, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('calendar_syncs')
      .upsert(syncData, { 
        onConflict: 'source_name',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      // Si la table n'existe pas, on ignore silencieusement l'erreur
      if (error.code === 'PGRST205') {
        console.warn('Table calendar_syncs non trouvée, synchronisation ignorée')
        return null
      }
      console.error('Erreur lors de la synchronisation du statut:', error)
      return null
    }

    return data
  } catch (error) {
    console.warn('Supabase non disponible, synchronisation ignorée:', error)
    return null
  }
}

export const cacheEvents = async (events: Omit<EventCache, 'id' | 'created_at' | 'updated_at'>[]) => {
  try {
    // Supprimer TOUS les événements en cache pour éviter les doublons lors de modifications
    await supabase
      .from('event_cache')
      .delete()
      .neq('id', 0) // Supprimer tous les enregistrements

    // Insérer les nouveaux événements
    const { data, error } = await supabase
      .from('event_cache')
      .insert(events)
      .select()

    if (error) {
      // Si la table n'existe pas, on ignore silencieusement l'erreur
      if (error.code === 'PGRST205') {
        console.warn('Table event_cache non trouvée, mise en cache ignorée')
        return null
      }
      console.error('Erreur lors de la mise en cache des événements:', error)
      return null
    }

    return data
  } catch (error) {
    console.warn('Supabase non disponible, mise en cache ignorée:', error)
    return null
  }
}

export const getCachedEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('event_cache')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      // Si la table n'existe pas, on retourne un tableau vide
      if (error.code === 'PGRST205') {
        console.warn('Table event_cache non trouvée, aucun cache disponible')
        return []
      }
      console.error('Erreur lors de la récupération des événements en cache:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('Supabase non disponible, aucun cache disponible:', error)
    return []
  }
}

export const clearCache = async () => {
  try {
    const { error } = await supabase
      .from('event_cache')
      .delete()
      .neq('id', 0) // Supprimer tous les enregistrements

    if (error && error.code !== 'PGRST205') {
      console.error('Erreur lors de la suppression du cache:', error)
      return false
    }

    console.log('Cache vidé avec succès')
    return true
  } catch (error) {
    console.warn('Supabase non disponible, impossible de vider le cache:', error)
    return false
  }
}