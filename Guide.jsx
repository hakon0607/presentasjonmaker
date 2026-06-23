import { SILHOUETTES } from './silhouettes'

export const CW = 960
export const CH = 540


export const FONTS = [
  // Sans
  'Inter', 'Poppins', 'Montserrat', 'Nunito', 'Quicksand', 'Space Grotesk', 'Work Sans', 'Raleway', 'Rubik', 'Manrope', 'DM Sans', 'Outfit', 'Sora', 'Plus Jakarta Sans', 'Figtree', 'Barlow', 'Cabin', 'Mulish', 'Karla',
  // Serif
  'Playfair Display', 'Lora', 'DM Serif Display', 'Abril Fatface', 'Merriweather', 'PT Serif', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville', 'Bitter', 'Spectral', 'Frank Ruhl Libre',
  // Display
  'Bebas Neue', 'Anton', 'Oswald', 'Archivo Black', 'Bangers', 'Righteous', 'Fjalla One', 'Staatliches', 'Teko', 'Alfa Slab One', 'Titan One', 'Bungee', 'Passion One', 'Russo One', 'Luckiest Guy', 'Shrikhand', 'Bowlby One SC', 'Chewy',
  // Skript / håndskrift
  'Caveat', 'Pacifico', 'Lobster', 'Dancing Script', 'Satisfy', 'Great Vibes', 'Sacramento', 'Kaushan Script', 'Permanent Marker', 'Shadows Into Light', 'Indie Flower', 'Patrick Hand', 'Amatic SC', 'Courgette',
  // Mono / runde
  'Roboto Mono', 'JetBrains Mono', 'IBM Plex Mono', 'Fredoka', 'Baloo 2',
]

export const THEMES = {
  minimal:   { name: 'Minimal',    bg: '#ffffff', title: '#0f172a', text: '#334155', accent: '#2563eb', fontHead: 'Poppins',          fontBody: 'Inter' },
  midnight:  { name: 'Midnatt',    bg: '#0f172a', title: '#ffffff', text: '#cbd5e1', accent: '#38bdf8', fontHead: 'Space Grotesk',    fontBody: 'Inter' },
  editorial: { name: 'Editorial',  bg: '#faf6ef', title: '#1f2937', text: '#3f3f46', accent: '#b45309', fontHead: 'Playfair Display', fontBody: 'Lora' },
  sunset:    { name: 'Solnedgang', bg: '#fff7ed', title: '#7c2d12', text: '#9a3412', accent: '#ea580c', fontHead: 'Montserrat',       fontBody: 'Inter' },
  grape:     { name: 'Drue',       bg: '#1e1b4b', title: '#ffffff', text: '#ddd6fe', accent: '#a78bfa', fontHead: 'Poppins',          fontBody: 'Inter' },
  forest:    { name: 'Skog',       bg: '#f0fdf4', title: '#14532d', text: '#3f6212', accent: '#16a34a', fontHead: 'Montserrat',       fontBody: 'Lora' },
  playful:   { name: 'Lekent',     bg: '#eaf7ff', title: '#ff3d9a', text: '#2b3a55', accent: '#ffb300', fontHead: 'Fredoka',          fontBody: 'Quicksand', decor: 'confetti' },
  watercolor:{ name: 'Akvarell',   bg: '#f7faf8', title: '#5b6f9c', text: '#5a6577', accent: '#8aa6c1', fontHead: 'Caveat',           fontBody: 'Quicksand', decor: 'blobs' },
  pastel:    { name: 'Pastell',    bg: '#fbf7f4', title: '#1f2430', text: '#6b7280', accent: '#e0908f', fontHead: 'Montserrat',       fontBody: 'Nunito',    decor: 'botanical' },
}

export const genId = () => Math.random().toString(36).slice(2, 9)

export function textEl(p) {
  return { id: genId(), type: 'text', x: 80, y: 220, w: 800, h: 100, text: 'Tekst',
    fontFamily: 'Inter', fontSize: 24, color: '#334155', bold: false, italic: false, underline: false, align: 'left', lineHeight: 1.3,
    letterSpacing: 0, highlight: '', list: 'none', opacity: 1, rotation: 0, locked: false, ...p }
}
export function imageEl(p) { return { id: genId(), type: 'image', x: 560, y: 120, w: 320, h: 300, src: '', caption: 'Sett inn bilde', fit: 'cover', pos: '50% 50%', opacity: 1, rotation: 0, locked: false, ...p } }
export function shapeEl(p) { return { id: genId(), type: 'shape', kind: 'rect', x: 80, y: 80, w: 120, h: 8, fill: '#2563eb', radius: 4, opacity: 1, stroke: '', strokeW: 0, rotation: 0, blur: 0, locked: false, ...p } }
export function tableEl(p) {
  return { id: genId(), type: 'table', x: 140, y: 180, w: 680, h: 220,
    rows: [['Kolonne A', 'Kolonne B'], ['Rad 1', ''], ['Rad 2', '']],
    fontSize: 20, color: '#334155', header: true, accent: '#2563eb', opacity: 1, rotation: 0, locked: false, ...p }
}

const bullets = (arr) => (arr || []).map((b) => '•  ' + b).join('\n')

