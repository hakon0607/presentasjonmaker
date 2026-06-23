// ============================================================================
//  MAL-BIBLIOTEK  (src/lib/templates.js)
// ----------------------------------------------------------------------------
//  Hver mal er et SELVSTENDIG data-objekt. Vil du ha flere maler? Be en AI om
//  å «lage 50 nye maler i akkurat dette formatet», lim dem inn i TEMPLATES-
//  lista under – så dukker de opp i søk, filter og velger AUTOMATISK. Ingen
//  annen kode trenger å endres.
//
//  Format på én mal:
//  {
//    id:       'unik-id',              // unik streng
//    name:     'Visningsnavn',         // vises i velgeren
//    category: 'Business',             // én av TEMPLATE_CATEGORIES (uten «Alle»)
//    keywords: ['søk', 'ord'],         // brukes av søkefeltet (sammen med name)
//    theme: {                          // KOMPLETT tema – farger + fonter + stil
//      bg, title, text, accent,        // #hex – sørg for god kontrast
//      fontHead, fontBody,             // fra Google Fonts-lista i deck.js
//      style                           // én av de 24 dekor-stilene (se deck.js)
//    },
//    align:    'left' | 'center'       // hvordan overskrifter plasseres (valgfritt)
//  }
//
//  Gyldige style-verdier (24): corners, bubbles, memphis, rings, dots, wave,
//  frame, triangles, grid, stripes, arch, confetti2, bigblob, diagonal,
//  brackets, halfTop, sidebar, topband, pluses, squares, sprinkles, wedge,
//  orbit, ribbon.
// ============================================================================

import { buildSlide, applyTheme, tidySlide, normalizeTheme, shapeEl } from './deck'
import { SILHOUETTES } from './silhouettes'

// Oppslag id → silhuett (path + ratio), brukt til å plassere mal-figurer.
const SIL_BY_ID = Object.fromEntries(SILHOUETTES.map((s) => [s.id, s]))

// Gjør en figur-spec om til et silhuett-element.
// Spec: { sid, x, y, w, fill, op, rot, flip }
//  - sid  = silhuett-id (se silhouettes.js: jet, tank, soldier, plane, flag, medal,
//           book, pencil, graduate, bulb, ball, lightning, person, rocket, …)
//  - x,y  = posisjon på lerretet (960×540), w = bredde (høyde regnes ut fra formen)
//  - fill = '#hex' ELLER 'accent' | 'title' | 'text' (henter farge fra temaet)
//  - op   = opasitet (0–1), rot = grader, flip = true for å speile vannrett
function figureEl(f, th) {
  const sil = SIL_BY_ID[f.sid]
  if (!sil) return null
  const w = Math.round(f.w || 120)
  const h = Math.round(w / (sil.ratio || 1))
  const named = { accent: th.accent, title: th.title, text: th.text, bg: th.bg }
  const fill = (typeof f.fill === 'string' && f.fill[0] === '#') ? f.fill : (named[f.fill] || th.accent)
  return shapeEl({
    kind: 'silhouette', path: sil.path, sid: sil.id,
    x: Math.round(f.x), y: Math.round(f.y), w, h, fill, radius: 0,
    rotation: f.rot || 0, opacity: f.op != null ? f.op : 1, flipH: !!f.flip,
  })
}
function figureEls(t, th) {
  return Array.isArray(t.figures) ? t.figures.map((f) => figureEl(f, th)).filter(Boolean) : []
}

// Legg figurer BAK teksten (foran bakteppe-pynten), så de rammer inn uten å dekke.
function withFigures(s, figs) {
  if (!figs || !figs.length) return s
  const decor = s.elements.filter((e) => e.decor)
  const rest = s.elements.filter((e) => !e.decor)
  return { ...s, elements: [...decor, ...figs, ...rest] }
}

// Rekkefølgen her styrer kategori-knappene i velgeren.
export const TEMPLATE_CATEGORIES = [
  'Alle', 'Business', 'Korporativ', 'Skole', 'Krig', 'Sport', 'Helse', 'Tech',
  'Minimal', 'Elegant', 'Natur', 'Reise', 'Mat', 'Pastell', 'Gradient', 'Retro',
  'Bold', 'Kreativ', 'Lekent',
]

