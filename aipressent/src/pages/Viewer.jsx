import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SlideStage from '../components/SlideStage'

export default function Viewer() {
  const { id } = useParams()
  const [deck, setDeck] = useState(null)
  const [err, setErr] = useState('')
  const [i, setI] = useState(0)

  useEffect(() => {
    supabase.from('presentations').select('data, title').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setErr('Fant ikke presentasjonen – eller den er ikke delt.'); return }
      setDeck(data.data)
    })
  }, [id])
  useEffect(() => {
    const onKey = (e) => {
      if (!deck) return
      if (e.key === 'ArrowRight' || e.key === ' ') setI((v) => Math.min(deck.slides.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [deck])

  if (err) return <div className="viewer-msg">{err}</div>
  if (!deck) return <div className="screen-center"><div className="spinner" /></div>
  const s = deck.slides[i]
  return (
    <div className="viewer">
      <div className="viewer-stage-wrap">
        <div className="viewer-stage"><SlideStage key={i} slide={s} animate /></div>
      </div>
      <div className="viewer-bar">
        <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>‹</button>
        <span className="viewer-count">{i + 1} / {deck.slides.length}</span>
        <button onClick={() => setI((v) => Math.min(deck.slides.length - 1, v + 1))} disabled={i === deck.slides.length - 1}>›</button>
        <span className="viewer-title">{deck.title}</span>
        <span className="viewer-brand">◆ AiPressent</span>
      </div>
    </div>
  )
}