// Dekorative bakgrunns-elementer som gir hvert tema sitt preg.
function decorEls(th, big) {
  const out = []
  const circ = (x, y, d, fill, op) => ({ ...shapeEl({ x, y, w: d, h: d, fill, radius: d / 2, opacity: op }), decor: true })
  const emoji = (x, y, e, size) => ({ ...textEl({ x, y, w: size + 30, h: size + 30, text: e, fontSize: size, align: 'center' }), decor: true })
  if (th.decor === 'confetti') {
    out.push(circ(-40, -40, 150, '#a78bfa', 1), circ(150, -70, 90, '#34d399', 1), circ(860, 380, 170, '#fbbf24', 1))
  } else if (th.decor === 'blobs') {
    out.push(circ(-70, -60, 220, th.accent, 0.22), circ(820, 350, 240, '#bcd3c4', 0.28), circ(810, -50, 130, th.accent, 0.16))
  } else if (th.decor === 'botanical') {
    out.push(circ(-60, 320, 200, '#ecc6c5', 0.55), circ(850, -50, 170, '#bcd3c4', 0.55), circ(60, -60, 110, '#ecc6c5', 0.4))
  }
  return out
}

// Slidesgo-inspirert auto-design: myke fargeflater (blur) + en dempet tema-silhuett.
// Alt er decor:true (alltid synlig bakgrunn, ikke en del av element-animasjonene).
// Bland to hex-farger (t = 0..1)
function mix(hex, target, t) {
  const a = String(hex || '').replace('#', ''); const b = String(target || '').replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(a) || !/^[0-9a-fA-F]{6}$/.test(b)) return hex
  const h = (c) => parseInt(c, 16); const x = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return '#' + x(h(a.slice(0, 2)) * (1 - t) + h(b.slice(0, 2)) * t) + x(h(a.slice(2, 4)) * (1 - t) + h(b.slice(2, 4)) * t) + x(h(a.slice(4, 6)) * (1 - t) + h(b.slice(4, 6)) * t)
}

// Dekor-byggere (alle decor:true)
const dCirc = (x, y, d, fill, op = 1) => ({ ...shapeEl({ kind: 'circle', x, y, w: d, h: d, fill, opacity: op }), decor: true })
const dRing = (x, y, d, stroke, sw, op = 1) => ({ ...shapeEl({ kind: 'circle', x, y, w: d, h: d, fill: 'transparent', stroke, strokeW: sw, opacity: op }), decor: true })
const dTri = (x, y, d, fill, op = 1) => ({ ...shapeEl({ kind: 'triangle', x, y, w: d, h: d, fill, opacity: op }), decor: true })
const dSq = (x, y, d, fill, op = 1) => ({ ...shapeEl({ kind: 'rect', x, y, w: d, h: d, fill, radius: 6, opacity: op }), decor: true })
const dLine = (x, y, w, fill, h = 6) => ({ ...shapeEl({ kind: 'line', x, y, w, h, fill }), decor: true })
const dBar = (x, y, w, h, fill, rot = 0, op = 1) => ({ ...shapeEl({ kind: 'rect', x, y, w, h, fill, radius: 2, rotation: rot, opacity: op }), decor: true })
const dotGrid = (x0, y0, cols, rows, gap, d, fill, op) => { const o = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) o.push(dCirc(x0 + c * gap, y0 + r * gap, d, fill, op)); return o }

