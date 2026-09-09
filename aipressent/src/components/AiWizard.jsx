import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { slidesFromAi, newDeck, normalizeTheme, genId, imageEl, CW, CH } from '../lib/deck'
import { designDeck, resolveStyle, STYLE_LIST, STYLES } from '../lib/design'
import { fetchPhoto } from '../lib/photo'
import { folderSlug } from '../lib/slug'
import { fireNoTokens } from '../lib/tokenGate'
import { Sparkles, ChevronLeft, ChevronUp, ChevronDown, Trash2, Plus, ArrowRight, ArrowLeft, X } from 'lucide-react'
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
import { limitsFor, fireUpgrade, canCreatePresentation } from '../lib/limits'
import { useLang } from '../i18n'

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
  const { tokens, tokensUnlimited, refreshTokens, plan } = useAuth()
  const lim = limitsFor(plan, tokensUnlimited)
  const maxCount = isFinite(lim.slides) ? lim.slides : 20
  const { lang } = useLang()
  const [step, setStep] = useState('input')
  const [subStep, setSubStep] = useState(0)            // 0=overskrift 1=manus 2=visuelt
  const [styleOverride, setStyleOverride] = useState(null)
  const [varied, setVaried] = useState(true)            // Variert (nye oppsett) vs Enkel (klassisk v78)
  const [manualOpen, setManualOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  // steg 1
  const [title, setTitle] = useState('')
  const [manuscript, setManuscript] = useState('')
  const [visualStyle, setVisualStyle] = useState('')
  const [count, setCount] = useState(7)  // caps mot maxCount i setCountSafe
  const [textAmount, setTextAmount] = useState('auto')
  // steg 2
  const [outline, setOutline] = useState([])
  const [theme, setTheme] = useState(normalizeTheme(null))
  const [styleBusy, setStyleBusy] = useState(false)
  const [genLabel, setGenLabel] = useState('')
  const prog = useProgress()
  const sprog = useProgress()

  async function uploadImage(blob, folder) {
    try {
      const dir = folder ? `${userId}/${folder}` : `${userId}`
      const path = `${dir}/${genId()}-ai.jpg`
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
        body: { manuscript, title, visualStyle, count, textAmount, lang },
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
    if (!(await canCreatePresentation(userId, plan, tokensUnlimited))) return
    if (!title.trim()) { setErr('Gi presentasjonen en tittel.'); return }
    if (!manuscript.trim()) { setErr('Skriv litt manus eller noen stikkord.'); return }
    setBusy(true); setErr(''); setGenLabel('Lager innhold …'); prog.start()
    try {
      if (!tokensUnlimited && typeof tokens === 'number' && tokens < 5) { fireNoTokens({ needed: 5, have: tokens }); setBusy(false); prog.reset(); return }
      const { data: o, error: oe } = await supabase.functions.invoke('smart-task', { body: { manuscript, title, visualStyle: '', count, textAmount, lang } })
      refreshTokens()
      if (oe) throw oe
      if (o?.error) throw new Error(o.error)
      const realTitle = title || o.title || 'Uten tittel'
      const dd = designDeck(o.slides || [], { title: realTitle, hint: visualStyle, styleId: styleOverride, varied })
      const slides = dd.slides
      await fillPhotos(slides, realTitle, dd.styleId, dd.style, folderSlug(realTitle))
      setGenLabel('Lagrer …')
      const deck = { theme: dd.theme, title: realTitle, slides: slides.length ? slides : newDeck(realTitle, 'minimal').slides, design: dd.styleId }
      const { data, error } = await supabase.from('presentations')
        .insert({ owner_id: userId, title: deck.title, theme: dd.styleId, data: deck }).select('id').single()
      if (error) throw error
      prog.done()
      nav('/p/' + data.id)
    } catch (e) { setErr('Klarte ikke å lage presentasjonen: ' + (e.message || e)); setBusy(false); prog.reset() }
  }

  // Stil-stemninger som gjør AI-bildene passende og helhetlige (ikke kjedelige stock-bilder).
  const PHOTO_MOODS = {
    editorial: 'editorial film photography, warm muted tones, soft natural light, minimal',
    natur: 'natural-light nature photography, fresh greenery, calm, documentary',
    pastell: 'soft pastel photography, dreamy, bright, gentle tones',
    graatone: 'black and white fine-art photography, high contrast, minimal',
    natt: 'cinematic dark photography, warm moody premium lighting',
    tech: 'futuristic technology, dark background, glowing neon-blue accents, sleek',
    botanisk: 'botanical photography, plants and leaves, soft natural light, elegant',
    korall: 'bright warm photography, coral and peach tones, friendly, soft light',
    ocean: 'clean blue photography, water and sky tones, fresh, airy, professional',
    midnatt: 'cinematic deep-blue night photography, sleek, premium, glowing accents',
    solnedgang: 'warm sunset photography, golden-orange glow, cinematic, dramatic light',
    mynte: 'fresh mint-green photography, clean, bright, calm, modern',
    lavendel: 'soft lavender-purple photography, dreamy, gentle, elegant light',
    safran: 'warm golden photography, saffron and amber tones, rich, inviting',
    burgunder: 'rich burgundy photography, deep wine tones, elegant, moody, refined',
    kull: 'minimal charcoal photography, monochrome, high contrast, sleek modern',
    sitrus: 'vibrant citrus photography, lime and green tones, fresh, energetic, bright',
    indigo: 'deep indigo-blue photography, modern, confident, clean, professional',
    terracotta: 'warm terracotta photography, clay and earth tones, natural, organic',
    arktis: 'cool arctic photography, icy blue tones, crisp, clean, bright',
    rosegull: 'soft rose-gold photography, warm blush tones, elegant, delicate light',
    skog: 'deep forest photography, dark green foliage, misty, moody, cinematic',
    plomme: 'rich plum-magenta photography, vivid purple tones, bold, dramatic',
    mokka: 'warm mocha photography, coffee and brown tones, cozy, rich, inviting',
    elektrisk: 'bold high-energy photography, dark background, vivid electric accents',
    fersken: 'soft peach photography, warm gentle tones, bright, friendly, dreamy',
    staal: 'cool steel-blue photography, clean industrial tones, modern, professional',
  }
  // Henter bilde til hvert bilde-felt: AI-generert (skreddersydd + stil) → nett-foto → fargefelt.
  async function fillPhotos(slides, topic, styleId, style, folder) {
    const imgs = []
    slides.forEach((s) => (s.elements || []).forEach((e) => { if (e.photoQuery) imgs.push(e) }))
    if (!imgs.length) return
    const uniq = [...new Set(imgs.map((e) => e.photoQuery).filter(Boolean))]
    const mood = PHOTO_MOODS[styleId] || 'high-quality aesthetic photography'
    prog.stop(); prog.set(2); setGenLabel(`Lager bilder … (0/${uniq.length})`)
    const map = {}
    let cnt = 0
    await Promise.all(uniq.map(async (q) => {
      let b64 = null
      // 1) AI-generert bilde tilpasset innhold + stil
      try {
        const { data } = await supabase.functions.invoke('smart-task', { body: { mode: 'image', prompt: `${q}, ${mood}`, topic } })
        if (data?.image) b64 = 'data:image/jpeg;base64,' + data.image
      } catch (_e) { /* prøv nett */ }
      // 2) reserve: ekte nett-foto
      if (!b64) { try { b64 = await fetchPhoto(q, topic) } catch (_e) { /* gir opp dette */ } }
      if (b64) {
        try { const blob = await (await fetch(b64)).blob(); const url = await uploadImage(blob, folder); map[q.toLowerCase()] = url || b64 } catch (_e) { /* hopp */ }
      }
      cnt++; prog.set(Math.max(2, Math.round((cnt / uniq.length) * 100))); setGenLabel(`Lager bilder … (${cnt}/${uniq.length})`)
    }))
    imgs.forEach((e) => { const u = map[String(e.photoQuery).toLowerCase()]; if (u) e.src = u })
    // 3) ingen bilder skal stå tomme: bytt resten til et rent fargefelt
    const fill = (style && style.card) || '#e7e7e5'
    imgs.forEach((e) => { if (!e.src) { e.type = 'shape'; e.kind = 'rect'; e.fill = fill; e.radius = 0; e.opacity = 1; e.decor = true; delete e.photoSlot; delete e.photoQuery } })
  }

  function setSlide(i, patch) { setOutline((o) => o.map((s, j) => (j === i ? { ...s, ...patch } : s))) }
  function setCol(i, c, patch) { setOutline((o) => o.map((s, j) => (j === i ? { ...s, columns: s.columns.map((col, k) => (k === c ? { ...col, ...patch } : col)) } : s))) }
  function move(i, dir) { const j = i + dir; if (j < 0 || j >= outline.length) return; setOutline((o) => { const n = [...o];[n[i], n[j]] = [n[j], n[i]]; return n }) }
  function removeSlide(i) { setOutline((o) => o.filter((_, j) => j !== i)) }
  function addSlide() { setOutline((o) => [...o, toEditable({ layout: 'bullets', title: 'Nytt lysbilde', bullets: ['Punkt'] })]) }

  async function generate() {
    setBusy(true); setErr(''); setGenLabel('Bygger lysbilder …'); prog.start()
    try {
      const realTitle = title || 'Uten tittel'
      const dd = designDeck(outline.map(toAi), { title: realTitle, hint: visualStyle, styleId: styleOverride, varied })
      const slides = dd.slides
      await fillPhotos(slides, realTitle, dd.styleId, dd.style, folderSlug(realTitle))
      setGenLabel('Lagrer …')
      const deck = { theme: dd.theme, title: realTitle, slides: slides.length ? slides : newDeck(realTitle, 'minimal').slides, design: dd.styleId }
      const { data, error } = await supabase.from('presentations')
        .insert({ owner_id: userId, title: deck.title, theme: dd.styleId, data: deck }).select('id').single()
      if (error) throw error
      prog.done()
      nav('/p/' + data.id)
    } catch (e) { setErr('Kunne ikke lagre: ' + (e.message || e)); setBusy(false); prog.reset() }
  }

  // ---- fremtidig, stegvis inndata (5 steg) ----
  const FXQ = [
    { q: 'Hva skal overskriften være?', hint: 'Tittelen på presentasjonen' },
    { q: 'Hva skal den handle om?', hint: 'Skriv stikkord eller manus – AI bygger ut resten' },
    { q: 'Hvor mye tekst på hver side?', hint: 'Velg mengde' },
    { q: 'Hvor mange sider?', hint: 'Antall lysbilder (3–20)' },
    { q: 'Hvordan skal det se ut?', hint: 'Beskriv stilen med egne ord – valgfritt' },
  ]
  const LAST = FXQ.length - 1
  const canNext = subStep === 0 ? !!title.trim() : subStep === 1 ? !!manuscript.trim() : true
  function fxNext() {
    setErr('')
    if (subStep < LAST) { if (canNext) setSubStep(subStep + 1); return }
    createPresentation()
  }
  function fxBack() { if (subStep > 0) { setErr(''); setSubStep(subStep - 1) } }
  const setCountSafe = (n) => {
    const want = n || 0
    if (want > maxCount) { fireUpgrade({ reason: 'slides' }); setCount(maxCount); return }
    setCount(Math.max(3, Math.min(20, want)))
  }
  const COUNT_QUICK = [5, 7, 10, 12, 15]
  // hvilken stil/palett blir valgt akkurat nå
  const resolved = resolveStyle(title, visualStyle, styleOverride)
  const pal = resolved.style
  function regenerateStyle() {
    const ids = STYLE_LIST.map((s) => s.id)
    const cur = ids.indexOf(resolved.id)
    setStyleOverride(ids[(cur + 1) % ids.length])
  }

  if (step === 'input') {
    return (
      <div className="ai-fx" onClick={busy ? undefined : onClose}>
        {!busy && <button className="ai-fx-close" onClick={(e) => { e.stopPropagation(); onClose() }} aria-label="Lukk"><X size={20} /></button>}
        <div className="ai-fx-inner" onClick={(e) => e.stopPropagation()}>
          <h1 className="ai-fx-title">Lag din neste presentasjon</h1>
          <p className="ai-fx-sub">Overskrift → Manus → Tekst → Sider → Stil</p>
          <div className="ai-fx-dots">
            {FXQ.map((s, i) => <span key={i} className={'ai-fx-dot' + (i === subStep ? ' on' : '') + (i < subStep ? ' done' : '')} />)}
          </div>

          <div className="ai-fx-card">
            <div className="ai-fx-q">{FXQ[subStep].q}<span className="ai-fx-qhint">{FXQ[subStep].hint}</span></div>

            {subStep === 0 && (
              <input className="ai-fx-input" autoFocus value={title} spellCheck lang="nb"
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fxNext() }}
                placeholder="Skriv overskriften her – f.eks. «2. verdenskrig»" />
            )}
            {subStep === 1 && (
              <textarea className="ai-fx-area" rows={4} autoFocus value={manuscript} spellCheck lang="nb"
                onChange={(e) => setManuscript(e.target.value)}
                placeholder="Skriv stikkord eller manus – f.eks. «årsaker, viktige hendelser, landene som deltok, hvordan den endte»" />
            )}
            {subStep === 2 && (
              <div className="ai-fx-choices">
                {AMOUNTS.map((a) => (
                  <button key={a.k} type="button" className={'ai-fx-choice' + (textAmount === a.k ? ' on' : '')} onClick={() => setTextAmount(a.k)}>{a.l}</button>
                ))}
              </div>
            )}
            {subStep === 3 && (
              <div className="ai-fx-count">
                <div className="ai-fx-stepper">
                  <button type="button" className="ai-fx-stepbtn" onClick={() => setCountSafe(count - 1)} disabled={count <= 3}>−</button>
                  <span className="ai-fx-countnum">{count}</span>
                  <button type="button" className="ai-fx-stepbtn" onClick={() => setCountSafe(count + 1)} disabled={count >= 20}>+</button>
                </div>
                <div className="ai-fx-quick">
                  {COUNT_QUICK.map((n) => {
                    const locked = n > maxCount
                    return <button key={n} type="button" className={'ai-fx-pill' + (count === n ? ' on' : '') + (locked ? ' locked' : '')} onClick={() => setCountSafe(n)}>{n}{locked && ' 🔒'}</button>
                  })}
                </div>
                {isFinite(maxCount) && maxCount < 20 && <div className="ai-fx-limithint">Gratis: maks {maxCount} sider · <span>oppgrader for flere</span></div>}
              </div>
            )}
            {subStep === 4 && (
              <>
                <input className="ai-fx-input" autoFocus value={visualStyle} spellCheck lang="nb"
                  onChange={(e) => { setStyleOverride(null); setVisualStyle(e.target.value) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') fxNext() }}
                  placeholder="«hvit og blå», «mørkt og stilig», «botanisk», «tech» … (valgfritt)" />
                <div className="ai-fx-palette">
                  <div className="ai-fx-swatches" title={resolved.name}>
                    {[pal.bg, pal.card, pal.acc, pal.ink].map((c, i) => (
                      <span key={i} className="ai-fx-sw" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="ai-fx-palinfo">
                    <span className="ai-fx-palname">{resolved.name}</span>
                    <div className="ai-fx-palbtns">
                      <button type="button" className="ai-fx-palbtn" onClick={regenerateStyle}><ArrowRight size={14} /> Generer på nytt</button>
                      <button type="button" className={'ai-fx-palbtn' + (manualOpen ? ' on' : '')} onClick={() => setManualOpen((v) => !v)}>Skift manuelt</button>
                    </div>
                  </div>
                </div>
                {manualOpen && (
                  <div className="ai-fx-stylelist">
                    {STYLE_LIST.map((s) => (
                      <button key={s.id} type="button" className={'ai-fx-stylechip' + (resolved.id === s.id ? ' on' : '')} onClick={() => setStyleOverride(s.id)}>
                        <span className="ai-fx-stylechip-sw" style={{ background: STYLES[s.id].acc }} />
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="ai-fx-variety">
                  <div className="ai-fx-varlabel">Oppsett på sidene</div>
                  <div className="ai-fx-palbtns">
                    <button type="button" className={'ai-fx-palbtn' + (varied ? ' on' : '')} onClick={() => setVaried(true)}>Variert</button>
                    <button type="button" className={'ai-fx-palbtn' + (!varied ? ' on' : '')} onClick={() => setVaried(false)}>Enkel</button>
                  </div>
                  <div className="ai-fx-varhint">
                    {varied
                      ? 'Bruker flere oppsett der det passer: tidslinje, sammenligning, steg, tall, sjekkliste m.m.'
                      : 'Klassisk og rolig: mest foto, tekst og punktlister.'}
                  </div>
                </div>
              </>
            )}

            {err && <p className="err" style={{ marginTop: 12 }}>{err}</p>}
            {busy && <div style={{ marginTop: 14 }}><ProgressBar p={prog.p} label={genLabel || 'Lager presentasjonen …'} /></div>}

            <div className="ai-fx-foot">
              <div className="ai-fx-left">
                {subStep > 0 && <button type="button" className="ai-fx-back" onClick={fxBack} disabled={busy}><ArrowLeft size={16} /> Tilbake</button>}
              </div>
              <button className="ai-fx-arrow" onClick={fxNext} disabled={busy || !canNext} title={subStep < LAST ? 'Neste' : 'Lag presentasjon'}>
                {busy ? <span className="ai-fx-spin" /> : subStep < LAST ? <ArrowRight size={22} /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>
          <p className="ai-fx-foothint">Steg {subStep + 1} av {FXQ.length}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <>
          <h2><Sparkles size={20} /> Se over utkastet</h2>
            <p className="muted">Rediger teksten på hvert lysbilde før du lager presentasjonen. Forside er først og oppsummering sist.</p>

            <div className="style-prev">
              <div className="style-meta">
                <b>Design</b>
                <span className="muted small">AI velger stil, foto og oppsett ut fra innholdet</span>
              </div>
            </div>
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
      </div>
    </div>
  )
}
