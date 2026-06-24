import { supabase } from './supabase'

// Bilder lagres i bøtta «slides» under mappa {userId}/...
const BUCKET = 'slides'
const PUBLIC_MARK = '/storage/v1/object/public/' + BUCKET + '/'

// Hent storage-stien ({userId}/fil.jpg) fra en public URL. Null hvis ikke vår bøtte.
export function pathFromUrl(url) {
  const s = String(url || '')
  const i = s.indexOf(PUBLIC_MARK)
  if (i === -1) return null
  try { return decodeURIComponent(s.slice(i + PUBLIC_MARK.length).split('?')[0]) } catch (_e) { return s.slice(i + PUBLIC_MARK.length).split('?')[0] }
}

// Alle bilde-stier som brukes i ett dekk.
export function deckImagePaths(deck) {
  const out = new Set()
  for (const sl of (deck?.slides || [])) {
    for (const el of (sl.elements || [])) {
      if (el && el.type === 'image' && el.src) { const p = pathFromUrl(el.src); if (p) out.add(p) }
    }
  }
  return out
}

// List alle filer i brukerens mappe (paginert, så vi får med alle).
// List alle filer under et prefiks – går rekursivt inn i mapper (per-presentasjon-mapper).
async function listAll(prefix) {
  const all = []
  let offset = 0
  for (let i = 0; i < 60; i++) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error || !data || !data.length) break
    for (const f of data) {
      if (!f || !f.name) continue
      const full = `${prefix}/${f.name}`
      if (f.id === null || f.id === undefined) { const sub = await listAll(full); all.push(...sub) } // mappe -> inn
      else all.push(full)                                                                            // fil
    }
    if (data.length < 100) break
    offset += 100
  }
  return all
}

// Fjern foreldreløse bilder: alt i storage som ikke er referert i NOEN av brukerens presentasjoner.
// Brukes etter sletting, og av og til ved innlasting. Trygg: laster brukte stier FØR den sletter.
export async function cleanupOrphanImages(userId) {
  if (!userId) return { removed: 0 }
  try {
    const files = await listAll(userId)
    if (!files.length) return { removed: 0 }
    const { data: rows, error } = await supabase.from('presentations').select('data').eq('owner_id', userId)
    if (error) return { removed: 0 }            // ved tvil: ALDRI slett
    const used = new Set()
    for (const r of (rows || [])) for (const p of deckImagePaths(r.data)) used.add(p)
    const orphans = files.filter((p) => !used.has(p))
    if (!orphans.length) return { removed: 0 }
    let removed = 0
    for (let i = 0; i < orphans.length; i += 100) {
      const chunk = orphans.slice(i, i + 100)
      const { error: delErr } = await supabase.storage.from(BUCKET).remove(chunk)
      if (!delErr) removed += chunk.length
    }
    return { removed }
  } catch (_e) { return { removed: 0 } }
}