export const TEMPLATES = [
  // ======================= Business =======================
  { id: 'biz-consult', name: 'Konsulent', category: 'Business', align: 'left',
    keywords: ['business', 'konsulent', 'profesjonell', 'rapport', 'blå', 'firma'],
    theme: { bg: '#ffffff', title: '#0f172a', text: '#475569', accent: '#2563eb', fontHead: 'Poppins', fontBody: 'Inter', style: 'sidebar' } },
  { id: 'biz-quarterly', name: 'Kvartalsrapport', category: 'Business', align: 'left',
    keywords: ['business', 'rapport', 'tall', 'resultat', 'møte', 'seriøs'],
    theme: { bg: '#f8fafc', title: '#1e293b', text: '#475569', accent: '#0ea5e9', fontHead: 'Work Sans', fontBody: 'Inter', style: 'topband' } },
  { id: 'biz-strategy', name: 'Strategi', category: 'Business', align: 'left',
    keywords: ['business', 'strategi', 'plan', 'ledelse', 'mål', 'blå'],
    theme: { bg: '#ffffff', title: '#0c2340', text: '#475569', accent: '#1d4ed8', fontHead: 'Manrope', fontBody: 'Inter', style: 'frame' } },
  { id: 'biz-pitch', name: 'Pitch', category: 'Business', align: 'left',
    keywords: ['business', 'pitch', 'oppstart', 'investor', 'indigo', 'moderne'],
    theme: { bg: '#ffffff', title: '#1e1b4b', text: '#475569', accent: '#6366f1', fontHead: 'Sora', fontBody: 'Inter', style: 'brackets' } },
  { id: 'biz-growth', name: 'Vekst', category: 'Business', align: 'left',
    keywords: ['business', 'vekst', 'salg', 'teal', 'positiv', 'resultat'],
    theme: { bg: '#f8fafc', title: '#134e4a', text: '#475569', accent: '#0d9488', fontHead: 'Outfit', fontBody: 'Inter', style: 'corners' } },
  { id: 'biz-board', name: 'Styremøte', category: 'Business', align: 'left',
    keywords: ['business', 'styre', 'møte', 'beslutning', 'grå', 'nøktern'],
    theme: { bg: '#ffffff', title: '#111827', text: '#4b5563', accent: '#334155', fontHead: 'Plus Jakarta Sans', fontBody: 'Inter', style: 'grid' } },

  // ======================= Korporativ =======================
  { id: 'corp-navy', name: 'Marineblå', category: 'Korporativ', align: 'left',
    keywords: ['korporativ', 'marineblå', 'mørk', 'konsern', 'formell', 'tillit'],
    theme: { bg: '#0f1e3d', title: '#f8fafc', text: '#cbd5e1', accent: '#38bdf8', fontHead: 'Manrope', fontBody: 'Inter', style: 'sidebar' } },
  { id: 'corp-finance', name: 'Finans', category: 'Korporativ', align: 'left',
    keywords: ['korporativ', 'finans', 'bank', 'investering', 'seriøs', 'klassisk'],
    theme: { bg: '#ffffff', title: '#14213d', text: '#4b5563', accent: '#1e3a8a', fontHead: 'Libre Baskerville', fontBody: 'Inter', style: 'frame' } },
  { id: 'corp-graphite', name: 'Grafitt', category: 'Korporativ', align: 'left',
    keywords: ['korporativ', 'grafitt', 'grå', 'nøytral', 'industri', 'rolig'],
    theme: { bg: '#f5f5f4', title: '#1c1917', text: '#57534e', accent: '#44403c', fontHead: 'Work Sans', fontBody: 'Inter', style: 'topband' } },
  { id: 'corp-gold', name: 'Gull & sort', category: 'Korporativ', align: 'center',
    keywords: ['korporativ', 'gull', 'sort', 'eksklusiv', 'luksus', 'elegant'],
    theme: { bg: '#18181b', title: '#fafaf9', text: '#d6d3d1', accent: '#d4af37', fontHead: 'Cormorant Garamond', fontBody: 'EB Garamond', style: 'rings' } },
  { id: 'corp-slate', name: 'Skifer', category: 'Korporativ', align: 'left',
    keywords: ['korporativ', 'skifer', 'grå', 'rolig', 'moderne', 'ren'],
    theme: { bg: '#f8fafc', title: '#0f172a', text: '#475569', accent: '#475569', fontHead: 'Sora', fontBody: 'Inter', style: 'brackets' } },
  { id: 'corp-exec', name: 'Direktør', category: 'Korporativ', align: 'left',
    keywords: ['korporativ', 'direktør', 'ledelse', 'formell', 'serif', 'stilig'],
    theme: { bg: '#ffffff', title: '#0a0a0a', text: '#404040', accent: '#1e40af', fontHead: 'DM Serif Display', fontBody: 'Lora', style: 'frame' } },

  // ======================= Skole =======================
  { id: 'sch-class', name: 'Klasserom', category: 'Skole', align: 'center',
    keywords: ['skole', 'klasse', 'undervisning', 'elev', 'lys', 'vennlig'],
    theme: { bg: '#f0f9ff', title: '#0c4a6e', text: '#0369a1', accent: '#38bdf8', fontHead: 'Nunito', fontBody: 'Inter', style: 'dots' } },
  { id: 'sch-project', name: 'Prosjektoppgave', category: 'Skole', align: 'left',
    keywords: ['skole', 'prosjekt', 'oppgave', 'fag', 'ryddig', 'gul'],
    theme: { bg: '#fefce8', title: '#1f2937', text: '#52525b', accent: '#f59e0b', fontHead: 'Rubik', fontBody: 'Karla', style: 'brackets' } },
  { id: 'sch-present', name: 'Fremføring', category: 'Skole', align: 'center',
    keywords: ['skole', 'fremføring', 'muntlig', 'tema', 'grønn', 'frisk'],
    theme: { bg: '#ffffff', title: '#14532d', text: '#3f6212', accent: '#22c55e', fontHead: 'Montserrat', fontBody: 'Inter', style: 'corners' } },
  { id: 'sch-notebook', name: 'Skrivebok', category: 'Skole', align: 'center',
    keywords: ['skole', 'skrivebok', 'notat', 'lilla', 'leken', 'ung'],
    theme: { bg: '#fffbeb', title: '#3730a3', text: '#4338ca', accent: '#818cf8', fontHead: 'Quicksand', fontBody: 'Nunito', style: 'halfTop' } },
  { id: 'sch-science', name: 'Naturfag', category: 'Skole', align: 'center',
    keywords: ['skole', 'naturfag', 'forskning', 'eksperiment', 'turkis', 'cyan'],
    theme: { bg: '#ecfeff', title: '#155e75', text: '#0e7490', accent: '#06b6d4', fontHead: 'Baloo 2', fontBody: 'Nunito', style: 'bubbles' } },
  { id: 'sch-history', name: 'Historie', category: 'Skole', align: 'left',
    keywords: ['skole', 'historie', 'fortid', 'brun', 'klassisk', 'serif'],
    theme: { bg: '#f5f0e8', title: '#44403c', text: '#57534e', accent: '#92400e', fontHead: 'Bitter', fontBody: 'PT Serif', style: 'rings' } },

  // ======================= Krig =======================
  { id: 'war-ww2', name: 'Andre verdenskrig', category: 'Krig', align: 'left',
    keywords: ['krig', 'ww2', 'verdenskrig', 'historie', 'fly', 'stridsvogn', 'soldat', 'mørk', 'action', 'dramatisk'],
    theme: { bg: '#14161a', title: '#f8fafc', text: '#cbd5e1', accent: '#f59e0b', fontHead: 'Oswald', fontBody: 'Inter', style: 'diagonal' },
    figures: [
      { sid: 'jet', x: 40, y: 28, w: 200, fill: 'accent', op: 0.9 },
      { sid: 'jet', x: 720, y: 84, w: 180, fill: 'accent', op: 0.75, flip: true },
      { sid: 'tank', x: 36, y: 424, w: 220, fill: '#64748b' },
      { sid: 'soldier', x: 320, y: 386, w: 84, fill: '#64748b' },
      { sid: 'soldier', x: 690, y: 392, w: 78, fill: '#475569', op: 0.9, flip: true },
      { sid: 'flag', x: 852, y: 356, w: 92, fill: 'accent', op: 0.9 },
    ] },
  { id: 'war-air', name: 'Luftkrig', category: 'Krig', align: 'left',
    keywords: ['krig', 'luftkrig', 'fly', 'jagerfly', 'himmel', 'natt', 'action', 'dramatisk', 'mørk'],
    theme: { bg: '#0b1220', title: '#e2e8f0', text: '#94a3b8', accent: '#fbbf24', fontHead: 'Bebas Neue', fontBody: 'Inter', style: 'stripes' },
    figures: [
      { sid: 'jet', x: 28, y: 44, w: 160, fill: 'accent' },
      { sid: 'jet', x: 732, y: 28, w: 188, fill: 'accent', op: 0.8, flip: true },
      { sid: 'jet', x: 430, y: 10, w: 130, fill: '#64748b', op: 0.6 },
      { sid: 'plane', x: 70, y: 424, w: 92, fill: '#475569' },
      { sid: 'plane', x: 842, y: 420, w: 86, fill: '#475569', op: 0.85, flip: true },
    ] },
  { id: 'war-front', name: 'Frontlinjen', category: 'Krig', align: 'left',
    keywords: ['krig', 'front', 'soldat', 'stridsvogn', 'bakke', 'historie', 'action', 'jord'],
    theme: { bg: '#1c1917', title: '#fafaf9', text: '#d6d3d1', accent: '#d97706', fontHead: 'Anton', fontBody: 'Inter', style: 'wedge' },
    figures: [
      { sid: 'tank', x: 28, y: 416, w: 240, fill: '#57534e' },
      { sid: 'soldier', x: 346, y: 388, w: 84, fill: '#44403c' },
      { sid: 'soldier', x: 460, y: 394, w: 78, fill: '#57534e', flip: true },
      { sid: 'soldier', x: 880, y: 392, w: 74, fill: '#44403c' },
      { sid: 'jet', x: 770, y: 30, w: 150, fill: '#92400e', op: 0.8, flip: true },
    ] },
  { id: 'war-victory', name: 'Seier', category: 'Krig', align: 'center',
    keywords: ['krig', 'seier', 'flagg', 'medalje', 'historie', 'minne', 'rolig', 'lys'],
    theme: { bg: '#f5f0e8', title: '#44403c', text: '#57534e', accent: '#b45309', fontHead: 'DM Serif Display', fontBody: 'Lora', style: 'rings' },
    figures: [
      { sid: 'flag', x: 432, y: 56, w: 120, fill: '#44403c' },
      { sid: 'medal', x: 150, y: 398, w: 92, fill: '#b45309' },
      { sid: 'medal', x: 726, y: 408, w: 82, fill: '#92400e', op: 0.9, flip: true },
    ] },

  // ======================= Sport =======================
  { id: 'sport-football', name: 'Fotball', category: 'Sport', align: 'left',
    keywords: ['sport', 'fotball', 'ball', 'kamp', 'lag', 'grønn', 'gress', 'energi'],
    theme: { bg: '#052e16', title: '#ecfdf5', text: '#bbf7d0', accent: '#fbbf24', fontHead: 'Oswald', fontBody: 'Inter', style: 'stripes' },
    figures: [
      { sid: 'ball', x: 56, y: 398, w: 112, fill: '#ecfdf5' },
      { sid: 'person', x: 836, y: 360, w: 80, fill: '#fbbf24' },
      { sid: 'lightning', x: 440, y: 28, w: 58, fill: '#fbbf24', op: 0.8 },
      { sid: 'ball', x: 804, y: 40, w: 68, fill: '#bbf7d0', op: 0.55 },
    ] },
  { id: 'sport-win', name: 'Vinnerlag', category: 'Sport', align: 'left',
    keywords: ['sport', 'seier', 'medalje', 'ball', 'mester', 'lys', 'energi', 'pokal'],
    theme: { bg: '#ffffff', title: '#0a0a0a', text: '#404040', accent: '#16a34a', fontHead: 'Anton', fontBody: 'Inter', style: 'topband' },
    figures: [
      { sid: 'medal', x: 60, y: 388, w: 100, fill: 'accent' },
      { sid: 'ball', x: 836, y: 398, w: 104, fill: '#0a0a0a' },
      { sid: 'lightning', x: 876, y: 30, w: 48, fill: 'accent' },
      { sid: 'person', x: 44, y: 40, w: 78, fill: '#16a34a', op: 0.85 },
    ] },
  { id: 'sport-energy', name: 'Energi', category: 'Sport', align: 'left',
    keywords: ['sport', 'energi', 'løp', 'trening', 'fart', 'lyn', 'mørk', 'dynamisk'],
    theme: { bg: '#1e1b4b', title: '#f8fafc', text: '#c7d2fe', accent: '#818cf8', fontHead: 'Bebas Neue', fontBody: 'Inter', style: 'diagonal' },
    figures: [
      { sid: 'person', x: 60, y: 368, w: 90, fill: 'accent' },
      { sid: 'lightning', x: 836, y: 356, w: 72, fill: 'accent' },
      { sid: 'ball', x: 436, y: 28, w: 72, fill: '#c7d2fe', op: 0.55 },
      { sid: 'lightning', x: 60, y: 36, w: 50, fill: '#818cf8', op: 0.7, flip: true },
    ] },

  // ---------- Skole (med figurer) ----------
  { id: 'sch-fig-project', name: 'Skoleprosjekt', category: 'Skole', align: 'left',
    keywords: ['skole', 'prosjekt', 'bok', 'blyant', 'studenthatt', 'lyspære', 'figurer', 'lys'],
    theme: { bg: '#f0f9ff', title: '#0c4a6e', text: '#0369a1', accent: '#38bdf8', fontHead: 'Nunito', fontBody: 'Inter', style: 'dots' },
    figures: [
      { sid: 'graduate', x: 40, y: 22, w: 130, fill: 'accent', op: 0.9 },
      { sid: 'pencil', x: 836, y: 28, w: 88, fill: '#0369a1' },
      { sid: 'book', x: 44, y: 406, w: 150, fill: 'accent' },
      { sid: 'bulb', x: 846, y: 398, w: 80, fill: '#f59e0b' },
    ] },
  { id: 'sch-fig-exam', name: 'Eksamen', category: 'Skole', align: 'center',
    keywords: ['skole', 'eksamen', 'studenthatt', 'bok', 'blyant', 'figurer', 'gul'],
    theme: { bg: '#fefce8', title: '#1f2937', text: '#52525b', accent: '#f59e0b', fontHead: 'Rubik', fontBody: 'Karla', style: 'brackets' },
    figures: [
      { sid: 'graduate', x: 408, y: 40, w: 150, fill: 'accent' },
      { sid: 'book', x: 52, y: 418, w: 140, fill: '#1f2937', op: 0.85 },
      { sid: 'pencil', x: 852, y: 414, w: 80, fill: '#f59e0b' },
    ] },

  // ======================= Helse =======================
  { id: 'hel-clinic', name: 'Klinikk', category: 'Helse', align: 'left',
    keywords: ['helse', 'klinikk', 'lege', 'teal', 'ren', 'tillit'],
    theme: { bg: '#ffffff', title: '#0f766e', text: '#115e59', accent: '#14b8a6', fontHead: 'Manrope', fontBody: 'Inter', style: 'corners' } },
  { id: 'hel-calm', name: 'Ro', category: 'Helse', align: 'center',
    keywords: ['helse', 'ro', 'mindfulness', 'mynte', 'myk', 'rolig'],
    theme: { bg: '#f0fdfa', title: '#115e59', text: '#0f766e', accent: '#2dd4bf', fontHead: 'Quicksand', fontBody: 'Inter', style: 'arch' } },
  { id: 'hel-care', name: 'Omsorg', category: 'Helse', align: 'center',
    keywords: ['helse', 'omsorg', 'pleie', 'rosa', 'varm', 'mild'],
    theme: { bg: '#fef2f2', title: '#9f1239', text: '#be123c', accent: '#fb7185', fontHead: 'Nunito', fontBody: 'Inter', style: 'wave' } },
  { id: 'hel-medical', name: 'Medisin', category: 'Helse', align: 'left',
    keywords: ['helse', 'medisin', 'sykehus', 'blå', 'fagleg', 'presis'],
    theme: { bg: '#f0f9ff', title: '#1e40af', text: '#1d4ed8', accent: '#3b82f6', fontHead: 'Work Sans', fontBody: 'Inter', style: 'frame' } },
  { id: 'hel-wellness', name: 'Velvære', category: 'Helse', align: 'center',
    keywords: ['helse', 'velvære', 'trening', 'grønn', 'frisk', 'energi'],
    theme: { bg: '#f7fee7', title: '#3f6212', text: '#4d7c0f', accent: '#84cc16', fontHead: 'Outfit', fontBody: 'Inter', style: 'halfTop' } },

  // ======================= Tech =======================
  { id: 'tech-terminal', name: 'Terminal', category: 'Tech', align: 'left',
    keywords: ['tech', 'terminal', 'kode', 'mørk', 'grønn', 'utvikler'],
    theme: { bg: '#0a0a0a', title: '#f4f4f5', text: '#a1a1aa', accent: '#22c55e', fontHead: 'JetBrains Mono', fontBody: 'Inter', style: 'grid' } },
  { id: 'tech-cloud', name: 'Sky', category: 'Tech', align: 'left',
    keywords: ['tech', 'sky', 'system', 'blå', 'moderne', 'saas'],
    theme: { bg: '#ffffff', title: '#1e293b', text: '#475569', accent: '#3b82f6', fontHead: 'Manrope', fontBody: 'Inter', style: 'orbit' } },
  { id: 'tech-data', name: 'Datasett', category: 'Tech', align: 'left',
    keywords: ['tech', 'data', 'analyse', 'statistikk', 'teal', 'presis'],
    theme: { bg: '#f8fafc', title: '#0f172a', text: '#475569', accent: '#0d9488', fontHead: 'IBM Plex Mono', fontBody: 'Inter', style: 'dots' } },
  { id: 'tech-neon', name: 'Neon', category: 'Tech', align: 'left',
    keywords: ['tech', 'neon', 'mørk', 'lilla', 'fremtid', 'cyber'],
    theme: { bg: '#0f172a', title: '#f8fafc', text: '#cbd5e1', accent: '#a855f7', fontHead: 'Space Grotesk', fontBody: 'Inter', style: 'diagonal' } },
  { id: 'tech-ai', name: 'AI', category: 'Tech', align: 'left',
    keywords: ['tech', 'ai', 'maskinlæring', 'cyan', 'mørk', 'smart'],
    theme: { bg: '#0b1120', title: '#e2e8f0', text: '#94a3b8', accent: '#22d3ee', fontHead: 'Sora', fontBody: 'Inter', style: 'orbit' } },
  { id: 'tech-code', name: 'Kode', category: 'Tech', align: 'left',
    keywords: ['tech', 'kode', 'programmering', 'amber', 'mørk', 'mono'],
    theme: { bg: '#18181b', title: '#fafafa', text: '#d4d4d8', accent: '#f59e0b', fontHead: 'Roboto Mono', fontBody: 'Inter', style: 'brackets' } },

  // ======================= Minimal =======================
  { id: 'min-clean', name: 'Ren', category: 'Minimal', align: 'left',
    keywords: ['minimal', 'ren', 'enkel', 'hvit', 'tydelig', 'rolig'],
    theme: { bg: '#ffffff', title: '#111111', text: '#525252', accent: '#171717', fontHead: 'Inter', fontBody: 'Inter', style: 'frame' } },
  { id: 'min-paper', name: 'Papir', category: 'Minimal', align: 'left',
    keywords: ['minimal', 'papir', 'nøytral', 'lys', 'rolig', 'mild'],
    theme: { bg: '#faf9f7', title: '#1c1917', text: '#57534e', accent: '#78716c', fontHead: 'DM Sans', fontBody: 'Inter', style: 'topband' } },
  { id: 'min-mono', name: 'Kontrast', category: 'Minimal', align: 'center',
    keywords: ['minimal', 'svart', 'hvit', 'kontrast', 'skarp', 'moderne'],
    theme: { bg: '#ffffff', title: '#0a0a0a', text: '#404040', accent: '#0a0a0a', fontHead: 'Manrope', fontBody: 'Inter', style: 'brackets' } },
  { id: 'min-line', name: 'Linje', category: 'Minimal', align: 'left',
    keywords: ['minimal', 'linje', 'enkel', 'blå', 'ren', 'stram'],
    theme: { bg: '#fafafa', title: '#18181b', text: '#52525b', accent: '#2563eb', fontHead: 'Outfit', fontBody: 'Inter', style: 'sidebar' } },
  { id: 'min-air', name: 'Luft', category: 'Minimal', align: 'center',
    keywords: ['minimal', 'luft', 'rom', 'lys', 'rolig', 'pust'],
    theme: { bg: '#ffffff', title: '#1e293b', text: '#64748b', accent: '#94a3b8', fontHead: 'Figtree', fontBody: 'Inter', style: 'corners' } },
  { id: 'min-slate', name: 'Skifergrå', category: 'Minimal', align: 'left',
    keywords: ['minimal', 'skifer', 'grå', 'kjølig', 'moderne', 'ren'],
    theme: { bg: '#f1f5f9', title: '#0f172a', text: '#475569', accent: '#334155', fontHead: 'Plus Jakarta Sans', fontBody: 'Inter', style: 'frame' } },

  // ======================= Elegant =======================
  { id: 'ele-editorial', name: 'Editorial', category: 'Elegant', align: 'left',
    keywords: ['elegant', 'editorial', 'magasin', 'serif', 'krem', 'klassisk'],
    theme: { bg: '#faf6ef', title: '#1f2937', text: '#3f3f46', accent: '#b45309', fontHead: 'Playfair Display', fontBody: 'Lora', style: 'ribbon' } },
  { id: 'ele-luxury', name: 'Luksus', category: 'Elegant', align: 'center',
    keywords: ['elegant', 'luksus', 'gull', 'mørk', 'eksklusiv', 'stilig'],
    theme: { bg: '#1c1917', title: '#fafaf9', text: '#d6d3d1', accent: '#d4af37', fontHead: 'Cormorant Garamond', fontBody: 'EB Garamond', style: 'arch' } },
  { id: 'ele-vintage', name: 'Vintage', category: 'Elegant', align: 'left',
    keywords: ['elegant', 'vintage', 'retro', 'brun', 'varm', 'serif'],
    theme: { bg: '#f5f0e8', title: '#44403c', text: '#57534e', accent: '#92400e', fontHead: 'DM Serif Display', fontBody: 'Lora', style: 'rings' } },
  { id: 'ele-marble', name: 'Marmor', category: 'Elegant', align: 'center',
    keywords: ['elegant', 'marmor', 'lys', 'rolig', 'raffinert', 'serif'],
    theme: { bg: '#faf9f7', title: '#292524', text: '#57534e', accent: '#a16207', fontHead: 'Frank Ruhl Libre', fontBody: 'Spectral', style: 'arch' } },
  { id: 'ele-couture', name: 'Couture', category: 'Elegant', align: 'center',
    keywords: ['elegant', 'couture', 'mote', 'rosa', 'feminin', 'stilig'],
    theme: { bg: '#fdf2f8', title: '#831843', text: '#9d174d', accent: '#db2777', fontHead: 'Abril Fatface', fontBody: 'Lora', style: 'ribbon' } },
  { id: 'ele-noir', name: 'Noir', category: 'Elegant', align: 'center',
    keywords: ['elegant', 'noir', 'sort', 'gull', 'dramatisk', 'klassisk'],
    theme: { bg: '#0a0a0a', title: '#fafafa', text: '#d4d4d8', accent: '#c0a062', fontHead: 'Playfair Display', fontBody: 'EB Garamond', style: 'orbit' } },

  // ======================= Natur =======================
  { id: 'nat-forest', name: 'Skog', category: 'Natur', align: 'left',
    keywords: ['natur', 'skog', 'grønn', 'miljø', 'klima', 'tre'],
    theme: { bg: '#f0fdf4', title: '#14532d', text: '#3f6212', accent: '#16a34a', fontHead: 'Montserrat', fontBody: 'Lora', style: 'wave' } },
  { id: 'nat-ocean', name: 'Hav', category: 'Natur', align: 'left',
    keywords: ['natur', 'hav', 'vann', 'blå', 'turkis', 'kyst'],
    theme: { bg: '#ecfeff', title: '#155e75', text: '#0e7490', accent: '#06b6d4', fontHead: 'Quicksand', fontBody: 'Inter', style: 'arch' } },
  { id: 'nat-earth', name: 'Jord', category: 'Natur', align: 'left',
    keywords: ['natur', 'jord', 'brun', 'terreng', 'høst', 'varm'],
    theme: { bg: '#fef7ed', title: '#7c2d12', text: '#9a3412', accent: '#d97706', fontHead: 'Bitter', fontBody: 'PT Serif', style: 'bigblob' } },
  { id: 'nat-leaf', name: 'Blad', category: 'Natur', align: 'center',
    keywords: ['natur', 'blad', 'plante', 'grønn', 'frisk', 'vekst'],
    theme: { bg: '#f7fee7', title: '#365314', text: '#4d7c0f', accent: '#65a30d', fontHead: 'Outfit', fontBody: 'Lora', style: 'halfTop' } },
  { id: 'nat-stone', name: 'Stein', category: 'Natur', align: 'left',
    keywords: ['natur', 'stein', 'fjell', 'grå', 'rolig', 'rå'],
    theme: { bg: '#f5f5f4', title: '#292524', text: '#57534e', accent: '#57534e', fontHead: 'Work Sans', fontBody: 'Inter', style: 'corners' } },
  { id: 'nat-sky', name: 'Himmel', category: 'Natur', align: 'center',
    keywords: ['natur', 'himmel', 'luft', 'blå', 'lett', 'vær'],
    theme: { bg: '#eff6ff', title: '#1e3a8a', text: '#1d4ed8', accent: '#60a5fa', fontHead: 'Nunito', fontBody: 'Inter', style: 'wave' } },

  // ======================= Reise =======================
  { id: 'rei-sunset', name: 'Solnedgang', category: 'Reise', align: 'center',
    keywords: ['reise', 'solnedgang', 'ferie', 'oransje', 'varm', 'eventyr'],
    theme: { bg: '#fff7ed', title: '#7c2d12', text: '#9a3412', accent: '#f97316', fontHead: 'Outfit', fontBody: 'Lora', style: 'arch' } },
  { id: 'rei-coast', name: 'Kyst', category: 'Reise', align: 'left',
    keywords: ['reise', 'kyst', 'strand', 'blå', 'sommer', 'hav'],
    theme: { bg: '#ecfeff', title: '#0c4a6e', text: '#0369a1', accent: '#0ea5e9', fontHead: 'Quicksand', fontBody: 'Inter', style: 'wave' } },
  { id: 'rei-desert', name: 'Ørken', category: 'Reise', align: 'left',
    keywords: ['reise', 'ørken', 'sand', 'brun', 'varm', 'tørr'],
    theme: { bg: '#fefce8', title: '#78350f', text: '#92400e', accent: '#d97706', fontHead: 'Bitter', fontBody: 'PT Serif', style: 'bigblob' } },
  { id: 'rei-tropic', name: 'Tropisk', category: 'Reise', align: 'center',
    keywords: ['reise', 'tropisk', 'palme', 'turkis', 'paradis', 'frisk'],
    theme: { bg: '#f0fdfa', title: '#115e59', text: '#0f766e', accent: '#14b8a6', fontHead: 'Baloo 2', fontBody: 'Nunito', style: 'halfTop' } },
  { id: 'rei-passport', name: 'Pass', category: 'Reise', align: 'center',
    keywords: ['reise', 'pass', 'tur', 'mørk blå', 'eventyr', 'verden'],
    theme: { bg: '#1e3a8a', title: '#f8fafc', text: '#dbeafe', accent: '#fbbf24', fontHead: 'Sora', fontBody: 'Inter', style: 'ribbon' } },
  { id: 'rei-map', name: 'Kart', category: 'Reise', align: 'left',
    keywords: ['reise', 'kart', 'rute', 'beige', 'oppdagelse', 'klassisk'],
    theme: { bg: '#f5f0e8', title: '#44403c', text: '#57534e', accent: '#b45309', fontHead: 'Work Sans', fontBody: 'Lora', style: 'wedge' } },

  // ======================= Mat =======================
  { id: 'mat-bistro', name: 'Bistro', category: 'Mat', align: 'center',
    keywords: ['mat', 'bistro', 'restaurant', 'rød', 'meny', 'klassisk'],
    theme: { bg: '#fffbeb', title: '#7f1d1d', text: '#991b1b', accent: '#dc2626', fontHead: 'Playfair Display', fontBody: 'Lora', style: 'arch' } },
  { id: 'mat-fresh', name: 'Fersk', category: 'Mat', align: 'center',
    keywords: ['mat', 'fersk', 'grønnsak', 'grønn', 'sunn', 'frisk'],
    theme: { bg: '#f7fee7', title: '#3f6212', text: '#4d7c0f', accent: '#84cc16', fontHead: 'Fredoka', fontBody: 'Nunito', style: 'halfTop' } },
  { id: 'mat-bakery', name: 'Bakeri', category: 'Mat', align: 'center',
    keywords: ['mat', 'bakeri', 'brød', 'varm', 'koselig', 'søt'],
    theme: { bg: '#fef3c7', title: '#78350f', text: '#92400e', accent: '#d97706', fontHead: 'Pacifico', fontBody: 'Quicksand', style: 'bubbles' } },
  { id: 'mat-cafe', name: 'Kafé', category: 'Mat', align: 'center',
    keywords: ['mat', 'kafé', 'kaffe', 'brun', 'hyggelig', 'håndskrift'],
    theme: { bg: '#f5f0e8', title: '#44403c', text: '#57534e', accent: '#b45309', fontHead: 'Caveat', fontBody: 'Lora', style: 'bigblob' } },
  { id: 'mat-spice', name: 'Krydder', category: 'Mat', align: 'center',
    keywords: ['mat', 'krydder', 'sterk', 'mørk', 'smak', 'varm'],
    theme: { bg: '#431407', title: '#fef3c7', text: '#fed7aa', accent: '#f97316', fontHead: 'Bitter', fontBody: 'PT Serif', style: 'arch' } },
  { id: 'mat-sweet', name: 'Søtt', category: 'Mat', align: 'center',
    keywords: ['mat', 'søtt', 'dessert', 'rosa', 'kake', 'leken'],
    theme: { bg: '#fdf2f8', title: '#9d174d', text: '#be185d', accent: '#f472b6', fontHead: 'Baloo 2', fontBody: 'Quicksand', style: 'sprinkles' } },

  // ======================= Pastell =======================
  { id: 'pas-peach', name: 'Fersken', category: 'Pastell', align: 'center',
    keywords: ['pastell', 'fersken', 'rosa', 'myk', 'søt', 'lys'],
    theme: { bg: '#fff1f2', title: '#9f1239', text: '#be123c', accent: '#fb7185', fontHead: 'Quicksand', fontBody: 'Nunito', style: 'halfTop' } },
  { id: 'pas-lavender', name: 'Lavendel', category: 'Pastell', align: 'center',
    keywords: ['pastell', 'lavendel', 'lilla', 'rolig', 'drømmende', 'myk'],
    theme: { bg: '#f5f3ff', title: '#5b21b6', text: '#6d28d9', accent: '#a78bfa', fontHead: 'Fredoka', fontBody: 'Quicksand', style: 'bubbles' } },
  { id: 'pas-mint', name: 'Mynte', category: 'Pastell', align: 'center',
    keywords: ['pastell', 'mynte', 'grønn', 'frisk', 'mild', 'rolig'],
    theme: { bg: '#f0fdfa', title: '#115e59', text: '#0f766e', accent: '#2dd4bf', fontHead: 'Baloo 2', fontBody: 'Nunito', style: 'sprinkles' } },
  { id: 'pas-sky', name: 'Pudderblå', category: 'Pastell', align: 'center',
    keywords: ['pastell', 'pudderblå', 'blå', 'lett', 'rolig', 'lys'],
    theme: { bg: '#eff6ff', title: '#1e40af', text: '#2563eb', accent: '#93c5fd', fontHead: 'Quicksand', fontBody: 'Inter', style: 'wave' } },
  { id: 'pas-rose', name: 'Pudderrosa', category: 'Pastell', align: 'center',
    keywords: ['pastell', 'pudderrosa', 'rosa', 'feminin', 'myk', 'lys'],
    theme: { bg: '#fdf2f8', title: '#9d174d', text: '#be185d', accent: '#f9a8d4', fontHead: 'Nunito', fontBody: 'Inter', style: 'arch' } },
  { id: 'pas-butter', name: 'Smørgul', category: 'Pastell', align: 'center',
    keywords: ['pastell', 'smørgul', 'gul', 'varm', 'mild', 'glad'],
    theme: { bg: '#fefce8', title: '#854d0e', text: '#a16207', accent: '#fcd34d', fontHead: 'Outfit', fontBody: 'Nunito', style: 'halfTop' } },

  // ======================= Gradient =======================
  { id: 'grad-aurora', name: 'Aurora', category: 'Gradient', align: 'center',
    keywords: ['gradient', 'aurora', 'mørk', 'lilla', 'lag', 'stemning'],
    theme: { bg: '#0f172a', title: '#f8fafc', text: '#cbd5e1', accent: '#818cf8', fontHead: 'Sora', fontBody: 'Inter', style: 'bigblob' } },
  { id: 'grad-sunset', name: 'Solglød', category: 'Gradient', align: 'center',
    keywords: ['gradient', 'solglød', 'oransje', 'rosa', 'varm', 'lag'],
    theme: { bg: '#fff7ed', title: '#7c2d12', text: '#9a3412', accent: '#fb7185', fontHead: 'Outfit', fontBody: 'Inter', style: 'wave' } },
  { id: 'grad-deep', name: 'Dyp', category: 'Gradient', align: 'center',
    keywords: ['gradient', 'dyp', 'blå', 'hav', 'mørk', 'rolig'],
    theme: { bg: '#082f49', title: '#e0f2fe', text: '#bae6fd', accent: '#38bdf8', fontHead: 'Manrope', fontBody: 'Inter', style: 'halfTop' } },
  { id: 'grad-berry', name: 'Bær', category: 'Gradient', align: 'center',
    keywords: ['gradient', 'bær', 'lilla', 'mørk', 'rik', 'stemning'],
    theme: { bg: '#2e1065', title: '#f5f3ff', text: '#ddd6fe', accent: '#c084fc', fontHead: 'Space Grotesk', fontBody: 'Inter', style: 'wedge' } },
  { id: 'grad-coral', name: 'Korall', category: 'Gradient', align: 'center',
    keywords: ['gradient', 'korall', 'rosa', 'oransje', 'lys', 'varm'],
    theme: { bg: '#fff1f2', title: '#9f1239', text: '#be123c', accent: '#fb923c', fontHead: 'Outfit', fontBody: 'Inter', style: 'arch' } },
  { id: 'grad-emerald', name: 'Smaragd', category: 'Gradient', align: 'center',
    keywords: ['gradient', 'smaragd', 'grønn', 'mørk', 'rik', 'natt'],
    theme: { bg: '#022c22', title: '#ecfdf5', text: '#a7f3d0', accent: '#34d399', fontHead: 'Sora', fontBody: 'Inter', style: 'diagonal' } },

  // ======================= Retro =======================
  { id: 'ret-seventies', name: 'Sytti', category: 'Retro', align: 'left',
    keywords: ['retro', 'sytti', '70-tall', 'oransje', 'varm', 'stripe'],
    theme: { bg: '#fef3c7', title: '#7c2d12', text: '#9a3412', accent: '#ea580c', fontHead: 'Righteous', fontBody: 'Nunito', style: 'stripes' } },
  { id: 'ret-disco', name: 'Disco', category: 'Retro', align: 'center',
    keywords: ['retro', 'disco', 'fest', 'rosa', 'mørk', 'glitter'],
    theme: { bg: '#1e1b4b', title: '#fce7f3', text: '#fbcfe8', accent: '#f472b6', fontHead: 'Bungee', fontBody: 'Quicksand', style: 'diagonal' } },
  { id: 'ret-arcade', name: 'Arkade', category: 'Retro', align: 'center',
    keywords: ['retro', 'arkade', 'spill', 'gul', 'mørk', '80-tall'],
    theme: { bg: '#0a0a0a', title: '#fde047', text: '#fef08a', accent: '#f43f5e', fontHead: 'Russo One', fontBody: 'Inter', style: 'memphis' } },
  { id: 'ret-poster', name: 'Retroplakat', category: 'Retro', align: 'left',
    keywords: ['retro', 'plakat', 'rød', 'kraftig', 'klassisk', 'display'],
    theme: { bg: '#fffbeb', title: '#7f1d1d', text: '#991b1b', accent: '#dc2626', fontHead: 'Alfa Slab One', fontBody: 'Lora', style: 'ribbon' } },
  { id: 'ret-vinyl', name: 'Vinyl', category: 'Retro', align: 'center',
    keywords: ['retro', 'vinyl', 'musikk', 'mørk', 'amber', 'klassisk'],
    theme: { bg: '#292524', title: '#fafaf9', text: '#d6d3d1', accent: '#f59e0b', fontHead: 'Staatliches', fontBody: 'PT Serif', style: 'rings' } },
  { id: 'ret-synth', name: 'Synthwave', category: 'Retro', align: 'center',
    keywords: ['retro', 'synthwave', 'neon', 'lilla', 'cyan', 'natt'],
    theme: { bg: '#1e1b4b', title: '#f0abfc', text: '#f5d0fe', accent: '#22d3ee', fontHead: 'Bungee', fontBody: 'Quicksand', style: 'wedge' } },

  // ======================= Bold =======================
  { id: 'bold-impact', name: 'Impact', category: 'Bold', align: 'left',
    keywords: ['bold', 'impact', 'sterk', 'gul', 'mørk', 'plakat'],
    theme: { bg: '#0a0a0a', title: '#fafafa', text: '#d4d4d8', accent: '#facc15', fontHead: 'Anton', fontBody: 'Inter', style: 'diagonal' } },
  { id: 'bold-red', name: 'Rød alarm', category: 'Bold', align: 'left',
    keywords: ['bold', 'rød', 'alarm', 'kraftig', 'oppmerksomhet', 'sterk'],
    theme: { bg: '#7f1d1d', title: '#fef2f2', text: '#fecaca', accent: '#fbbf24', fontHead: 'Archivo Black', fontBody: 'Inter', style: 'wedge' } },
  { id: 'bold-electric', name: 'Elektrisk', category: 'Bold', align: 'left',
    keywords: ['bold', 'elektrisk', 'indigo', 'energi', 'mørk', 'sterk'],
    theme: { bg: '#1e1b4b', title: '#f8fafc', text: '#c7d2fe', accent: '#818cf8', fontHead: 'Bebas Neue', fontBody: 'Inter', style: 'stripes' } },
  { id: 'bold-mono', name: 'Svart/hvit', category: 'Bold', align: 'left',
    keywords: ['bold', 'svart', 'hvit', 'kontrast', 'skarp', 'rå'],
    theme: { bg: '#0a0a0a', title: '#ffffff', text: '#a3a3a3', accent: '#ffffff', fontHead: 'Archivo Black', fontBody: 'Inter', style: 'triangles' } },
  { id: 'bold-sport', name: 'Sport', category: 'Bold', align: 'left',
    keywords: ['bold', 'sport', 'energi', 'grønn', 'dynamisk', 'kraftig'],
    theme: { bg: '#ffffff', title: '#0a0a0a', text: '#404040', accent: '#16a34a', fontHead: 'Oswald', fontBody: 'Inter', style: 'topband' } },
  { id: 'bold-fire', name: 'Ild', category: 'Bold', align: 'left',
    keywords: ['bold', 'ild', 'oransje', 'mørk', 'varm', 'kraftig'],
    theme: { bg: '#18181b', title: '#fef3c7', text: '#fde68a', accent: '#f97316', fontHead: 'Fjalla One', fontBody: 'Inter', style: 'halfTop' } },

  // ======================= Kreativ =======================
  { id: 'cre-studio', name: 'Studio', category: 'Kreativ', align: 'left',
    keywords: ['kreativ', 'studio', 'design', 'oransje', 'memphis', 'leken'],
    theme: { bg: '#fffbeb', title: '#18181b', text: '#3f3f46', accent: '#f97316', fontHead: 'Space Grotesk', fontBody: 'Inter', style: 'memphis' } },
  { id: 'cre-gallery', name: 'Galleri', category: 'Kreativ', align: 'left',
    keywords: ['kreativ', 'galleri', 'kunst', 'rosa', 'utstilling', 'varm'],
    theme: { bg: '#fdf2f8', title: '#831843', text: '#9d174d', accent: '#ec4899', fontHead: 'Raleway', fontBody: 'Lora', style: 'wedge' } },
  { id: 'cre-collage', name: 'Collage', category: 'Kreativ', align: 'center',
    keywords: ['kreativ', 'collage', 'grønn', 'leken', 'energi', 'rute'],
    theme: { bg: '#f0fdf4', title: '#166534', text: '#15803d', accent: '#22c55e', fontHead: 'Righteous', fontBody: 'Nunito', style: 'squares' } },
  { id: 'cre-splash', name: 'Splash', category: 'Kreativ', align: 'center',
    keywords: ['kreativ', 'splash', 'blå', 'gul', 'energi', 'fargerik'],
    theme: { bg: '#eff6ff', title: '#1e40af', text: '#2563eb', accent: '#f59e0b', fontHead: 'Fredoka', fontBody: 'Quicksand', style: 'confetti2' } },
  { id: 'cre-ink', name: 'Blekk', category: 'Kreativ', align: 'left',
    keywords: ['kreativ', 'blekk', 'indigo', 'enkel', 'moderne', 'design'],
    theme: { bg: '#fafafa', title: '#18181b', text: '#3f3f46', accent: '#6366f1', fontHead: 'Outfit', fontBody: 'Inter', style: 'pluses' } },

  // ======================= Lekent =======================
  { id: 'fun-confetti', name: 'Konfetti', category: 'Lekent', align: 'center',
    keywords: ['lekent', 'konfetti', 'fest', 'feiring', 'fargerik', 'barn'],
    theme: { bg: '#eff6ff', title: '#7c3aed', text: '#2563eb', accent: '#fb923c', fontHead: 'Fredoka', fontBody: 'Quicksand', style: 'confetti2' } },
  { id: 'fun-comic', name: 'Tegneserie', category: 'Lekent', align: 'center',
    keywords: ['lekent', 'tegneserie', 'gøy', 'gul', 'sterk', 'barn'],
    theme: { bg: '#fffbeb', title: '#b91c1c', text: '#1f2937', accent: '#facc15', fontHead: 'Bangers', fontBody: 'Quicksand', style: 'pluses' } },
  { id: 'fun-pop', name: 'Pop', category: 'Lekent', align: 'center',
    keywords: ['lekent', 'pop', 'glad', 'rosa', 'energisk', 'morsom'],
    theme: { bg: '#fdf4ff', title: '#86198f', text: '#a21caf', accent: '#e879f9', fontHead: 'Righteous', fontBody: 'Nunito', style: 'squares' } },
  { id: 'fun-candy', name: 'Godteri', category: 'Lekent', align: 'center',
    keywords: ['lekent', 'godteri', 'søt', 'rosa', 'barn', 'glad'],
    theme: { bg: '#fef2f2', title: '#9d174d', text: '#be185d', accent: '#fb7185', fontHead: 'Baloo 2', fontBody: 'Quicksand', style: 'sprinkles' } },
  { id: 'fun-jelly', name: 'Gelé', category: 'Lekent', align: 'center',
    keywords: ['lekent', 'gelé', 'turkis', 'rund', 'myk', 'morsom'],
    theme: { bg: '#ecfeff', title: '#155e75', text: '#0e7490', accent: '#22d3ee', fontHead: 'Chewy', fontBody: 'Nunito', style: 'bubbles' } },
]