// Slidesgo-aktige design-stiler. AI velger hvilken som passer temaet.
const DECOR_STYLES = {
  corners: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.45), T = th.title
    const o = [dCirc(-150, -160, 330, A, 0.92), dRing(CW - 130, CH - 140, 270, A, 12, 0.85), dCirc(CW - 56, 54, 64, L, 0.9)]
    if (big) o.push(dCirc(CW - 150, CH - 150, 90, L, 0.9), dCirc(140, CH - 64, 16, T, 0.5)); return o },
  bubbles: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    const o = [dCirc(-90, -100, 250, L, 0.85), dCirc(70, -130, 150, A, 0.9), dRing(-50, CH - 150, 210, A, 9, 0.75), dCirc(CW - 130, CH - 120, 210, L, 0.85), dCirc(CW - 44, CH - 70, 96, A, 0.9), dCirc(CW - 92, 70, 30, A, 0.85)]
    if (big) o.push(dCirc(60, CH - 70, 20, A, 0.8)); return o },
  memphis: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.4), T = th.title, D = mix(th.accent, '#000000', 0.22)
    const o = [dRing(36, 40, 74, A, 8, 0.9), dTri(CW - 120, 50, 76, L, 0.9), dSq(CW - 74, CH - 124, 50, A, 0.85), dCirc(-70, CH / 2 - 60, 130, L, 0.6), dLine(CW - 170, CH - 56, 96, A, 8), ...dotGrid(60, CH - 96, 3, 2, 22, 12, T, 0.6)]
    if (big) o.push(dTri(120, 150, 30, D, 0.7), dCirc(CW / 2, 26, 16, A, 0.7)); return o },
  rings: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dRing(-120, -120, 300, A, 14, 0.85), dRing(-60, -60, 180, L, 10, 0.85), dRing(CW - 150, CH - 150, 280, A, 12, 0.7), dCirc(CW - 30, 90, 56, L, 0.85), dCirc(60, CH - 60, 22, A, 0.8)] },
  dots: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [...dotGrid(CW - 156, 28, 5, 4, 30, 10, A, 0.55), dCirc(-110, CH - 110, 250, L, 0.85), dRing(64, 64, 92, A, 9, 0.7), dCirc(CW - 40, CH - 70, 60, A, 0.6)] },
  wave: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dCirc(-170, CH - 80, 300, L, 0.8), dCirc(110, CH - 30, 250, A, 0.5), dCirc(CW - 250, CH - 50, 300, L, 0.7), dCirc(CW - 70, -120, 230, A, 0.45)] },
  frame: (th, big) => { const A = th.accent, T = th.title
    return [dBar(40, 40, 130, 6, A, 0, 0.9), dBar(40, 40, 6, 130, A, 0, 0.9), dBar(CW - 170, CH - 46, 130, 6, A, 0, 0.9), dBar(CW - 46, CH - 170, 6, 130, A, 0, 0.9), dCirc(CW - 72, 72, 14, A, 0.85), dCirc(72, CH - 72, 14, T, 0.5)] },
  triangles: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.4), D = mix(th.accent, '#000000', 0.22)
    return [dTri(-34, -24, 170, L, 0.7), dTri(CW - 130, CH - 130, 160, A, 0.5), dTri(CW - 78, 44, 64, D, 0.7), dTri(54, CH - 96, 48, A, 0.6), dLine(CW - 150, 70, 90, A, 6)] },
  grid: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5); const o = []
    for (let i = 0; i < 6; i++) o.push(dBar(CW - 184 + i * 30, 22, 2, 150, A, 0, 0.32))
    for (let j = 0; j < 5; j++) o.push(dBar(CW - 184, 22 + j * 30, 152, 2, A, 0, 0.32))
    o.push(dCirc(-90, CH - 90, 220, L, 0.7), dSq(60, 60, 42, A, 0.7)); return o },
  stripes: (th, big) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.45); const o = []
    for (let i = 0; i < 5; i++) o.push(dBar(-50 + i * 50, -70, 22, 280, i % 2 ? L : A, 25, 0.55))
    o.push(dCirc(CW - 80, CH - 80, 130, L, 0.55), dCirc(CW - 30, CH - 30, 50, A, 0.6)); return o },
  arch: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dRing(-150, -150, 360, A, 16, 0.7), dRing(-110, -110, 270, L, 12, 0.7), dRing(-70, -70, 180, A, 9, 0.7), dCirc(CW - 60, CH - 60, 40, A, 0.7)] },
  confetti2: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.4), D = mix(th.accent, '#000000', 0.2), T = th.title
    return [dCirc(60, 60, 18, A, 0.8), dRing(120, 40, 26, A, 5, 0.7), dSq(CW - 90, 60, 20, L, 0.8), dTri(CW - 50, 120, 24, D, 0.7), dCirc(CW - 70, CH - 80, 22, A, 0.8), dRing(70, CH - 90, 30, T, 5, 0.5), dCirc(CW / 2, 40, 12, L, 0.7), dSq(60, CH - 60, 16, A, 0.7)] },
  bigblob: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.45)
    return [dCirc(CW - 280, -160, 460, A, 0.85), dCirc(-80, CH - 120, 200, L, 0.7), dCirc(120, CH - 60, 30, A, 0.7)] },
  diagonal: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dBar(-60, -40, 60, 360, A, 32, 0.8), dBar(20, -60, 30, 360, L, 32, 0.7), dCirc(CW - 70, CH - 70, 120, L, 0.6), dCirc(CW - 40, CH - 40, 46, A, 0.7)] },
  brackets: (th) => { const A = th.accent
    return [dBar(46, 46, 90, 5, A, 0, 0.9), dBar(46, 46, 5, 90, A, 0, 0.9), dBar(CW - 136, 46, 90, 5, A, 0, 0.9), dBar(CW - 51, 46, 5, 90, A, 0, 0.9), dBar(46, CH - 51, 90, 5, A, 0, 0.9), dBar(46, CH - 136, 5, 90, A, 0, 0.9), dBar(CW - 136, CH - 51, 90, 5, A, 0, 0.9), dBar(CW - 51, CH - 136, 5, 90, A, 0, 0.9)] },
  halfTop: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dCirc(CW / 2 - 320, -480, 640, A, 0.16), dCirc(CW - 70, CH - 70, 120, L, 0.6), dCirc(70, CH - 50, 40, A, 0.6)] },
  sidebar: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dBar(-20, -20, 120, CH + 40, A, 0, 0.14), dCirc(50, 70, 36, A, 0.8), dCirc(54, CH - 90, 24, L, 0.7)] },
  topband: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dBar(-20, -20, CW + 40, 90, A, 0, 0.14), dCirc(CW - 80, 24, 30, L, 0.8), dCirc(60, CH - 80, 140, L, 0.5)] },
  pluses: (th) => { const A = th.accent, T = th.title; const o = []
    const plus = (x, y, s, c, op) => { o.push(dBar(x - s / 2, y - s / 8, s, s / 4, c, 0, op), dBar(x - s / 8, y - s / 2, s / 4, s, c, 0, op)) }
    plus(70, 60, 34, A, 0.7); plus(CW - 80, 90, 30, A, 0.6); plus(CW - 60, CH - 80, 36, T, 0.4); plus(110, CH - 70, 26, A, 0.6); plus(CW / 2, 44, 22, A, 0.5)
    o.push(dCirc(-90, CH - 90, 200, mix(A, '#ffffff', 0.5), 0.6)); return o },
  squares: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.4), D = mix(th.accent, '#000000', 0.2)
    return [dSq(-30, -30, 130, L, 0.7), dSq(80, -50, 60, A, 0.7), dSq(CW - 120, CH - 120, 150, A, 0.5), dSq(CW - 60, CH - 60, 50, D, 0.7), dSq(CW - 70, 50, 40, L, 0.7)] },
  sprinkles: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5); const o = [...dotGrid(40, 40, 3, 3, 26, 10, A, 0.5), ...dotGrid(CW - 110, CH - 110, 3, 3, 26, 10, A, 0.5)]
    o.push(dRing(CW - 90, 60, 40, A, 6, 0.6), dCirc(70, CH - 70, 36, L, 0.7)); return o },
  wedge: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.45)
    return [dTri(-10, -10, 200, A, 0.85), dTri(CW - 190, CH - 190, 200, L, 0.7), dCirc(CW - 60, 70, 30, A, 0.7), dCirc(80, CH - 60, 20, A, 0.6)] },
  orbit: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5); const o = [dRing(CW - 200, -90, 300, A, 8, 0.6)]
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; o.push(dCirc(CW - 50 + Math.cos(a) * 150 - 8, 60 + Math.sin(a) * 150 - 8, 16, A, 0.7)) }
    o.push(dCirc(-80, CH - 80, 180, L, 0.6)); return o },
  ribbon: (th) => { const A = th.accent, L = mix(th.accent, '#ffffff', 0.5)
    return [dBar(-80, CH / 2 - 30, CW + 160, 60, A, -12, 0.12), dCirc(CW - 70, 60, 36, A, 0.7), dCirc(70, CH - 70, 28, L, 0.7)] },
}
const STYLE_IDS = Object.keys(DECOR_STYLES)

