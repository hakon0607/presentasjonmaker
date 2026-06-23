// ============================================================================
//  AiPresent – malbibliotek (ny, forseggjort utgave)
//  Hver mal bygger HELE lysbilder (forside + innholdssider) med presist
//  plasserte elementer – ikke bare farger. Ingen hardkodet kunst: ikoner hentes
//  fra Iconify (gratis, ingen nøkkel), foto fra Pixabay (din nøkkel).
// ============================================================================
import { textEl, shapeEl, imageEl, normalizeTheme, applyTheme, genId } from './deck'

// ---- små byggehjelpere (koordinater i 960×540-rommet) ----
function iconColorHex(c, th) { const m = { accent: th?.accent, title: th?.title, text: th?.text, bg: th?.bg }; return (typeof c === 'string' && c[0] === '#') ? c : (m[c] || (th && th.accent) || '#333333') }
function iconifyUrl(id, color, size = 256) { return `https://api.iconify.design/${id}.svg?color=${encodeURIComponent(color || '#333333')}&width=${size}&height=${size}` }
function ico(id, color, x, y, w, op = 1) { return { ...imageEl({ x, y, w, h: w, src: iconifyUrl(id, color), fit: 'contain', opacity: op, caption: '' }), decor: true } }
function box(p) { return shapeEl(p) }
function disc(p) { return shapeEl({ kind: 'circle', ...p }) }
function bar(x, y, w, h, fill, op = 1) { return shapeEl({ x, y, w, h, fill, radius: h / 2, opacity: op }) }
// Pent «kort» bak tekst (passende farge bak teksten). Markeres som dekor så det ligger bak.
function card(x, y, w, h, fill, radius = 18, op = 1) { return { ...shapeEl({ kind: 'rect', x, y, w, h, fill, radius, opacity: op }), decor: true } }
function T(p) { return textEl(p) }
function connector(ax, ay, bx, by, fill, thick = 2, op = 0.5) {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI
  return { ...shapeEl({ x: (ax + bx) / 2 - len / 2, y: (ay + by) / 2 - thick / 2, w: len, h: thick, fill, radius: thick / 2, opacity: op, rotation: ang }), decor: true }
}
const slide = (background, elements) => ({ id: genId(), background, elements })

// Krymp tittel-fontstørrelse så lang tekst ikke flyter ut av boksen (unngå overlapp).
function fitSize(text, base, boxW, boxH, lh = 1.06, min = 24, charW = 0.56) {
  let size = base
  const t = String(text || '')
  while (size > min) {
    const perLine = Math.max(1, Math.floor(boxW / (size * charW)))
    const lines = Math.ceil(t.length / perLine)
    if (lines * size * lh <= boxH) break
    size -= 2
  }
  return size
}

// ============================ 1 · TEKNOLOGI ============================
const techTheme = { bg: '#070b16', title: '#eaf2ff', text: '#9fb3d1', accent: '#34e0ea', fontHead: 'Space Grotesk', fontBody: 'Inter', style: 'dots' }
const TECH_BG = '#070b16'
const TECH_GLOW = 'radial-gradient(62% 78% at 82% 12%, rgba(52,224,234,.22), rgba(99,102,241,.10) 45%, transparent 70%), #070b16'
function techHead(s, x = 72, y = 72, color = '#34e0ea') { return T({ x, y, w: 600, h: 30, text: s, fontFamily: 'Inter', fontSize: 16, color, bold: true, letterSpacing: 3 }) }

