import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { THEMES, blankSlide, textEl, imageEl, shapeEl, tableEl, genId, slidesFromAi, normalizeTheme, CW, CH, applyTheme } from '../lib/deck'
import { SILHOUETTES, SIL_CATS, SCENES } from '../lib/silhouettes'
import { exportPptx, exportPdf, pptxBlob } from '../lib/export'
import { importToGoogleSlides, googleConfigured, loadGis } from '../lib/gslides'
import Canvas from '../components/Canvas'
import SlideStage from '../components/SlideStage'
import TokenBadge from '../components/TokenBadge'

const TEMPLATES = [
  { name: 'Forside', s: { layout: 'cover', title: 'Tittel', subtitle: 'Undertittel', icon: '📌' } },
  { name: 'Kapittel', s: { layout: 'section', title: 'Kapittel', icon: '🌟' } },
  { name: 'Punktliste', s: { layout: 'bullets', title: 'Tittel', bullets: ['Første punkt', 'Andre punkt', 'Tredje punkt'], icon: '✅' } },
  { name: 'Stor setning', s: { layout: 'statement', statement: 'En viktig setning her', subtitle: '' } },
  { name: 'Bilde + tekst', s: { layout: 'imageText', title: 'Tittel', bullets: ['Punkt 1', 'Punkt 2', 'Punkt 3'], image: { caption: 'Bilde her' } } },
  { name: 'Stort bilde', s: { layout: 'imageFull', title: 'Tittel', image: { caption: 'Stort bilde her' } } },
  { name: 'To kolonner', s: { layout: 'twoColumn', title: 'Tittel', columns: [{ heading: 'Venstre', bullets: ['Punkt', 'Punkt'] }, { heading: 'Høyre', bullets: ['Punkt', 'Punkt'] }], icon: '⚖️' } },
]
import Toolbar from '../components/Toolbar'
import AnimPanel from '../components/AnimPanel'
import { useProgress, ProgressBar } from '../components/Progress'
import Tour from '../components/Tour'
import { ChevronLeft, Plus, Copy, Trash2, Play, Download, Sparkles, ChevronUp, ChevronDown, Undo2, Redo2, Save, FileText, Wand2, CheckCircle2, Share2, Image as ImageIcon, Clapperboard, Grid3x3, X, Search, Palette } from 'lucide-react'