// Komponerer bakteppet: Slidesgo-aktig design-stil i temaets farger.
function autoBackdrop(th, big, styleId, idx = 0) {
  const style = DECOR_STYLES[styleId] || DECOR_STYLES.corners
  const out = style(th, big)
  // Speil annenhver side så ikke alle lysbildene ser helt like ut
  if (idx % 2 === 1) out.forEach((e) => { e.x = CW - e.x - e.w; if (e.rotation) e.rotation = -e.rotation })
  // Sikring: store, solide former dempes så de aldri blir en solid blokk oppå teksten
  out.forEach((e) => {
    const isRing = !e.fill || e.fill === 'transparent'
    if (!isRing && (e.w >= 200 || e.h >= 200) && (e.opacity ?? 1) > 0.25) e.opacity = 0.2
  })
  return out
}

// Figur-ikon (hentet fra nett-album) som dekorativt hjørne-element øverst til høyre (unngår teksten).
export function figureDecor(src, layout) {
  const sz = 96
  // Trygt, ledig hjørne for hver layout (unngår tittel, tekst og bilder)
  let x = CW - sz - 24, y = CH - sz - 22 // standard: nederst til høyre
  if (layout === 'cover' || layout === 'section') { x = CW - sz - 30; y = CH - sz - 26 }
  else if (layout === 'imageText') { x = 70; y = CH - sz - 26 } // bilde til høyre → figur nede til venstre under tekst
  else if (layout === 'imageFull') { x = CW - sz - 24; y = 36 } // bilde fyller midten → figur oppe til høyre
  else if (layout === 'twoColumn') { x = CW / 2 - sz / 2; y = CH - sz - 18 } // mellom kolonnene nederst
  else if (layout === 'statement') { x = CW - sz - 26; y = CH - sz - 24 }
  return { ...imageEl({ src, x, y, w: sz, h: sz, fit: 'contain', opacity: 0.85, caption: '' }), decor: true }
}

const asTheme = (t) => (typeof t === 'string' ? (THEMES[t] || THEMES.minimal) : (t || THEMES.minimal))

// Validerer/renser et tema (fra AI eller gammelt nøkkel-format) til et trygt tema-objekt.
// Tolker enkle norske fargekommandoer DETERMINISTISK (uten AI) så fargen alltid havner i riktig felt.
// Returnerer { title?, text?, bg?, accent? } eller null hvis den ikke er sikker (da brukes AI).
const NO_COLORS = [
  ['lyseblå', '#93c5fd'], ['lyse blå', '#93c5fd'], ['mørkeblå', '#1e3a8a'], ['mørk blå', '#1e3a8a'], ['marineblå', '#1e3a8a'],
  ['lysegrå', '#d1d5db'], ['lyse grå', '#d1d5db'], ['mørkegrå', '#374151'], ['mørk grå', '#374151'],
  ['lysegrønn', '#86efac'], ['mørkegrønn', '#166534'], ['turkis', '#14b8a6'],
  ['mørkerød', '#991b1b'], ['mørk rød', '#991b1b'], ['burgunder', '#7f1d1d'],
  ['blå', '#2563eb'], ['blått', '#2563eb'], ['rød', '#dc2626'], ['rødt', '#dc2626'], ['grønn', '#16a34a'], ['grønt', '#16a34a'],
  ['hvit', '#ffffff'], ['hvitt', '#ffffff'], ['svart', '#111111'], ['svart', '#111111'],
  ['gul', '#facc15'], ['gult', '#facc15'], ['grå', '#6b7280'], ['grått', '#6b7280'],
  ['rosa', '#ec4899'], ['lyserosa', '#f9a8d4'], ['lilla', '#7c3aed'], ['fiolett', '#7c3aed'],
  ['oransje', '#f97316'], ['brun', '#92400e'], ['brunt', '#92400e'], ['beige', '#efe7d3'], ['krem', '#fdf6e3'],
  ['gull', '#d4af37'], ['gyllen', '#d4af37'], ['sølv', '#c0c0c0'],
]
export function parseColorInstruction(text) {
  const t = ' ' + String(text || '').toLowerCase().trim() + ' '
  // Hvis det handler om å flytte/legge til/fjerne, er det ikke en ren fargekommando → la AI ta den
  if (/\b(flytt|bytt|st[øo]rre|mindre|midtstill|venstrejuster|h[øo]yrejuster|legg til|fjern|slett|lag (en|ny|et)|roter|animer)\b/.test(t)) return null
  const findColor = (seg) => {
    for (const [name, hex] of NO_COLORS) { if (seg.includes(name)) return { hex, name } }
    // "mørk/mørkt" alene = mørk tekstfarge, "lys/lyst" alene = lys
    if (/\bm[øo]rk(t|e)?\b/.test(seg)) return { hex: '#111111', name: 'mørk' }
    if (/\blys(t|e)?\b/.test(seg)) return { hex: '#f3f4f6', name: 'lys' }
    return null
  }
  const targetOf = (seg) => {
    if (/(overskrift|tittel|titler|heading)/.test(seg)) return 'title'
    if (/(bakgrunn|bakgrunnen|\bbg\b)/.test(seg)) return 'bg'
    if (/(aksent|detalj|detaljer|pynt|strek|stripe|kant)/.test(seg)) return 'accent'
    if (/(br[øo]dtekst|punkt|punkter|kulepunkt|skrift|skriften|tekst|teksten)/.test(seg)) return 'text'
    return null
  }
  // Del opp i biter på komma / "og" / "med" / punktum
  const segs = t.split(/,| og | med |\.|;/).map((s) => s.trim()).filter(Boolean)
  const out = {}
  let any = false
  for (const seg of segs) {
    const col = findColor(seg); const tgt = targetOf(seg)
    if (col && tgt) { out[tgt] = col.hex; any = true }
  }
  // Spesialtilfelle: bare én farge nevnt uten felt, men sammen med "tekst/overskrift" i hele strengen
  if (!any) {
    const col = findColor(t); const tgt = targetOf(t)
    if (col && tgt) { out[tgt] = col.hex; any = true }
  }
  return any ? out : null
}

