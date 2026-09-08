import PptxGenJS from 'pptxgenjs'
import { jsPDF } from 'jspdf'
import { CW, CH } from './deck'

const IN_W = 10, IN_H = 5.625
const sx = IN_W / CW, sy = IN_H / CH
// senket/hevet tall (₂ ⁴ osv.) -> vanlige tall, så de ikke roter til eksport-fontene
const SUBSUP = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
const sanitize = (t) => String(t || '').replace(/[₀-₉⁰¹²³⁴-⁹]/g, (c) => SUBSUP[c] || c)
// jsPDF/helvetica støtter ikke emoji – fjern dem (og normaliser tall) for PDF.
const stripEmoji = (t) => sanitize(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu, '').replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim()
const expandHex = (h) => (h.length === 3 ? h.split('').map((x) => x + x).join('') : h)
const isGradient = (c) => /gradient/i.test(String(c || ''))
// -> [r,g,b] for hex (#fff og #ffffff), rgb()/rgba(); ellers null
function rgbOf(c) {
  let s = String(c || '').trim()
  const m = s.match(/rgba?\(([^)]+)\)/i)
  if (m) { const p = m[1].split(',').map((v) => parseFloat(v)); return [p[0] || 0, p[1] || 0, p[2] || 0] }
  s = s.replace('#', '')
  if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(s)) { const e = expandHex(s); return [parseInt(e.slice(0, 2), 16), parseInt(e.slice(2, 4), 16), parseInt(e.slice(4, 6), 16)] }
  return null
}
// alltid [r,g,b]; for gradient: finn første farge i strengen, ellers fallback
function colorOf(c, fallback) {
  const direct = rgbOf(c)
  if (direct) return direct
  const s = String(c || '')
  const hit = s.match(/rgba?\([^)]+\)|#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/i)
  if (hit) { const r = rgbOf(hit[0]); if (r) return r }
  return fallback || [0, 0, 0]
}
// 6-sifret hex uten # (PPTX). Gradient/ugyldig -> svart.
function noHash(c) {
  const rgb = rgbOf(c) || colorOf(c, null)
  if (!rgb) return '000000'
  return rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase()
}
function hexRgb(c) { return colorOf(c, [0, 0, 0]) }

// Mørkt slør som ett jevnt gradient-bilde (lyst øverst -> mørkt nederst) – ingen striper.
let _scrimUrl = null
function scrimDataUrl() {
  if (_scrimUrl) return _scrimUrl
  try {
    const c = document.createElement('canvas')
    c.width = 8; c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, 'rgba(15,14,12,0.10)')
    g.addColorStop(0.55, 'rgba(15,14,12,0.42)')
    g.addColorStop(1, 'rgba(15,14,12,0.80)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 256)
    _scrimUrl = c.toDataURL('image/png')
  } catch (_e) { _scrimUrl = null }
  return _scrimUrl
}

