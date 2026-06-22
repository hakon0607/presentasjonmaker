import { useState, useLayoutEffect } from 'react'

// steps: [{ sel: '[data-tour="x"]' | null, title, text }]
export default function Tour({ steps, onClose, onFinish }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const step = steps[i]

  useLayoutEffect(() => {
    if (!step) return
    let cancelled = false
    const el = step.sel ? document.querySelector(step.sel) : null
    const update = () => {
      if (cancelled) return
      if (el) { const r = el.getBoundingClientRect(); setRect({ top: r.top, left: r.left, width: r.width, height: r.height }) }
      else setRect(null)
    }
    if (el) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    update()
    const t = setTimeout(update, 300)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => { cancelled = true; clearTimeout(t); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) }
  }, [i])

  if (!step) return null
  const last = i + 1 >= steps.length
  const next = () => (last ? (onFinish || onClose)() : setI(i + 1))

  // plasser forklaringsboksen ved elementet (under hvis plass, ellers over / midt)
  const vw = window.innerWidth, vh = window.innerHeight
  const TW = Math.min(320, vw - 24)
  let tip
  if (rect) {
    const below = rect.top + rect.height + 14
    const fitsBelow = below + 190 < vh
    const top = fitsBelow ? below : Math.max(14, rect.top - 200)
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - TW / 2), vw - TW - 12)
    tip = { top, left, width: TW }
  } else {
    tip = { top: vh / 2 - 110, left: vw / 2 - TW / 2, width: TW }
  }

  return (
    <div className="tour">
      {rect && <div className="tour-hl" style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} />}
      {!rect && <div className="tour-dim" />}
      <div className="tour-tip" style={tip}>
        <div className="tour-count">{i + 1} / {steps.length}</div>
        <h4>{step.title}</h4>
        <p>{step.text}</p>
        <div className="tour-foot">
          <button className="tour-skip" onClick={onClose}>Hopp over</button>
          <div className="tour-nav">
            {i > 0 && <button className="btn ghost sm" onClick={() => setI(i - 1)}>Forrige</button>}
            <button className="btn primary sm" onClick={next}>{last ? 'Ferdig 🎉' : 'Neste →'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