export function normalizeTheme(t) {
  if (!t) return THEMES.minimal
  if (typeof t === 'string') return THEMES[t] || THEMES.minimal
  const hex = (c, d) => { const v = String(c || '').replace('#', ''); return /^[0-9a-fA-F]{6}$/.test(v) ? '#' + v : d }
  // Godta enhver rimelig font-streng (også system-fonter som Arial/Times), ikke bare de innebygde
  const font = (f, d) => { const s = String(f || '').trim(); return (s && s.length <= 40 && /^[\w\s'-]+$/.test(s)) ? s : d }
  const def = THEMES.minimal
  return {
    name: t.name || 'Egendefinert',
    bg: hex(t.bg, def.bg), title: hex(t.title, def.title), text: hex(t.text, def.text), accent: hex(t.accent, def.accent),
    fontHead: font(t.fontHead, 'Poppins'), fontBody: font(t.fontBody, 'Inter'),
    decor: ['confetti', 'blobs', 'botanical', 'none'].includes(t.decor) ? t.decor : 'none',
    style: (typeof t.style === 'string' && DECOR_STYLES[t.style]) ? t.style : undefined,
  }
}

export function blankSlide(theme = 'minimal') {
  const th = asTheme(theme)
  return { id: genId(), background: th.bg, elements: [
    ...decorEls(th, false),
    textEl({ x: 80, y: 70, w: 800, h: 90, text: 'Ny tittel', fontFamily: th.fontHead, fontSize: 44, bold: true, color: th.title }),
    shapeEl({ x: 82, y: 150, w: 80, h: 6, fill: th.accent, radius: 3 }),
    textEl({ x: 80, y: 190, w: 800, h: 270, text: 'Skriv innholdet her …', fontFamily: th.fontBody, fontSize: 24, color: th.text }),
  ] }
}

function fitFont(text, base, boxW, boxH, lineH = 1.14, min = 16, charW = 0.52) {
  const t = String(text || '')
  if (!t) return base
  let size = base
  while (size > min) {
    const perLine = Math.max(1, Math.floor(boxW / (size * charW)))
    const lines = t.split('\n').reduce((acc, ln) => acc + Math.max(1, Math.ceil((ln.length || 1) / perLine)), 0)
    if (lines * size * lineH <= boxH - 4) break
    size -= 1
  }
  return Math.max(min, size)
}

// Fjerner tilfeldige nettadresser/domener (f.eks. «fido.no») fra AI-tekst
function scrubText(str) {
  if (typeof str !== 'string') return str
  return str.replace(/\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]{2,}\.(?:no|com|org|net|io|co|info|biz|app|dev)\b(?:\/\S*)?/gi, '').replace(/\s{2,}/g, ' ').trim()
}
function scrubSlide(s) {
  const w = (v) => Array.isArray(v) ? v.map(w) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, val]) => [k, w(val)])) : scrubText(v)
  return w(s)
}

