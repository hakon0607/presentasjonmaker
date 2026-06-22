import { useRef, useState } from 'react'
import SlideStage from './SlideStage'
import { Play, Plus, X, GripVertical, Trash2 } from 'lucide-react'

const PRESETS = [
  { v: 'fadeUp', n: 'Tone opp' },
  { v: 'fadeIn', n: 'Ton inn' },
  { v: 'zoomIn', n: 'Zoom inn' },
  { v: 'slideRight', n: 'Skli inn' },
  { v: 'pop', n: 'Sprett' },
  { v: 'flyAcross', n: '✈️ Fly over' },
  { v: 'dropIn', n: '⬇️ Dropp ned (stable)' },
  { v: 'liftOff', n: '🚀 Ta av' },
  { v: 'spinIn', n: '🌀 Snurr inn' },
  { v: 'bounceIn', n: '🏀 Spretten' },
]
const TRANS = [
  { v: 'fade', n: 'Ton inn' },
  { v: 'slideLeft', n: 'Skli fra siden' },
  { v: 'slideUp', n: 'Skli opp' },
  { v: 'zoom', n: 'Zoom' },
]

function label(slide, id) {
  const el = slide.elements.find((e) => e.id === id)
  if (!el) return '(slettet)'
  if (el.type === 'text') return (el.text || 'Tekst').replace(/\n/g, ' ').slice(0, 22) || 'Tekst'
  if (el.type === 'image') return '🖼️ Bilde'
  if (el.type === 'table') return '▦ Tabell'
  if (el.type === 'shape') return '◆ Figur'
  return el.type
}

export default function AnimPanel({ slide, onChange, selectedId, onClose }) {
  const [pos, setPos] = useState({ x: Math.max(8, window.innerWidth - 372), y: 92 })
  const [playKey, setPlayKey] = useState(0)
  const dragWin = useRef(null)
  const dragRow = useRef(null)

  const list = slide.elements
    .map((el, idx) => ({ el, idx }))
    .filter((o) => o.el.anim && o.el.anim.type)
    .map((o) => ({ id: o.el.id, type: o.el.anim.type, start: o.el.anim.start || 'after', order: o.el.anim.order ?? o.idx }))
    .sort((a, b) => a.order - b.order)

  function setElAnim(id, patch) {
    onChange({ ...slide, elements: slide.elements.map((e) => (e.id === id ? { ...e, anim: patch === null ? undefined : { ...(e.anim || {}), ...patch } } : e)) })
  }
  function setTransition(t) { onChange({ ...slide, anim: { ...(slide.anim || {}), transition: t } }) }
  function addSelected() {
    if (!selectedId || list.some((l) => l.id === selectedId)) return
    const maxOrder = list.reduce((m, l) => Math.max(m, l.order), -1)
    setElAnim(selectedId, { type: 'fadeUp', start: 'after', order: maxOrder + 1 })
  }
  function reorder(from, to) {
    if (from === to || from < 0 || to < 0 || to >= list.length) return
    const ids = list.map((l) => l.id)
    const [m] = ids.splice(from, 1); ids.splice(to, 0, m)
    const orderMap = {}; ids.forEach((id, i) => { orderMap[id] = i })
    onChange({ ...slide, elements: slide.elements.map((e) => (orderMap[e.id] != null ? { ...e, anim: { ...(e.anim || {}), order: orderMap[e.id] } } : e)) })
  }

  function winDown(e) {
    if (e.target.closest('.anim-x')) return
    dragWin.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
    const mv = (ev) => { const d = dragWin.current; if (!d) return; setPos({ x: Math.max(0, Math.min(window.innerWidth - 120, d.ox + ev.clientX - d.sx)), y: Math.max(0, d.oy + ev.clientY - d.sy) }) }
    const up = () => { dragWin.current = null; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
  }

  const selAdded = selectedId && list.some((l) => l.id === selectedId)

  return (
    <div className="anim-panel" style={{ left: pos.x, top: pos.y }}>
      <div className="anim-head" onPointerDown={winDown}>
        <span>🎬 Animasjoner</span>
        <button className="anim-x" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="anim-body">
        <label className="anim-field">Når lysbildet kommer inn
          <select value={slide.anim?.transition || 'fade'} onChange={(e) => setTransition(e.target.value)}>
            {TRANS.map((t) => <option key={t.v} value={t.v}>{t.n}</option>)}
          </select>
        </label>

        <div className="anim-list-head">
          <span>Rekkefølge — øverst først</span>
          <button className="anim-add" onClick={addSelected} disabled={!selectedId || selAdded}><Plus size={14} /> {selectedId ? (selAdded ? 'Lagt til' : 'Legg til valgt') : 'Velg objekt'}</button>
        </div>

        {list.length === 0 && <p className="anim-empty">Klikk på et objekt på lysbildet og trykk «Legg til valgt». Så kan du dra for å endre rekkefølge og velge om hver skal spille <b>etter</b> eller <b>med</b> den forrige.</p>}

        <div className="anim-list">
          {list.map((a, i) => (
            <div key={a.id} className="anim-item" draggable
              onDragStart={() => { dragRow.current = i }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = dragRow.current; dragRow.current = null; if (f != null) reorder(f, i) }}>
              <span className="anim-grip" title="Dra for å flytte"><GripVertical size={14} /></span>
              <span className="anim-num">{i + 1}</span>
              <div className="anim-item-main">
                <div className="anim-item-name" title={label(slide, a.id)}>{label(slide, a.id)}</div>
                <div className="anim-item-ctl">
                  <select value={a.type} onChange={(e) => setElAnim(a.id, { type: e.target.value })}>
                    {PRESETS.map((p) => <option key={p.v} value={p.v}>{p.n}</option>)}
                  </select>
                  {i === 0
                    ? <span className="anim-start">ved start</span>
                    : <div className="anim-when">
                        <button className={a.start !== 'with' ? 'on' : ''} onClick={() => setElAnim(a.id, { start: 'after' })} title="Etter at forrige er ferdig">Etter</button>
                        <button className={a.start === 'with' ? 'on' : ''} onClick={() => setElAnim(a.id, { start: 'with' })} title="Samtidig som forrige">Med forrige</button>
                      </div>}
                </div>
              </div>
              <button className="anim-del" onClick={() => setElAnim(a.id, null)} title="Fjern animasjon"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>

        <div className="anim-preview">
          <div className="anim-preview-stage"><SlideStage key={playKey} slide={slide} animate /></div>
          <button className="btn primary anim-play" onClick={() => setPlayKey((k) => k + 1)}><Play size={14} /> Spill av</button>
        </div>
      </div>
    </div>
  )
}
