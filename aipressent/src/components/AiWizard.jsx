import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { slidesFromAi, newDeck, normalizeTheme, genId, imageEl, CW, CH, figureDecor } from '../lib/deck'
import { Sparkles, ChevronLeft, ChevronUp, ChevronDown, Trash2, Plus, RefreshCw } from 'lucide-react'
import { useProgress, ProgressBar } from './Progress'

// Henter et passende ikon/figur fra nett-albumet Iconify (200k+ gratis ikoner)
async function iconifyFind(keyword) {
  try {
    const r = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(keyword)}&limit=6`)
    if (!r.ok) return ''
    const d = await r.json()
    return (Array.isArray(d?.icons) && d.icons[0]) ? d.icons[0] : ''
  } catch (_e) { return '' }
}
function iconifyUrl(id, color) {
  return `https://api.iconify.design/${id}.svg?color=${encodeURIComponent(color || '#333333')}&width=400&height=400`
}
import { useAuth } from '../context/AuthContext'

const LAYOUTS = [
  { k: 'cover', l: 'Forside' }, { k: 'section', l: 'Kapittel-skille' }, { k: 'bullets', l: 'Punkter' },
  { k: 'statement', l: 'Stor setning' }, { k: 'imageText', l: 'Bilde + tekst' }, { k: 'imageFull', l: 'Stort bilde' },
  { k: 'twoColumn', l: 'To kolonner' },
]
const AMOUNTS = [
  { k: 'long', l: 'Lange setninger' }, { k: 'short', l: 'Korte stikkord' }, { k: 'auto', l: 'La AI variere' },
]
const lines = (t) => (t || '').split('\n').map((s) => s.trim()).filter(Boolean)

function toEditable(s) {
  if (s.layout === 'twoColumn') return {
    layout: 'twoColumn', title: s.title || '', icon: s.icon || '', caption: '', text: '',
    columns: [
      { heading: s.columns?.[0]?.heading || '', text: (s.columns?.[0]?.bullets || []).join('\n') },
      { heading: s.columns?.[1]?.heading || '', text: (s.columns?.[1]?.bullets || []).join('\n') },
    ],
  }
  return {
    layout: s.layout || 'bullets',
    title: s.layout === 'statement' ? (s.statement || '') : (s.title || ''),
    text: (s.bullets && s.bullets.length) ? s.bullets.join('\n') : (s.subtitle || ''),
    caption: s.image?.caption || '', icon: s.icon || '',
    columns: [{ heading: '', text: '' }, { heading: '', text: '' }],
  }
}
function toAi(e) {
  const L = e.layout
  if (L === 'twoColumn') return { layout: 'twoColumn', title: e.title, icon: e.icon, columns: [
    { heading: e.columns[0].heading, bullets: lines(e.columns[0].text) },
    { heading: e.columns[1].heading, bullets: lines(e.columns[1].text) }] }
  if (L === 'cover') return { layout: 'cover', title: e.title, subtitle: e.text, icon: e.icon }
  if (L === 'section') return { layout: 'section', title: e.title, icon: e.icon }
  if (L === 'statement') return { layout: 'statement', statement: e.title, subtitle: e.text }
  if (L === 'imageFull') return { layout: 'imageFull', title: e.title, image: { caption: e.caption } }
  if (L === 'imageText') return { layout: 'imageText', title: e.title, bullets: lines(e.text), image: { caption: e.caption }, icon: e.icon }
  return { layout: 'bullets', title: e.title, bullets: lines(e.text), icon: e.icon }
}

