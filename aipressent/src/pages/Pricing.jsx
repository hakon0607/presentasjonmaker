import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Check, Zap } from 'lucide-react'

export default function Pricing() {
  const { user, plan } = useAuth()
  const nav = useNavigate()
  const [plans, setPlans] = useState([])
  const [interval, setInterval] = useState('month')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    supabase.from('plans').select('*').order('sort').then(({ data }) => setPlans(data || []))
  }, [])

  async function upgrade(tier) {
    setErr('')
    if (!user) { nav('/login', { state: { from: '/priser' } }); return }
    setBusy(tier)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { tier, interval, origin: window.location.origin } })
      if (error) {
        let msg = error.message || 'Ukjent feil'
        try { const body = await error.context.json(); if (body?.error) msg = body.error } catch (_e) { /* ignore */ }
        throw new Error(msg)
      }
      if (data?.error) throw new Error(data.error)
      if (data?.url) window.location.href = data.url
    } catch (e) { setErr(String(e.message || e)); setBusy('') }
  }

  const feats = {
    gratis: ['Lag presentasjoner med AI', 'Alle stiler og maler', 'Eksport til PowerPoint & PDF'],
    pluss: ['Alt i Gratis', 'Mange flere AI-tokens hver dag', 'AI presenterer med stemme', 'Prioritert generering'],
    pro: ['Alt i Pluss', 'Mest AI-tokens hver dag', 'Best for daglig bruk', 'Tidlig tilgang til nyheter'],
  }

  return (
    <div className="pricing-wrap">
      <div className="pricing-head">
        <h1>Velg pakke</h1>
        <p>Betal månedlig eller spar med årlig. Du kan si opp når som helst.</p>
        <div className="pricing-toggle">
          <button className={interval === 'month' ? 'on' : ''} onClick={() => setInterval('month')}>Månedlig</button>
          <button className={interval === 'year' ? 'on' : ''} onClick={() => setInterval('year')}>Årlig <span>spar</span></button>
        </div>
      </div>
      {err && <div className="pricing-err">{err}</div>}
      <div className="pricing-grid">
        {plans.map((p) => {
          const price = interval === 'year' ? p.price_year_nok : p.price_month_nok
          const suffix = interval === 'year' ? 'kr/år' : 'kr/mnd'
          const current = plan === p.tier
          return (
            <div key={p.tier} className={'pricing-card' + (p.tier === 'pluss' ? ' feat' : '')}>
              {p.tier === 'pluss' && <div className="pricing-badge">Mest populær</div>}
              <h2>{p.name}</h2>
              <div className="pricing-price">{price ? <><b>{price}</b> {suffix}</> : <b>Gratis</b>}</div>
              <div className="pricing-tokens"><Zap size={15} /> {p.tokens_daily} tokens/dag</div>
              <ul>{(feats[p.tier] || []).map((f, i) => <li key={i}><Check size={16} /> {f}</li>)}</ul>
              {p.tier === 'gratis'
                ? <button className="pricing-btn ghost" disabled>{current ? 'Ditt nivå' : 'Standard'}</button>
                : <button className="pricing-btn" disabled={current || busy === p.tier} onClick={() => upgrade(p.tier)}>
                    {current ? 'Ditt nivå' : busy === p.tier ? 'Sender deg til betaling…' : 'Velg ' + p.name}
                  </button>}
            </div>
          )
        })}
      </div>
      <p className="pricing-foot">Spørsmål? Kontakt <a href="mailto:hakon.solvik@hotmail.com">hakon.solvik@hotmail.com</a></p>
    </div>
  )
}
