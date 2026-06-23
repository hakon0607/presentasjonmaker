import PptxGenJS from 'pptxgenjs'
import { jsPDF } from 'jspdf'
import { CW, CH } from './deck'

const IN_W = 10, IN_H = 5.625
const sx = IN_W / CW, sy = IN_H / CH
const noHash = (c) => (c || '#000000').replace('#', '')
// jsPDF sine standardfonter støtter ikke emoji – fjern dem så de ikke blir rot ("øb8").
const stripEmoji = (t) => (t || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu, '').replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim()
function hexRgb(c) {
  const h = (c || '#000000').replace('#', '')
  return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0]
}

async function buildPptx(deck) {
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
        const fill = { color: noHash(isRing ? (el.stroke || '#888888') : el.fill), transparency: isRing ? 100 : trans }
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
        s.addText(el.text || '', { ...box, fontSize: Math.round(el.fontSize * 0.75), color: noHash(el.color),
          bold: !!el.bold, italic: !!el.italic, underline: el.underline ? { style: 'sng' } : undefined,
          align: el.align || 'left', valign: 'top', fontFace: el.fontFamily || 'Inter', lineSpacingMultiple: el.lineHeight || 1.2 })
      } else if (el.type === 'image') {
        if (el.decor) { /* dekor-ikon – hoppes over i PowerPoint */ }
        else if (el.src) { try { s.addImage({ path: el.src, ...box, sizing: { type: el.fit === 'contain' ? 'contain' : 'cover', w: box.w, h: box.h } }) } catch (_e) { /* skip */ } }
        else {
          s.addShape(pptx.ShapeType.rect, { ...box, fill: { color: 'EEEEEE' }, line: { color: 'C8C8C8', dashType: 'dash' } })
          s.addText('🖼️ ' + (el.caption || 'Bilde'), { ...box, fontSize: 12, color: '888888', align: 'center', valign: 'middle' })
        }
      }
    }
  }
  return pptx
}

export async function exportPptx(deck) {
  const pptx = await buildPptx(deck)
  await pptx.writeFile({ fileName: (deck.title || 'presentasjon') + '.pptx' })
}

export async function pptxBlob(deck) {
  const pptx = await buildPptx(deck)
  return pptx.write({ outputType: 'blob' })
}

export function exportPdf(deck) {
  const mmW = IN_W * 25.4, mmH = IN_H * 25.4
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [mmW, mmH] })
  const mx = mmW / CW, my = mmH / CH
  deck.slides.forEach((slide, i) => {
    if (i > 0) pdf.addPage([mmW, mmH], 'landscape')
    pdf.setFillColor(...hexRgb(slide.background)); pdf.rect(0, 0, mmW, mmH, 'F')
    for (const el of slide.elements) {
      const x = el.x * mx, y = el.y * my, w = el.w * mx, h = el.h * my
      if (el.type === 'shape') {
        if (el.kind === 'silhouette') continue
        const op = el.opacity ?? 1
        let g
        try { if (op < 1) { g = new pdf.GState({ opacity: op }); pdf.saveGraphicsState(); pdf.setGState(g) } } catch (_e) { g = null }
        const isRing = !el.fill || el.fill === 'transparent'
        if (isRing && el.stroke) {
          pdf.setDrawColor(...hexRgb(el.stroke)); pdf.setLineWidth(Math.max(0.3, (el.strokeW || 2) * mx))
          if (el.kind === 'circle') pdf.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 'S')
          else pdf.rect(x, y, w, h, 'S')
          pdf.setLineWidth(0.2)
        } else {
          pdf.setFillColor(...hexRgb(el.fill || '#888888'))
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
        pdf.setTextColor(...hexRgb(el.color))
        pdf.setFont('helvetica', el.bold ? 'bold' : (el.italic ? 'italic' : 'normal'))
        const ptSize = el.fontSize * 0.75; pdf.setFontSize(ptSize)
        const lines = pdf.splitTextToSize(stripEmoji(el.text), w)
        const lh = (ptSize * 0.3528) * (el.lineHeight || 1.3)
        let ty = y + lh
        const ax = el.align === 'center' ? x + w / 2 : el.align === 'right' ? x + w : x
        lines.forEach((ln) => { pdf.text(ln, ax, ty, { align: el.align || 'left' }); ty += lh })
      }
    }
  })
  pdf.save((deck.title || 'presentasjon') + '.pdf')
}