export default function AiWizard({ onClose, userId, nav }) {
  const { tokens, tokensUnlimited, refreshTokens } = useAuth()
  const [step, setStep] = useState('input')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  // steg 1
  const [title, setTitle] = useState('')
  const [manuscript, setManuscript] = useState('')
  const [visualStyle, setVisualStyle] = useState('')
  const [count, setCount] = useState(7)
  const [textAmount, setTextAmount] = useState('auto')
  // steg 2
  const [outline, setOutline] = useState([])
  const [theme, setTheme] = useState(normalizeTheme(null))
  const [styleBusy, setStyleBusy] = useState(false)
  const [genLabel, setGenLabel] = useState('')
  const prog = useProgress()
  const sprog = useProgress()

  async function uploadImage(blob) {
    try {
      const path = `${userId}/${genId()}-ai.jpg`
      const { error } = await supabase.storage.from('slides').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) return null
      return supabase.storage.from('slides').getPublicUrl(path).data.publicUrl
    } catch (_e) { return null }
  }

  async function makeOutline() {
    if (!manuscript.trim()) { setErr('Skriv litt manus eller noen stikkord først.'); return }
    setBusy(true); setErr(''); prog.start()
    try {
      const { data, error } = await supabase.functions.invoke('smart-task', {
        body: { manuscript, title, visualStyle, count, textAmount },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      const eds = (data.slides || []).map(toEditable)
      setOutline(eds.length ? eds : [toEditable({ layout: 'cover', title: title || 'Tittel' })])
      setTheme(normalizeTheme(data.theme))
      if (data.title && !title) setTitle(data.title)
      prog.done(); setStep('review')
    } catch (e) { setErr('AI klarte det ikke: ' + (e.message || e)); prog.reset() }
    finally { setBusy(false) }
  }

  async function updateStyle() {
    setStyleBusy(true); setErr(''); sprog.start()
    try {
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'theme', visualStyle } })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setTheme(normalizeTheme(data.theme)); sprog.done()
    } catch (e) { setErr('Klarte ikke å lage ny stil: ' + (e.message || e)); sprog.reset() }
    finally { setStyleBusy(false) }
  }

  async function createPresentation() {
    if (!title.trim()) { setErr('Gi presentasjonen en tittel.'); return }
    if (!manuscript.trim()) { setErr('Skriv litt manus eller noen stikkord.'); return }
    if (!visualStyle.trim()) { setErr('Beskriv kort hvordan det skal se ut.'); return }
    setBusy(true); setErr(''); setGenLabel('Lager innhold …'); prog.start()
    try {
      if (!tokensUnlimited && typeof tokens === 'number' && tokens < 5) throw new Error(`Du trenger 5 tokens for å lage en hel AI-presentasjon, men har ${tokens}. Du kan fortsatt lage en tom presentasjon og redigere selv – og AI-bilder er gratis. Du får påfyll i morgen.`)
      const { data: o, error: oe } = await supabase.functions.invoke('smart-task', { body: { manuscript, title, visualStyle, count, textAmount } })
      refreshTokens()
      if (oe) throw oe
      if (o?.error) throw new Error(o.error)
      const th = normalizeTheme(o.theme)
      const realTitle = title || o.title || 'Uten tittel'
      const slides = slidesFromAi(o.slides || [], th)
      // Hent et passende figur-ikon per lysbilde fra nett-albumet (Iconify)
      try {
        const kws = [...new Set((o.slides || []).map((s) => String(s.figure || '').trim()).filter(Boolean))]
        if (kws.length) {
          const map = {}
          await Promise.all(kws.map(async (k) => { map[k] = await iconifyFind(k) }))
          slides.forEach((sl, i) => {
            const kw = String(o.slides[i]?.figure || '').trim()
            const lay = o.slides[i]?.layout
            const id = kw && map[kw]
            if (id && lay !== 'imageFull' && lay !== 'imageText' && lay !== 'twoColumn') {
              const big = (lay === 'cover' || lay === 'section')
              const n = sl.elements.findIndex((e) => !e.decor)
              const at = n === -1 ? sl.elements.length : n
              sl.elements.splice(at, 0, figureDecor(iconifyUrl(id, th.accent), big))
            }
          })
        }
      } catch (_e) { /* hopp over figurer */ }
      const imgs = []
      slides.forEach((s) => s.elements.forEach((e) => { if (e.type === 'image' && !e.src && e.caption && e.caption !== 'Sett inn bilde') imgs.push(e) }))
      if (imgs.length) {
        prog.stop(); prog.set(2); setGenLabel(`Lager bilder … (0/${imgs.length})`)
        let cnt = 0
        await Promise.all(imgs.map(async (e) => {
          try {
            const { data } = await supabase.functions.invoke('smart-task', { body: { mode: 'image', prompt: e.caption, topic: realTitle } })
            if (data?.image) { const blob = await (await fetch('data:image/jpeg;base64,' + data.image)).blob(); const url = await uploadImage(blob); if (url) e.src = url }
          } catch (_e) { /* hopp over */ }
          cnt++; prog.set(Math.max(2, Math.round((cnt / imgs.length) * 100))); setGenLabel(`Lager bilder … (${cnt}/${imgs.length})`)
        }))
      }
      setGenLabel('Lagrer …')
      const deck = { theme: th, title: realTitle, slides: slides.length ? slides : newDeck(realTitle, th).slides }
      const { data, error } = await supabase.from('presentations')
        .insert({ owner_id: userId, title: deck.title, theme: th?.name || 'Egendefinert', data: deck }).select('id').single()
      if (error) throw error
      prog.done()
      nav('/p/' + data.id)
    } catch (e) { setErr('Klarte ikke å lage presentasjonen: ' + (e.message || e)); setBusy(false); prog.reset() }
  }

  function setSlide(i, patch) { setOutline((o) => o.map((s, j) => (j === i ? { ...s, ...patch } : s))) }
  function setCol(i, c, patch) { setOutline((o) => o.map((s, j) => (j === i ? { ...s, columns: s.columns.map((col, k) => (k === c ? { ...col, ...patch } : col)) } : s))) }
  function move(i, dir) { const j = i + dir; if (j < 0 || j >= outline.length) return; setOutline((o) => { const n = [...o];[n[i], n[j]] = [n[j], n[i]]; return n }) }
  function removeSlide(i) { setOutline((o) => o.filter((_, j) => j !== i)) }
  function addSlide() { setOutline((o) => [...o, toEditable({ layout: 'bullets', title: 'Nytt lysbilde', bullets: ['Punkt'] })]) }

  async function generate() {
    setBusy(true); setErr(''); setGenLabel('Bygger lysbilder …'); prog.start()
    try {
      const slides = slidesFromAi(outline.map(toAi), theme)
      // fyll inn bilder automatisk (Pollinations via edge-funksjonen)
      const imgs = []
      slides.forEach((s) => s.elements.forEach((e) => {
        if (e.type === 'image' && !e.src && e.caption && e.caption !== 'Sett inn bilde') imgs.push(e)
      }))
      if (imgs.length) {
        prog.stop(); prog.set(2); setGenLabel(`Lager bilder … (0/${imgs.length})`)
        let cnt = 0
        await Promise.all(imgs.map(async (e) => {
          try {
            const { data } = await supabase.functions.invoke('smart-task', { body: { mode: 'image', prompt: e.caption, topic: title || 'presentasjon' } })
            if (data?.image) {
              const blob = await (await fetch('data:image/jpeg;base64,' + data.image)).blob()
              const url = await uploadImage(blob)
              if (url) e.src = url
            }
          } catch (_e) { /* hopp over dette bildet, bruker kan legge inn selv */ }
          cnt++; prog.set(Math.max(2, Math.round((cnt / imgs.length) * 100))); setGenLabel(`Lager bilder … (${cnt}/${imgs.length})`)
        }))
      }
      setGenLabel('Lagrer …')
      // tematisk dekor-illustrasjon (subtil bakgrunn på forside + kapittel-skille)
      try {
        const decorIdx = outline.map((o, i) => (o.layout === 'cover' || o.layout === 'section' ? i : -1)).filter((i) => i >= 0 && slides[i])
        if (decorIdx.length) {
          const { data } = await supabase.functions.invoke('smart-task', { body: { mode: 'image', prompt: `subtil dekorativ bakgrunns-illustrasjon som passer temaet «${title || 'presentasjon'}», enkel, rolig, mye åpen plass`, topic: title || 'presentasjon' } })
          if (data?.image) {
            const blob = await (await fetch('data:image/jpeg;base64,' + data.image)).blob()
            const url = await uploadImage(blob)
            if (url) decorIdx.forEach((i) => {
              slides[i].elements.unshift(imageEl({ x: 0, y: 0, w: CW, h: CH, src: url, fit: 'cover', pos: '50% 50%', opacity: 0.14, decorative: true }))
            })
          }
        }
      } catch (_e) { /* dekor er valgfritt */ }
      const deck = { theme, title: title || 'Uten tittel', slides: slides.length ? slides : newDeck(title, theme).slides }
      const { data, error } = await supabase.from('presentations')
        .insert({ owner_id: userId, title: deck.title, theme: theme?.name || 'Egendefinert', data: deck }).select('id').single()
      if (error) throw error
      prog.done()
      nav('/p/' + data.id)
    } catch (e) { setErr('Kunne ikke lagre: ' + (e.message || e)); setBusy(false); prog.reset() }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        {step === 'input' ? (
          <>
            <h2><Sparkles size={20} /> Lag med AI</h2>
            <label>Tittel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} spellCheck lang="nb" placeholder="F.eks. Jobbuke i barnehage" />
            <label>Manus / stikkord</label>
            <textarea rows={6} value={manuscript} onChange={(e) => setManuscript(e.target.value)} spellCheck lang="nb"
              placeholder="Skriv manus eller bare stikkord – AI tolker og bygger ut resten." />
            <label>Hvordan skal det se ut? (AI lager et tema ut fra dette)</label>
            <input value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)}
              placeholder="F.eks. «lekent og fargerikt for barn», «rolig pastell», «mørkt og stilig»" />
            <label>Hvor mye tekst?</label>
            <div className="seg">
              {AMOUNTS.map((a) => (
                <button key={a.k} className={'seg-btn' + (textAmount === a.k ? ' on' : '')} onClick={() => setTextAmount(a.k)}>{a.l}</button>
              ))}
            </div>
            <label>Antall lysbilder</label>
            <input type="number" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            {err && <p className="err">{err}</p>}
            {busy && <ProgressBar p={prog.p} label={genLabel || 'Lager presentasjonen …'} />}
            <div className="modal-foot">
              <button className="btn ghost" onClick={onClose} disabled={busy}>Avbryt</button>
              <button className="btn primary" onClick={createPresentation} disabled={busy || !title.trim() || !manuscript.trim() || !visualStyle.trim()}>{busy ? 'Lager …' : 'Lag presentasjon ✨'}</button>
            </div>
          </>
        ) : (
          <>
            <h2><Sparkles size={20} /> Se over utkastet</h2>
            <p className="muted">Rediger teksten på hvert lysbilde før du lager presentasjonen. Forside er først og oppsummering sist.</p>

            <div className="style-prev">
              <div className="style-swatches">
                <span style={{ background: theme.bg }} /><span style={{ background: theme.title }} />
                <span style={{ background: theme.accent }} /><span style={{ background: theme.text }} />
              </div>
              <div className="style-meta">
                <b style={{ fontFamily: `'${theme.fontHead}'` }}>{theme.name}</b>
                <span className="muted small">{theme.fontHead} + {theme.fontBody}</span>
              </div>
              <button className="chip" onClick={updateStyle} disabled={styleBusy} title="Lag ny stil ut fra beskrivelsen">
                <RefreshCw size={14} className={styleBusy ? 'spin' : ''} /> Ny stil
              </button>
            </div>
            <input className="style-input" value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)}
              placeholder="Endre den visuelle stilen og trykk «Ny stil»" />
            {styleBusy && <ProgressBar p={sprog.p} label="Lager ny stil …" />}
            <label style={{ marginTop: 12 }}>Tittel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <div className="outline">
              {outline.map((s, i) => (
                <div className="ol-card" key={i}>
                  <div className="ol-head">
                    <span className="ol-num">{i + 1}</span>
                    <select value={s.layout} onChange={(e) => setSlide(i, { layout: e.target.value })}>
                      {LAYOUTS.map((l) => <option key={l.k} value={l.k}>{l.l}</option>)}
                    </select>
                    <span className="ol-tools">
                      <button onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={15} /></button>
                      <button onClick={() => move(i, 1)} disabled={i === outline.length - 1}><ChevronDown size={15} /></button>
                      <button onClick={() => removeSlide(i)} disabled={outline.length === 1}><Trash2 size={15} /></button>
                    </span>
                  </div>
                  <input className="ol-title" value={s.title} onChange={(e) => setSlide(i, { title: e.target.value })}
                    placeholder={s.layout === 'statement' ? 'Setningen' : 'Tittel'} />
                  {s.layout === 'twoColumn' ? (
                    <div className="row2">
                      {[0, 1].map((c) => (
                        <div key={c}>
                          <input className="ol-sub" value={s.columns[c].heading} onChange={(e) => setCol(i, c, { heading: e.target.value })} placeholder={'Kolonne ' + (c + 1)} />
                          <textarea rows={3} value={s.columns[c].text} onChange={(e) => setCol(i, c, { text: e.target.value })} placeholder="Ett punkt per linje" />
                        </div>
                      ))}
                    </div>
                  ) : (s.layout === 'cover' || s.layout === 'section' || s.layout === 'statement') ? (
                    s.layout !== 'section' && <input className="ol-sub" value={s.text} onChange={(e) => setSlide(i, { text: e.target.value })} placeholder="Undertittel / liten linje" />
                  ) : (
                    <textarea rows={3} value={s.text} onChange={(e) => setSlide(i, { text: e.target.value })} placeholder="Ett punkt per linje" />
                  )}
                  {(s.layout === 'imageText' || s.layout === 'imageFull') && (
                    <input className="ol-sub" value={s.caption} onChange={(e) => setSlide(i, { caption: e.target.value })} placeholder="🖼️ Hva bildet skal vise" />
                  )}
                </div>
              ))}
              <button className="ol-add" onClick={addSlide}><Plus size={16} /> Legg til lysbilde</button>
            </div>

            {err && <p className="err">{err}</p>}
            {busy && <ProgressBar p={prog.p} label={genLabel || 'Lager presentasjon …'} />}
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setStep('input')} disabled={busy}><ChevronLeft size={16} /> Tilbake</button>
              <button className="btn primary" onClick={generate} disabled={busy}>{busy ? 'Lager …' : 'Generer presentasjon ✨'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
