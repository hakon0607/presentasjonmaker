// Design-motor: gjoer AI-innhold (tittel/punkter/bilde) om til vakre lysbilder
// i app-formatet (elementer paa 960x540). Inspirert av Slidesgo: foto i tomrom,
// editorial fonter, tekstbokser med farge bak, myke former. Hvert lysbilde faar
// sitt eget oppsett -> variasjon.
import { textEl, shapeEl, imageEl, genId, fitTextBox } from './deck'

const CW = 960, CH = 540

// ---------- stilpakker (palett + fonter). En pakke pr presentasjon = helhetlig. ----------
export const STYLES = {
  editorial: { bg: '#f3eae0', ink: '#2c2622', soft: '#6f635a', acc: '#bd7a57', card: '#e8dccd', head: 'Playfair Display', body: 'EB Garamond', dark: false },
  natur:     { bg: '#f1f5f0', ink: '#1d3a29', soft: '#4c6354', acc: '#3f9d63', card: '#e2ece2', head: 'Playfair Display', body: 'Inter', dark: false },
  pastell:   { bg: '#fdf2f6', ink: '#7a4456', soft: '#9c6b7c', acc: '#e07ba6', card: '#f8e3ec', head: 'Fredoka', body: 'Nunito', dark: false },
  graatone:  { bg: '#f4f4f3', ink: '#1a1a1a', soft: '#585858', acc: '#1a1a1a', card: '#e7e7e5', head: 'DM Serif Display', body: 'Inter', dark: false },
  natt:      { bg: '#15110e', bgCss: 'radial-gradient(120% 120% at 80% 0%, #2a2017 0%, #15110e 60%)', ink: '#f6efe6', soft: '#c2b3a3', acc: '#e0a96d', card: '#241c15', head: 'Space Grotesk', body: 'Inter', dark: true },
  tech:      { bg: '#070b16', bgCss: 'radial-gradient(120% 120% at 75% 0%, #15233f 0%, #070b16 60%)', ink: '#eaf2ff', soft: '#9fb3d1', acc: '#34e0ea', card: '#101d34', head: 'Space Grotesk', body: 'Inter', dark: true },
  botanisk:  { bg: '#f5efe6', ink: '#3f372e', soft: '#6b5d4f', acc: '#7e9a5f', card: '#e7ead8', head: 'Cormorant Garamond', body: 'EB Garamond', dark: false },

  korall:    { bg: '#fff6f2', ink: '#4a2c25', soft: '#8a665c', acc: '#ff6f5e', card: '#ffe7df', head: 'Poppins', body: 'Inter', dark: false },
  ocean:     { bg: '#f0f6fb', ink: '#14304a', soft: '#4a6781', acc: '#1f78c1', card: '#e0ecf6', head: 'Sora', body: 'Inter', dark: false },
  midnatt:   { bg: '#0c1424', bgCss: 'radial-gradient(120% 120% at 75% 0%, #1a2c4d 0%, #0c1424 60%)', ink: '#e8eefc', soft: '#93a6c8', acc: '#5b8cff', card: '#16223c', head: 'Sora', body: 'Inter', dark: true },
  solnedgang:{ bg: '#1a1016', bgCss: 'radial-gradient(120% 120% at 80% 0%, #3a1c2a 0%, #1a1016 60%)', ink: '#ffeede', soft: '#d9a98f', acc: '#ff8a4c', card: '#2a1820', head: 'Outfit', body: 'Inter', dark: true },
  mynte:     { bg: '#f0faf6', ink: '#16413a', soft: '#4a6b63', acc: '#1fae8c', card: '#dff3ec', head: 'Quicksand', body: 'Nunito', dark: false },
  lavendel:  { bg: '#f6f3fc', ink: '#3d2c5c', soft: '#6f5f8c', acc: '#8b5cf6', card: '#ece4f9', head: 'Plus Jakarta Sans', body: 'Inter', dark: false },
  safran:    { bg: '#fdf8ee', ink: '#4a3a1c', soft: '#8a7550', acc: '#e0a020', card: '#f6ecd4', head: 'Lora', body: 'Inter', dark: false },
  burgunder: { bg: '#faf3f3', ink: '#4a1c24', soft: '#8a5a60', acc: '#9c2b3e', card: '#f1e2e3', head: 'Playfair Display', body: 'EB Garamond', dark: false },
  kull:      { bg: '#16181c', ink: '#f0f1f3', soft: '#a8acb4', acc: '#e8eaee', card: '#22252b', head: 'DM Sans', body: 'Inter', dark: true },
  sitrus:    { bg: '#fbfdf2', ink: '#36400f', soft: '#6b7536', acc: '#9bbf2e', card: '#f0f5dc', head: 'Outfit', body: 'Inter', dark: false },
  indigo:    { bg: '#f3f4fb', ink: '#1e2147', soft: '#555a86', acc: '#4f46e5', card: '#e5e7f7', head: 'Manrope', body: 'Inter', dark: false },
  terracotta:{ bg: '#faf2ec', ink: '#4a2e20', soft: '#8a6450', acc: '#c2643c', card: '#f1e0d3', head: 'Cormorant Garamond', body: 'EB Garamond', dark: false },
  arktis:    { bg: '#f4f9fc', ink: '#1c3744', soft: '#4e6b78', acc: '#2aa0c4', card: '#e2eff3', head: 'Manrope', body: 'Inter', dark: false },
  rosegull:  { bg: '#fcf4f1', ink: '#4a302c', soft: '#8a6660', acc: '#c98a6a', card: '#f4e3dc', head: 'Cormorant Garamond', body: 'EB Garamond', dark: false },
  skog:      { bg: '#0e1a13', bgCss: 'radial-gradient(120% 120% at 78% 0%, #18331f 0%, #0e1a13 60%)', ink: '#e8f3e8', soft: '#9ab8a2', acc: '#4caf6a', card: '#16291c', head: 'Space Grotesk', body: 'Inter', dark: true },
  plomme:    { bg: '#1a0f1c', bgCss: 'radial-gradient(120% 120% at 80% 0%, #331a38 0%, #1a0f1c 60%)', ink: '#f6e8f6', soft: '#c39ac3', acc: '#d05ce0', card: '#271630', head: 'Sora', body: 'Inter', dark: true },
  mokka:     { bg: '#f6f0ea', ink: '#3a2a20', soft: '#7a6354', acc: '#9c6b43', card: '#ebe0d4', head: 'Lora', body: 'Inter', dark: false },
  elektrisk: { bg: '#0a0a12', bgCss: 'radial-gradient(120% 120% at 50% 0%, #16162a 0%, #0a0a12 60%)', ink: '#f2f2ff', soft: '#a0a0c8', acc: '#ffe14d', card: '#15151f', head: 'Space Grotesk', body: 'Inter', dark: true },
  fersken:   { bg: '#fff5ee', ink: '#5a3a2c', soft: '#9a7464', acc: '#f5a06a', card: '#ffe6d6', head: 'Fredoka', body: 'Nunito', dark: false },
  staal:     { bg: '#f2f4f6', ink: '#25303a', soft: '#5a6670', acc: '#4a7a9c', card: '#e3e8ec', head: 'Work Sans', body: 'Inter', dark: false },
}
const STYLE_IDS = Object.keys(STYLES)

