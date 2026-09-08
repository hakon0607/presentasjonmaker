import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n'
import { Check, Zap } from 'lucide-react'
import BackButton from '../components/BackButton'

export default function Pricing() {
  const { user, plan } = useAuth()
  const t = useT()
  const nav = useNavigate()
  const [plans, setPlans] = useState([])
  const [interval, setInterval] = useState('month')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const isPaid = plan === 'pluss' || plan === 'pro'

  useEffect(() => {
    supabase.from('plans').select('*').order('sort').then(({ data }) => setPlans(data || []))
  }, [])

  async function upgrade(tier) {
    setErr(''); setMsg('')
    if (!user) { nav('/login', { state: { from: '/priser' } }); return }
    setBusy(tier)
    try {
      // Har man allerede et betalt abonnement: BYTT det (trer i kraft ved neste periode) i stedet for ny checkout
      const action = isPaid ? 'change' : undefined
      const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { action, tier, interval, origin: window.location.origin } })
      if (error) { let m = error.message; try { const b = await error.context.json(); if (b?.error) m = b.error } catch (_e) {} throw new Error(m) }
      if (data?.error) throw new Error(data.error)
      if (data?.url) { window.location.href = data.url; return }
      if (data?.scheduled) { setMsg(t('pricing.changeScheduled')); setBusy('') }
      else setBusy('')
    } catch (e) { setErr(String(e.message || e)); setBusy('') }
  }

  const feats = {
    gratis: [t('pricing.featGratis1'), t('pricing.featGratis2'), t('pricing.featGratis3')],
    pluss: [t('pricing.featPluss1'), t('pricing.featPluss2'), t('pricing.featPluss3'), t('pricing.featPluss4')],
    pro: [t('pricing.featPro1'), t('pricing.featPro2'), t('pricing.featPro3'), t('pricing.featPro4')],
  }
  const nameOf = (tier, fallback) => tier === 'gratis' ? t('pricing.free') : fallback

  return (
    <div className="pricing-wrap">
      <BackButton />
      <div className="pricing-head">
        <h1>{t('pricing.title')}</h1>
        <p>{t('pricing.subtitle')}</p>
        <div className="pricing-toggle">
          <button className={interval === 'month' ? 'on' : ''} onClick={() => setInterval('month')}>{t('pricing.monthly')}</button>
          <button className={interval === 'year' ? 'on' : ''} onClick={() => setInterval('year')}>{t('pricing.yearly')} <span>{t('pricing.save')}</span></button>
        </div>
      </div>
      {err && <div className="pricing-err">{err}</div>}
      {msg && <div className="pricing-msg">{msg}</div>}
      <div className="pricing-grid">
        {plans.map((p) => {
          const price = interval === 'year' ? p.price_year_nok : p.price_month_nok
          const suffix = interval === 'year' ? t('pricing.perYear') : t('pricing.perMonth')
          const current = plan === p.tier
          return (
            <div key={p.tier} className={'pricing-card' + (p.tier === 'pluss' ? ' feat' : '')}>
              {p.tier === 'pluss' && <div className="pricing-badge">{t('pricing.mostPopular')}</div>}
              <h2>{nameOf(p.tier, p.name)}</h2>
              <div className="pricing-price">{price ? <><b>{price}</b> {suffix}</> : <b>{t('pricing.free')}</b>}</div>
              <div className="pricing-tokens"><Zap size={15} /> {t('pricing.tokensPerDay', { n: p.tokens_daily })}</div>
              <ul>{(feats[p.tier] || []).map((f, i) => <li key={i}><Check size={16} /> {f}</li>)}</ul>
              {p.tier === 'gratis'
                ? <button className="pricing-btn ghost" disabled>{current ? t('pricing.yourPlan') : t('pricing.standard')}</button>
                : <button className="pricing-btn" disabled={current || busy === p.tier} onClick={() => upgrade(p.tier)}>
                    {current ? t('pricing.yourPlan') : busy === p.tier ? t('pricing.redirecting') : (isPaid ? t('pricing.switchTo', { plan: nameOf(p.tier, p.name) }) : t('pricing.choose', { plan: nameOf(p.tier, p.name) }))}
                  </button>}
            </div>
          )
        })}
      </div>
      <p className="pricing-foot">{t('pricing.questions')} <a href="mailto:hakon.solvik@hotmail.com">hakon.solvik@hotmail.com</a></p>
    </div>
  )
}