function techCover(title, subtitle) {
  const n1 = [705, 95, 64], n2 = [815, 152, 64], n3 = [672, 244, 64], n4 = [800, 330, 64]
  const c = (n) => [n[0] + n[2] / 2, n[1] + n[2] / 2]
  const a = c(n1), b = c(n2), d = c(n3), e = c(n4)
  const ttl = title || 'Fremtidens nettverk'
  return slide(TECH_GLOW, [
    connector(a[0], a[1], b[0], b[1], '#34e0ea', 2, 0.45),
    connector(b[0], b[1], d[0], d[1], '#34e0ea', 2, 0.45),
    connector(d[0], d[1], e[0], e[1], '#34e0ea', 2, 0.45),
    connector(a[0], a[1], d[0], d[1], '#34e0ea', 2, 0.4),
    ico('ph:wifi-high', '#eaf2ff', n1[0], n1[1], n1[2], 0.95),
    ico('ph:cloud', '#eaf2ff', n2[0], n2[1], n2[2], 0.9),
    ico('ph:cpu', '#eaf2ff', n3[0], n3[1], n3[2], 0.9),
    ico('ph:device-mobile', '#eaf2ff', n4[0], n4[1], n4[2], 0.85),
    techHead('TEKNOLOGI · 2026', 72, 150),
    T({ x: 72, y: 188, w: 545, h: 196, text: ttl, fontFamily: 'Space Grotesk', fontSize: fitSize(ttl, 74, 545, 196, 1.02, 34), bold: true, color: '#eaf2ff', lineHeight: 1.02 }),
    T({ x: 72, y: 396, w: 430, h: 84, text: subtitle || 'Hvordan 5G, skyen og smarte enheter henger sammen – forklart enkelt.', fontFamily: 'Inter', fontSize: 19, color: '#9fb3d1', lineHeight: 1.5 }),
    bar(72, 470, 125, 6, '#34e0ea'),
  ])
}
function techAgenda() {
  const rows = [['01', 'Hva er 5G?', 'Grunnlaget'], ['02', 'Skyen i hverdagen', 'Lagring & sync'], ['03', 'Smarte enheter', 'Tingenes internett'], ['04', 'Veien videre', '2026 →']]
  const els = [techHead('OVERSIKT'), T({ x: 72, y: 104, w: 520, h: 78, text: 'Agenda', fontFamily: 'Space Grotesk', fontSize: 58, bold: true, color: '#eaf2ff' })]
  // Bilde-panel som fyller tomrommet til høyre
  els.push(card(648, 150, 240, 300, '#101d34', 20))
  els.push(ico('ph:rocket-launch', '#34e0ea', 702, 196, 132, 0.9))
  els.push(T({ x: 648, y: 372, w: 240, h: 28, text: 'MOT 2026', fontFamily: 'Inter', fontSize: 15, color: '#9fb3d1', align: 'center', bold: true, letterSpacing: 3 }))
  let y = 206
  rows.forEach((r) => {
    els.push(card(72, y, 540, 56, '#101d34', 14))
    els.push(T({ x: 92, y: y + 12, w: 70, h: 36, text: r[0], fontFamily: 'Space Grotesk', fontSize: 26, bold: true, color: '#34e0ea' }))
    els.push(T({ x: 168, y: y + 13, w: 300, h: 34, text: r[1], fontFamily: 'Space Grotesk', fontSize: 24, color: '#eaf2ff' }))
    els.push(T({ x: 470, y: y + 18, w: 124, h: 26, text: r[2], fontFamily: 'Inter', fontSize: 14, color: '#9fb3d1', align: 'right' }))
    y += 66
  })
  return slide(TECH_GLOW, els)
}
function techFeatures() {
  const cols = [['ph:cloud', 'Skyen', 'Alt lagres og synkes i sanntid, uansett enhet.'], ['ph:cpu', 'Ytelse', 'Kraftig databehandling selv på små enheter.'], ['ph:wifi-high', 'Tilkobling', 'Stabilt nett – overalt, hele tiden.']]
  const xs = [72, 352, 632]
  const els = [techHead('TRE BYGGEKLOSSER'), T({ x: 72, y: 104, w: 816, h: 70, text: 'Slik henger det sammen', fontFamily: 'Space Grotesk', fontSize: 44, bold: true, color: '#eaf2ff' })]
  cols.forEach((cl, i) => {
    const x = xs[i]
    els.push(card(x, 208, 256, 256, '#101d34', 20))
    els.push(box({ x: x + 24, y: 232, w: 48, h: 4, fill: '#34e0ea', radius: 2 }))
    els.push(ico(cl[0], '#34e0ea', x + 24, 252, 56, 1))
    els.push(T({ x: x + 24, y: 330, w: 208, h: 36, text: cl[1], fontFamily: 'Space Grotesk', fontSize: 25, bold: true, color: '#eaf2ff' }))
    els.push(T({ x: x + 24, y: 372, w: 208, h: 80, text: cl[2], fontFamily: 'Inter', fontSize: 15, color: '#9fb3d1', lineHeight: 1.45 }))
  })
  return slide(TECH_GLOW, els)
}
function techClosing() {
  const stats = [['10×', 'raskere'], ['1 ms', 'forsinkelse'], ['99,9%', 'oppetid']]
  const xs = [210, 430, 650]
  const els = [card(170, 138, 620, 150, '#101d34', 22)]
  stats.forEach((s, i) => {
    els.push(T({ x: xs[i], y: 168, w: 160, h: 60, text: s[0], fontFamily: 'Space Grotesk', fontSize: 48, bold: true, color: '#34e0ea', align: 'center' }))
    els.push(T({ x: xs[i], y: 234, w: 160, h: 28, text: s[1], fontFamily: 'Inter', fontSize: 15, color: '#9fb3d1', align: 'center' }))
  })
  els.push(T({ x: 0, y: 324, w: 960, h: 100, text: 'Takk.', fontFamily: 'Space Grotesk', fontSize: 74, bold: true, color: '#eaf2ff', align: 'center' }))
  els.push(T({ x: 0, y: 436, w: 960, h: 28, text: 'AIPRESENT · 2026', fontFamily: 'Inter', fontSize: 16, color: '#9fb3d1', align: 'center', letterSpacing: 3 }))
  return slide(TECH_GLOW, els)
}