// velg stil ut fra emne (enkle stikkord) ellers stabil hash
export function pickStyle(title = '', hint = '') {
  const h = String(hint || '').toLowerCase()
  const t = (title + ' ' + hint).toLowerCase()
  const any = (s, ...w) => w.some((x) => s.includes(x))
  // 0) skrev brukeren et stilnavn direkte? (f.eks. «ocean», «lavendel», «skog»)
  for (const id of [...STYLE_IDS].sort((a, b) => b.length - a.length)) { if (id.length > 3 && h.includes(id)) return id }
  if (h.includes('terrakotta')) return 'terracotta'
  if (h.includes('rosegull') || h.includes('rosa gull')) return 'rosegull'
  if (h.includes('stål') || h.includes('staal')) return 'staal'
  // 1) eksplisitt ønske i «hvordan skal det se ut»
  if (any(h, 'botanisk', 'blomst', 'plante', 'hage', 'botanikk')) return 'botanisk'
  if (any(h, 'teknologi', 'tech', 'neon', 'futurist', 'digital', 'cyber', 'sci-fi')) return 'tech'
  if (any(h, 'gråtone', 'graatone', 'svart', 'minimal', 'enkel', 'clean', 'rene', 'stilren')) return 'graatone'
  if (any(h, 'pastell', 'rosa', 'søt', 'soet', 'koselig', 'myk', 'lekent', 'barn')) return 'pastell'
  if (any(h, 'mørk', 'mork', 'dark', 'dempet', 'dramatisk', 'natt', 'varm')) return 'natt'
  if (any(h, 'elegant', 'editorial', 'serif', 'eksklusiv', 'aesthetic', 'æsteti', 'asteti', 'luksus', 'stilig')) return 'editorial'
  if (any(h, 'natur', 'grønn', 'gronn', 'miljø', 'miljo', 'organisk', 'frisk')) return 'natur'
  // 2) ut fra emne
  if (any(t, 'botanisk', 'blomst', 'plante', 'hage', 'flora')) return 'botanisk'
  if (any(t, 'natur', 'klima', 'milj', 'dyr', 'skog', 'hav', 'planet', 'baerekraft')) return 'natur'
  if (any(t, 'mat', 'kaffe', 'restaurant', 'reise', 'mote', 'kunst', 'esteti', 'kjaerlighet', 'historie', 'bok')) return 'editorial'
  if (any(t, 'barn', 'skole', 'lek', 'bursdag', 'venn')) return 'pastell'
  if (any(t, 'tech', 'teknologi', 'data', 'kode', 'app', 'digital', 'fremtid', 'spill', 'robot')) return 'tech'
  if (any(t, 'pitch', 'startup', 'forretning', 'business', 'penger', 'salg', 'invest', 'marked')) return 'natt'
  let n = 0; for (const c of t) n = (n * 31 + c.charCodeAt(0)) >>> 0
  return STYLE_IDS[n % STYLE_IDS.length]
}

// ---------- byggeklosser ----------
const ICONIFY = (id, color) => `https://api.iconify.design/${String(id || 'ph:circle').replace(':', '/')}.svg?color=${encodeURIComponent(color)}`
const T = (p) => textEl({ lineHeight: 1.3, ...p })
const RECT = (p) => ({ ...shapeEl({ kind: 'rect', radius: 0, ...p }), decor: true })
const CIRC = (p) => ({ ...shapeEl({ kind: 'circle', ...p }), decor: true })
const ICON = (id, color, x, y, w) => ({ ...imageEl({ x, y, w, h: w, src: ICONIFY(id, color), fit: 'contain', caption: '' }), decor: true })
const PHOTO = (p, q) => ({ ...imageEl({ src: '', fit: 'cover', caption: q || '', ...p }), photoSlot: true, photoQuery: q || '' })
const SCRIM = (css, p = {}) => ({ ...shapeEl({ kind: 'rect', x: 0, y: 0, w: CW, h: CH, fill: css, radius: 0, ...p }), decor: true, overlay: true, locked: true })

function chip(text, x, y, bg, fg, style) {
  const w = Math.min(360, 60 + text.length * 11)
  return [
    RECT({ x, y, w, h: 34, fill: bg, radius: 17 }),
    T({ x: x + 16, y: y + 7, w: w - 32, h: 22, text: text.toUpperCase(), fontFamily: 'Inter', fontSize: 13, color: fg, bold: true, letterSpacing: 1.5 }),
  ]
}
// tittel-tilpasning: krymper på lange titler OG sørger for at det lengste ORDET
// får plass på én linje (så ingen ord kuttes midt i / brekker stygt).
function fit(text, base, w, maxLines = 2) {
  const s = String(text || '')
  const per = Math.max(4, Math.floor(w / (base * 0.55)))
  const totalLines = s.split('\n').reduce((n, ln) => n + Math.max(1, Math.ceil(ln.length / per)), 0)
  let size = base
  if (totalLines > maxLines) size = Math.max(Math.round(base * (maxLines / totalLines) * 1.04), Math.round(base * 0.5))
  // lengste ord må få plass i bredden (konservativ tegnbredde 0.62)
  const longest = s.split(/\s+/).reduce((m, x) => Math.max(m, x.length), 0)
  if (longest > 0) {
    const cap = Math.floor(w / (longest * 0.62))
    if (size > cap) size = cap
  }
  return Math.max(size, 12)
}
// antall linjer + høyde (respekterer linjeskift, litt konservativ for å unngå overlapp)
function lineCount(text, fs, w) {
  const per = Math.max(4, Math.floor(w / (fs * 0.58)))
  return String(text || '').split('\n').reduce((n, ln) => n + Math.max(1, Math.ceil(ln.length / per)), 0)
}
function txtH(text, fs, w, lh = 1.04) { return Math.round(lineCount(text, fs, w) * fs * lh) }
const photoQ = (spec) => (spec.image && spec.image.caption) || spec.photo || spec.figure || spec.title || spec.statement || ''
// ekte bilde-emne? (faller IKKE tilbake til tittel/setning – så f.eks. «Takk» ikke blir et foto)
const hasPhoto = (spec) => !!((spec.image && spec.image.caption) || spec.photo || spec.figure)
// senket/hevet tall (CO₂, CH₄) -> vanlige tall, så de ikke roter til verken visning eller eksport
const SUBSUP_MAP = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
const cleanText = (t) => String(t == null ? '' : t).replace(/[₀-₉⁰¹²³⁴-⁹]/g, (c) => SUBSUP_MAP[c] || c)