// ---------------------------------------------------------------------------
//  Hjelpere – ALT under leser fra TEMPLATES, så nye maler virker automatisk.
// ---------------------------------------------------------------------------

const lc = (s) => String(s || '').toLowerCase()

// Liten redigeringsavstand (for skrivefeil som «elgant» → «elegant»)
function editDist(a, b) {
  if (a === b) return 0
  const m = a.length, n = b.length
  if (!m) return n; if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = cur
  }
  return prev[n]
}

// Synonymer/aliaser → gjør at «blue», «dark», «business» osv. også treffer norske nøkkelord.
const SYN = {
  blue: 'blå', dark: 'mørk', light: 'lys', green: 'grønn', red: 'rød', pink: 'rosa',
  purple: 'lilla', yellow: 'gul', orange: 'oransje', gold: 'gull', black: 'svart',
  white: 'hvit', business: 'business', school: 'skole', nature: 'natur', clean: 'minimal',
  fun: 'lekent', elegant: 'elegant', retro: 'retro', bold: 'bold', food: 'mat', travel: 'reise',
  health: 'helse', tech: 'tech', professional: 'profesjonell', kids: 'barn', playful: 'lekent',
}
const expand = (w) => (SYN[w] ? [w, SYN[w]] : [w])

// Hvor godt matcher ETT søkeord en mal? Returnerer en score (0 = ingen match).
function wordScore(word, hayWords) {
  let best = 0
  for (const w of expand(word)) {
    for (const h of hayWords) {
      if (h === w) best = Math.max(best, 5)
      else if (h.startsWith(w) || w.startsWith(h)) best = Math.max(best, 4)
      else if (h.includes(w) || w.includes(h)) best = Math.max(best, 3)
      else if (w.length >= 4 && editDist(w, h) <= 1) best = Math.max(best, 2)
      else if (w.length >= 5 && editDist(w, h) <= 2) best = Math.max(best, 1)
    }
  }
  return best
}