function buildSlide(s, th, slideIdx = 0) {
  s = scrubSlide(s)
  const L = s.layout || 'bullets'
  const big = (L === 'cover' || L === 'section')
  const els = [...autoBackdrop(th, big, s.style, slideIdx)]
  const baseDecorN = els.length
  const accentBar = (x, y, w = 70) => shapeEl({ x, y, w, h: 5, fill: th.accent, radius: 3 })
  const card = (x, y, w, h, op = 0.10) => ({ ...shapeEl({ kind: 'rect', x: x - 24, y: y - 18, w: w + 48, h: h + 34, fill: th.accent, radius: 24, opacity: op }), decor: true })
  const wantCard = slideIdx % 2 === 0
  const icon = () => null
  const push = (e) => e && els.push(e)

  if (L === 'cover') {
    push(icon(435, 96, 60))
    push(textEl({ x: 90, y: 178, w: 780, h: 124, text: s.title || 'Tittel', fontFamily: th.fontHead, fontSize: fitFont(s.title || 'Tittel', 56, 780, 124, 1.12, 28), bold: true, color: th.title, align: 'center', lineHeight: 1.12 }))
    push(accentBar(430, 318, 100))
    if (s.subtitle) push(textEl({ x: 140, y: 342, w: 680, h: 70, text: s.subtitle, fontFamily: th.fontBody, fontSize: fitFont(s.subtitle, 24, 680, 60, 1.2, 16), color: th.text, align: 'center' }))
  } else if (L === 'section') {
    push(shapeEl({ x: 80, y: 205, w: 12, h: 130, fill: th.accent, radius: 6 }))
    push(icon(112, 150, 54))
    push(textEl({ x: 120, y: 232, w: 740, h: 120, text: s.title || '', fontFamily: th.fontHead, fontSize: fitFont(s.title, 46, 740, 120, 1.12, 24), bold: true, color: th.title, lineHeight: 1.12 }))
  } else if (L === 'statement') {
    push(card(110, 184, 740, 168, 0.12))
    push(accentBar(430, 150, 100))
    push(textEl({ x: 110, y: 184, w: 740, h: 210, text: s.statement || s.title || '', fontFamily: th.fontHead, fontSize: fitFont(s.statement || s.title, 42, 740, 210, 1.25, 22), bold: true, color: th.title, align: 'center', lineHeight: 1.25 }))
    if (s.subtitle) push(textEl({ x: 160, y: 410, w: 640, h: 60, text: s.subtitle, fontFamily: th.fontBody, fontSize: fitFont(s.subtitle, 22, 640, 50, 1.2, 15), color: th.text, align: 'center', italic: true }))
  } else if (L === 'imageText') {
    push(textEl({ x: 70, y: 60, w: 470, h: 84, text: s.title || '', fontFamily: th.fontHead, fontSize: fitFont(s.title, 34, 470, 84, 1.12, 18), bold: true, color: th.title, lineHeight: 1.12 }))
    push(accentBar(72, 150, 60))
    if (wantCard) push(card(70, 180, 470, 300))
    push(textEl({ x: 70, y: 180, w: 470, h: 320, text: bullets(s.bullets), fontFamily: th.fontBody, fontSize: fitFont(bullets(s.bullets), 22, 470, 310, 1.55, 14, 0.5), color: th.text, lineHeight: 1.5 }))
    push(imageEl({ x: 580, y: 90, w: 320, h: 360, src: '', caption: s.image?.caption || 'Sett inn bilde' }))
  } else if (L === 'imageFull') {
    push(textEl({ x: 70, y: 44, w: 820, h: 70, text: s.title || '', fontFamily: th.fontHead, fontSize: fitFont(s.title, 34, 820, 70, 1.12, 18), bold: true, color: th.title, lineHeight: 1.12 }))
    push(accentBar(72, 120, 60))
    push(imageEl({ x: 90, y: 146, w: 780, h: 352, src: '', caption: s.image?.caption || 'Sett inn et stort bilde her' }))
  } else if (L === 'twoColumn') {
    push(textEl({ x: 80, y: 52, w: 800, h: 66, text: s.title || '', fontFamily: th.fontHead, fontSize: fitFont(s.title, 36, 800, 66, 1.12, 18), bold: true, color: th.title, lineHeight: 1.12 }))
    push(accentBar(82, 130))
    const cols = s.columns || []
    const c = (col, x) => {
      if (wantCard) push(card(x, 156, 380, 322))
      push(textEl({ x, y: 162, w: 380, h: 44, text: (col?.heading) || '', fontFamily: th.fontHead, fontSize: fitFont(col?.heading, 22, 380, 40, 1.12, 15), bold: true, color: th.accent }))
      push(textEl({ x, y: 210, w: 380, h: 268, text: bullets(col?.bullets), fontFamily: th.fontBody, fontSize: fitFont(bullets(col?.bullets), 20, 380, 260, 1.55, 13, 0.5), color: th.text, lineHeight: 1.5 }))
    }
    c(cols[0], 80); c(cols[1], 500)
  } else {
    push(textEl({ x: 80, y: 52, w: 690, h: 78, text: s.title || '', fontFamily: th.fontHead, fontSize: fitFont(s.title, 38, 690, 78, 1.12, 18), bold: true, color: th.title, lineHeight: 1.12 }))
    push(accentBar(82, 138))
    if (wantCard) push(card(80, 174, 800, 300))
    push(textEl({ x: 80, y: 174, w: 800, h: 320, text: bullets(s.bullets), fontFamily: th.fontBody, fontSize: fitFont(bullets(s.bullets), 25, 800, 312, 1.5, 14, 0.5), color: th.text, lineHeight: 1.5 }))
  }
  // Auto-animasjon med MYE LIV: varierte presets + stagger
  const content = els.filter((e) => !e.decor)
  const flow = ['fadeUp', 'slideRight', 'zoomIn', 'fadeUp', 'pop']
  content.forEach((e, i) => {
    let type
    if (e.type === 'image') type = 'zoomIn'
    else if (e.type === 'shape') type = i === 0 ? 'fadeIn' : 'pop'
    else type = flow[i % flow.length]
    e.anim = { type, start: (e.type === 'shape' && i > 0) ? 'with' : 'after', order: i }
  })
  // Variert overgang mellom lysbildene for ekstra bevegelse
  const trans = big ? 'zoom' : ['slideLeft', 'slideUp', 'fade', 'slideLeft'][slideIdx % 4]
  return { id: genId(), background: th.bg, elements: els, notes: typeof s.notes === 'string' ? s.notes : '', anim: { transition: trans }, layout: L, style: s.style || 'corners' }
}