// ---------- layouts (returnerer {background, elements}) ----------
function bg(st) { return st.bgCss || st.bg }

function coverSplit(spec, st) {
  const els = []
  els.push(PHOTO({ x: 540, y: 0, w: 420, h: 540 }, photoQ(spec)))
  els.push(...chip(spec.eyebrow || 'Presentasjon', 72, 96, st.acc, '#ffffff'))
  const tw = 430
  const fs = fit(spec.title, 80, tw, 2)
  const tH = txtH(spec.title, fs, tw, 1.0)
  const ty = Math.max(150, Math.round(298 - tH / 2))
  els.push(T({ x: 72, y: ty, w: tw, h: tH + 12, text: spec.title || 'Tittel', fontFamily: st.head, fontSize: fs, bold: true, color: st.ink, lineHeight: 1.0 }))
  let y = ty + tH + 18
  els.push(RECT({ x: 74, y, w: 110, h: 6, fill: st.acc, radius: 3 })); y += 22
  if (spec.subtitle) els.push(T({ x: 72, y, w: tw, h: 80, text: spec.subtitle, fontFamily: st.body, fontSize: 21, italic: st.head.includes('Playfair') || st.head.includes('Serif'), color: st.soft, lineHeight: 1.35 }))
  return { background: bg(st), elements: els }
}
function coverFull(spec, st) {
  const els = []
  els.push(PHOTO({ x: 0, y: 0, w: CW, h: CH }, photoQ(spec)))
  els.push(SCRIM('linear-gradient(180deg, rgba(15,15,18,.18) 0%, rgba(15,15,18,.82) 100%)'))
  const tw = 760
  const fs = fit(spec.title, 76, tw, 2)
  const tH = txtH(spec.title, fs, tw, 1.0)
  const ty = 496 - tH
  els.push(...chip(spec.eyebrow || 'Presentasjon', 72, ty - 48, 'rgba(255,255,255,.92)', '#1a1a1a'))
  els.push(T({ x: 72, y: ty, w: tw, h: tH + 12, text: spec.title || 'Tittel', fontFamily: st.head, fontSize: fs, bold: true, color: '#ffffff', lineHeight: 1.0 }))
  return { background: bg(st), elements: els }
}
function section(spec, st) {
  const els = []
  els.push(CIRC({ x: 690, y: -90, w: 320, h: 320, fill: st.acc, opacity: st.dark ? 0.18 : 0.14 }))
  els.push(RECT({ x: 72, y: 232, w: 12, h: 120, fill: st.acc, radius: 6 }))
  const fs = fit(spec.title, 58, 660, 2)
  const tH = txtH(spec.title, fs, 660, 1.04)
  els.push(T({ x: 104, y: Math.round(270 - tH / 2), w: 660, h: tH + 12, text: spec.title || '', fontFamily: st.head, fontSize: fs, bold: true, color: st.ink, lineHeight: 1.04 }))
  return { background: bg(st), elements: els }
}
function statBig(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 800, h: 70, text: spec.title || 'I tall', fontFamily: st.head, fontSize: 46, bold: true, color: st.ink }))
  const stats = parseStats(spec).slice(0, 3)
  const n = stats.length || 1
  const gap = 28, w = Math.floor((816 - gap * (n - 1)) / n)
  stats.forEach((s, i) => {
    const x = 72 + i * (w + gap)
    els.push(RECT({ x, y: 256, w: w, h: 2, fill: st.dark ? '#33445e' : '#d8cabb', radius: 1 }))
    els.push(T({ x, y: 276, w, h: 90, text: s.big, fontFamily: st.head, fontSize: 76, bold: true, color: st.ink, lineHeight: 1 }))
    els.push(T({ x, y: 384, w, h: 40, text: s.lab, fontFamily: st.body, fontSize: 19, color: st.soft, lineHeight: 1.3 }))
  })
  return { background: bg(st), elements: els }
}
function quote(spec, st) {
  const els = []
  const q = spec.statement || spec.title || ''
  if (spec.image || hasPhoto(spec)) {
    const fs = fit(q, 52, 760, 4)
    const qH = txtH(q, fs, 760, 1.14)
    const qy = Math.max(110, Math.round(255 - qH / 2))
    els.push(PHOTO({ x: 0, y: 0, w: CW, h: CH }, photoQ(spec)))
    els.push(SCRIM('linear-gradient(120deg, rgba(20,16,12,.84), rgba(20,16,12,.4))'))
    els.push(T({ x: 90, y: qy, w: 760, h: qH + 14, text: '“' + q + '”', fontFamily: st.head, fontSize: fs, italic: true, bold: true, color: '#ffffff', lineHeight: 1.14 }))
    if (spec.subtitle) els.push(T({ x: 90, y: Math.min(qy + qH + 18, 502), w: 760, h: 28, text: '— ' + spec.subtitle, fontFamily: 'Inter', fontSize: 15, color: '#eadccd', letterSpacing: 1.5, bold: true }))
  } else {
    const fs = fit(q, 46, 600, 4)
    const qH = txtH(q, fs, 600, 1.14)
    const cardH = Math.min(430, qH + 150)
    const cy = Math.round((540 - cardH) / 2)
    els.push(RECT({ x: 120, y: cy, w: 720, h: cardH, fill: st.card, radius: 22 }))
    els.push(T({ x: 150, y: cy - 6, w: 200, h: 110, text: '“', fontFamily: st.head, fontSize: 110, bold: true, color: st.acc, lineHeight: 1 }))
    els.push(T({ x: 170, y: cy + 72, w: 600, h: qH + 14, text: q, fontFamily: st.head, fontSize: fs, italic: true, bold: true, color: st.ink, lineHeight: 1.14 }))
    if (spec.subtitle) els.push(T({ x: 170, y: cy + 72 + qH + 16, w: 600, h: 26, text: '— ' + spec.subtitle, fontFamily: 'Inter', fontSize: 14, color: st.acc, letterSpacing: 1.5, bold: true }))
  }
  return { background: bg(st), elements: els }
}
function iconCards(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 64, text: spec.title || '', fontFamily: st.head, fontSize: 44, bold: true, color: st.ink }))
  const items = (spec.bullets || []).slice(0, 3)
  const defIcons = ['ph:check-circle', 'ph:star', 'ph:lightbulb', 'ph:target']
  const icons = spec.icons || []
  const n = items.length || 1
  const gap = 24, w = Math.floor((816 - gap * (n - 1)) / n)
  items.forEach((b, i) => {
    const x = 72 + i * (w + gap)
    const { head, body } = splitBullet(b)
    const iconId = icons[i] ? `ph:${icons[i]}` : defIcons[i % defIcons.length]
    els.push(RECT({ x, y: 220, w, h: 250, fill: st.card, radius: 20 }))
    els.push(RECT({ x: x + 24, y: 244, w: 44, h: 4, fill: st.acc, radius: 2 }))
    els.push(ICON(iconId, st.acc, x + 24, 262, 50))
    els.push(T({ x: x + 24, y: 332, w: w - 48, h: 34, text: head, fontFamily: st.head, fontSize: 24, bold: true, color: st.ink }))
    els.push(T({ x: x + 24, y: 372, w: w - 48, h: 88, text: body, fontFamily: st.body, fontSize: 17, color: st.soft, lineHeight: 1.4 }))
  })
  return { background: bg(st), elements: els }
}
function twoColumn(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 64, text: spec.title || '', fontFamily: st.head, fontSize: 44, bold: true, color: st.ink }))
  const cols = (spec.columns || []).slice(0, 2)
  const gap = 28, w = Math.floor((816 - gap) / 2)
  cols.forEach((c, i) => {
    const x = 72 + i * (w + gap)
    els.push(RECT({ x, y: 220, w, h: 252, fill: st.card, radius: 20 }))
    els.push(T({ x: x + 26, y: 244, w: w - 52, h: 38, text: c.heading || '', fontFamily: st.head, fontSize: 26, bold: true, color: st.acc }))
    els.push(T({ x: x + 26, y: 292, w: w - 52, h: 160, text: (c.bullets || []).map((b) => '· ' + b).join('\n'), fontFamily: st.body, fontSize: 18, color: st.soft, lineHeight: 1.5 }))
  })
  return { background: bg(st), elements: els }
}
function photoText(spec, st, flip = false) {
  const els = []
  const px = flip ? 0 : 560
  const tx = flip ? 440 : 72
  const iw = 340
  const padT = 30, padB = 28, gapTB = 14, ebH = 28
  const fs = fit(spec.title, 38, iw, 3)
  const tH = txtH(spec.title, fs, iw, 1.06)
  const body = (spec.bullets || []).length ? (spec.bullets).map((b) => '· ' + b).join('\n') : (spec.subtitle || '')
  // krymp brødtekst-font til alt får plass i et kort på maks 486 px
  const maxCard = 486
  let bfs = 17
  let bH = txtH(body, bfs, iw, 1.5)
  let cardH = padT + ebH + tH + gapTB + bH + padB
  while (cardH > maxCard && bfs > 11) { bfs -= 1; bH = txtH(body, bfs, iw, 1.45); cardH = padT + ebH + tH + gapTB + bH + padB }
  cardH = Math.min(cardH, maxCard)
  const cardY = Math.max(28, Math.round((540 - cardH) / 2))
  els.push(PHOTO({ x: px, y: 0, w: 400, h: 540 }, photoQ(spec)))
  els.push(RECT({ x: tx, y: cardY, w: 392, h: cardH, fill: st.card, radius: 20 }))
  els.push(...eyebrow(spec, st, tx + 28, cardY + padT))
  const titleY = cardY + padT + ebH
  els.push(T({ x: tx + 26, y: titleY, w: iw, h: tH + 8, text: spec.title || '', fontFamily: st.head, fontSize: fs, bold: true, color: st.ink, lineHeight: 1.06 }))
  els.push(T({ x: tx + 26, y: titleY + tH + gapTB, w: iw, h: bH + 6, text: body, fontFamily: st.body, fontSize: bfs, color: st.soft, lineHeight: bfs < 17 ? 1.45 : 1.5 }))
  return { background: bg(st), elements: els }
}
function closing(spec, st) {
  const els = []
  const title = spec.title || 'Takk'
  if (hasPhoto(spec)) {
    const fs = fit(title, 70, 760, 2)
    const tH = txtH(title, fs, 760, 1.0)
    const ty = Math.round(280 - tH / 2)
    els.push(PHOTO({ x: 0, y: 0, w: CW, h: CH }, photoQ(spec)))
    els.push(SCRIM('linear-gradient(120deg, rgba(20,18,16,.86), rgba(20,18,16,.4))'))
    els.push(...chip(spec.eyebrow || 'Takk', 72, ty - 48, st.acc, st.dark ? '#15110e' : '#fff'))
    els.push(T({ x: 72, y: ty, w: 760, h: tH + 12, text: title, fontFamily: st.head, fontSize: fs, bold: true, color: '#fff', lineHeight: 1 }))
    if (spec.subtitle) els.push(T({ x: 72, y: Math.min(ty + tH + 16, 470), w: 700, h: 40, text: spec.subtitle, fontFamily: st.body, fontSize: 22, color: '#ecdccd' }))
  } else {
    const fs = fit(title, 76, 720, 2)
    const tH = txtH(title, fs, 720, 1.0)
    const ty = Math.round(270 - tH / 2)
    els.push(CIRC({ x: 700, y: 300, w: 360, h: 360, fill: st.acc, opacity: st.dark ? 0.2 : 0.14 }))
    els.push(...chip(spec.eyebrow || 'Takk', 72, ty - 48, st.acc, st.dark ? '#15110e' : '#fff'))
    els.push(T({ x: 72, y: ty, w: 720, h: tH + 12, text: title, fontFamily: st.head, fontSize: fs, bold: true, color: st.ink, lineHeight: 1 }))
    if (spec.subtitle) els.push(T({ x: 72, y: Math.min(ty + tH + 16, 470), w: 640, h: 40, text: spec.subtitle, fontFamily: st.body, fontSize: 22, color: st.soft }))
  }
  return { background: bg(st), elements: els }
}

