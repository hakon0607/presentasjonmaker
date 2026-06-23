// Design-motor: gjoer AI-innhold (tittel/punkter/bilde) om til vakre lysbilder
// i app-formatet (elementer paa 960x540). Inspirert av Slidesgo: foto i tomrom,
// editorial fonter, tekstbokser med farge bak, myke former. Hvert lysbilde faar
// sitt eget oppsett -> variasjon.
import { textEl, shapeEl, imageEl, genId } from './deck'

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
}
const STYLE_IDS = Object.keys(STYLES)

// velg stil ut fra emne (enkle stikkord) ellers stabil hash
export function pickStyle(title = '', hint = '') {
  const h = String(hint || '').toLowerCase()
  const t = (title + ' ' + hint).toLowerCase()
  const any = (s, ...w) => w.some((x) => s.includes(x))
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
const SCRIM = (css, p = {}) => ({ ...shapeEl({ kind: 'rect', x: 0, y: 0, w: CW, h: CH, fill: css, radius: 0, ...p }), decor: true })

function chip(text, x, y, bg, fg, style) {
  const w = Math.min(360, 60 + text.length * 11)
  return [
    RECT({ x, y, w, h: 34, fill: bg, radius: 17 }),
    T({ x: x + 16, y: y + 7, w: w - 32, h: 22, text: text.toUpperCase(), fontFamily: 'Inter', fontSize: 13, color: fg, bold: true, letterSpacing: 1.5 }),
  ]
}
// enkel tittel-tilpasning (krymper paa lange titler)
function fit(text, base, w, maxLines = 2) {
  const perLine = Math.max(6, Math.floor(w / (base * 0.56)))
  const lines = Math.max(1, Math.ceil((text || '').length / perLine))
  if (lines <= maxLines) return base
  return Math.max(Math.round(base * (maxLines / lines) * 1.06), Math.round(base * 0.55))
}
// antall linjer + hoyde for en tekst -> brukes til aa stable elementer uten overlapp
function lineCount(text, fs, w) { const per = Math.max(4, Math.floor(w / (fs * 0.54))); return Math.max(1, Math.ceil(String(text || '').length / per)) }
function txtH(text, fs, w, lh = 1.04) { return Math.round(lineCount(text, fs, w) * fs * lh) }
const photoQ = (spec) => (spec.image && spec.image.caption) || spec.photo || spec.figure || spec.title || spec.statement || ''

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
  if (spec.image || photoQ(spec)) {
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
  els.push(PHOTO({ x: px, y: 0, w: 400, h: 540 }, photoQ(spec)))
  const tx = flip ? 440 : 72
  const iw = 340
  els.push(RECT({ x: tx, y: 130, w: 392, h: 300, fill: st.card, radius: 20 }))
  els.push(...eyebrow(spec, st, tx + 28, 158))
  const fs = fit(spec.title, 38, iw, 3)
  const tH = txtH(spec.title, fs, iw, 1.04)
  els.push(T({ x: tx + 26, y: 186, w: iw, h: tH + 8, text: spec.title || '', fontFamily: st.head, fontSize: fs, bold: true, color: st.ink, lineHeight: 1.04 }))
  const by = Math.min(186 + tH + 16, 360)
  const body = (spec.bullets || []).length ? (spec.bullets).map((b) => '· ' + b).join('\n') : (spec.subtitle || '')
  els.push(T({ x: tx + 26, y: by, w: iw, h: 414 - by, text: body, fontFamily: st.body, fontSize: 17, color: st.soft, lineHeight: 1.5 }))
  return { background: bg(st), elements: els }
}
function closing(spec, st) {
  const els = []
  const title = spec.title || 'Takk'
  if (photoQ(spec)) {
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
    const m = s.match(/([\d.,]+\s?(?:%|k|K|M|mrd|kr|\+|x|°)?)/)
    if (m) out.push({ big: m[1].trim(), lab: s.replace(m[1], '').replace(/^[\s:–-]+/, '').trim() || 'tall' })
    else out.push({ big: s.slice(0, 6), lab: '' })
  }
  if (!out.length) return [{ big: '100%', lab: 'eksempel' }, { big: '3×', lab: 'mer' }, { big: '#1', lab: 'beste' }]
  return out
}

// ---------- velg layout pr lysbilde (variasjon) ----------
function designSlide(spec, st, idx, isFirst, isLast) {
  const L = spec.layout || 'bullets'
  if (isFirst || L === 'cover') return (idx % 2 === 0 ? coverSplit : coverSplit)(spec, st) // forside alltid split-foto
  if (isLast && L !== 'twoColumn') return closing(spec, st)
  if (L === 'section') return section(spec, st)
  if (L === 'statement') return (parseStats(spec).length >= 2 && /\d/.test((spec.bullets || []).join(''))) ? statBig(spec, st) : quote(spec, st)
  if (L === 'twoColumn') return twoColumn(spec, st)
  if (L === 'imageFull') return quote(spec.statement ? spec : { ...spec, statement: spec.title }, st)
  if (L === 'imageText') return photoText(spec, st, idx % 2 === 1)
  // bullets: vekslende stiler for variasjon
  const bl = (spec.bullets || [])
  if (bl.length && bl.length <= 3 && bl.every((b) => String(b).length < 90)) return iconCards(spec, st)
  return photoText(spec, st, idx % 2 === 1)
}

// ---------- offentlig: bygg helt dekk fra AI-lysbilder ----------
export function designDeck(aiSlides, opts = {}) {
  const styleId = opts.styleId && STYLES[opts.styleId] ? opts.styleId : pickStyle(opts.title || '', opts.hint || '')
  const st = STYLES[styleId]
  const list = (aiSlides && aiSlides.length) ? aiSlides : [{ layout: 'cover', title: opts.title || 'Uten tittel' }]
  const slides = list.map((spec, i) => {
    const built = designSlide(spec || {}, st, i, i === 0, i === list.length - 1)
    return { id: genId(), background: built.background, elements: built.elements, notes: spec.notes || '', anim: { transition: 'fade' }, layout: spec.layout || 'bullets', style: styleId }
  })
  return { styleId, style: st, slides }
}

// tema som lagres paa dekket (for editor-verktoey)
export function themeOfStyle(styleId) {
  const st = STYLES[styleId] || STYLES.editorial
  return { name: styleId, bg: st.bg, title: st.ink, text: st.soft, accent: st.acc, fontHead: st.head, fontBody: st.body, style: 'corners' }
}