// ============================ 2 · BOTANISK ============================
const botTheme = { bg: '#f5efe6', title: '#3f372e', text: '#6b5d4f', accent: '#9caf88', fontHead: 'Cormorant Garamond', fontBody: 'EB Garamond', style: 'arch' }
const BOT_BG = '#f5efe6'
function botCover(title, subtitle) {
  const ttl = title || 'Botanisk'
  return slide(BOT_BG, [
    box({ x: 340, y: 92, w: 280, h: 356, fill: '#e7ead8', radius: 120 }),
    ico('ph:leaf', '#9caf88', 78, 52, 104, 0.75),
    ico('ph:flower-lotus', '#c08a5e', 772, 58, 96, 0.65),
    ico('ph:plant', '#9caf88', 104, 398, 92, 0.65),
    ico('ph:leaf', '#c08a5e', 768, 398, 82, 0.55),
    T({ x: 0, y: 128, w: 960, h: 28, text: 'EN STILLE STUDIE', fontFamily: 'Inter', fontSize: 15, color: '#8a9a6f', align: 'center', bold: true, letterSpacing: 6 }),
    T({ x: 60, y: 158, w: 840, h: 168, text: ttl, fontFamily: 'Cormorant Garamond', fontSize: fitSize(ttl, 116, 840, 168, 1.0, 44, 0.5), italic: true, bold: true, color: '#3f372e', align: 'center', lineHeight: 1.0 }),
    T({ x: 180, y: 332, w: 600, h: 56, text: subtitle || 'Former, farger og ro hentet rett fra naturen.', fontFamily: 'EB Garamond', fontSize: 23, color: '#6b5d4f', align: 'center', lineHeight: 1.4 }),
    bar(440, 400, 80, 2, '#c08a5e'),
  ])
}
function botAgenda() {
  const rows = [['01', 'Innledning'], ['02', 'Naturens former'], ['03', 'Farger og lys'], ['04', 'Refleksjon']]
  const els = [T({ x: 90, y: 80, w: 500, h: 26, text: 'INNHOLD', fontFamily: 'Inter', fontSize: 14, color: '#8a9a6f', bold: true, letterSpacing: 5 }),
    T({ x: 88, y: 108, w: 600, h: 78, text: 'Oversikt', fontFamily: 'Cormorant Garamond', fontSize: 64, bold: true, color: '#3f372e' })]
  let y = 210
  rows.forEach((r) => {
    els.push(card(90, y, 780, 58, '#ece4d6', 14))
    els.push(T({ x: 112, y: y + 12, w: 80, h: 40, text: r[0], fontFamily: 'Cormorant Garamond', fontSize: 30, bold: true, color: '#c08a5e' }))
    els.push(T({ x: 196, y: y + 11, w: 600, h: 40, text: r[1], fontFamily: 'Cormorant Garamond', fontSize: 32, color: '#3f372e' }))
    y += 70
  })
  return slide(BOT_BG, els)
}
function botContent() {
  return slide(BOT_BG, [
    T({ x: 90, y: 80, w: 500, h: 26, text: 'KAPITTEL 02', fontFamily: 'Inter', fontSize: 14, color: '#8a9a6f', bold: true, letterSpacing: 5 }),
    T({ x: 88, y: 108, w: 520, h: 76, text: 'Naturens former', fontFamily: 'Cormorant Garamond', fontSize: 58, bold: true, color: '#3f372e' }),
    card(72, 206, 524, 256, '#ece4d6', 18),
    T({ x: 102, y: 236, w: 466, h: 200, text: 'Vi henter ro og balanse fra det som vokser sakte. Enkle linjer, dempede farger og rom til å puste – en estetikk som lar innholdet hvile.', fontFamily: 'EB Garamond', fontSize: 22, color: '#6b5d4f', lineHeight: 1.55 }),
    box({ x: 636, y: 206, w: 252, h: 256, fill: '#e7ead8', radius: 18 }),
    ico('ph:plant', '#9caf88', 690, 250, 144, 0.85),
  ])
}
function botClosing() {
  return slide(BOT_BG, [
    card(280, 168, 400, 224, '#ece4d6', 24),
    ico('ph:leaf', '#9caf88', 432, 196, 96, 0.7),
    T({ x: 0, y: 286, w: 960, h: 120, text: 'Takk', fontFamily: 'Cormorant Garamond', fontSize: 92, italic: true, bold: true, color: '#3f372e', align: 'center' }),
  ])
}