// ---------- smaa hjelpere ----------
function eyebrow(spec, st, x, y) {
  return [T({ x, y, w: 300, h: 24, text: (spec.eyebrow || spec.kicker || 'Oversikt').toUpperCase(), fontFamily: 'Inter', fontSize: 13, color: st.acc, bold: true, letterSpacing: 2 })]
}
function splitBullet(b) {
  const s = String(b || '')
  const m = s.match(/^([^:–-]{2,28})[:–-]\s*(.+)$/)
  if (m) return { head: m[1].trim(), body: m[2].trim() }
  const words = s.split(' ')
  if (words.length > 4) return { head: words.slice(0, 2).join(' '), body: s }
  return { head: s, body: '' }
}
function parseStats(spec) {
  const out = []
  for (const b of (spec.bullets || spec.stats || [])) {
    const s = String(b)
    // fang hele tallområder («7-9») som ett tall, ikke bare det første tallet
    const m = s.match(/(\d[\d.,]*(?:\s*[-–]\s*\d[\d.,]*)?\s?(?:%|k|K|M|mrd|kr|\+|x|°)?)/)
    if (m) out.push({ big: m[1].replace(/\s*[-–]\s*/, '–').trim(), lab: s.replace(m[1], '').replace(/^[\s:–-]+/, '').trim() || 'tall' })
    else out.push({ big: s.slice(0, 6), lab: '' })
  }
  if (!out.length) return [{ big: '100%', lab: 'eksempel' }, { big: '3×', lab: 'mer' }, { big: '#1', lab: 'beste' }]
  return out
}

