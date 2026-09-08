import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, LogOut, Sparkles, Presentation, Coins } from 'lucide-react'

export default function Profile() {
  const { user, signOut, tokens, tokensUnlimited, tokensCap, tokensFirst, refreshTokens, plan, isAdmin } = useAuth()
  const nav = useNavigate()
  const [count, setCount] = useState(null)
  const [sub, setSub] = useState(null)
  const [subBusy, setSubBusy] = useState(false)
  const [subMsg, setSubMsg] = useState('')
  const name = user?.user_metadata?.display_name || (user?.email || '').split('@')[0] || 'Bruker'
  const initial = name.charAt(0).toUpperCase()
  const planName = tokensUnlimited ? 'Pro' : (plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Gratis')

  async function loadSub() {
    if (!user) return
    const { data } = await supabase.from('profiles').select('plan,sub_status,sub_interval,sub_period_end,stripe_subscription_id').eq('id', user.id).single()
    // cancel_at_period_end vet vi ikke lokalt; utled: hvis status active men vi nettopp sa opp, viser vi "Avsluttes". Hentes egt fra Stripe, men vi holder det enkelt.
    setSub(data)
  }

  async function manage(action) {
    setSubBusy(true); setSubMsg('')
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { action } })
      if (error) { let m = error.message; try { const b = await error.context.json(); if (b?.error) m = b.error } catch (_e) {} throw new Error(m) }
      if (data?.error) throw new Error(data.error)
      setSubMsg(action === 'cancel' ? 'Abonnementet avsluttes ved periodeslutt. Du beholder tilgangen til da.' : 'Abonnementet er gjenopptatt. 🎉')
      setSub((s) => ({ ...s, cancel_at_period_end: action === 'cancel' }))
    } catch (e) { setSubMsg(String(e.message || e)) }
    setSubBusy(false)
  }

  useEffect(() => {
    let on = true
    if (user) {
      supabase.from('presentations').select('id', { count: 'exact', head: true }).eq('owner_id', user.id)
        .then(({ count }) => { if (on) setCount(count ?? 0) })
    }
    refreshTokens()
    loadSub()
    return () => { on = false }
  }, [])

  const max = tokensUnlimited ? 100 : (tokensFirst || 10)
  const cur = tokensUnlimited ? 100 : (tokens ?? 0)


  return (
    <div className="profile-wrap">
      <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/mine')}><ChevronLeft size={18} /> Tilbake</button>

      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{initial}</div>
          <div>
            <h1 style={{ margin: 0 }}>{name}</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)' }}>{user?.email}</p>
          </div>
        </div>
        <div className="profile-stats">
          <div className="profile-stat"><b>{count == null ? '–' : count}</b><span><Presentation size={13} /> Presentasjoner</span></div>
          <div className="profile-stat"><b>{tokensUnlimited ? '∞' : (tokens ?? 0)}</b><span><Coins size={13} /> Tokens igjen</span></div>
          <div className="profile-stat"><b>{tokensUnlimited ? 'Pro' : (plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Gratis')}</b><span><Sparkles size={13} /> Plan</span></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="sub-head">
          <h3 style={{ margin: 0 }}><Sparkles size={18} /> Abonnement</h3>
          <span className={'sub-pill sub-' + (plan || 'gratis')}>{planName}</span>
        </div>
        {sub && (sub.sub_status === 'active' || sub.sub_status === 'trialing') ? (
          <>
            <div className="sub-rows">
              <div><span>Tokens/dag</span><b>{tokensCap}</b></div>
              <div><span>Betaling</span><b>{sub.sub_interval === 'year' ? 'Årlig' : 'Månedlig'}</b></div>
              <div><span>{sub.cancel_at_period_end ? 'Avsluttes' : 'Fornyes'}</span><b>{sub.sub_period_end ? new Date(sub.sub_period_end).toLocaleDateString('no-NO') : '–'}</b></div>
            </div>
            {subMsg && <div className="sub-msg">{subMsg}</div>}
            <div className="sub-actions">
              <button className="btn ghost" onClick={() => nav('/priser')}>Bytt pakke</button>
              {sub.cancel_at_period_end
                ? <button className="btn" disabled={subBusy} onClick={() => manage('resume')}>Gjenoppta</button>
                : <button className="btn danger" disabled={subBusy} onClick={() => manage('cancel')}>{subBusy ? 'Sender…' : 'Si opp'}</button>}
            </div>
          </>
        ) : (
          <>
            <p className="sub-sub">Få flere tokens hver dag.</p>
            <button className="btn primary" onClick={() => nav('/priser')}>Se pakker</button>
          </>
        )}
        {isAdmin && <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => nav('/admin')}>Åpne admin</button>}
      </div>

      <div className="profile-card">
        <h3 style={{ marginTop: 0 }}><Coins size={18} /> Tokens</h3>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          {tokensUnlimited
            ? 'Du har ubegrenset med tokens 🎉 Lag så mange AI-presentasjoner du vil.'
            : `Du har ${tokens ?? 0} tokens igjen. Nye brukere får ${tokensFirst}, og du får ${tokensCap} på toppen hver dag.`}
        </p>
        <div className="token-slider-row">
          <input type="range" min="0" max={max} value={cur} readOnly />
          <span style={{ minWidth: 64, textAlign: 'right', fontWeight: 700 }}>{tokensUnlimited ? '∞' : `${cur}/${max}`}</span>
        </div>
      </div>

      <div className="profile-future">
        ✨ Mer kommer her snart – temaer du har laget, statistikk, og innstillinger.
      </div>

      <button className="btn ghost" onClick={signOut}><LogOut size={18} /> Logg ut</button>
    </div>
  )
}
