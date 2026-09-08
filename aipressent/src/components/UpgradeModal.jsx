import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { onUpgrade } from '../lib/limits'

const REASONS = {
  pres: 'Du har nådd grensen for antall presentasjoner på gratis.',
  slides: 'Gratis har maks 8 sider per presentasjon.',
  tts: 'AI-opplesning er en funksjon for Pluss og Pro.',
  default: 'Oppgrader for å låse opp mer.',
}

export default function UpgradeModal() {
  const [info, setInfo] = useState(null)
  const [plans, setPlans] = useState([])
  const nav = useNavigate()

  useEffect(() => onUpgrade((i) => setInfo(i || {})), [])
  useEffect(() => {
    if (info && !plans.length) supabase.from('plans').select('*').order('sort').then(({ data }) => setPlans(data || []))
    const esc = (e) => { if (e.key === 'Escape') setInfo(null) }
    if (info) window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [info])

  if (!info) return null
  const close = () => setInfo(null)
  const goPricing = () => { close(); nav('/priser') }
  const perk = { gratis: '3 presentasjoner · maks 8 sider', pluss: '15 presentasjoner · uendelig sider · opplesning', pro: 'Uendelig alt · opplesning' }

  return (
    <div className="up-overlay" onClick={close}>
      <div className="up-modal" onClick={(e) => e.stopPropagation()}>
        <button className="up-x" onClick={close} aria-label="Lukk"><X size={20} /></button>
        <h2>Oppgrader AiPresent</h2>
        <p className="up-reason">{REASONS[info.reason] || REASONS.default}</p>
        <div className="up-plans">
          {plans.map((p) => (
            <div key={p.tier} className={'up-plan' + (p.tier === 'pluss' ? ' feat' : '')}>
              <div className="up-plan-name">{p.tier === 'gratis' ? 'Gratis' : p.name}</div>
              <div className="up-plan-price">{p.price_month_nok ? <><b>{p.price_month_nok}</b> kr/mnd</> : <b>Gratis</b>}</div>
              <div className="up-plan-perk"><Zap size={13} /> {perk[p.tier] || ''}</div>
              {p.tier === 'gratis'
                ? <button className="up-plan-btn ghost" disabled>Ditt nivå</button>
                : <button className="up-plan-btn" onClick={goPricing}>Velg {p.name}</button>}
            </div>
          ))}
        </div>
        <button className="up-later" onClick={close}>Kanskje senere</button>
      </div>
    </div>
  )
}