// ---------- nye oppsett: tidslinje + sammenligning ----------
function timeline(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 56, text: spec.title || '', fontFamily: st.head, fontSize: 40, bold: true, color: st.ink }))
  const items = (spec.bullets || []).slice(0, 5)
  const n = items.length || 1
  const top = 210, bottom = 498
  const rowH = Math.floor((bottom - top) / n)
  const railX = 112
  if (n > 1) els.push(RECT({ x: railX - 2, y: top + 11, w: 4, h: rowH * (n - 1), fill: tint(st.acc, st.bg, 0.45), radius: 2 }))
  items.forEach((b, i) => {
    const ry = top + i * rowH
    const s = String(b)
    const ci = s.indexOf(':')
    const head = ci > 0 && ci <= 32 ? s.slice(0, ci).trim() : ''
    const body = head ? s.slice(ci + 1).trim() : s
    els.push(CIRC({ x: railX - 11, y: ry, w: 22, h: 22, fill: st.acc }))
    if (head) {
      els.push(T({ x: railX + 34, y: ry - 5, w: 736, h: 28, text: head, fontFamily: st.head, fontSize: 21, bold: true, color: st.ink }))
      els.push(T({ x: railX + 34, y: ry + 24, w: 736, h: rowH - 30, text: body, fontFamily: st.body, fontSize: 16, color: st.soft, lineHeight: 1.35 }))
    } else {
      els.push(T({ x: railX + 34, y: ry - 2, w: 736, h: rowH - 8, text: body, fontFamily: st.body, fontSize: 18, color: st.ink, lineHeight: 1.35 }))
    }
  })
  return { background: bg(st), elements: els }
}
function comparison(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 56, text: spec.title || '', fontFamily: st.head, fontSize: 40, bold: true, color: st.ink }))
  let cols = (spec.columns || []).slice(0, 2)
  if (cols.length < 2) {
    const bl = spec.bullets || []
    const half = Math.ceil(bl.length / 2) || 1
    cols = [{ heading: 'Fordeler', bullets: bl.slice(0, half) }, { heading: 'Ulemper', bullets: bl.slice(half) }]
  }
  const gap = 60, w = Math.floor((816 - gap) / 2)
  const colY = 212, colH = 272
  cols.forEach((c, i) => {
    const x = 72 + i * (w + gap)
    const accent = i === 0 ? st.acc : tint(st.ink, st.acc, 0.45)
    els.push(RECT({ x, y: colY, w, h: colH, fill: st.card, radius: 20 }))
    els.push(RECT({ x: x + 26, y: colY + 28, w: 38, h: 5, fill: accent, radius: 3 }))
    els.push(T({ x: x + 26, y: colY + 46, w: w - 52, h: 34, text: c.heading || (i === 0 ? 'A' : 'B'), fontFamily: st.head, fontSize: 24, bold: true, color: accent }))
    els.push(T({ x: x + 26, y: colY + 92, w: w - 52, h: colH - 112, text: (c.bullets || []).map((b) => '· ' + b).join('\n'), fontFamily: st.body, fontSize: 16, color: st.soft, lineHeight: 1.45 }))
  })
  const vx = 72 + w + gap / 2, vy = colY + colH / 2
  els.push(CIRC({ x: vx - 27, y: vy - 27, w: 54, h: 54, fill: st.acc }))
  els.push(T({ x: vx - 27, y: vy - 13, w: 54, h: 28, text: 'VS', fontFamily: st.head, fontSize: 19, bold: true, color: st.dark ? '#15110e' : '#fff', align: 'center' }))
  return { background: bg(st), elements: els }
}
function processSteps(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 60, text: spec.title || '', fontFamily: st.head, fontSize: 42, bold: true, color: st.ink }))
  const items = (spec.bullets || []).slice(0, 4)
  const n = items.length || 1
  const gap = 20, w = Math.floor((816 - gap * (n - 1)) / n)
  items.forEach((b, i) => {
    const x = 72 + i * (w + gap)
    const s = String(b), ci = s.indexOf(':')
    const head = ci > 0 && ci <= 30 ? s.slice(0, ci).trim() : ''
    const body = head ? s.slice(ci + 1).trim() : s
    els.push(RECT({ x, y: 226, w, h: 244, fill: st.card, radius: 18 }))
    els.push(CIRC({ x: x + 22, y: 250, w: 46, h: 46, fill: st.acc }))
    els.push(T({ x: x + 22, y: 261, w: 46, h: 30, text: String(i + 1), fontFamily: st.head, fontSize: 22, bold: true, color: st.dark ? '#15110e' : '#fff', align: 'center' }))
    if (head) els.push(T({ x: x + 22, y: 312, w: w - 44, h: 30, text: head, fontFamily: st.head, fontSize: 18, bold: true, color: st.ink }))
    els.push(T({ x: x + 22, y: head ? 344 : 314, w: w - 44, h: 116, text: body, fontFamily: st.body, fontSize: 15, color: st.soft, lineHeight: 1.4 }))
    if (i < n - 1) els.push(T({ x: x + w - 2, y: 318, w: gap + 4, h: 40, text: '→', fontFamily: st.head, fontSize: 24, bold: true, color: st.acc, align: 'center' }))
  })
  return { background: bg(st), elements: els }
}
function numberedList(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 60, text: spec.title || '', fontFamily: st.head, fontSize: 42, bold: true, color: st.ink }))
  const items = (spec.bullets || []).slice(0, 5)
  const n = items.length || 1
  const top = 208, bottom = 500, rowH = Math.floor((bottom - top) / n)
  items.forEach((b, i) => {
    const ry = top + i * rowH
    const s = String(b), ci = s.indexOf(':')
    const head = ci > 0 && ci <= 30 ? s.slice(0, ci).trim() : ''
    const body = head ? s.slice(ci + 1).trim() : s
    els.push(T({ x: 72, y: ry - 8, w: 96, h: 64, text: String(i + 1).padStart(2, '0'), fontFamily: st.head, fontSize: 46, bold: true, color: tint(st.acc, st.bg, 0.32) }))
    if (head) {
      els.push(T({ x: 180, y: ry, w: 700, h: 30, text: head, fontFamily: st.head, fontSize: 21, bold: true, color: st.ink }))
      els.push(T({ x: 180, y: ry + 28, w: 700, h: rowH - 32, text: body, fontFamily: st.body, fontSize: 16, color: st.soft, lineHeight: 1.35 }))
    } else {
      els.push(T({ x: 180, y: ry + 4, w: 700, h: rowH - 10, text: body, fontFamily: st.body, fontSize: 19, color: st.ink, lineHeight: 1.3 }))
    }
  })
  return { background: bg(st), elements: els }
}
function kpiRow(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 64, text: spec.title || '', fontFamily: st.head, fontSize: 44, bold: true, color: st.ink }))
  const stats = parseStats(spec).slice(0, 4)
  const n = stats.length || 1
  const gap = 22, w = Math.floor((816 - gap * (n - 1)) / n)
  stats.forEach((s, i) => {
    const x = 72 + i * (w + gap)
    els.push(RECT({ x, y: 234, w, h: 218, fill: st.card, radius: 20 }))
    els.push(T({ x: x + 14, y: 270, w: w - 28, h: 80, text: s.big, fontFamily: st.head, fontSize: 52, bold: true, color: st.acc, lineHeight: 1, align: 'center' }))
    els.push(T({ x: x + 14, y: 360, w: w - 28, h: 78, text: s.lab, fontFamily: st.body, fontSize: 16, color: st.soft, lineHeight: 1.3, align: 'center' }))
  })
  return { background: bg(st), elements: els }
}
function checklist(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  els.push(T({ x: 72, y: 116, w: 816, h: 64, text: spec.title || '', fontFamily: st.head, fontSize: 44, bold: true, color: st.ink }))
  const items = (spec.bullets || []).slice(0, 6)
  const n = items.length || 1
  const top = 214, bottom = 498, rowH = Math.min(62, Math.floor((bottom - top) / n))
  items.forEach((b, i) => {
    const ry = top + i * rowH
    els.push(CIRC({ x: 72, y: ry, w: 30, h: 30, fill: '#1faf6b' }))
    els.push(ICON('ph:check-bold', '#ffffff', 78, ry + 6, 18))
    els.push(T({ x: 122, y: ry + 2, w: 740, h: rowH - 6, text: String(b).replace(/^[·•\-\s]+/, ''), fontFamily: st.body, fontSize: 19, color: st.ink, lineHeight: 1.3 }))
  })
  return { background: bg(st), elements: els }
}
function quotePortrait(spec, st) {
  const els = []
  const q = spec.statement || spec.title || ''
  const imgX = 96, imgY = 168, imgD = 204
  if (hasPhoto(spec) || spec.image) {
    els.push(PHOTO({ x: imgX, y: imgY, w: imgD, h: imgD, radius: imgD / 2 }, photoQ(spec)))
  } else {
    els.push(CIRC({ x: imgX, y: imgY, w: imgD, h: imgD, fill: tint(st.acc, st.bg, 0.5) }))
    els.push(T({ x: imgX, y: imgY + 56, w: imgD, h: 90, text: '“', fontFamily: st.head, fontSize: 100, bold: true, color: st.acc, align: 'center', lineHeight: 1 }))
  }
  const tx = imgX + imgD + 52, tw = 888 - tx
  const fs = fit(q, 34, tw, 5)
  const qH = txtH(q, fs, tw, 1.2)
  const qy = Math.max(150, Math.round(268 - qH / 2))
  els.push(T({ x: tx, y: qy, w: tw, h: qH + 12, text: '“' + q + '”', fontFamily: st.head, fontSize: fs, italic: true, bold: true, color: st.ink, lineHeight: 1.2 }))
  if (spec.subtitle) els.push(T({ x: tx, y: qy + qH + 20, w: tw, h: 28, text: '— ' + spec.subtitle, fontFamily: 'Inter', fontSize: 15, color: st.acc, bold: true, letterSpacing: 1 }))
  return { background: bg(st), elements: els }
}
function mindMap(spec, st) {
  const els = []
  els.push(...eyebrow(spec, st, 72, 84))
  const items = (spec.bullets || []).slice(0, 6)
  const slots = [[60, 150], [690, 150], [36, 300], [714, 300], [60, 446], [690, 446]]
  const bw = 206, bh = 56
  const cx = 480, cy = 312, cR = 88
  items.forEach((b, i) => {
    const [sx, sy] = slots[i]
    els.push(RECT({ x: sx, y: sy, w: bw, h: bh, fill: st.card, radius: 14 }))
    els.push(T({ x: sx + 16, y: sy + 9, w: bw - 32, h: bh - 14, text: String(b).replace(/^[·•\-\s]+/, ''), fontFamily: st.body, fontSize: 15, color: st.ink, lineHeight: 1.25 }))
  })
  els.push(CIRC({ x: cx - cR, y: cy - cR, w: cR * 2, h: cR * 2, fill: st.acc }))
  els.push(T({ x: cx - cR + 12, y: cy - 28, w: cR * 2 - 24, h: 60, text: spec.title || '', fontFamily: st.head, fontSize: 19, bold: true, color: st.dark ? '#15110e' : '#fff', align: 'center', lineHeight: 1.05 }))
  return { background: bg(st), elements: els }
}
function factBox(spec, st) {
  const els = []
  const fact = (spec.bullets && spec.bullets[0]) || spec.statement || spec.subtitle || spec.title || ''
  els.push(CIRC({ x: -90, y: -90, w: 280, h: 280, fill: st.acc, opacity: st.dark ? 0.18 : 0.12 }))
  els.push(CIRC({ x: 770, y: 350, w: 300, h: 300, fill: st.acc, opacity: st.dark ? 0.18 : 0.12 }))
  const cardW = 660
  const fs0 = fit(fact, 30, cardW - 80, 6)
  const fH = txtH(fact, fs0, cardW - 80, 1.4)
  const cardH = Math.min(360, 150 + fH)
  const cx = Math.round((960 - cardW) / 2), cy = Math.round((540 - cardH) / 2)
  els.push(RECT({ x: cx, y: cy, w: cardW, h: cardH, fill: st.card, radius: 24 }))
  els.push(...chip(spec.eyebrow || 'Visste du at?', cx + 40, cy + 34, st.acc, st.dark ? '#15110e' : '#fff'))
  els.push(T({ x: cx + 40, y: cy + 82, w: cardW - 80, h: fH + 12, text: fact, fontFamily: st.head, fontSize: fs0, bold: true, color: st.ink, lineHeight: 1.4 }))
  return { background: bg(st), elements: els }
}
// gjenkjenn innhold som passer de nye oppsettene
function looksTimeline(spec) {
  const bl = (spec.bullets || [])
  if (bl.length < 2) return false
  const hits = bl.filter((b) => /(\b\d{4}\b|\d{2,4}-tallet|^\s*steg\b|^\s*trinn\b|^\s*fase\b|^\s*\d{1,2}\s*[:.)])/i.test(String(b))).length
  if (hits >= 2) return true
  const t = (spec.title || '').toLowerCase()
  return /tidslinje|historie|utvikling|gjennom tiden|milepæl|kronologi/.test(t) && bl.length >= 3
}
function looksComparison(spec) {
  const t = (spec.title || '').toLowerCase()
  if (/\bvs\b|versus|sammenlign|fordeler og ulemper|før og nå|pro og kontra/.test(t)) return true
  if ((spec.columns || []).length === 2) {
    const heads = (spec.columns || []).map((c) => (c.heading || '').toLowerCase()).join(' ')
    if (/fordel|ulemp|før|nå|pro\b|kontra|positiv|negativ/.test(heads)) return true
  }
  return false
}
function looksProcess(spec) {
  const t = (spec.title || '').toLowerCase()
  if (/\bslik\b|fremgangsmåte|oppskrift|prosess|trinn for trinn|steg for steg|hvordan (lage|gjøre|komme)/.test(t)) return true
  const bl = spec.bullets || []
  return bl.length >= 2 && bl.length <= 4 && bl.filter((b) => /^\s*(steg|trinn)\s*\d/i.test(String(b))).length >= 2
}
function looksNumbered(spec) {
  return /\b\d+\s+(grunner|tips|måter|ting|råd|punkter|fordeler|grep|tegn|vaner|trinn|prinsipper|nøkler|kjennetegn)\b|topp\s*\d+/i.test(spec.title || '')
}
function looksKpi(spec) {
  const bl = spec.bullets || []
  if (bl.length < 3 || bl.length > 4) return false
  return bl.every((b) => /\d/.test(String(b)) && String(b).length < 44)
}
function looksChecklist(spec) {
  return /sjekkliste|dette får du|hva du får|fordelene|fordeler med|inkludert|fordeler:|huskeliste/i.test(spec.title || '')
}
function looksFact(spec) {
  return /visste du|kuriosa|fun fact|fakta:/i.test(spec.title || '')
}
function looksMindmap(spec) {
  const bl = spec.bullets || []
  return /oversikt over|komponenter|elementer|aspekter|deler av|kategorier|temaer|grener|hovedområder/i.test(spec.title || '') && bl.length >= 3 && bl.length <= 6
}
function looksPortrait(spec) {
  const isQuote = spec.layout === 'statement' || spec.layout === 'imageFull' || !!spec.statement
  return isQuote && spec.subtitle && /^[A-ZÆØÅ]/.test(String(spec.subtitle)) && String(spec.subtitle).length < 40
}