// ============================ 3 · KULINARISK (foto) ============================
const culTheme = { bg: '#efe7da', title: '#2a1f17', text: '#5a4a3a', accent: '#c69a52', fontHead: 'Cormorant Garamond', fontBody: 'EB Garamond', style: 'frame' }
const CUL_BG = '#efe7da'
// Foto-panel til høyre: reservebakgrunn + ikon (vises før foto lastes) + foto-slot + tynn ramme.
function photoRight(x, w) {
  return [
    box({ x, y: 0, w, h: 540, fill: '#3a2a1c' }),
    ico('ph:fork-knife', '#caa15f', x + w / 2 - 60, 210, 120, 0.5),
    { ...imageEl({ x, y: 0, w, h: 540, src: '', fit: 'cover', caption: '' }), photoSlot: true, decor: true },
    { ...shapeEl({ x: x + 24, y: 24, w: w - 48, h: 492, fill: 'transparent', stroke: '#ffffff', strokeW: 2, opacity: 0.55, radius: 0 }), decor: true },
  ]
}
function culCover(title, subtitle) {
  const ttl = title || 'Kulinarisk'
  return slide(CUL_BG, [
    ...photoRight(480, 480),
    disc({ x: 415, y: 205, w: 130, h: 130, fill: '#efe7da', stroke: '#c69a52', strokeW: 2 }),
    T({ x: 415, y: 242, w: 130, h: 60, text: 'EST.\n2026', fontFamily: 'Inter', fontSize: 16, bold: true, color: '#7c5a26', align: 'center', lineHeight: 1.25, letterSpacing: 2 }),
    T({ x: 72, y: 178, w: 360, h: 26, text: 'RESTAURANT & MENY', fontFamily: 'Inter', fontSize: 14, color: '#b08642', bold: true, letterSpacing: 5 }),
    T({ x: 70, y: 212, w: 360, h: 132, text: ttl, fontFamily: 'Cormorant Garamond', fontSize: fitSize(ttl, 78, 360, 132, 0.98, 34, 0.5), bold: true, color: '#2a1f17', lineHeight: 0.98 }),
    T({ x: 72, y: 350, w: 330, h: 84, text: subtitle || 'En smaksreise gjennom sesongens råvarer og kjøkkenets håndverk.', fontFamily: 'EB Garamond', fontSize: 19, color: '#5a4a3a', lineHeight: 1.5 }),
    bar(72, 440, 110, 2, '#c69a52'),
  ])
}
function culSpread() {
  return slide(CUL_BG, [
    ...photoRight(500, 460),
    card(60, 132, 392, 296, '#e8ddcc', 18),
    T({ x: 88, y: 158, w: 360, h: 26, text: 'KAPITTEL 01', fontFamily: 'Inter', fontSize: 14, color: '#b08642', bold: true, letterSpacing: 5 }),
    T({ x: 86, y: 188, w: 340, h: 92, text: 'Sesongens råvarer', fontFamily: 'Cormorant Garamond', fontSize: 52, bold: true, color: '#2a1f17', lineHeight: 1.0 }),
    T({ x: 88, y: 300, w: 336, h: 120, text: 'Vi henter det beste fra årstiden og lar det stå i sentrum. Enkle teknikker, rene smaker og respekt for hver ingrediens.', fontFamily: 'EB Garamond', fontSize: 19, color: '#5a4a3a', lineHeight: 1.55 }),
  ])
}
function culQuote() {
  return slide(CUL_BG, [
    card(150, 168, 660, 204, '#e8ddcc', 22),
    T({ x: 0, y: 150, w: 960, h: 100, text: '“', fontFamily: 'Cormorant Garamond', fontSize: 130, bold: true, color: '#c69a52', align: 'center', lineHeight: 1 }),
    T({ x: 200, y: 244, w: 560, h: 110, text: 'God mat er minner du kan smake.', fontFamily: 'Cormorant Garamond', fontSize: 48, italic: true, bold: true, color: '#2a1f17', align: 'center', lineHeight: 1.12 }),
    T({ x: 0, y: 392, w: 960, h: 28, text: '— KJØKKENSJEFEN', fontFamily: 'Inter', fontSize: 14, color: '#b08642', align: 'center', letterSpacing: 5, bold: true }),
  ])
}
function culClosing() {
  return slide(CUL_BG, [
    T({ x: 0, y: 200, w: 960, h: 120, text: 'Takk for besøket', fontFamily: 'Cormorant Garamond', fontSize: 84, bold: true, color: '#2a1f17', align: 'center' }),
    bar(435, 316, 90, 2, '#c69a52'),
    T({ x: 0, y: 344, w: 960, h: 28, text: 'VEL MØTT IGJEN', fontFamily: 'Inter', fontSize: 14, color: '#7c5a26', align: 'center', letterSpacing: 5 }),
  ])
}

