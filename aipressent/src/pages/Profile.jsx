import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import InstallButton from '../components/InstallButton'
import { ChevronLeft, LogOut, Sparkles, Presentation, Coins, HelpCircle } from 'lucide-react'

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
    // hent så mye som mulig; tåler at en kolonne ikke finnes
    let data = null
    let res = await supabase.from('profiles').select('plan,sub_status,sub_interval,sub_period_end,sub_cancel_at_period_end,stripe_subscription_id').eq('id', user.id).maybeSingle()
    if (res.error) {
      res = await supabase.from('profiles').select('plan,sub_status,sub_interval,sub_period_end,stripe_subscription_id').eq('id', user.id).maybeSingle()
    }
    data = res.data
    if (data) setSub({ ...data, cancel_at_period_end: !!data.sub_cancel_at_period_end })
    else setSub({ plan, sub_status: (plan && plan !== 'gratis') ? 'active' : null })
  }

  async function manage(action) {
    setSubBusy(true); setSubMsg('')
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { action } })
      if (error) { let m = error.message; try { const b = await error.context.json(); if (b?.error) m = b.error } catch (_e) {} throw new Error(m) }
      if (data?.error) throw new Error(data.error)
      setSubMsg(action === 'cancel' ? 'Abonnementet avsluttes ved periodeslutt. Du beholder tilgangen til da.' : 'Abonnementet er gjenopptatt. 🎉')
      setSub((s) => ({ ...s, cancel_at_period_end: action === 'cancel' }))
    } catch (e) {
      const msg = String(e.message || e)
      // hvis det alt er sagt opp, vis rolig beskjed i stedet for Stripe-feil
      if (/canceled subscription can only|already canceled|no such subscription/i.test(msg)) {
        setSubMsg('Abonnementet er allerede sagt opp – det avsluttes ved periodeslutt.')
        setSub((s) => ({ ...s, cancel_at_period_end: true }))
      } else setSubMsg(msg)
    }
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

  const dailyMax = Math.max(1, tokensCap || 10)
  const remaining = Math.max(0, Math.min(tokens ?? 0, dailyMax))
  const usedPct = tokensUnlimited ? 0 : Math.round((1 - remaining / dailyMax) * 100)


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
              <div><span>{sub.cancel_at_period_end ? 'Avsluttes' : 'Neste betaling'}</span><b>{sub.sub_period_end ? new Date(sub.sub_period_end).toLocaleDateString('no-NO') : '–'}</b></div>
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
        <div className="tok-head">
          <h3 style={{ margin: 0 }}><Coins size={18} /> Tokens</h3>
          <span className="tok-pct">{tokensUnlimited ? '∞' : `${usedPct}% brukt`}</span>
        </div>
        <div className="tok-bar"><i style={{ width: (tokensUnlimited ? 0 : usedPct) + '%' }} /></div>
        {!tokensUnlimited && <div className="tok-note">Fylles opp igjen i morgen</div>}
      </div>

      <div className="profile-future">
        ✨ Mer kommer her snart – temaer du har laget, statistikk, og innstillinger.
      </div>

      <div className="profile-card">
        <h3 style={{ marginTop: 0 }}><HelpCircle size={18} /> Mer</h3>
        <div className="profile-more">
          <InstallButton className="btn ghost" />
          <button className="btn ghost" onClick={() => nav('/guide')}><HelpCircle size={16} /> Se hvordan det funker</button>
        </div>
      </div>

      <button className="btn ghost" onClick={signOut}><LogOut size={18} /> Logg ut</button>
    </div>
  )
}