// ---------- velg layout pr lysbilde (variasjon) ----------
function designSlide(spec, st, idx, isFirst, isLast, varied = true) {
  const L = spec.layout || 'bullets'
  if (isFirst || L === 'cover') return coverSplit(spec, st)
  if (isLast && L !== 'twoColumn') return closing(spec, st)
  if (L === 'section') return section(spec, st)
  if (varied) {
    if (L === 'timeline') return timeline(spec, st)
    if (L === 'comparison') return comparison(spec, st)
    if (L === 'process') return processSteps(spec, st)
    if (L === 'numbered') return numberedList(spec, st)
    if (L === 'kpi') return kpiRow(spec, st)
    if (L === 'checklist') return checklist(spec, st)
    if (L === 'mindmap') return mindMap(spec, st)
    if (L === 'fact') return factBox(spec, st)
  }
  if (L === 'statement') {
    if (varied && looksPortrait(spec)) return quotePortrait(spec, st)
    return (parseStats(spec).length >= 2 && /\d/.test((spec.bullets || []).join(''))) ? statBig(spec, st) : quote(spec, st)
  }
  if (L === 'twoColumn') return (varied && looksComparison(spec)) ? comparison(spec, st) : twoColumn(spec, st)
  if (L === 'imageFull') return (varied && looksPortrait(spec)) ? quotePortrait(spec, st) : quote(spec.statement ? spec : { ...spec, statement: spec.title }, st)
  if (L === 'imageText') return photoText(spec, st, idx % 2 === 1)
  // bullets: i variert modus gjenkjenner vi spesialtilfeller; ellers klassisk (som v78)
  if (varied) {
    if (looksTimeline(spec)) return timeline(spec, st)
    if (looksComparison(spec)) return comparison(spec, st)
    if (looksProcess(spec)) return processSteps(spec, st)
    if (looksFact(spec)) return factBox(spec, st)
    if (looksChecklist(spec)) return checklist(spec, st)
    if (looksNumbered(spec)) return numberedList(spec, st)
    if (looksKpi(spec)) return kpiRow(spec, st)
    if (looksMindmap(spec)) return mindMap(spec, st)
  }
  const bl = (spec.bullets || [])
  if (bl.length && bl.length <= 3 && bl.every((b) => String(b).length < 90)) return iconCards(spec, st)
  return photoText(spec, st, idx % 2 === 1)
}