export default function Editor() {
  const { id } = useParams()
  const { user, aiEnabled, tokens, tokensUnlimited, refreshTokens } = useAuth()
  const nav = useNavigate()
  const [deck, setDeck] = useState(null)
  const [idx, setIdx] = useState(0)
  const [selId, setSelId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [present, setPresent] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [saved, setSaved] = useState('saved')   // saved | dirty | saving
  const [notesBusy, setNotesBusy] = useState(false)
  const notesProg = useProgress()
  const [tourOpen, setTourOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [animBusy, setAnimBusy] = useState(false)
  const [sp, setSp] = useSearchParams()
  useEffect(() => {
    if (sp.get('tour') === '1') { setTourOpen(true); sp.delete('tour'); setSp(sp, { replace: true }) }
  }, [])
  const [aiSlideOpen, setAiSlideOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [aiImgEl, setAiImgEl] = useState(null)
  const [webImgEl, setWebImgEl] = useState(null)
  const [imgChoice, setImgChoice] = useState(null)
  const [grid, setGrid] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [tplOpen, setTplOpen] = useState(false)
  const [animOpen, setAnimOpen] = useState(false)
  const [multiSel, setMultiSel] = useState([])
  const [minimal, setMinimal] = useState(() => { try { return localStorage.getItem('ap_minimal') === '1' } catch (_e) { return false } })
  const [silOpen, setSilOpen] = useState(false)
  const [silCat, setSilCat] = useState('mat')
  const [railW, setRailW] = useState(() => { try { return Math.min(360, Math.max(120, Number(localStorage.getItem('ap_railw')) || 168)) } catch (_e) { return 168 } })
  const railDrag = useRef(null)
  function toggleMinimal() { setMinimal((m) => { try { localStorage.setItem('ap_minimal', m ? '0' : '1') } catch (_e) { /* ignore */ } return !m }) }
  function startRailResize(e) {
    e.preventDefault()
    railDrag.current = { sx: e.clientX, ow: railW }
    const mv = (ev) => { const d = railDrag.current; if (!d) return; setRailW(Math.min(360, Math.max(120, d.ow + ev.clientX - d.sx))) }
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
  }
  const [shareMsg, setShareMsg] = useState('')
  const [, setHistTick] = useState(0)

  const saveT = useRef(null)
  const replaceRef = useRef(null)
  const replaceTarget = useRef(null)
  const deckRef = useRef(null)
  const slideClip = useRef(null)
  const dragSlide = useRef(null)
  const dirtyRef = useRef(false)
  const undoStack = useRef([])
  const redoStack = useRef([])
  const lastSnap = useRef(0)

  useEffect(() => {
    supabase.from('presentations').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (!data) { nav('/mine'); return }
      const d = { ...data.data, theme: normalizeTheme(data.data.theme) }
      deckRef.current = d; undoStack.current = []; redoStack.current = []
      setDeck(d)
    })
  }, [id, nav])

  const rawWrite = useCallback((d) => {
    return supabase.from('presentations').update({
      data: d, title: d.title, theme: d.theme?.name || 'Egendefinert', updated_at: new Date().toISOString(),
    }).eq('id', id)
  }, [id])

  function writeNow(d) {
    clearTimeout(saveT.current); setSaved('saving')
    rawWrite(d).then(({ error }) => { dirtyRef.current = !!error; setSaved(error ? 'dirty' : 'saved') })
  }
  function persist(d) {
    dirtyRef.current = true; setSaved('dirty')
    clearTimeout(saveT.current)
    saveT.current = setTimeout(() => writeNow(d), 700)
  }
  function commitEdits() { const a = document.activeElement; if (a && typeof a.blur === 'function') a.blur() }
  function flush() { commitEdits(); if (deckRef.current) writeNow(deckRef.current) }

  // lagre ved navigering bort / lukking av fane
  useEffect(() => {
    const onUnload = () => { if (dirtyRef.current && deckRef.current) rawWrite(deckRef.current) }
    window.addEventListener('beforeunload', onUnload)
    return () => { window.removeEventListener('beforeunload', onUnload); if (dirtyRef.current && deckRef.current) rawWrite(deckRef.current) }
  }, [rawWrite])

  function snapshot() {
    const now = Date.now()
    if (now - lastSnap.current > 600 && deckRef.current) {
      undoStack.current.push(deckRef.current)
      if (undoStack.current.length > 60) undoStack.current.shift()
      redoStack.current = []; lastSnap.current = now; setHistTick((t) => t + 1)
    }
  }
  function apply(next, hist = true) {
    if (hist) snapshot()
    deckRef.current = next; setDeck(next); persist(next)
  }
  function undo() {
    if (!undoStack.current.length) return
    redoStack.current.push(deckRef.current)
    const prev = undoStack.current.pop()
    deckRef.current = prev; setDeck(prev); persist(prev); lastSnap.current = Date.now(); setSelId(null); setEditId(null); setHistTick((t) => t + 1)
  }
  function redo() {
    if (!redoStack.current.length) return
    undoStack.current.push(deckRef.current)
    const nx = redoStack.current.pop()
    deckRef.current = nx; setDeck(nx); persist(nx); lastSnap.current = Date.now(); setSelId(null); setEditId(null); setHistTick((t) => t + 1)
  }

  // hurtigtaster
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const inField = !!(t && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'))
      const meta = e.ctrlKey || e.metaKey
      if (meta) {
        const k = e.key.toLowerCase()
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
        else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
        else if (k === 's') { e.preventDefault(); flush() }
        else if (k === 'c' && !inField) { e.preventDefault(); copySlide() }
        else if (k === 'v' && !inField) { e.preventDefault(); pasteSlide() }
        return
      }
      if (editId || inField) return
      const hasMulti = multiSel.length > 1
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (hasMulti) { e.preventDefault(); deleteMulti(); return }
        if (sel && !sel.locked) { e.preventDefault(); deleteSel() }
        return
      }
      if (e.key.startsWith('Arrow')) {
        // Ingen objekt valgt → bla mellom lysbildene
        if (!sel && !hasMulti && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault()
          setIdx((v) => Math.max(0, Math.min(deck.slides.length - 1, e.key === 'ArrowLeft' ? v - 1 : v + 1)))
          setSelId(null); setEditId(null)
          return
        }
        const step = e.shiftKey ? 10 : 1
        let dx = 0, dy = 0
        if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step
        else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step
        if (hasMulti) { e.preventDefault(); setSlide({ ...slide, elements: slide.elements.map((q) => (multiSel.includes(q.id) ? { ...q, x: q.x + dx, y: q.y + dy } : q)) }); return }
        if (sel && !sel.locked) { e.preventDefault(); updateSel({ x: sel.x + dx, y: sel.y + dy }) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => { setMultiSel([]) }, [idx])
  useEffect(() => { try { localStorage.setItem('ap_railw', String(railW)) } catch (_e) { /* ignore */ } }, [railW])
  useEffect(() => { if (googleConfigured()) loadGis().catch(() => {}) }, [])

  function goBack() { flush(); nav('/mine') }
  if (!deck) return <div className="screen-center"><div className="spinner" /></div>

  const slide = deck.slides[idx] || deck.slides[0]
  const sel = slide.elements.find((e) => e.id === selId) || null

  function setSlide(ns) { apply({ ...deck, slides: deck.slides.map((s, i) => (i === idx ? ns : s)) }) }
  function updateSel(patch) {
    if (!sel) return
    setSlide({ ...slide, elements: slide.elements.map((e) => (e.id === sel.id ? { ...e, ...patch } : e)) })
  }
  function addText() {
    const th = deck.theme || THEMES.minimal
    const e = textEl({ text: 'Ny tekst', fontFamily: th.fontBody, color: th.text, x: 120, y: 240 })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id); setEditId(e.id)
  }
  async function uploadFile(file) {
    const path = `${user.id}/${genId()}-${file.name.replace(/[^\w.]/g, '_')}`
    const { error } = await supabase.storage.from('slides').upload(path, file, { upsert: true })
    if (error) { alert('Kunne ikke laste opp bildet: ' + error.message); return null }
    return supabase.storage.from('slides').getPublicUrl(path).data.publicUrl
  }
  async function addImage(ev) {
    const file = ev.target.files?.[0]; ev.target.value = ''
    if (!file) return
    const url = await uploadFile(file); if (!url) return
    const e = imageEl({ src: url })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id)
  }
  function addImageChoice() {
    const e = imageEl({ src: '' })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id); setImgChoice(e)
  }
  async function uploadIntoImage(elId, file) {
    const url = await uploadFile(file); if (!url) return
    setSlide({ ...slide, elements: slide.elements.map((e) => (e.id === elId ? { ...e, src: url } : e)) })
  }
  function addShape(kind = 'rect') {
    const th = deck.theme || THEMES.minimal
    const dims = kind === 'circle' ? { w: 160, h: 160, radius: 0 } : kind === 'line' ? { w: 260, h: 12, radius: 0 }
      : kind === 'arrow' ? { w: 260, h: 60, radius: 0 } : kind === 'star' ? { w: 150, h: 150, radius: 0 } : { w: 220, h: 120, radius: 12 }
    const e = shapeEl({ kind, x: 130, y: 220, ...dims, fill: th.accent })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id)
  }
  function addSticker(emoji) {
    const e = textEl({ text: emoji, fontSize: 80, x: 420, y: 220, w: 120, h: 120, align: 'center', color: '#000000' })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id)
  }
  function addSilhouette(sil) {
    const th = deck.theme || THEMES.minimal
    const h = 150, w = Math.round(h * (sil.ratio || 1))
    const e = shapeEl({ kind: 'silhouette', path: sil.path, sid: sil.id, x: Math.round((CW - w) / 2), y: Math.round((CH - h) / 2), w, h, fill: th.accent, radius: 0 })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id); setSilOpen(false)
  }
  function addScene(scene) {
    const th = deck.theme || THEMES.minimal
    const parts = scene.build(th.accent).map((p) => shapeEl({ kind: 'silhouette', path: p.path, sid: p.sid, x: p.x, y: p.y, w: p.w, h: p.h, fill: p.fill, radius: 0, anim: p.anim }))
    setSlide({ ...slide, elements: [...slide.elements, ...parts] }); setSelId(null); setSilOpen(false); setAnimOpen(true)
  }
  function addTable() {
    const th = deck.theme || THEMES.minimal
    const e = tableEl({ accent: th.accent, color: th.text })
    setSlide({ ...slide, elements: [...slide.elements, e] }); setSelId(e.id)
  }
  function replaceImage(el) { replaceTarget.current = el.id; replaceRef.current?.click() }
  function onReplaceFile(ev) {
    const file = ev.target.files?.[0]; ev.target.value = ''
    const tid = replaceTarget.current; replaceTarget.current = null
    if (file && tid) uploadIntoImage(tid, file)
  }
  function deleteSel() {
    if (!sel) return
    setSlide({ ...slide, elements: slide.elements.filter((e) => e.id !== sel.id) }); setSelId(null)
  }
  function bringFront() { if (!sel) return; const rest = slide.elements.filter((e) => e.id !== sel.id); setSlide({ ...slide, elements: [...rest, sel] }) }
  function sendBack() { if (!sel) return; const rest = slide.elements.filter((e) => e.id !== sel.id); setSlide({ ...slide, elements: [sel, ...rest] }) }
  function selectEl(id, shift) {
    if (id == null) { setSelId(null); setMultiSel([]); setEditId(null); return }
    const e0 = slide.elements.find((e) => e.id === id)
    const groupIds = e0 && e0.groupId ? slide.elements.filter((e) => e.groupId === e0.groupId).map((e) => e.id) : [id]
    setEditId(null)
    if (shift) {
      setMultiSel((prev) => {
        const set = new Set(prev.length ? prev : (selId ? [selId] : []))
        groupIds.forEach((g) => (set.has(g) ? set.delete(g) : set.add(g)))
        return [...set]
      })
      setSelId(id)
    } else {
      if (multiSel.length > 1 && multiSel.includes(id)) { setSelId(id); return }
      setMultiSel(groupIds); setSelId(id)
    }
  }
  function alignSel(kind) {
    const els = slide.elements.filter((e) => multiSel.includes(e.id)); if (els.length < 2) return
    const minX = Math.min(...els.map((e) => e.x)), maxR = Math.max(...els.map((e) => e.x + e.w))
    const minY = Math.min(...els.map((e) => e.y)), maxB = Math.max(...els.map((e) => e.y + e.h))
    const cx = (minX + maxR) / 2, cy = (minY + maxB) / 2
    setSlide({ ...slide, elements: slide.elements.map((e) => {
      if (!multiSel.includes(e.id)) return e
      if (kind === 'left') return { ...e, x: Math.round(minX) }
      if (kind === 'right') return { ...e, x: Math.round(maxR - e.w) }
      if (kind === 'centerH') return { ...e, x: Math.round(cx - e.w / 2) }
      if (kind === 'top') return { ...e, y: Math.round(minY) }
      if (kind === 'bottom') return { ...e, y: Math.round(maxB - e.h) }
      if (kind === 'middleV') return { ...e, y: Math.round(cy - e.h / 2) }
      return e
    }) })
  }
  function distributeSel(axis) {
    const els = slide.elements.filter((e) => multiSel.includes(e.id)); if (els.length < 3) return
    const key = axis === 'h' ? 'x' : 'y'
    const sorted = [...els].sort((a, b) => a[key] - b[key])
    const start = sorted[0][key], end = sorted[sorted.length - 1][key]
    const gap = (end - start) / (sorted.length - 1)
    const pos = {}
    sorted.forEach((e, i) => { pos[e.id] = Math.round(start + gap * i) })
    setSlide({ ...slide, elements: slide.elements.map((e) => (pos[e.id] != null ? { ...e, [key]: pos[e.id] } : e)) })
  }
  function groupSel() { const gid = genId(); setSlide({ ...slide, elements: slide.elements.map((e) => (multiSel.includes(e.id) ? { ...e, groupId: gid } : e)) }) }
  function ungroupSel() { setSlide({ ...slide, elements: slide.elements.map((e) => (multiSel.includes(e.id) ? { ...e, groupId: undefined } : e)) }) }
  function deleteMulti() { if (!multiSel.length) return; setSlide({ ...slide, elements: slide.elements.filter((e) => !multiSel.includes(e.id)) }); setSelId(null); setMultiSel([]) }
  function addTemplate(tpl) {
    const built = slidesFromAi([tpl], deck.theme)[0]; if (!built) return
    const slides = [...deck.slides]; slides.splice(idx + 1, 0, built)
    apply({ ...deck, slides }); setIdx(idx + 1); setSelId(null); setMultiSel([]); setTplOpen(false)
  }
  function setAnim(patch) { setSlide({ ...slide, anim: { ...(slide.anim || {}), ...patch } }) }
  function setBg(color) { setSlide({ ...slide, background: color }) }
  function setNotes(t) { setSlide({ ...slide, notes: t }) }

  async function aiNotes() {
    setNotesBusy(true); notesProg.start()
    try {
      const summary = deck.slides.map((s, i) => `${i + 1}. ${s.elements.filter((e) => e.type === 'text').map((e) => e.text).join(' | ')}`).join('\n')
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'notes', current: summary } })
      refreshTokens()
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      const notes = data.notes || []
      apply({ ...deck, slides: deck.slides.map((s, i) => ({ ...s, notes: notes[i] ?? s.notes ?? '' })) })
      notesProg.done()
    } catch (e) { alert('AI klarte ikke å lage manus: ' + (e.message || e)); notesProg.reset() }
    finally { setNotesBusy(false) }
  }

  function applyAiSlide(aiSlide) {
    const built = slidesFromAi([aiSlide], deck.theme)[0]
    if (!built) return
    setSlide({ ...built, id: slide.id, notes: slide.notes }); setSelId(null); setEditId(null)
  }
  async function searchWeb(query) {
    const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'stock_search', prompt: query, topic: deck.title } })
    if (error) throw new Error(error.message || 'nett')
    if (data?.error) throw new Error(data.error)
    return data.results || []
  }
  async function webImage(el, imageUrl) {
    const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'stock_fetch', url: imageUrl } })
    if (error) throw new Error(error.message || 'nett')
    if (data?.error) throw new Error(data.error)
    if (!data.image) throw new Error('Fikk ikke bildet')
    const blob = await (await fetch('data:image/jpeg;base64,' + data.image)).blob()
    const u = await uploadFile(new File([blob], 'web.jpg', { type: 'image/jpeg' }))
    if (!u) throw new Error('Opplasting feilet')
    setSlide({ ...slide, elements: slide.elements.map((e) => (e.id === el.id ? { ...e, src: u } : e)) })
  }
  async function genImage(el, prompt) {
    const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'image', prompt, topic: deck.title } })
    if (error) throw new Error(error.message || 'nett')
    if (data?.error) throw new Error(data.error)
    if (!data.image) throw new Error('Fikk ikke noe bilde')
    const blob = await (await fetch('data:image/png;base64,' + data.image)).blob()
    const u = await uploadFile(new File([blob], 'ai.png', { type: 'image/png' }))
    if (!u) throw new Error('Opplasting feilet')
    setSlide({ ...slide, elements: slide.elements.map((e) => (e.id === el.id ? { ...e, src: u } : e)) })
  }
  // Lager + laster opp bilder for alle tomme bildefelter (brukes av «Endre med AI»)
  async function fillImages(slides, topic) {
    const imgs = []
    slides.forEach((s) => s.elements.forEach((e) => { if (e.type === 'image' && !e.src && e.caption && e.caption !== 'Sett inn bilde') imgs.push(e) }))
    if (!imgs.length) return
    await Promise.all(imgs.map(async (e) => {
      try {
        const { data } = await supabase.functions.invoke('smart-task', { body: { mode: 'image', prompt: e.caption, topic } })
        if (data?.image) {
          const blob = await (await fetch('data:image/jpeg;base64,' + data.image)).blob()
          const u = await uploadFile(new File([blob], 'ai.jpg', { type: 'image/jpeg' }))
          if (u) e.src = u
        }
      } catch (_e) { /* hopp over */ }
    }))
  }
  async function applyAiEdit(aiSlides) {
    const built = slidesFromAi(aiSlides || [], deck.theme)
    await fillImages(built, deck.title)
    apply({ ...deck, slides: built }); setIdx(0)
  }
  async function googleSlides() {
    if (!googleConfigured()) {
      try { await exportPptx(deck) } catch (e) { /* nedlasting startet uansett */ }
      window.open('https://drive.google.com/drive/my-drive', '_blank')
      setShareMsg('Lastet ned .pptx ✓  Dra fila inn i Google Drive → dobbeltklikk → «Åpne med Google Slides».')
      setTimeout(() => setShareMsg(''), 10000)
      return
    }
    const tab = window.open('', '_blank')
    if (tab) { try { tab.document.write('<p style="font-family:sans-serif;padding:24px;color:#444">Lager Google Slides … logg inn med Google i vinduet som dukker opp. Dette vinduet åpner presentasjonen automatisk.</p>') } catch (_e) { /* ignore */ } }
    setShareMsg('Lager Google Slides … logg inn med Google')
    try {
      commitEdits()
      const url = await importToGoogleSlides(() => pptxBlob(deckRef.current || deck), (deckRef.current || deck).title)
      if (tab) tab.location = url; else window.open(url, '_blank')
      setShareMsg('Åpnet i Google Slides ✓')
      setTimeout(() => setShareMsg(''), 4000)
    } catch (e) {
      if (tab) { try { tab.close() } catch (_e) { /* ignore */ } }
      setShareMsg('Klarte ikke automatisk (' + (e.message || e) + '). Laster ned .pptx i stedet …')
      try { await exportPptx(deck) } catch (_e) { /* ignore */ }
      setTimeout(() => setShareMsg(''), 9000)
    }
  }
  async function share() {
    setShareMsg('Deler …')
    const { error } = await supabase.from('presentations').update({ is_public: true }).eq('id', id)
    if (error) { setShareMsg('Kunne ikke dele'); return }
    const link = `${window.location.origin}/v/${id}`
    try { await navigator.clipboard.writeText(link); setShareMsg('Lenke kopiert! ✓') } catch { setShareMsg(link) }
    setTimeout(() => setShareMsg(''), 5000)
  }

  async function animateWithAi() {
    if (animBusy) return
    setAnimBusy(true)
    try {
      const d = deckRef.current
      const summary = d.slides.map((s) => {
        const txt = (s.elements || []).find((e) => e.type === 'text' && !e.decor && e.text)
        const items = (s.elements || []).filter((e) => !e.decor).length
        return { title: txt ? String(txt.text).slice(0, 60) : '', items }
      })
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'animate', slides: summary, mood: d.theme?.name || '' } })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      const anims = Array.isArray(data?.slides) ? data.slides : []
      const fb = { transition: 'fade', preset: 'fadeUp', stagger: 110 }
      const next = { ...d, slides: d.slides.map((s, i) => ({ ...s, anim: anims[i] || anims[anims.length - 1] || fb })) }
      apply(next)
      refreshTokens()
      setShareMsg('Animasjoner lagt til! Trykk «Presenter» for å se dem ✨')
      setTimeout(() => setShareMsg(''), 3500)
    } catch (e) {
      setShareMsg('Kunne ikke animere: ' + (e?.message || 'ukjent feil'))
      setTimeout(() => setShareMsg(''), 4000)
    } finally {
      setAnimBusy(false)
    }
  }

  function addSlide() {
    const ns = blankSlide(deck.theme)
    const slides = [...deck.slides]; slides.splice(idx + 1, 0, ns)
    apply({ ...deck, slides }); setIdx(idx + 1); setSelId(null)
  }
  function dupSlide() {
    const copy = { ...slide, id: genId(), elements: slide.elements.map((e) => ({ ...e, id: genId() })) }
    const slides = [...deck.slides]; slides.splice(idx + 1, 0, copy)
    apply({ ...deck, slides }); setIdx(idx + 1)
  }
  function copySlide() { slideClip.current = JSON.parse(JSON.stringify(slide)); setShareMsg('Lysbilde kopiert ✓ (Ctrl+V for å lime inn)'); setTimeout(() => setShareMsg(''), 1800) }
  function pasteSlide() {
    if (!slideClip.current) return
    const src = slideClip.current
    const copy = { ...src, id: genId(), elements: (src.elements || []).map((e) => ({ ...e, id: genId() })) }
    const slides = [...deck.slides]; slides.splice(idx + 1, 0, copy)
    apply({ ...deck, slides }); setIdx(idx + 1); setSelId(null)
  }
  function reorderSlides(from, to) {
    if (from === to || from < 0 || to < 0) return
    const slides = [...deck.slides]
    const [moved] = slides.splice(from, 1)
    slides.splice(to, 0, moved)
    apply({ ...deck, slides }); setIdx(to); setSelId(null)
  }
  function delSlide() {
    if (deck.slides.length === 1) return
    const slides = deck.slides.filter((_, i) => i !== idx)
    apply({ ...deck, slides }); setIdx(Math.max(0, idx - 1)); setSelId(null)
  }
  function moveSlide(dir) {
    const j = idx + dir
    if (j < 0 || j >= deck.slides.length) return
    const slides = [...deck.slides];[slides[idx], slides[j]] = [slides[j], slides[idx]]
    apply({ ...deck, slides }); setIdx(j)
  }

  const saveLabel = saved === 'saving' ? 'Lagrer …' : saved === 'dirty' ? 'Lagre' : 'Lagret ✓'

  return (
    <div className="editor">
      <header className="ed-top">
        <button className="chip" onClick={goBack}><ChevronLeft size={16} /> Mine</button>
        <input className="ed-title" spellCheck lang="nb" value={deck.title} onChange={(e) => apply({ ...deck, title: e.target.value })} />
        <div className="ed-top-right">
          <button className="chip ic" onClick={undo} disabled={!undoStack.current.length} title="Angre (Ctrl+Z)"><Undo2 size={15} /></button>
          <button className="chip ic" onClick={redo} disabled={!redoStack.current.length} title="Gjenta (Ctrl+Y)"><Redo2 size={15} /></button>
          <button className={'chip' + (saved === 'saved' ? ' ok' : '')} onClick={flush}><Save size={15} /> {saveLabel}</button>
          <TokenBadge />
          {aiEnabled && <button className="chip" data-tour="ai" onClick={() => setAiSlideOpen(true)} title="Lag/omskriv dette lysbildet med AI"><Sparkles size={15} /> AI-lysbilde</button>}
          {aiEnabled && <button className="chip" data-tour="check" onClick={() => setReviewOpen(true)}><CheckCircle2 size={15} /> Sjekk</button>}
          {aiEnabled && <button className="chip" data-tour="animate" onClick={animateWithAi} disabled={animBusy}><Clapperboard size={15} /> {animBusy ? 'Animerer …' : 'Animer med AI'}</button>}
          <button className="chip" data-tour="share" onClick={() => setShareOpen(true)}><Share2 size={15} /> Del</button>
          <button className="chip" data-tour="present" onClick={() => { commitEdits(); setTimeout(() => setPresent(true), 0) }}><Play size={15} /> Presenter</button>
          <div className="menu-wrap" data-tour="export">
            <button className="chip primary" onClick={() => setExportOpen((o) => !o)}><Download size={15} /> Eksporter</button>
            {exportOpen && (
              <div className="menu" onMouseLeave={() => setExportOpen(false)}>
                <button onClick={() => { exportPptx(deck); setExportOpen(false) }}>PowerPoint (.pptx)</button>
                <button onClick={() => { exportPdf(deck); setExportOpen(false) }}>PDF</button>
                <button onClick={() => { googleSlides(); setExportOpen(false) }}>{googleConfigured() ? 'Lag i Google Slides (automatisk) ✨' : 'Åpne i Google Slides ↗'}</button>
                <div className="menu-note">{googleConfigured() ? 'Logg inn med Google, så lages presentasjonen automatisk i Google Slides.' : 'Google Slides: vi laster ned .pptx og åpner Google – dra fila inn, så åpnes den i Slides.'}</div>
              </div>
            )}
          </div>
          <button className="chip ic" onClick={() => setTourOpen(true)} title="Omvisning – hva gjør knappene?">?</button>
        </div>
      </header>

      <Toolbar el={sel} update={updateSel} onAddText={addText} onAddImageChoice={addImageChoice} onAddShape={addShape} onAddSticker={addSticker} onAddTable={addTable} onAiImage={(e) => setAiImgEl(e)} onReplaceSel={replaceImage} onDelete={deleteSel} onFront={bringFront} onBack={sendBack} onAnim={() => setAnimOpen(true)} onSilhouette={() => setSilOpen(true)} bg={slide.background} onBg={setBg} aiEnabled={aiEnabled} grid={grid} onGrid={() => setGrid((g) => !g)} minimal={minimal} onMinimal={toggleMinimal} />

      {multiSel.length > 1 && (
        <div className="toolbar multi-toolbar">
          <span className="tb-multi-label">{multiSel.length} valgt</span>
          <button className="tb ic" title="Venstrejuster" onClick={() => alignSel('left')}>⇤</button>
          <button className="tb ic" title="Midtstill vannrett" onClick={() => alignSel('centerH')}>↔</button>
          <button className="tb ic" title="Høyrejuster" onClick={() => alignSel('right')}>⇥</button>
          <button className="tb ic" title="Toppjuster" onClick={() => alignSel('top')}>⤒</button>
          <button className="tb ic" title="Midtstill loddrett" onClick={() => alignSel('middleV')}>↕</button>
          <button className="tb ic" title="Bunnjuster" onClick={() => alignSel('bottom')}>⤓</button>
          <span className="tb-sep" />
          <button className="tb" title="Fordel jevnt vannrett" onClick={() => distributeSel('h')}>Fordel ↔</button>
          <button className="tb" title="Fordel jevnt loddrett" onClick={() => distributeSel('v')}>Fordel ↕</button>
          <span className="tb-sep" />
          <button className="tb" onClick={groupSel}>Grupper</button>
          <button className="tb" onClick={ungroupSel}>Avgrupper</button>
          <button className="tb ic danger" title="Slett valgte" onClick={deleteMulti}><Trash2 size={15} /></button>
        </div>
      )}

      <div className="ed-body">
        <aside className="slides-rail" data-tour="rail" style={{ width: railW, flex: `0 0 ${railW}px` }}>
          {deck.slides.map((s, i) => {
            return (
              <div key={s.id} draggable
                className={'rail-thumb' + (i === idx ? ' on' : '')}
                onClick={() => { setIdx(i); setSelId(null) }}
                onDragStart={() => { dragSlide.current = i }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const from = dragSlide.current; dragSlide.current = null; if (from != null && from !== i) reorderSlides(from, i) }}>
                <span className="rail-num">{i + 1}</span>
                <div className="rail-mini"><SlideStage slide={s} /></div>
              </div>
            )
          })}
          <button className="rail-add" onClick={addSlide}><Plus size={16} /> Lysbilde</button>
          <button className="rail-add ghost" onClick={() => setTplOpen(true)}><FileText size={15} /> Fra mal</button>
          <div className="rail-resizer" onPointerDown={startRailResize} title="Dra for å endre bredde" />
        </aside>

        <main className="ed-stage" data-tour="canvas">
          <Canvas slide={slide} onChange={setSlide} selectedId={selId} setSelectedId={setSelId} selectedIds={multiSel} onSelect={selectEl} editingId={editId} setEditingId={setEditId} onReplaceImage={(el) => setImgChoice(el)} grid={grid} zoom={zoom} />
          <div className="zoom-ctl">
            <button onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))} title="Zoom ut">−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10))} title="Zoom inn">+</button>
            <button onClick={() => setZoom(1)} title="Tilbakestill">⤢</button>
          </div>
          <input ref={replaceRef} type="file" accept="image/*" hidden onChange={onReplaceFile} />
          <div className="stage-tools">
            <button onClick={() => moveSlide(-1)} title="Flytt opp" disabled={idx === 0}><ChevronUp size={16} /></button>
            <button onClick={() => moveSlide(1)} title="Flytt ned" disabled={idx === deck.slides.length - 1}><ChevronDown size={16} /></button>
            <button onClick={dupSlide} title="Dupliser"><Copy size={16} /></button>
            <button onClick={delSlide} title="Slett lysbilde" disabled={deck.slides.length === 1}><Trash2 size={16} /></button>
            <button onClick={() => setThemeOpen(true)} title="Endre tema – farger og stil" className="wand"><Palette size={16} /></button>
          </div>

          <div className="notes" data-tour="notes">
            <div className="notes-head">
              <span><FileText size={14} /> Manus / notater <span className="muted small">(kun for deg – følger med i PowerPoint)</span></span>
              {aiEnabled && <button className="chip small" onClick={aiNotes} disabled={notesBusy}><Sparkles size={13} /> {notesBusy ? "Skriver …" : "AI-manus"}</button>}
            </div>
            {notesBusy && <ProgressBar p={notesProg.p} label="Skriver manus til alle lysbilder …" />}
            <textarea value={slide.notes || ''} onChange={(e) => setNotes(e.target.value)} rows={3} spellCheck lang="nb"
              placeholder="Hva du skal si til dette lysbildet … (eller trykk «AI-manus» så skriver AI det for deg)" />
          </div>
        </main>
      </div>

      {present && <Present deck={deck} start={idx} onClose={() => setPresent(false)} />}
      {aiSlideOpen && <AiSlideModal current={slide.elements.filter((e) => e.type === 'text').map((e) => e.text).join(' | ')} onClose={() => setAiSlideOpen(false)} onApply={(s) => { applyAiSlide(s); setAiSlideOpen(false) }} />}
      {reviewOpen && <ReviewModal deck={deck} onClose={() => setReviewOpen(false)} />}
      {tplOpen && (
        <div className="modal-bg" onClick={() => setTplOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2><FileText size={20} /> Velg en mal</h2>
            <p className="muted">Legg til et nytt lysbilde med ferdig oppsett. Du fyller inn ditt eget innhold etterpå.</p>
            <div className="tpl-grid">
              {TEMPLATES.map((t) => <button key={t.name} className="tpl-btn" onClick={() => addTemplate(t.s)}>{t.name}</button>)}
            </div>
            <div className="modal-foot"><button className="btn ghost" onClick={() => setTplOpen(false)}>Avbryt</button></div>
          </div>
        </div>
      )}
      {animOpen && <AnimPanel slide={slide} onChange={setSlide} selectedId={selId} onClose={() => setAnimOpen(false)} />}

      {aiImgEl && <AiImageModal el={aiImgEl} onClose={() => setAiImgEl(null)} onGen={genImage} />}
      {webImgEl && <WebImageModal el={webImgEl} onClose={() => setWebImgEl(null)} onSearch={searchWeb} onPick={webImage} />}
      {imgChoice && (
        <div className="modal-bg" onClick={() => setImgChoice(null)}>
          <div className="modal img-choice" onClick={(e) => e.stopPropagation()}>
            <h2><ImageIcon size={20} /> Velg bilde</h2>
            <p className="muted">Hvor vil du hente bildet fra?</p>
            <div className="img-choice-row">
              <button className="img-choice-btn" onClick={() => { const el = imgChoice; setImgChoice(null); replaceImage(el) }}>
                <span className="ic">📁</span><span className="t">Last opp fra PC</span><span className="s">Velg en fil fra enheten din</span>
              </button>
              <button className="img-choice-btn" onClick={() => { const el = imgChoice; setImgChoice(null); setWebImgEl(el) }}>
                <span className="ic">🔎</span><span className="t">Søk på nett</span><span className="s">Gratis – millioner av bilder</span>
              </button>
              <button className="img-choice-btn" onClick={() => { const el = imgChoice; setImgChoice(null); setAiImgEl(el) }}>
                <span className="ic">✨</span><span className="t">Lag med AI</span><span className="s">Gratis – beskriv hva du vil ha</span>
              </button>
            </div>
            <div className="modal-foot"><button className="btn ghost" onClick={() => setImgChoice(null)}>Avbryt</button></div>
          </div>
        </div>
      )}
      {shareMsg && <div className="toast">{shareMsg}</div>}
      {shareOpen && <ShareModal id={id} title={deck.title} onClose={() => setShareOpen(false)} />}
      {themeOpen && <ThemeModal deck={deck} idx={idx} onApply={apply} onClose={() => setThemeOpen(false)} />}
      {tourOpen && <Tour onClose={() => setTourOpen(false)} steps={[
        { sel: '[data-tour="toolbar"]', title: 'Verktøylinja', text: 'Her legger du til tekst, bilder, figurer, stickers og tabeller. Klikk et bildefelt for å «Søke på nett», laste opp eget bilde, eller lage med AI. Helt til høyre er «enkel visning» som gjemmer de sjeldne knappene.' },
        { sel: '[data-tour="anim"]', title: 'Animasjon', text: 'Åpne animasjonspanelet (du kan dra det rundt). Klikk et objekt → «Legg til valgt». Velg «Med forrige» (samtidig) eller «Etter forrige» (i rekkefølge), dra radene for å endre rekkefølge, og «Spill av» for å se det.' },
        { sel: '[data-tour="rail"]', title: 'Lysbildene dine', text: 'Alle lysbildene ligger her. Klikk for å bytte, dra for å endre rekkefølge, og «+ Lysbilde» for å legge til. Dra i kanten for å gjøre stripa bredere.' },
        { sel: '[data-tour="canvas"]', title: 'Selve lysbildet', text: 'Dra ting for å flytte dem. Dobbeltklikk på tekst for å skrive – klikk midt i teksten, så går skrivemerket dit. Markér et objekt og dra det runde håndtaket over det for å rotere.' },
        ...(aiEnabled ? [
          { sel: '[data-tour="ai"]', title: 'AI-lysbilde', text: 'La AI lage eller skrive om akkurat DETTE ene lysbildet ut fra en kort beskrivelse. Resten røres ikke.' },
          { sel: '[data-tour="check"]', title: 'Sjekk', text: 'AI ser over presentasjonen og gir deg vennlige tips om hva som kan bli bedre.' },
          { sel: '[data-tour="animate"]', title: 'Animer med AI', text: 'AI velger fine overganger og bevegelse på alle lysbildene på én gang. Trykk «Presenter» etterpå for å se det.' },
        ] : []),
        { sel: '[data-tour="notes"]', title: 'Manus til deg selv', text: 'AI skriver et manus til hvert lysbilde automatisk. Det vises i presentasjons-modus og følger med i PowerPoint-eksporten.' },
        { sel: '[data-tour="present"]', title: 'Presentér', text: 'Kjør presentasjonen i fullskjerm med animasjoner. Trykk «N» for å se manuset mens du presenterer.' },
        { sel: '[data-tour="share"]', title: 'Del', text: 'Velg «Bare se på» (lenke til visning) eller «Kan redigere» (mottakeren får sin egen kopi). Du kan også sende lenken på e-post.' },
        { sel: '[data-tour="export"]', title: 'Eksporter', text: 'Last ned som PowerPoint eller PDF, eller åpne rett i Google Slides – pynt og farger følger med.' },
      ]} />}
    </div>
  )
}

