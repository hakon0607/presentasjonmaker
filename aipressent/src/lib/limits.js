// Grenser per nivå + en liten «buss» så oppgraderings-vinduet kan trigges hvor som helst.
let handler = null
export function onUpgrade(fn) { handler = fn; return () => { if (handler === fn) handler = null } }
export function fireUpgrade(info) { try { if (handler) handler(info || {}) } catch (_e) { /* ignore */ } }

export const LIMITS = {
  gratis: { pres: 3, slides: 8, watermark: true, tts: false },
  pluss: { pres: 15, slides: Infinity, watermark: false, tts: true },
  pro: { pres: Infinity, slides: Infinity, watermark: false, tts: true },
}

export function limitsFor(plan, unlimited) {
  if (unlimited) return LIMITS.pro
  return LIMITS[plan] || LIMITS.gratis
}

// Sjekk om brukeren har lov til å lage en ny presentasjon. Fyrer opp oppgraderings-vinduet hvis ikke.
import { supabase } from './supabase'
export async function canCreatePresentation(userId, plan, unlimited) {
  const lim = limitsFor(plan, unlimited)
  if (!isFinite(lim.pres)) return true
  try {
    const { count } = await supabase.from('presentations').select('id', { count: 'exact', head: true }).eq('owner_id', userId)
    if ((count ?? 0) >= lim.pres) { fireUpgrade({ reason: 'pres' }); return false }
  } catch (_e) { /* ved feil: ikke blokker */ }
  return true
}