// ============================ MALER ============================
export const TEMPLATES = [
  { id: 'tech', name: 'Teknologi', category: 'Tech', bgCss: TECH_GLOW,
    keywords: ['tech', 'teknologi', 'data', '5g', 'digital', 'fremtid', 'mørk', 'neon', 'ikoner'],
    theme: techTheme, cover: (t, s) => techCover(t, s), make: (t) => [techCover(t), techAgenda(), techFeatures(), techClosing()] },
  { id: 'botanical', name: 'Botanisk', category: 'Elegant', bgCss: BOT_BG,
    keywords: ['elegant', 'astetisk', 'aesthetic', 'botanisk', 'blomst', 'natur', 'rolig', 'mote', 'serif'],
    theme: botTheme, cover: (t, s) => botCover(t, s), make: (t) => [botCover(t), botAgenda(), botContent(), botClosing()] },
  { id: 'culinary', name: 'Kulinarisk', category: 'Mat', bgCss: CUL_BG,
    keywords: ['mat', 'kulinarisk', 'restaurant', 'meny', 'foto', 'kokk', 'gourmet', 'elegant'],
    theme: culTheme, photo: 'restaurant chef cooking gourmet', scrim: 'dark',
    cover: (t, s) => culCover(t, s), make: (t) => [culCover(t), culSpread(), culQuote(), culClosing()] },
]