function Present({ deck, start, onClose }) {
  const [i, setI] = useState(start || 0)
  const [showNotes, setShowNotes] = useState(false)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setI((v) => Math.min(deck.slides.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
      if (e.key.toLowerCase() === 'n') setShowNotes((v) => !v)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deck.slides.length, onClose])
  const s = deck.slides[i]
  return (
    <div className="present" onClick={() => setI((v) => Math.min(deck.slides.length - 1, v + 1))}>
      <button className="present-x" onClick={(e) => { e.stopPropagation(); onClose() }}>✕</button>
      <div className="present-stage"><SlideStage key={i} slide={s} animate /></div>
      {showNotes && s.notes && <div className="present-notes" onClick={(e) => e.stopPropagation()}>{s.notes}</div>}
      <div className="present-count">{i + 1} / {deck.slides.length} · trykk «N» for manus</div>
    </div>
  )
}

function AiEdit({ deck, onClose, onApply }) {
  const { refreshTokens } = useAuth()
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const prog = useProgress()
  async function go() {
    if (!instruction.trim()) return
    setBusy(true); setErr(''); prog.start()
    try {
      const summary = deck.slides.map((s) => s.elements.filter((e) => e.type === 'text').map((e) => e.text).join(' | ')).join('\n')
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'edit', current: summary, instruction } })
      refreshTokens()
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      await onApply(data.slides || [])
      prog.done()
      onClose()
    } catch (e) { setErr('AI klarte det ikke: ' + (e.message || e)); setBusy(false); prog.reset() }
  }
  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><Sparkles size={20} /> Endre med AI</h2>
        <p className="muted">Beskriv hva du vil endre, så bygger AI lysbildene på nytt.</p>
        <textarea rows={4} value={instruction} onChange={(e) => setInstruction(e.target.value)} disabled={busy}
          placeholder="F.eks. «Kort ned teksten», «legg til et lysbilde om løsninger», «gjør det mer formelt»" />
        <p className="warn-note">Obs: dette bygger lysbildene på nytt, så manuelle flyttinger nullstilles.</p>
        {err && <p className="err">{err}</p>}
        {busy && <ProgressBar p={prog.p} label="Endrer og lager bilder …" />}
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose} disabled={busy}>Avbryt</button>
          <button className="btn primary" onClick={go} disabled={busy}>{busy ? 'Endrer …' : 'Endre'}</button>
        </div>
      </div>
    </div>
  )
}