// Måler hvor høy en tekstboks må være for å romme teksten ved gitt bredde/font/størrelse
export function measureTextHeight(el) {
  if (typeof document === 'undefined' || !el || el.type !== 'text') return el?.h
  const d = document.createElement('div')
  d.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:-9999px;box-sizing:border-box;white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;padding:0'
  d.style.width = (el.w || 200) + 'px'
  d.style.fontFamily = `'${el.fontFamily}', sans-serif`
  d.style.fontSize = (el.fontSize || 24) + 'px'
  d.style.fontWeight = el.bold ? '700' : '400'
  d.style.fontStyle = el.italic ? 'italic' : 'normal'
  d.style.lineHeight = String(el.lineHeight || 1.3)
  d.style.letterSpacing = (el.letterSpacing || 0) + 'px'
  d.style.textAlign = el.align || 'left'
  d.textContent = (el.text && String(el.text).length) ? String(el.text) : 'Xg'
  document.body.appendChild(d)
  const h = Math.ceil(d.getBoundingClientRect().height)
  document.body.removeChild(d)
  return Math.max(el.fontSize || 24, h + 2)
}
// Returnerer en tekstboks med høyde tilpasset innholdet (uten å flytte utenfor lerretet)
export function fitTextBox(el) {
  if (!el || el.type !== 'text') return el
  const h = measureTextHeight(el)
  const y = Math.max(0, Math.min(540 - h, el.y))
  return { ...el, h, y }
}

export function slidesFromAi(aiSlides, theme = 'minimal') {
  const th = asTheme(theme)
  return (aiSlides || []).map((s, i) => buildSlide(s, th, i))
}

export function newDeck(title = 'Uten tittel', theme = 'minimal') {
  const th = asTheme(theme)
  return { theme: th, slides: [blankSlide(th)], title }
}

// ===== Endre tema underveis (behold tekst/bilder, bytt farger) =====
export const PRESET_THEMES = [
  ...Object.values(THEMES),
  { name: 'Hav',        bg: '#ecfeff', title: '#164e63', text: '#155e75', accent: '#0891b2', fontHead: 'Montserrat', fontBody: 'Inter' },
  { name: 'Rose',       bg: '#fff1f2', title: '#881337', text: '#9f1239', accent: '#e11d48', fontHead: 'Playfair Display', fontBody: 'Lora' },
  { name: 'Neon',       bg: '#0a0a0a', title: '#ffffff', text: '#d4d4d8', accent: '#a3e635', fontHead: 'Bebas Neue', fontBody: 'Inter' },
  { name: 'Godteri',    bg: '#fdf4ff', title: '#701a75', text: '#86198f', accent: '#d946ef', fontHead: 'Fredoka', fontBody: 'Quicksand' },
  { name: 'Kaffe',      bg: '#1c1917', title: '#fafaf9', text: '#d6d3d1', accent: '#d97706', fontHead: 'DM Serif Display', fontBody: 'Lora' },
  { name: 'Himmel',     bg: '#f0f9ff', title: '#0c4a6e', text: '#075985', accent: '#0ea5e9', fontHead: 'Poppins', fontBody: 'Inter' },
  { name: 'Mynte',      bg: '#f0fdfa', title: '#134e4a', text: '#115e59', accent: '#14b8a6', fontHead: 'Quicksand', fontBody: 'Nunito' },
  { name: 'Kull',       bg: '#18181b', title: '#fafafa', text: '#d4d4d8', accent: '#f59e0b', fontHead: 'Anton', fontBody: 'Inter' },
  { name: 'Lavendel',   bg: '#f5f3ff', title: '#4c1d95', text: '#5b21b6', accent: '#8b5cf6', fontHead: 'Poppins', fontBody: 'Inter' },
]