// ============================ API (samme navn som før) ============================
export const TEMPLATE_CATEGORIES = ['Alle', ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

export function searchTemplates(q = '', cat = 'Alle') {
  const s = (q || '').toLowerCase().trim()
  let list = TEMPLATES
  if (cat && cat !== 'Alle') list = list.filter((t) => t.category === cat)
  if (!s) return list
  return list.filter((t) => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s) || (t.keywords || []).some((k) => k.includes(s)))
}

export function photoQueryOf(t) { return t && t.photo ? t.photo : '' }

// Forside-lysbildet (brukes som ekte forhåndsvisning i velgeren/galleriet).
export function templateCover(t) {
  try { return t.make(t.name)[0] } catch (e) { return { id: genId(), background: (t && t.theme && t.theme.bg) || '#ffffff', elements: [] } }
}

// Lag et komplett dekk fra en mal.
export function deckFromTemplate(title, t) {
  const th = normalizeTheme({ ...t.theme })
  return { theme: th, title: title || t.name, slides: t.make(title || t.name) }
}

// Bytt mal på et eksisterende dekk: behold tekst-innhold, legg på malens farger/
// fonter, bytt inn malens egen forside, og merk dekket som mal-basert.
export function applyTemplateToDeck(deck, t, scope = 'all', idx = 0) {
  const th = normalizeTheme({ ...t.theme })
  let d
  try { d = applyTheme(deck, th, scope, idx) } catch (e) { d = { ...deck, theme: th } }
  d = { ...d, theme: th, fromTemplate: t.id }
  if (t.cover) d = { ...d, slides: d.slides.map((s, i) => (i === 0 ? t.cover(deck.title || t.name, '') : s)) }
  return d
}

// AI-flyt: tema + malens forside med AI-tittel/undertittel + mal-merking.
export function applyTemplateAi(deck, t, coverTitle, coverSubtitle) {
  const th = normalizeTheme({ ...t.theme })
  let d
  try { d = applyTheme(deck, th, 'all', 0) } catch (e) { d = { ...deck, theme: th } }
  d = { ...d, theme: th, title: deck.title, fromTemplate: t.id }
  if (t.cover) d = { ...d, slides: d.slides.map((s, i) => (i === 0 ? t.cover(coverTitle || deck.title || t.name, coverSubtitle || '') : s)) }
  return d
}

// Legg foto på et dekk. Bespoke-maler har en foto-slot som fylles; ellers fullflate.
export function deckWithPhotoBg(deck, src, scrim = 'dark', scope = 'all', idx = 0) {
  if (!src || !deck || !deck.slides) return deck
  let found = false
  const slides = deck.slides.map((s) => {
    let hit = false
    const els = (s.elements || []).map((e) => { if (e && e.photoSlot) { hit = true; found = true; return { ...e, src } } return e })
    return hit ? { ...s, elements: els } : s
  })
  if (found) return { ...deck, slides }
  // Fallback (f.eks. AI-dekk uten foto-slot): enkel fullflate + slør.
  const dark = scrim !== 'light'
  const scr = dark ? 'rgba(8,10,16,.46)' : 'rgba(255,255,255,.30)'
  const inScope = (i) => scope === 'all' || i === idx
  const slides2 = deck.slides.map((s, i) => {
    if (!inScope(i)) return s
    const bg = { ...imageEl({ x: 0, y: 0, w: 960, h: 540, src, fit: 'cover', caption: '' }), decor: true }
    const ov = { ...shapeEl({ x: 0, y: 0, w: 960, h: 540, fill: scr }), decor: true }
    const keep = (s.elements || []).filter((e) => !e.decor || e.photoSlot)
    return { ...s, background: dark ? '#0b0f1a' : '#ffffff', elements: [bg, ov, ...keep] }
  })
  return { ...deck, slides: slides2 }
}