// Søk på navn + kategori + nøkkelord, og filtrer på kategori.
// Tom query = alle (i kategori). Ellers RANGERES alle maler, og vi viser de
// beste – aldri tomt: finner ikke noe eksakt, kommer NÆRMESTE treff opp.
export function searchTemplates(query = '', category = 'Alle') {
  const inCat = TEMPLATES.filter((t) => !(category && category !== 'Alle' && t.category !== category))
  const q = lc(query).trim()
  if (!q) return inCat

  const words = q.split(/\s+/).filter(Boolean)
  const scored = inCat.map((t) => {
    const hayWords = (lc(t.name) + ' ' + lc(t.category) + ' ' + (t.keywords || []).map(lc).join(' ')).split(/\s+/).filter(Boolean)
    let total = 0, allHit = true
    for (const word of words) {
      const s = wordScore(word, hayWords)
      if (s === 0) allHit = false
      total += s
    }
    return { t, total, allHit }
  })

  // 1) maler der ALLE søkeordene traff noe – best først
  const strict = scored.filter((x) => x.allHit && x.total > 0).sort((a, b) => b.total - a.total)
  if (strict.length) return strict.map((x) => x.t)
  // 2) ellers: nærmeste treff (minst ett ord traff), best først
  const loose = scored.filter((x) => x.total > 0).sort((a, b) => b.total - a.total)
  if (loose.length) return loose.map((x) => x.t)
  // 3) fant ingenting i det hele tatt → vis alt i kategorien (aldri tomt)
  return inCat
}