function AiSlideModal({ current, onClose, onApply }) {
  const { refreshTokens } = useAuth()
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const prog = useProgress()
  async function go() {
    if (!instruction.trim()) return
    setBusy(true); setErr(''); prog.start()
    try {
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'slide', current, instruction } })
      refreshTokens()
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      prog.done()
      onApply(data.slide)
    } catch (e) { setErr('AI klarte det ikke: ' + (e.message || e)); setBusy(false); prog.reset() }
  }
  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><Wand2 size={20} /> AI – dette lysbildet</h2>
        <p className="muted">Beskriv hva lysbildet skal inneholde, så lager AI det (erstatter innholdet på dette lysbildet).</p>
        <textarea rows={3} value={instruction} onChange={(e) => setInstruction(e.target.value)} disabled={busy}
          placeholder="F.eks. «et lysbilde om hva vi lærte, med 3 korte punkter»" />
        {err && <p className="err">{err}</p>}
        {busy && <ProgressBar p={prog.p} label="Lager lysbildet …" />}
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose} disabled={busy}>Avbryt</button>
          <button className="btn primary" onClick={go} disabled={busy}>{busy ? 'Lager …' : 'Lag lysbilde'}</button>
        </div>
      </div>
    </div>
  )
}

function ReviewModal({ deck, onClose }) {
  const { refreshTokens } = useAuth()
  const [busy, setBusy] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [tips, setTips] = useState([])
  const [err, setErr] = useState('')
  const prog = useProgress()
  useEffect(() => {
    prog.start()
    ;(async () => {
      try {
        const summary = deck.slides.map((s, i) => `${i + 1}. ${s.elements.filter((e) => e.type === 'text').map((e) => e.text).join(' | ')}`).join('\n')
        const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'review', current: summary } })
        refreshTokens()
        if (error) throw error
        if (data?.error) throw new Error(data.error)
        setFeedback(data.feedback || ''); setTips(data.tips || []); prog.done()
      } catch (e) { setErr('AI klarte det ikke: ' + (e.message || e)); prog.reset() }
      finally { setBusy(false) }
    })()
  }, [deck])
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><CheckCircle2 size={20} /> AI-kvalitetssjekk</h2>
        {busy ? <ProgressBar p={prog.p} label="Ser over presentasjonen …" /> : (
          <>
            {err && <p className="err">{err}</p>}
            {feedback && <p className="review-fb">{feedback}</p>}
            {tips.length > 0 && <ul className="review-tips">{tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
          </>
        )}
        <div className="modal-foot"><button className="btn primary" onClick={onClose}>Lukk</button></div>
      </div>
    </div>
  )
}

