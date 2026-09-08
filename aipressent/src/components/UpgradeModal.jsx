import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { onUpgrade } from '../lib/limits'

const REASONS = {
  pres: 'Du har nådd grensen for antall presentasjoner på Gratis.',
  slides: 'Gratis har maks 8 sider per presentasjon.',
  tts: 'AI-opplesning er en funksjon for Pluss og Pro.',
  default: 'Oppgrader for å låse opp mer.',
}

// Rader i sammenligningstabellen. true = ✓, false = ✗, ellers tekst.
const ROWS = [
  { label: 'Lage presentasjoner med AI', gratis: true, pluss: true, pro: true },
  { label: 'Alle stiler og maler', gratis: true, pluss: true, pro: true },
  { label: 'Eksport til PowerPoint & PDF', gratis: true, pluss: true, pro: true },
  { label: 'Antall presentasjoner', gratis: '3', pluss: '15', pro: '∞' },
  { label: 'Sider per presentasjon', gratis: '8', pluss: '∞', pro: '∞' },
  { label: 'Tokens per dag', gratis: '5', pluss: '50', pro: '150' },
  { label: 'Uten vannmerke', gratis: false, pluss: true, pro: true },
  { label: 'AI-opplesning (stemme)', gratis: false, pluss: true, pro: true },
]

function Cell({ v }) {
  if (v === true) return <span className="um-yes"><Check size={16} /></span>
  if (v === false) return <span className="um-no">✕</span>
  return <span className="um-val">{v}</span>
}

export default function UpgradeModal() {
  const [info, setInfo] = useState(null)
  const [prices, setPrices] = useState({})
  const nav = useNavigate()

  useEffect(() => onUpgrade((i) => setInfo(i || {})), [])
  useEffect(() => {
    if (info && !Object.keys(prices).length) {
      supabase.from('plans').select('tier,price_month_nok').then(({ data }) => {
        const m = {}; (data || []).forEach((p) => { m[p.tier] = p.price_month_nok }); setPrices(m)
      })
    }
    const esc = (e) => { if (e.key === 'Escape') setInfo(null) }
    if (info) window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [info])

  if (!info) return null
  const close = () => setInfo(null)
  const goPricing = () => { close(); nav('/priser') }

  return (
    <div className="up-overlay" onClick={close}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <button className="up-x" onClick={close} aria-label="Lukk"><X size={20} /></button>
        <h2>Oppgrader AiPresent</h2>
        <p className="up-reason">{REASONS[info.reason] || REASONS.default}</p>

        <div className="um-table">
          <div className="um-row um-head">
            <span className="um-feat"></span>
            <span>Gratis</span>
            <span className="um-col-feat">Pluss</span>
            <span>Pro</span>
          </div>
          {ROWS.map((r, i) => (
            <div className="um-row" key={i}>
              <span className="um-feat">{r.label}</span>
              <span><Cell v={r.gratis} /></span>
              <span className="um-col-feat"><Cell v={r.pluss} /></span>
              <span><Cell v={r.pro} /></span>
            </div>
          ))}
          <div className="um-row um-price">
            <span className="um-feat">Pris</span>
            <span>0 kr</span>
            <span className="um-col-feat">{prices.pluss ?? 39} kr</span>
            <span>{prices.pro ?? 79} kr</span>
          </div>
        </div>

        <div className="um-actions">
          <button className="um-btn" onClick={goPricing}>Velg Pluss</button>
          <button className="um-btn pro" onClick={goPricing}>Velg Pro</button>
        </div>
        <button className="up-later" onClick={close}>Kanskje senere</button>
      </div>
    </div>
  )
}