const lowc = (s) => String(s || '').toLowerCase()
function buildColorMap(o, n) {
  const m = {}
  const add = (a, b) => { if (a && b && lowc(a) !== lowc(b)) m[lowc(a)] = b }
  // IKKE map noe til ny bakgrunn (ellers kan tekst bli usynlig mot bakgrunnen)
  add(o.title, n.title); add(o.text, n.text); add(o.accent, n.accent)
  ;[0.4, 0.45, 0.5].forEach((t) => add(mix(o.accent, '#ffffff', t), mix(n.accent, '#ffffff', t)))
  ;[0.2, 0.22, 0.25].forEach((t) => add(mix(o.accent, '#000000', t), mix(n.accent, '#000000', t)))
  return m
}
// Sikrer at en farge er godt nok forskjellig fra bakgrunnen til å være lesbar
function lum(hex) { const v = String(hex || '').replace('#', ''); if (v.length !== 6) return 0.5; const r = parseInt(v.slice(0, 2), 16) / 255, g = parseInt(v.slice(2, 4), 16) / 255, b = parseInt(v.slice(4, 6), 16) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b }
function readableOn(color, bg, fallback) { return Math.abs(lum(color) - lum(bg)) < 0.22 ? fallback : color }
function recolorEl(el, map, fontMap, bg) {
  const c = (v) => (v && map[lowc(v)]) || v
  const out = { ...el }
  if (el.color) {
    let nc = c(el.color)
    // Sørg for at TEKST aldri blir usynlig mot den nye bakgrunnen
    if (el.type === 'text' && bg) nc = readableOn(nc, bg, lum(bg) > 0.5 ? '#1a1a1a' : '#ffffff')
    out.color = nc
  }
  if (el.fill && el.fill !== 'transparent') out.fill = c(el.fill)
  if (el.stroke) out.stroke = c(el.stroke)
  if (el.highlight) out.highlight = c(el.highlight)
  if (el.accent) out.accent = c(el.accent)
  if (el.fontFamily && fontMap[lowc(el.fontFamily)]) out.fontFamily = fontMap[lowc(el.fontFamily)]
  return out
}
// scope: 'all' = hele presentasjonen, 'slide' = bare lysbildet på idx
// scope: 'all' = hele presentasjonen, 'slide' = bare lysbildet på idx
export function applyTheme(deck, newTheme, scope, idx, tweaks) {
  const nt = asTheme(newTheme)
  const useStyleFor = (s) => (nt.style && DECOR_STYLES[nt.style]) ? nt.style : (s.style || 'corners')
  const tw = tweaks && typeof tweaks === 'object' ? tweaks : null
  // Avgjør om et tekst-element er en overskrift (stor/fet) eller brødtekst
  const isHeading = (el) => el.bold || (el.fontSize || 0) >= 28
  const applyTweaks = (el) => {
    if (!tw || el.type !== 'text') return el
    const target = tw.applyTo || 'all'
    const head = isHeading(el)
    const hit = target === 'all' || (target === 'headings' && head) || (target === 'body' && !head)
    if (!hit) return el
    const out = { ...el }
    const sc = head ? tw.scaleHeadings : tw.scaleBody
    if (typeof sc === 'number' && sc > 0.3 && sc < 4) out.fontSize = Math.round((el.fontSize || 20) * sc)
    if (typeof tw.boldHeadings === 'boolean' && head) out.bold = tw.boldHeadings
    if (typeof tw.italicBody === 'boolean' && !head) out.italic = tw.italicBody
    if (typeof tw.bold === 'boolean') out.bold = tw.bold
    if (typeof tw.italic === 'boolean') out.italic = tw.italic
    if (tw.align === 'center' || tw.align === 'left' || tw.align === 'right') out.align = tw.align
    return out
  }
  const apply = (s, i) => {
    const from = asTheme(s.theme || deck.theme)
    // Relativ overskrift-gjenkjenning: største tekst på lysbildet teller som overskrift
    const sizes = s.elements.filter((e) => e.type === 'text' && !e.decor).map((e) => e.fontSize || 0)
    const maxSize = Math.max(0, ...sizes)
    const isHeadingRel = (el) => el.bold || (el.fontSize || 0) >= 28 || (maxSize > 0 && (el.fontSize || 0) >= maxSize * 0.85)
    const map = buildColorMap(from, nt)
    const fontMap = {}
    if (from.fontHead) fontMap[lowc(from.fontHead)] = nt.fontHead
    if (from.fontBody) fontMap[lowc(from.fontBody)] = nt.fontBody
    // Rolle-basert tekstfarge: bestem om elementet er overskrift, brødtekst eller aksent,
    // og gi RIKTIG ny farge – så overskrift/tekst aldri byttes om (selv om de hadde lik farge før)
    const recolorText = (el) => {
      const col = lowc(el.color || '')
      let nc
      if (col && col === lowc(from.accent)) nc = nt.accent
      else if (col && col === lowc(from.title) && col !== lowc(from.text)) nc = nt.title
      else if (col && col === lowc(from.text) && col !== lowc(from.title)) nc = nt.text
      else nc = isHeadingRel(el) ? nt.title : nt.text   // lik gammel farge / ukjent → bruk størrelse/fet
      // Sikkerhetsnett: bare hvis fargen er så å si IDENTISK med bakgrunnen (helt usynlig),
      // nudg den så teksten ikke forsvinner helt. Bevisste valg (f.eks. hvit på beige) røres ikke.
      if (Math.abs(lum(nc) - lum(nt.bg)) < 0.06) nc = lum(nt.bg) > 0.5 ? '#1a1a1a' : '#ffffff'
      return nc
    }
    // Behold alt innhold (tekst, bilder, brukerens egne ting) OG figur-ikoner (dekor-bilder) – bytt bare farger/fonter
    const keep = s.elements.filter((e) => !e.decor || e.type === 'image')
    const content = keep.map((el) => {
      let out = recolorEl(el, map, fontMap, nt.bg)
      if (el.type === 'text' && el.color) out = { ...out, color: recolorText(el) }
      return applyTweaks(out)
    })
    // Bygg KUN den geometriske pynten (bakteppet) på nytt med ny stil + nye farger
    const big = s.layout ? (s.layout === 'cover' || s.layout === 'section')
      : (Math.max(0, ...s.elements.filter((e) => e.type === 'text').map((e) => e.fontSize || 0)) >= 42)
    const decor = autoBackdrop(nt, big, useStyleFor(s), i)
    return { ...s, theme: { ...nt }, style: useStyleFor(s), background: nt.bg, elements: [...decor, ...content] }
  }
  if (scope === 'slide') return { ...deck, slides: deck.slides.map((s, i) => (i === idx ? apply(s, i) : s)) }
  return { ...deck, theme: { ...nt }, slides: deck.slides.map(apply) }
}
