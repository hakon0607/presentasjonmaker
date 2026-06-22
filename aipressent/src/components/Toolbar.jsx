import { useState } from 'react'
import { FONTS } from '../lib/deck'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon, Shapes, Smile, Table, Trash2,
  Square, Circle, Minus, ArrowRight, Star, Triangle, Hexagon, Heart, MessageSquare, Sparkles, Crop,
  List, ListOrdered, Highlighter, Lock, Unlock, BringToFront, SendToBack, Film, Grid3x3, Minimize2, Maximize2 } from 'lucide-react'

const SIZES = [14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72, 88]
const POS = ['0% 0%', '50% 0%', '100% 0%', '0% 50%', '50% 50%', '100% 50%', '0% 100%', '50% 100%', '100% 100%']
const LINEH = [1, 1.15, 1.3, 1.5, 1.8, 2.2]
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ' }
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ' }
const mapStr = (s, m) => s.split('').map((c) => m[c] || m[c.toLowerCase()] || c).join('')
function transformSel(map) {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return
  const txt = sel.toString()
  if (!txt) return
  try { document.execCommand('insertText', false, mapStr(txt, map)) } catch (_e) { /* ignore */ }
}
const STICKERS = ['⭐', '✨', '❤️', '🔥', '✅', '❌', '💡', '📌', '🎯', '🚀', '🎉', '👍', '👏', '🙌', '😀', '😎', '🤔', '🥳', '🌈', '☀️', '🌙', '⚡', '🌸', '🍀', '🐶', '🐱', '🦊', '🐼', '🍎', '🍕', '⚽', '🎈', '🎁', '📚', '✏️', '🖍️', '🎨', '🎵', '💬', '❓']

