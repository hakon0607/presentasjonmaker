import { useEffect, useRef, useState } from 'react'
import { CW, CH, fitTextBox } from '../lib/deck'
import ShapeInner from './ShapeInner'

const esc = (t) => (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function listHtml(text, list) {
  const lines = String(text || '').split('\n')
  if (list === 'bullet') return lines.map((l) => '•&nbsp;' + esc(l)).join('<br>')
  if (list === 'number') return lines.map((l, i) => (i + 1) + '.&nbsp;' + esc(l)).join('<br>')
  return esc(text)
}

export default function Canvas({ slide, onChange, selectedId, setSelectedId, selectedIds = [], onSelect, editingId, setEditingId, onReplaceImage, grid, zoom = 1 }) {
  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const [base, setBase] = useState(1)
  const [guide, setGuide] = useState({ x: null, y: null })
  const drag = useRef(null)
  const editPoint = useRef(null)
  const focusedId = useRef(null)
  const scale = base * (zoom || 1)

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const parent = el.parentElement
      const availH = parent ? parent.clientHeight - 175 : 99999
      setBase(Math.max(0.12, Math.min(w / CW, availH / CH)))
    }
    const ro = new ResizeObserver(measure); ro.observe(el); if (el.parentElement) ro.observe(el.parentElement); measure()
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  function updateEl(id, patch) { onChange({ ...slide, elements: slide.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) }) }
  function pick(id, shift) { if (onSelect) onSelect(id, shift); else setSelectedId(id) }

  function start(e, el, mode) {
    if (editingId === el.id) return
    e.preventDefault(); e.stopPropagation()
    if (mode === 'move') pick(el.id, e.shiftKey)
    else setSelectedId(el.id)
    setEditingId(null)
    if (el.locked || e.shiftKey) return
    const ids = (selectedIds.length > 1 && selectedIds.includes(el.id)) ? selectedIds : [el.id]
    const origins = {}
    slide.elements.forEach((q) => { if (ids.includes(q.id)) origins[q.id] = { x: q.x, y: q.y } })
    drag.current = { id: el.id, mode, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h, ids, origins }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  function startRotate(e, el) {
    e.preventDefault(); e.stopPropagation()
    if (el.locked) return
    const r = stageRef.current.getBoundingClientRect()
    const cx = r.left + (el.x + el.w / 2) * scale
    const cy = r.top + (el.y + el.h / 2) * scale
    const onMove = (ev) => {
      let ang = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90
      if (ev.shiftKey) ang = Math.round(ang / 15) * 15
      updateEl(el.id, { rotation: Math.round(ang) })
    }
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp)
  }
  function snap(edge, center, far, targets) {
    for (const t of targets) {
      if (Math.abs(edge - t) < 8) return { delta: t - edge, guide: t }
      if (Math.abs(center - t) < 8) return { delta: t - center, guide: t }
      if (Math.abs(far - t) < 8) return { delta: t - far, guide: t }
    }
    return null
  }
  function move(e) {
    const d = drag.current; if (!d) return
    const dx = (e.clientX - d.sx) / scale, dy = (e.clientY - d.sy) / scale
    if (d.mode === 'move') {
      if (d.ids.length > 1) {
        const ndx = Math.round(dx), ndy = Math.round(dy)
        onChange({ ...slide, elements: slide.elements.map((q) => d.ids.includes(q.id) ? { ...q, x: d.origins[q.id].x + ndx, y: d.origins[q.id].y + ndy } : q) })
        return
      }
      let x = Math.round(d.ox + dx), y = Math.round(d.oy + dy)
      const el = slide.elements.find((q) => q.id === d.id)
      const sx = snap(x, x + el.w / 2, x + el.w, [0, CW / 2, CW])
      const sy = snap(y, y + el.h / 2, y + el.h, [0, CH / 2, CH])
      if (sx) x = Math.round(x + sx.delta)
      if (sy) y = Math.round(y + sy.delta)
      setGuide({ x: sx ? sx.guide : null, y: sy ? sy.guide : null })
      updateEl(d.id, { x, y })
    } else updateEl(d.id, { w: Math.max(30, Math.round(d.ow + dx)), h: Math.max(20, Math.round(d.oh + dy)) })
  }
  function up() { drag.current = null; setGuide({ x: null, y: null }); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }

  function enterEdit(e, el) {
    e.stopPropagation()
    if (el.locked) return
    editPoint.current = { x: e.clientX, y: e.clientY }
    setSelectedId(el.id); setEditingId(el.id)
  }
  function placeCaret(n) {
    if (!n) return
    if (focusedId.current === editingId) return
    focusedId.current = editingId
    n.focus()
    const p = editPoint.current
    if (!p) return
    let range = null
    try {
      if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(p.x, p.y)
      else if (document.caretPositionFromPoint) { const cp = document.caretPositionFromPoint(p.x, p.y); if (cp) { range = document.createRange(); range.setStart(cp.offsetNode, cp.offset); range.collapse(true) } }
    } catch (_e) { range = null }
    if (range && n.contains(range.startContainer)) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(range) }
  }

  const isSel = (el) => selectedId === el.id || selectedIds.includes(el.id)
  const showHandle = (el) => selectedId === el.id && selectedIds.length <= 1 && !el.locked
  const grips = (el) => showHandle(el)
    ? <><span className="resize" onPointerDown={(e) => start(e, el, 'resize')} /><span className="rot-handle" title="Roter (hold Shift = hakk på 15°)" onPointerDown={(e) => startRotate(e, el)} /></>
    : null

  return (
    <div className="stage-wrap" ref={wrapRef}>
      <div className="stage" ref={stageRef} style={{ width: CW * scale, height: CH * scale, background: slide.background }}
        onPointerDown={() => { pick(null); setEditingId(null) }}>
        {grid && <div className="grid-overlay" style={{ backgroundSize: `${48 * scale}px ${48 * scale}px` }} />}
        {slide.elements.map((el) => {
          const sel = isSel(el)
          const xf = { opacity: el.opacity ?? 1, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined, transformOrigin: 'center center', filter: el.blur ? `blur(${el.blur * scale}px)` : undefined }
          const box = { left: el.x * scale, top: el.y * scale, width: el.w * scale, height: el.h * scale, ...xf }
          const lockCls = el.locked ? ' locked' : ''

          if (el.type === 'shape') {
            return <div key={el.id} className={'el' + (sel ? ' sel' : '') + lockCls} style={box}
              onPointerDown={(e) => start(e, el, 'move')}>
              <ShapeInner el={el} W={el.w * scale} H={el.h * scale} />{grips(el)}
            </div>
          }

          if (el.type === 'table') {
            return <div key={el.id} className={'el el-table' + (sel ? ' sel' : '') + lockCls} style={box}
              onPointerDown={(e) => { e.stopPropagation(); pick(el.id, e.shiftKey); setEditingId(null) }}>
              {sel && !el.locked && <span className="tbl-grip" onPointerDown={(e) => start(e, el, 'move')} title="Flytt">✛</span>}
              <table className="tbl" style={{ fontSize: el.fontSize * scale, color: el.color }}>
                <tbody>
                  {el.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} contentEditable suppressContentEditableWarning spellCheck lang="nb"
                          onPointerDown={(e) => e.stopPropagation()}
                          onBlur={(ev) => { const rows = el.rows.map((rr) => rr.slice()); rows[r][c] = ev.currentTarget.innerText; updateEl(el.id, { rows }) }}
                          style={{ borderColor: el.accent + '55', fontWeight: el.header && r === 0 ? 700 : 400, background: el.header && r === 0 ? el.accent + '22' : 'transparent' }}
                          dangerouslySetInnerHTML={{ __html: esc(cell) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {grips(el)}
            </div>
          }

          if (el.type === 'image') {
            return <div key={el.id} className={'el' + (sel ? ' sel' : '') + lockCls} style={{ ...box, overflow: 'hidden', borderRadius: 6 }}
              onPointerDown={(e) => start(e, el, 'move')}
              onDoubleClick={(e) => { e.stopPropagation(); onReplaceImage && onReplaceImage(el) }}>
              {el.src
                ? <img src={el.src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: el.fit || 'cover', objectPosition: el.pos || '50% 50%', transform: (el.imgZoom && el.imgZoom > 1) ? `scale(${el.imgZoom})` : undefined }} />
                : <div className="img-ph" onClick={(e) => { e.stopPropagation(); onReplaceImage && onReplaceImage(el) }}><span className="img-ph-ic">🖼️</span><span className="img-ph-cap">{el.caption || 'Sett inn bilde'}</span><span className="img-ph-hint">trykk for å velge: fil eller AI</span></div>}
              {grips(el)}
            </div>
          }

          const editing = editingId === el.id
          const html = (!editing && el.list && el.list !== 'none') ? listHtml(el.text, el.list) : esc(el.text)
          return (
            <div key={el.id} className={'el' + (sel ? ' sel' : '') + (editing ? ' editing' : '') + lockCls} style={box}
              onPointerDown={(e) => { if (editing) { e.stopPropagation(); return } start(e, el, 'move') }}
              onDoubleClick={(e) => enterEdit(e, el)}>
              <div className="el-text" contentEditable={editing} suppressContentEditableWarning
                spellCheck={editing} lang="nb"
                ref={(n) => { if (n && editing) placeCaret(n) }}
                onBlur={(ev) => { const text = ev.currentTarget.innerText; const fitted = fitTextBox({ ...el, text }); updateEl(el.id, { text, h: fitted.h, y: fitted.y }); setEditingId(null); focusedId.current = null; editPoint.current = null }}
                style={{ fontFamily: `'${el.fontFamily}', sans-serif`, fontSize: el.fontSize * scale, color: el.color,
                  fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal',
                  textDecoration: el.underline ? 'underline' : 'none', textAlign: el.align, lineHeight: el.lineHeight,
                  letterSpacing: (el.letterSpacing || 0) + 'px', background: el.highlight || 'transparent', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: html }} />{grips(el)}
            </div>
          )
        })}
        {guide.x != null && <div className="snap-v" style={{ left: guide.x * scale }} />}
        {guide.y != null && <div className="snap-h" style={{ top: guide.y * scale }} />}
      </div>
    </div>
  )
}