function AiImageModal({ el, onClose, onGen }) {
  const [prompt, setPrompt] = useState(el.caption && el.caption !== 'Sett inn bilde' ? el.caption : '')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const timerRef = useRef(null)
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])
  async function go() {
    if (!prompt.trim()) { setErr('Skriv hva bildet skal vise først.'); return }
    setBusy(true); setErr(''); setProgress(0)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 96) return p
        const step = p < 55 ? 3.5 : p < 80 ? 1.4 : 0.5
        return Math.min(96, p + step)
      })
    }, 220)
    try {
      await onGen(el, prompt)
      clearInterval(timerRef.current); setProgress(100)
      setTimeout(onClose, 300)
    } catch (e) {
      clearInterval(timerRef.current)
      setErr('Klarte ikke å lage bilde: ' + (e.message || e)); setBusy(false); setProgress(0)
    }
  }
  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><Sparkles size={20} /> Lag AI-bilde</h2>
        <p className="muted">Skriv kort hva bildet skal vise – AI skriver en grundig engelsk beskrivelse og lager et detaljert bilde som passer temaet.</p>
        <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={busy}
          placeholder="F.eks. «kart over Japan under andre verdenskrig», «stridsvogn fra ww2»" />
        {busy && (
          <div className="ai-prog">
            <div className="ai-prog-bar"><div className="ai-prog-fill" style={{ width: progress + '%' }} /></div>
            <div className="ai-prog-pct">{Math.round(progress)}%</div>
          </div>
        )}
        {busy && <p className="muted" style={{ marginTop: 4 }}>{progress < 100 ? 'Lager bildet ditt … ✨' : 'Ferdig! 🎉'}</p>}
        {err && <p className="err">{err}</p>}
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose} disabled={busy}>Avbryt</button>
          <button className="btn primary" onClick={go} disabled={busy}>{busy ? 'Lager …' : '✨ Lag bilde'}</button>
        </div>
      </div>
    </div>
  )
}