// ---------- offentlig: bygg helt dekk fra AI-lysbilder ----------
// liten fargemikser (lokal, deck.mix er ikke eksportert)
function tint(hex, target, t) {
  const A = hex.replace('#', ''), B = target.replace('#', '')
  const f = (s, i) => parseInt(s.slice(i, i + 2), 16)
  const r = Math.round(f(A, 0) + (f(B, 0) - f(A, 0)) * t)
  const g = Math.round(f(A, 2) + (f(B, 2) - f(A, 2)) * t)
  const b = Math.round(f(A, 4) + (f(B, 4) - f(A, 4)) * t)
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}
// fargeord (norsk/engelsk) -> hex. Compounds først.
const COLOR_WORDS = [
  ['mørkeblå', '#1e3a8a'], ['morkebla', '#1e3a8a'], ['lyseblå', '#5b9bd5'], ['lysebla', '#5b9bd5'],
  ['blå', '#2563eb'], ['bla ', '#2563eb'], ['blue', '#2563eb'], ['navy', '#1e3a8a'],
  ['rød', '#d23b3b'], ['rod', '#d23b3b'], ['red', '#d23b3b'],
  ['grønn', '#2e9e5b'], ['gronn', '#2e9e5b'], ['green', '#2e9e5b'],
  ['turkis', '#13a9a0'], ['teal', '#13a9a0'],
  ['gul', '#e0b400'], ['yellow', '#e0b400'], ['gull', '#c9a227'], ['gold', '#c9a227'],
  ['oransje', '#e07b39'], ['orange', '#e07b39'],
  ['lilla', '#7c3aed'], ['fiolett', '#7c3aed'], ['purple', '#7c3aed'],
  ['rosa', '#e07ba6'], ['pink', '#e07ba6'],
  ['brun', '#8a5a3b'], ['brown', '#8a5a3b'], ['beige', '#cdb9a0'],
  ['svart', '#121212'], ['black', '#121212'],
  ['hvit', '#ffffff'], ['white', '#ffffff'],
  ['grå', '#8a8a8a'], ['graa', '#8a8a8a'], ['gray', '#8a8a8a'], ['grey', '#8a8a8a'],
]
function parseColors(hint) {
  const h = ' ' + String(hint || '').toLowerCase() + ' '
  const out = []; const seen = new Set()
  for (const [w, hex] of COLOR_WORDS) {
    if (h.includes(w) && !seen.has(hex)) { out.push(hex); seen.add(hex) }
  }
  return out
}
// bygg en egendefinert palett ut fra fargeord i teksten (ellers null)
function customStyle(hint) {
  const cols = parseColors(hint)
  if (!cols.length) return null
  const h = String(hint || '').toLowerCase()
  const wantDark = /(mørk|mork|dark|natt)/.test(h)
  const hasWhite = cols.includes('#ffffff')
  const hasBlack = cols.includes('#121212')
  const acc = cols.find((c) => c !== '#ffffff' && c !== '#121212' && c !== '#8a8a8a') || cols[0]
  const dark = wantDark || (hasBlack && !hasWhite)
  if (dark) {
    return { id: 'egendefinert', bg: '#13151a', ink: '#f4f6fb', soft: '#aeb6c4', acc, card: tint('#13151a', acc, 0.16), head: 'Space Grotesk', body: 'Inter', dark: true }
  }
  return { id: 'egendefinert', bg: '#ffffff', ink: '#16181d', soft: '#5c6270', acc, card: tint('#ffffff', acc, 0.10), head: 'Playfair Display', body: 'Inter', dark: false }
}
// finn riktig stil: manuelt valg > egendefinerte farger > emne/stikkord
export function resolveStyle(title = '', hint = '', overrideId = null) {
  if (overrideId && STYLES[overrideId]) return { id: overrideId, style: STYLES[overrideId], name: PRETTY[overrideId] || overrideId }
  const custom = customStyle(hint)
  if (custom) return { id: 'egendefinert', style: custom, name: 'Egendefinert' }
  const id = pickStyle(title, hint)
  return { id, style: STYLES[id], name: PRETTY[id] || id }
}
function themeFromStyle(st, id) {
  return { name: id, bg: st.bg, title: st.ink, text: st.soft, accent: st.acc, fontHead: st.head, fontBody: st.body, style: 'corners' }
}