// Et ekte lite forhåndsvisnings-lysbilde (forside) bygget med malens tema/stil + figurer.
export function sampleSlideForTemplate(t, title) {
  const th = normalizeTheme({ ...t.theme })
  const cover = buildSlide({
    layout: 'cover',
    title: title || t.name,
    subtitle: 'Slik ser denne malen ut',
    style: t.theme.style,
  }, th, 0)
  return withFigures(cover, figureEls(t, th))
}

// Ny presentasjon FRA en mal: én pen forside i malens stil (med figurer). Teksten
// kan brukeren endre etterpå; ingenting er låst.
export function deckFromTemplate(title, t) {
  const th = normalizeTheme({ ...t.theme })
  const cover = buildSlide({
    layout: 'cover',
    title: title || 'Ny presentasjon',
    subtitle: 'Trykk for å skrive din egen undertittel',
    style: t.theme.style,
  }, th, 0)
  const body = buildSlide({
    layout: 'bullets',
    title: 'Første tema',
    bullets: ['Skriv ditt eget innhold her', 'Legg til så mange punkter du vil', 'Bytt mal når som helst – teksten beholdes'],
    style: t.theme.style,
  }, th, 1)
  return { theme: th, title: title || 'Ny presentasjon', slides: [withFigures(tidySlide(cover), figureEls(t, th)), tidySlide(body)] }
}