function WebImageModal({ el, onClose, onSearch, onPick }) {
  const [q, setQ] = useState(el.caption && el.caption !== 'Sett inn bilde' ? el.caption : '')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [picking, setPicking] = useState(false)
  const [err, setErr] = useState('')
  const [did, setDid] = useState(false)
  async function go() {
    if (!q.trim()) { setErr('Skriv hva du leter etter.'); return }
    setBusy(true); setErr(''); setResults([])
    try {
      const r = await onSearch(q)
      setResults(r); setDid(true)
      if (!r.length) setErr('Fant ingen bilder. Prøv andre ord – gjerne på engelsk.')
    } catch (e) { setErr('Søk feilet: ' + (e.message || e)) } finally { setBusy(false) }
  }
  async function pick(url) {
    if (picking) return
    setPicking(true); setErr('')
    try { await onPick(el, url); onClose() } catch (e) { setErr('Klarte ikke å hente bildet: ' + (e.message || e)); setPicking(false) }
  }
  return (
    <div className="modal-bg" onClick={picking ? undefined : onClose}>
      <div className="modal web-img" onClick={(e) => e.stopPropagation()}>
        <h2><Search size={20} /> Søk på nett</h2>
        <p className="muted">Søk i millioner av gratis bilder (Wikimedia + Openverse). Tips: engelske ord gir flest treff.</p>
        <div className="web-search-row">
          <input value={q} onChange={(e) => setQ(e.target.value)} disabled={busy || picking}
            placeholder="F.eks. «eiffel tower», «volcano», «roman soldier»"
            onKeyDown={(e) => { if (e.key === 'Enter') go() }} />
          <button className="btn primary" onClick={go} disabled={busy || picking}>{busy ? 'Søker …' : 'Søk'}</button>
        </div>
        {picking && <p className="muted">Henter bildet … ⏳</p>}
        {err && <p className="err">{err}</p>}
        <div className="web-img-grid">
          {results.map((r, i) => (
            <button key={i} className="web-img-item" onClick={() => pick(r.url)} disabled={picking} title={r.title || ''}>
              <img src={r.url} alt={r.title || ''} loading="lazy" />
            </button>
          ))}
        </div>
        {!did && !busy && <p className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>Skriv et søk og trykk «Søk» 🔎</p>}
        <div className="modal-foot"><button className="btn ghost" onClick={onClose} disabled={picking}>Lukk</button></div>
      </div>
    </div>
  )
}