export function designDeck(aiSlides, opts = {}) {
  const r = resolveStyle(opts.title || '', opts.hint || '', opts.styleId)
  const styleId = r.id, st = r.style
  const list = (aiSlides && aiSlides.length) ? aiSlides : [{ layout: 'cover', title: opts.title || 'Uten tittel' }]
  const varied = opts.varied !== false   // standard: variert
  const slides = list.map((spec, i) => {
    const built = designSlide(spec || {}, st, i, i === 0, i === list.length - 1, varied)
    // lim hver tekstboks tett rundt teksten (måles i nettleseren)
    const elements = built.elements.map((e) => (e.type === 'text' ? fitTextBox({ ...e, text: cleanText(e.text) }) : e))
    return { id: genId(), background: built.background, elements, notes: spec.notes || '', anim: { transition: 'fade' }, layout: spec.layout || 'bullets', style: styleId }
  })
  return { styleId, style: st, styleName: r.name, theme: themeFromStyle(st, styleId), slides }
}

// Pene navn + liste for forhåndsvisning av stiler
const PRETTY = {
  editorial: 'Editorial', natur: 'Natur', pastell: 'Pastell', graatone: 'Gråtone', natt: 'Mørk & varm', tech: 'Tech', botanisk: 'Botanisk',
  korall: 'Korall', ocean: 'Ocean', midnatt: 'Midnatt', solnedgang: 'Solnedgang', mynte: 'Mynte', lavendel: 'Lavendel', safran: 'Safran',
  burgunder: 'Burgunder', kull: 'Kull', sitrus: 'Sitrus', indigo: 'Indigo', terracotta: 'Terrakotta', arktis: 'Arktis', rosegull: 'Rosegull',
  skog: 'Skog', plomme: 'Plomme', mokka: 'Mokka', elektrisk: 'Elektrisk', fersken: 'Fersken', staal: 'Stål',
}
export const STYLE_LIST = STYLE_IDS.map((id) => ({ id, name: PRETTY[id] || id }))

// Et eksempel-forsidebilde i en gitt stil (foto byttes til fargefelt – ingen henting).
export function previewCover(styleId, title) {
  const st = STYLES[styleId] || STYLES.editorial
  const built = coverSplit({ layout: 'cover', title: title || 'Din presentasjon', subtitle: 'Forhåndsvisning av stilen', figure: 'star', eyebrow: 'Forhåndsvisning' }, st)
  const els = built.elements.map((e) => (e.photoSlot ? { ...shapeEl({ kind: 'rect', x: e.x, y: e.y, w: e.w, h: e.h, fill: st.acc, radius: 0, opacity: 0.92 }), decor: true } : e))
  els.push({ ...imageEl({ x: 686, y: 230, w: 128, h: 128, src: ICONIFY('ph:sparkle-fill', st.dark ? '#0b1220' : '#ffffff'), fit: 'contain', caption: '' }), decor: true })
  return { id: genId(), background: built.background, elements: els.map((e) => (e.type === 'text' ? fitTextBox(e) : e)), anim: { transition: 'fade' } }
}

// tema som lagres paa dekket (for editor-verktoey)
export function themeOfStyle(styleId) {
  const st = STYLES[styleId] || STYLES.editorial
  return { name: styleId, bg: st.bg, title: st.ink, text: st.soft, accent: st.acc, fontHead: st.head, fontBody: st.body, style: 'corners' }
}