// Bytt mal UNDERVEIS: behold ALL tekst og alle ekte bilder nøyaktig, men bytt det
// visuelle (farger, fonter, stil, bakteppe) til den nye malen. Gamle silhuetter/
// figurer fjernes, og den NYE malens figurer settes inn. Rydder hvert lysbilde så
// ingenting overlapper eller kuttes.
export function applyTemplateToDeck(deck, t, scope = 'all', idx = 0) {
  const th = normalizeTheme({ ...t.theme })
  // align gir en synlig plasseringsforskjell på overskriftene uten å røre brødtekst-lister
  const tweaks = (t.align === 'center' || t.align === 'left' || t.align === 'right')
    ? { align: t.align, applyTo: 'headings' } : null
  const inScope = (i) => scope === 'all' || i === idx
  // Fjern gamle silhuetter og dekor-figurer på sidene som bytter mal – behold ALL tekst og ekte bilder.
  const stripFigures = (s) => ({
    ...s,
    elements: s.elements.filter((e) => !(e.kind === 'silhouette' || (e.decor && e.type === 'image'))),
  })
  const cleaned = { ...deck, slides: deck.slides.map((s, i) => (inScope(i) ? stripFigures(s) : s)) }
  let nd = applyTheme(cleaned, th, scope, idx, tweaks)
  nd = {
    ...nd,
    slides: nd.slides.map((s, i) => (inScope(i) ? withFigures(tidySlide(s), figureEls(t, th)) : s)),
  }
  return nd
}