function ThemeModal({ deck, idx, onApply, onClose }) {
  const [scope, setScope] = useState('all')
  const [desc, setDesc] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [last, setLast] = useState(null)
  const examples = ['mørkt og elegant med gull', 'lyst og lekent rosa', 'som havet, blått og friskt', 'rolig pastell', 'kraftig og sporty', 'vintage og varmt']
  async function gen() {
    if (!desc.trim()) { setErr('Beskriv hvilke farger eller stil du vil ha.'); return }
    setBusy(true); setErr('')
    try {
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'theme', visualStyle: desc.trim() } })
      if (error) throw new Error(error.message || 'serverfeil')
      if (data?.error) throw new Error(data.error)
      const th = normalizeTheme(data.theme)
      onApply(applyTheme(deck, th, scope, idx))
      setLast(th)
    } catch (e) { setErr('Klarte ikke å lage tema: ' + (e.message || e)) } finally { setBusy(false) }
  }
  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal theme-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sil-head"><h3><Palette size={20} /> Endre tema med AI</h3><button className="modal-x" onClick={onClose}><X size={18} /></button></div>
        <p className="muted" style={{ margin: 0 }}>Beskriv farger eller stil, så lager AI et nytt tema. All tekst og alle bilder beholdes nøyaktig som de er. <span className="small">(Koster 1 token)</span></p>
        <div className="seg" style={{ marginTop: 2 }}>
          <button className={'seg-btn' + (scope === 'all' ? ' on' : '')} onClick={() => setScope('all')}>Hele presentasjonen</button>
          <button className={'seg-btn' + (scope === 'slide' ? ' on' : '')} onClick={() => setScope('slide')}>Bare dette lysbildet</button>
        </div>
        <textarea className="theme-desc" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} disabled={busy}
          placeholder="F.eks. «mørkt og elegant med gull» eller «som en solnedgang»"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gen() } }} />
        <div className="theme-examples">
          {examples.map((x) => <button key={x} className="theme-ex" onClick={() => setDesc(x)} disabled={busy}>{x}</button>)}
        </div>
        {err && <p className="err">{err}</p>}
        {last && !err && (
          <div className="theme-result">
            <span className="muted small">Tema brukt: <b style={{ color: 'var(--ink)' }}>{last.name || 'Nytt tema'}</b> ✓</span>
            <span className="theme-swatches">
              {[last.bg, last.title, last.text, last.accent].map((c, i) => <i key={i} style={{ background: c }} />)}
            </span>
            <span className="muted small">Likte du det ikke? Prøv en ny beskrivelse.</span>
          </div>
        )}
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose} disabled={busy}>Ferdig</button>
          <button className="btn primary" onClick={gen} disabled={busy || !desc.trim()}>{busy ? 'Lager tema …' : '✨ Lag tema'}</button>
        </div>
      </div>
    </div>
  )
}

