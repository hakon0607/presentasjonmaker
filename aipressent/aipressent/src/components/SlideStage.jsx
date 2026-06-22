import { useEffect, useRef, useState } from 'react'
import { CW } from '../lib/deck'
import ShapeInner from './ShapeInner'

const ELEM_KF = { fadeUp: 'aniFadeUp', fadeIn: 'aniFadeIn', zoomIn: 'aniZoomIn', slideRight: 'aniSlideRight', pop: 'aniPop', flyAcross: 'aniFlyAcross', dropIn: 'aniDropIn', liftOff: 'aniLiftOff', spinIn: 'aniSpinIn', bounceIn: 'aniBounceIn' }
const ELEM_DUR = { flyAcross: 1200, liftOff: 1000, dropIn: 560, bounceIn: 760, spinIn: 700 }
const ELEM_EASE = { flyAcross: 'cubic-bezier(.45,.05,.35,1)', dropIn: 'cubic-bezier(.3,1.4,.5,1)', bounceIn: 'cubic-bezier(.3,1.5,.5,1)', liftOff: 'cubic-bezier(.5,0,.7,.4)' }
const durOf = (t) => ELEM_DUR[t] || 560
const easeOf = (t) => ELEM_EASE[t] || 'cubic-bezier(.22,.68,.32,1)'
const TRANS_KF = { fade: 'stFade', slideLeft: 'stSlideLeft', slideUp: 'stSlideUp', zoom: 'stZoom' }

function listText(el) {
  if (!el.list || el.list === 'none') return el.text
  const lines = String(el.text || '').split('\n')
  if (el.list === 'bullet') return lines.map((l) => '•  ' + l).join('\n')
  return lines.map((l, i) => (i + 1) + '.  ' + l).join('\n')
}

// Skrivebeskyttet visning av ett lysbilde (Presenter + delt lenke).
export default function SlideStage({ slide, animate = false }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const m = () => setScale(el.clientWidth / CW)
    const ro = new ResizeObserver(m); ro.observe(el); m()
    return () => ro.disconnect()
  }, [])

  const a = slide.anim || {}
  const stagger = Math.max(0, Math.min(400, a.stagger ?? 130))
  const transKf = animate ? (TRANS_KF[a.transition] || 'stFade') : null
  const stageAnim = transKf ? { animation: `${transKf} 430ms cubic-bezier(.22,.68,.32,1) both` } : null

  const DUR = 560
  const resolveType = (el) => {
    const t = (el.anim && el.anim.type) || el.animPreset || a.preset
    return (t && t !== 'none' && ELEM_KF[t]) ? t : null
  }
  const timeline = {}
  if (animate) {
    const animated = slide.elements
      .map((el, idx) => ({ el, idx }))
      .filter((o) => !o.el.decor && resolveType(o.el))
      .sort((a, b) => ((a.el.anim?.order ?? a.idx) - (b.el.anim?.order ?? b.idx)))
    let lastStart = 0, lastDur = DUR, first = true
    for (const { el } of animated) {
      const type = resolveType(el)
      const d = durOf(type)
      let start
      if (first) { start = 90; first = false }
      else if (el.anim && el.anim.start === 'with') start = lastStart
      else if (el.anim && el.anim.start === 'after') start = lastStart + lastDur + 60
      else start = lastStart + stagger
      timeline[el.id] = { type, start }
      lastStart = start; lastDur = d
    }
  }
  const elemAnim = (el) => {
    const t = timeline[el.id]
    if (!t) return null
    return { animation: `${ELEM_KF[t.type]} ${durOf(t.type)}ms ${easeOf(t.type)} ${t.start}ms both` }
  }

  return (
    <div className="slidestage" ref={ref} style={{ width: '100%', height: '100%', position: 'relative', background: slide.background, overflow: 'hidden', ...stageAnim }}>
      {slide.elements.map((el) => {
        const box = { position: 'absolute', left: el.x * scale, top: el.y * scale, width: el.w * scale, height: el.h * scale, opacity: el.opacity ?? 1, filter: el.blur ? `blur(${el.blur * scale}px)` : undefined }
        const an = elemAnim(el)
        const rot = el.rotation ? { transform: `rotate(${el.rotation}deg)`, transformOrigin: 'center center', width: '100%', height: '100%' } : { width: '100%', height: '100%' }
        const inner = (content) => <div style={rot}>{content}</div>

        if (el.type === 'shape') return <div key={el.id} style={{ ...box, ...an }}>{inner(<ShapeInner el={el} W={el.w * scale} H={el.h * scale} />)}</div>
        if (el.type === 'image') return el.src ? <div key={el.id} style={{ ...box, ...an, overflow: 'hidden', borderRadius: 6 }}>{inner(<img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: el.fit || 'cover', objectPosition: el.pos || '50% 50%', transform: (el.imgZoom && el.imgZoom > 1) ? `scale(${el.imgZoom})` : undefined }} />)}</div> : null
        if (el.type === 'table') return (
          <div key={el.id} style={{ ...box, ...an }}>{inner(
            <table className="tbl" style={{ width: '100%', height: '100%', fontSize: el.fontSize * scale, color: el.color, borderCollapse: 'collapse' }}>
              <tbody>{el.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} style={{ border: `1px solid ${el.accent}55`, padding: '2px 6px', fontWeight: el.header && ri === 0 ? 700 : 400, background: el.header && ri === 0 ? el.accent + '22' : 'transparent' }}>{c}</td>)}</tr>)}</tbody>
            </table>
          )}</div>
        )
        return <div key={el.id} style={{ ...box, ...an }}>{inner(
          <div style={{ width: '100%', height: '100%', fontFamily: `'${el.fontFamily}', sans-serif`, fontSize: el.fontSize * scale, color: el.color, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', textDecoration: el.underline ? 'underline' : 'none', textAlign: el.align, lineHeight: el.lineHeight, letterSpacing: (el.letterSpacing || 0) + 'px', background: el.highlight || 'transparent', whiteSpace: 'pre-wrap' }}>{listText(el)}</div>
        )}</div>
      })}
    </div>
  )
}