async function buildPptx(deck, watermark = false) {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'AP', width: IN_W, height: IN_H })
  pptx.layout = 'AP'
  for (const slide of deck.slides) {
    const s = pptx.addSlide()
    s.background = { color: noHash(slide.background) }
    if (slide.notes) s.addNotes(slide.notes)
    for (const el of slide.elements) {
      const box = { x: el.x * sx, y: el.y * sy, w: el.w * sx, h: el.h * sy }
      if (el.type === 'shape') {
        if (el.kind === 'silhouette') continue
        const op = el.opacity ?? 1
        const trans = Math.round((1 - op) * 100)
        const isRing = !el.fill || el.fill === 'transparent'
        const grad = isGradient(el.fill) || el.overlay
        const fill = grad
          ? { color: '0F0E0C', transparency: 50 }
          : { color: noHash(isRing ? (el.stroke || '#888888') : el.fill), transparency: isRing ? 100 : trans }
        const line = (el.strokeW && el.stroke) ? { color: noHash(el.stroke), width: Math.max(0.5, el.strokeW * sx), transparency: trans } : undefined
        const rotate = el.rotation || 0
        const opts = { ...box, fill, line, rotate }
        try {
          if (el.kind === 'circle') s.addShape(pptx.ShapeType.ellipse, opts)
          else if (el.kind === 'arrow') s.addShape(pptx.ShapeType.rightArrow, opts)
          else if (el.kind === 'star') s.addShape('star5', opts)
          else if (el.kind === 'triangle') s.addShape('triangle', opts)
          else if (el.kind === 'hexagon') s.addShape('hexagon', opts)
          else if (el.kind === 'heart') s.addShape('heart', opts)
          else if (el.kind === 'bubble') s.addShape('wedgeRectCallout', opts)
          else if (el.kind === 'line') s.addShape(pptx.ShapeType.rect, { x: box.x, y: box.y + box.h / 2 - 0.02, w: box.w, h: 0.04, fill })
          else { const type = (el.radius || 0) > 4 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect; s.addShape(type, { ...opts, rectRadius: (el.radius || 0) * sx }) }
        } catch (_e) { try { s.addShape(pptx.ShapeType.rect, { ...box, fill }) } catch (_e2) { /* skip */ } }
      } else if (el.type === 'table') {
        const rows = el.rows.map((r, ri) => r.map((c) => ({ text: stripEmoji(c) || ' ',
          options: { fontSize: Math.round(el.fontSize * 0.75), color: noHash(el.color), bold: el.header && ri === 0, fill: el.header && ri === 0 ? { color: noHash(el.accent), transparency: 80 } : undefined, valign: 'middle' } })))
        try { s.addTable(rows, { ...box, border: { type: 'solid', color: noHash(el.accent), pt: 0.5 }, align: 'left' }) } catch (_e) { /* skip */ }
      } else if (el.type === 'text') {
        s.addText(sanitize(el.text) || '', { ...box, fontSize: Math.round(el.fontSize * 0.75), color: noHash(el.color),
          bold: !!el.bold, italic: !!el.italic, underline: el.underline ? { style: 'sng' } : undefined,
          align: el.align || 'left', valign: 'top', fontFace: el.fontFamily || 'Inter', lineSpacingMultiple: el.lineHeight || 1.2, fit: 'shrink', shrinkText: true })
      } else if (el.type === 'image') {
        if (el.decor) { /* dekor-ikon – hoppes over i PowerPoint */ }
        else if (el.src) { try { s.addImage({ path: el.src, ...box, sizing: { type: el.fit === 'contain' ? 'contain' : 'cover', w: box.w, h: box.h } }) } catch (_e) { /* skip */ } }
        else {
          s.addShape(pptx.ShapeType.rect, { ...box, fill: { color: 'EEEEEE' }, line: { color: 'C8C8C8', dashType: 'dash' } })
          s.addText('🖼️ ' + (el.caption || 'Bilde'), { ...box, fontSize: 12, color: '888888', align: 'center', valign: 'middle' })
        }
      }
    }
    if (watermark) {
      s.addText('AiPresent', { x: 0, y: IN_H / 2 - 0.7, w: IN_W, h: 1.4, align: 'center', valign: 'middle', fontSize: 60, bold: true, color: 'FFFFFF', transparency: 55, fontFace: 'Arial', shadow: { type: 'outer', color: '000000', opacity: 0.45, blur: 4, offset: 2, angle: 45 } })
    }
  }
  return pptx
}

export async function exportPptx(deck, watermark = false) {
  const pptx = await buildPptx(deck, watermark)
  await pptx.writeFile({ fileName: (deck.title || 'presentasjon') + '.pptx' })
}

export async function pptxBlob(deck, watermark = false) {
  const pptx = await buildPptx(deck, watermark)
  return pptx.write({ outputType: 'blob' })
}