function ShareModal({ id, title, onClose }) {
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(true)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const [mode, setMode] = useState('view')
  const editLink = `${window.location.origin}/kopi/${id}`
  useEffect(() => {
    (async () => {
      try {
        await supabase.from('presentations').update({ is_public: true }).eq('id', id)
        setLink(`${window.location.origin}/v/${id}`)
      } catch (e) { setMsg('Kunne ikke gjøre delbar: ' + (e.message || e)) }
      finally { setBusy(false) }
    })()
  }, [id])
  async function copy() { const cur = mode === 'edit' ? editLink : link; try { await navigator.clipboard.writeText(cur); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch (_e) {} }
  async function sendMail() {
    if (!email.trim()) { setMsg('Skriv en e-postadresse.'); return }
    setSending(true); setMsg('')
    const cur = mode === 'edit' ? editLink : link
    try {
      const { data, error } = await supabase.functions.invoke('smart-task', { body: { mode: 'email', to: email.trim(), title, link: cur } })
      if (error) {
        let detail = error.message || 'Serverfeil'
        try {
          const ctx = error.context
          if (ctx && typeof ctx.json === 'function') { const j = await ctx.json(); detail = j.error || JSON.stringify(j) }
          else if (ctx && typeof ctx.text === 'function') { detail = (await ctx.text()) || detail }
          if (ctx && ctx.status) detail = '(' + ctx.status + ') ' + detail
        } catch (_e) {}
        throw new Error(detail)
      }
      if (data?.error) throw new Error(data.error)
      if (!data?.ok) throw new Error('Uventet svar: ' + JSON.stringify(data || {}))
      setMsg('Sendt! ✓'); setEmail('')
    } catch (e) { setMsg('Kunne ikke sende: ' + (e?.message || JSON.stringify(e) || 'ukjent feil')) }
    finally { setSending(false) }
  }
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><Share2 size={20} /> Del presentasjonen</h2>
        {busy ? <div className="screen-center" style={{ height: 90 }}><div className="spinner" /></div> : (
          <>
            <div className="seg" style={{ marginBottom: 4 }}>
              <button className={'seg-btn' + (mode === 'view' ? ' on' : '')} onClick={() => setMode('view')}>👁️ Bare se på</button>
              <button className={'seg-btn' + (mode === 'edit' ? ' on' : '')} onClick={() => setMode('edit')}>✏️ Kan redigere</button>
            </div>
            <p className="muted">{mode === 'edit' ? 'Mottakeren får sin EGEN kopi å redigere når de åpner lenken (din original endres ikke).' : 'Alle med lenken kan åpne og se presentasjonen i nettleseren.'}</p>
            <div className="share-link-row">
              <input readOnly value={mode === 'edit' ? editLink : link} onFocus={(e) => e.target.select()} />
              <button className="btn primary" onClick={copy}>{copied ? 'Kopiert ✓' : 'Kopier'}</button>
            </div>
            <div className="share-mail">
              <label>Eller send på e-post:</label>
              <div className="share-link-row">
                <input type="email" placeholder="navn@eksempel.no" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMail() }} />
                <button className="btn ghost" onClick={sendMail} disabled={sending}>{sending ? 'Sender …' : 'Send'}</button>
              </div>
            </div>
            {msg && <p className={msg.includes('Sendt') ? 'ok-note' : 'err'}>{msg}</p>}
          </>
        )}
        <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Lukk</button></div>
      </div>
    </div>
  )
}
