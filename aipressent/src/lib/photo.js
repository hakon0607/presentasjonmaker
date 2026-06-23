import { supabase } from './supabase'

// Henter ett passende foto fra Pixabay (via edge-funksjonen) som data-URL.
// Returnerer null hvis det feiler – kallstedet faller da pent tilbake til scenen.
export async function fetchPixabay(query) {
  const q = String(query || '').trim()
  if (!q) return null
  try {
    const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'pixabay', query: q } })
    if (error || !data || data.error || !data.image) return null
    return 'data:image/jpeg;base64,' + data.image
  } catch (_e) { return null }
}