export function exportPdf(deck, watermark = false) {
  const mmW = IN_W * 25.4, mmH = IN_H * 25.4
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [mmW, mmH] })
  const mx = mmW / CW, my = mmH / CH
  deck.slides.forEach((slide, i) => {
    if (i > 0) pdf.addPage([mmW, mmH], 'landscape')
    pdf.setFillColor(...colorOf(slide.background, [255, 255, 255])); pdf.rect(0, 0, mmW, mmH, 'F')
    for (const el of slide.elements) {
      const x = el.x * mx, y = el.y * my, w = el.w * mx, h = el.h * my
      if (el.type === 'shape') {
        if (el.kind === 'silhouette') continue
        const op = el.opacity ?? 1
        let g
        try { if (op < 1) { g = new pdf.GState({ opacity: op }); pdf.saveGraphicsState(); pdf.setGState(g) } } catch (_e) { g = null }
        const isRing = !el.fill || el.fill === 'transparent'
        if (isGradient(el.fill) || el.overlay) {
          // mørkt slør som ett jevnt gradient-bilde – ingen synlige striper
          const url = scrimDataUrl()
          let ok = false
          if (url) { try { pdf.addImage(url, 'PNG', x, y, w, h); ok = true } catch (_e) { ok = false } }
          if (!ok) {
            let gb = null
            try { gb = new pdf.GState({ opacity: 0.5 }); pdf.saveGraphicsState(); pdf.setGState(gb) } catch (_e) { gb = null }
            pdf.setFillColor(15, 14, 12); pdf.rect(x, y, w, h, 'F')
            if (gb) { try { pdf.restoreGraphicsState() } catch (_e) { /* ignore */ } }
          }
        } else if (isRing && el.stroke) {
          pdf.setDrawColor(...hexRgb(el.stroke)); pdf.setLineWidth(Math.max(0.3, (el.strokeW || 2) * mx))
          if (el.kind === 'circle') pdf.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 'S')
          else pdf.rect(x, y, w, h, 'S')
          pdf.setLineWidth(0.2)
        } else {
          pdf.setFillColor(...colorOf(el.fill || '#888888', [136, 136, 136]))
          if (el.kind === 'circle') pdf.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 'F')
          else if (el.kind === 'line') pdf.rect(x, y + h / 2 - h * 0.3, w, Math.max(0.5, h * 0.6), 'F')
          else if (el.kind === 'arrow') { pdf.rect(x, y + h * 0.35, w * 0.75, h * 0.3, 'F'); try { pdf.triangle(x + w * 0.7, y, x + w, y + h / 2, x + w * 0.7, y + h, 'F') } catch (_e) { /* ignore */ } }
          else if (el.kind === 'star') pdf.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 'F')
          else if (el.kind === 'triangle') { try { pdf.triangle(x + w / 2, y, x + w, y + h, x, y + h, 'F') } catch (_e) { pdf.rect(x, y, w, h, 'F') } }
          else { const r = Math.min((el.radius || 0) * mx, w / 2, h / 2); if (r > 0.3) pdf.roundedRect(x, y, w, h, r, r, 'F'); else pdf.rect(x, y, w, h, 'F') }
        }
        if (g) { try { pdf.restoreGraphicsState() } catch (_e) { /* ignore */ } }
      } else if (el.type === 'table') {
        const cols = Math.max(1, ...el.rows.map((r) => r.length)), rowsN = el.rows.length
        const cw = w / cols, rh = h / rowsN
        pdf.setFontSize(el.fontSize * 0.75); pdf.setDrawColor(...hexRgb(el.accent))
        el.rows.forEach((row, ri) => {
          for (let ci = 0; ci < cols; ci++) {
            const cx = x + ci * cw, cy = y + ri * rh
            pdf.setDrawColor(...hexRgb(el.accent)); pdf.rect(cx, cy, cw, rh)
            pdf.setTextColor(...hexRgb(el.color)); pdf.setFont('helvetica', el.header && ri === 0 ? 'bold' : 'normal')
            const txt = stripEmoji(row[ci] || '')
            pdf.text(pdf.splitTextToSize(txt, cw - 3)[0] || '', cx + 2, cy + rh / 2 + 1.5)
          }
        })
      } else if (el.type === 'image' && !el.src) {
        pdf.setFillColor(238, 238, 238); pdf.rect(x, y, w, h, 'F')
        pdf.setTextColor(140, 140, 140); pdf.setFontSize(11)
        pdf.text(pdf.splitTextToSize(stripEmoji(el.caption || 'Bilde'), w - 6), x + w / 2, y + h / 2, { align: 'center' })
      } else if (el.type === 'image' && el.src) {
        if (el.decor) { /* dekor-ikon – hoppes over i PDF */ }
        else try { pdf.addImage(el.src, 'JPEG', x, y, w, h) } catch (_e) {
          pdf.setFillColor(238, 238, 238); pdf.rect(x, y, w, h, 'F')
        }
      } else if (el.type === 'text' && el.text) {
        pdf.setTextColor(...colorOf(el.color, [0, 0, 0]))
        pdf.setFont('helvetica', el.bold ? 'bold' : (el.italic ? 'italic' : 'normal'))
        const txt = stripEmoji(el.text)
        let ptSize = el.fontSize * 0.75
        pdf.setFontSize(ptSize)
        let lines = pdf.splitTextToSize(txt, w)
        let lh = (ptSize * 0.3528) * (el.lineHeight || 1.3)
        // helvetica har andre mål enn design-fonten – krymp så teksten holder seg i boksen
        let guard = 0
        while (ptSize > 6 && lines.length * lh > h + 0.6 && guard < 40) {
          ptSize -= 0.5; pdf.setFontSize(ptSize)
          lines = pdf.splitTextToSize(txt, w)
          lh = (ptSize * 0.3528) * (el.lineHeight || 1.3); guard++
        }
        let ty = y + lh
        const ax = el.align === 'center' ? x + w / 2 : el.align === 'right' ? x + w : x
        lines.forEach((ln) => { pdf.text(ln, ax, ty, { align: el.align || 'left' }); ty += lh })
      }
    }
    if (watermark) {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(66)
      const drawWm = (dx, dy, rgb, op) => {
        let g; try { g = new pdf.GState({ opacity: op }); pdf.saveGraphicsState(); pdf.setGState(g) } catch (_e) { g = null }
        pdf.setTextColor(...rgb)
        try { pdf.text('AiPresent', mmW / 2 + dx, mmH / 2 + dy, { align: 'center', baseline: 'middle' }) } catch (_e) { pdf.text('AiPresent', mmW / 2 + dx, mmH / 2 + dy, { align: 'center' }) }
        if (g) { try { pdf.restoreGraphicsState() } catch (_e) { /* ignore */ } }
      }
      drawWm(0.7, 0.7, [20, 20, 20], 0.22)   // mørk skygge – synlig på lyse bakgrunner
      drawWm(0, 0, [255, 255, 255], 0.5)      // hvit tekst – synlig på mørke bakgrunner
    }
  })
  pdf.save((deck.title || 'presentasjon') + '.pdf')
}