export default function Toolbar({ el, update, onAddText, onAddImageChoice, onAddShape, onAddSticker, onAddTable, onAiImage, onReplaceSel, onDelete, onFront, onBack, onAnim, onSilhouette, bg, onBg, aiEnabled, grid, onGrid, minimal, onMinimal }) {
  const [pop, setPop] = useState(null)
  const adv = !minimal
  const shapes = [
    { k: 'rect', I: Square }, { k: 'circle', I: Circle }, { k: 'triangle', I: Triangle }, { k: 'hexagon', I: Hexagon },
    { k: 'heart', I: Heart }, { k: 'bubble', I: MessageSquare }, { k: 'star', I: Star }, { k: 'line', I: Minus }, { k: 'arrow', I: ArrowRight },
  ]
  const stepSize = (d) => update({ fontSize: Math.max(8, Math.min(200, (el.fontSize || 24) + d)) })
  return (
    <div className="toolbar" data-tour="toolbar">
      <button className="tb" onClick={onAddText}><Type size={16} /> Tekst</button>
      <button className="tb" onClick={onAddImageChoice}><ImageIcon size={16} /> Bilde</button>

      <div className="tb-pop-wrap">
        <button className="tb" onClick={() => setPop(pop === 'shapes' ? null : 'shapes')}><Shapes size={16} /> Figur</button>
        {pop === 'shapes' && (
          <div className="tb-pop shapes-pop" onMouseLeave={() => setPop(null)}>
            {shapes.map(({ k, I }) => <button key={k} onClick={() => { onAddShape(k); setPop(null) }}><I size={18} /></button>)}
          </div>
        )}
      </div>

      <div className="tb-pop-wrap">
        <button className="tb" onClick={() => setPop(pop === 'stickers' ? null : 'stickers')}><Smile size={16} /> Sticker</button>
        {pop === 'stickers' && (
          <div className="tb-pop stickers" onMouseLeave={() => setPop(null)}>
            {STICKERS.map((s) => <button key={s} onClick={() => { onAddSticker(s); setPop(null) }}>{s}</button>)}
          </div>
        )}
      </div>

      <button className="tb" onClick={onAddTable}><Table size={16} /> Tabell</button>
      <button className="tb" data-tour="anim" onClick={onAnim}><Film size={16} /> Animasjon</button>
      <label className="tb-bg">Bakgrunn<input type="color" value={bg} onChange={(e) => onBg(e.target.value)} /></label>

      {el && el.type === 'text' && (
        <>
          <span className="tb-sep" />
          <select value={el.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })} style={{ fontFamily: el.fontFamily }}>
            {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>
          <button className="tb ic" onClick={() => stepSize(-2)} title="Mindre">A−</button>
          <select className="size" value={el.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })}>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="tb ic" onClick={() => stepSize(2)} title="Større">A+</button>
          <button className={'tb ic' + (el.bold ? ' on' : '')} onClick={() => update({ bold: !el.bold })}><Bold size={15} /></button>
          <button className={'tb ic' + (el.italic ? ' on' : '')} onClick={() => update({ italic: !el.italic })}><Italic size={15} /></button>
          <button className={'tb ic' + (el.underline ? ' on' : '')} onClick={() => update({ underline: !el.underline })}><Underline size={15} /></button>
          <label className="tb-color" title="Tekstfarge"><input type="color" value={el.color} onChange={(e) => update({ color: e.target.value })} /></label>
          <button className={'tb ic' + (el.align === 'left' ? ' on' : '')} onClick={() => update({ align: 'left' })}><AlignLeft size={15} /></button>
          <button className={'tb ic' + (el.align === 'center' ? ' on' : '')} onClick={() => update({ align: 'center' })}><AlignCenter size={15} /></button>
          <button className={'tb ic' + (el.align === 'right' ? ' on' : '')} onClick={() => update({ align: 'right' })}><AlignRight size={15} /></button>
          {adv && <>
            <label className={'tb-color hl' + (el.highlight ? ' active' : '')} title="Uthevingsfarge"><Highlighter size={14} /><input type="color" value={el.highlight || '#ffe066'} onChange={(e) => update({ highlight: e.target.value })} /></label>
            {el.highlight && <button className="tb ic" title="Fjern utheving" onClick={() => update({ highlight: '' })}>×</button>}
            <button className={'tb ic' + (el.list === 'bullet' ? ' on' : '')} title="Punktliste" onClick={() => update({ list: el.list === 'bullet' ? 'none' : 'bullet' })}><List size={15} /></button>
            <button className={'tb ic' + (el.list === 'number' ? ' on' : '')} title="Nummerert liste" onClick={() => update({ list: el.list === 'number' ? 'none' : 'number' })}><ListOrdered size={15} /></button>
            <button className="tb ic" title="Hev skrift (x²) – marker tegn først" onMouseDown={(e) => e.preventDefault()} onClick={() => transformSel(SUP)}>x²</button>
            <button className="tb ic" title="Senk skrift (H₂O) – marker tegn først" onMouseDown={(e) => e.preventDefault()} onClick={() => transformSel(SUB)}>x₂</button>
            <label className="tb-mini" title="Linjeavstand">↕
              <select value={el.lineHeight || 1.3} onChange={(e) => update({ lineHeight: Number(e.target.value) })}>
                {LINEH.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="tb-mini" title="Bokstavavstand">A↔
              <input type="range" min="-2" max="12" step="0.5" value={el.letterSpacing || 0} onChange={(e) => update({ letterSpacing: Number(e.target.value) })} style={{ width: 64 }} />
            </label>
          </>}
        </>
      )}

      {el && el.type === 'shape' && (
        <>
          <span className="tb-sep" />
          <label className="tb-color" title="Fyllfarge">Farge<input type="color" value={el.fill} onChange={(e) => update({ fill: e.target.value })} /></label>
          {adv && <>
            <label className="tb-color" title="Kantfarge">Kant<input type="color" value={el.stroke || '#000000'} onChange={(e) => update({ stroke: e.target.value, strokeW: el.strokeW || 2 })} /></label>
            <label className="tb-mini" title="Kanttykkelse">▭
              <input type="range" min="0" max="20" value={el.strokeW || 0} onChange={(e) => update({ strokeW: Number(e.target.value) })} style={{ width: 64 }} />
            </label>
            {el.kind === 'rect' && <label className="tb-mini" title="Rundet hjørne">⬭<input type="range" min="0" max="60" value={el.radius || 0} onChange={(e) => update({ radius: Number(e.target.value) })} style={{ width: 64 }} /></label>}
          </>}
        </>
      )}

      {el && el.type === 'table' && (
        <>
          <span className="tb-sep" />
          <label className="tb-color">Farge<input type="color" value={el.accent} onChange={(e) => update({ accent: e.target.value })} /></label>
          <select className="size" value={el.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })}>
            {[14, 16, 18, 20, 24, 28].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      {el && el.type === 'image' && (
        <>
          <span className="tb-sep" />
          {aiEnabled && <button className="tb" onClick={() => onAiImage(el)}><Sparkles size={15} /> AI-bilde</button>}
          <button className="tb" onClick={() => onReplaceSel(el)}><ImageIcon size={15} /> Bytt bilde</button>
          <div className="tb-pop-wrap">
            <button className="tb" onClick={() => setPop(pop === 'imgfit' ? null : 'imgfit')}><Crop size={15} /> Tilpass</button>
            {pop === 'imgfit' && (
              <div className="tb-pop imgfit" onMouseLeave={() => setPop(null)}>
                <div className="imgfit-row">
                  <button className={(el.fit || 'cover') === 'cover' ? 'on' : ''} onClick={() => update({ fit: 'cover' })}>Fyll boks</button>
                  <button className={el.fit === 'contain' ? 'on' : ''} onClick={() => update({ fit: 'contain' })}>Vis hele</button>
                </div>
                <div className="imgfit-hint">Velg hvilken del som vises:</div>
                <div className="imgfit-grid">
                  {POS.map((p) => <button key={p} className={(el.pos || '50% 50%') === p ? 'on' : ''} onClick={() => update({ pos: p })} />)}
                </div>
                <div className="imgfit-hint">Zoom inn (beskjær fritt):</div>
                <input type="range" min="1" max="3" step="0.1" value={el.imgZoom || 1} onChange={(e) => update({ imgZoom: Number(e.target.value) })} style={{ width: '100%' }} />
              </div>
            )}
          </div>
        </>
      )}

      {el && (
        <>
          <span className="tb-sep" />
          {adv && <>
            <button className="tb ic" title="Legg fremst" onClick={onFront}><BringToFront size={15} /></button>
            <button className="tb ic" title="Legg bakerst" onClick={onBack}><SendToBack size={15} /></button>
            <label className="tb-mini" title="Gjennomsiktighet">◐
              <input type="range" min="10" max="100" value={Math.round((el.opacity ?? 1) * 100)} onChange={(e) => update({ opacity: Number(e.target.value) / 100 })} style={{ width: 60 }} />
            </label>
          </>}
          <button className={'tb ic' + (el.locked ? ' on' : '')} title={el.locked ? 'Lås opp' : 'Lås'} onClick={() => update({ locked: !el.locked })}>{el.locked ? <Lock size={15} /> : <Unlock size={15} />}</button>
          {!el.locked && <button className="tb ic danger" title="Slett" onClick={onDelete}><Trash2 size={15} /></button>}
        </>
      )}

      <span className="tb-spacer" />
      <button className={'tb ic' + (grid ? ' on' : '')} title="Rutenett av/på" onClick={onGrid}><Grid3x3 size={15} /></button>
      <button className="tb ic" title={minimal ? 'Vis alle verktøy' : 'Enkel visning (færre knapper)'} onClick={onMinimal}>{minimal ? <Maximize2 size={15} /> : <Minimize2 size={15} />}</button>
    </div>
  )
}
