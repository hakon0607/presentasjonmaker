import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BackButton from '../components/BackButton'

export default function Admin() {
  const { user, isAdmin, loading } = useAuth()
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [plans, setPlans] = useState([])
  const [msg, setMsg] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  async function call(body) {
    const { data, error } = await supabase.functions.invoke('admin-api', { body })
    if (error) { let m = error.message; try { const b = await error.context.json(); if (b?.error) m = b.error } catch (_e) {} throw new Error(m) }
    if (data?.error) throw new Error(data.error)
    return data
  }

  async function load() {
    setLoadingData(true); setMsg('')
    try {
      const s = await call({ action: 'stats' })
      const l = await call({ action: 'list' })
      setStats(s); setCustomers(l.customers || [])
      const { data: pl } = await supabase.from('plans').select('*').order('sort')
      setPlans(pl || [])
    } catch (e) { setMsg(String(e.message || e)) }
    setLoadingData(false)
  }
  useEffect(() => { if (isAdmin) load() }, [isAdmin])

  async function savePlan(tier, fields) {
    setMsg('')
    try { await call({ action: 'update_plan', tier, fields }); setMsg('Pakke oppdatert ✓') } catch (e) { setMsg(String(e.message || e)) }
  }
  async function setUser(uid, fields) {
    setMsg('')
    try { await call({ action: 'set_user', uid, fields }); setMsg('Bruker oppdatert ✓'); load() } catch (e) { setMsg(String(e.message || e)) }
  }
  async function cancel(uid, immediate) {
    if (!confirm(immediate ? 'Avbestille umiddelbart (mister tilgang nå)?' : 'Avbestille ved periodeslutt?')) return
    setMsg('')
    try { await call({ action: 'cancel', uid, immediate }); setMsg('Avbestilling registrert ✓'); load() } catch (e) { setMsg(String(e.message || e)) }
  }

  if (loading) return <div className="admin-wrap">Laster…</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <div className="admin-wrap"><BackButton to="/mine" /><h1>Ingen tilgang</h1><p>Denne siden er kun for administratorer.</p></div>

  return (
    <div className="admin-wrap">
      <BackButton to="/mine" />
      <h1>Admin</h1>
      {msg && <div className="admin-msg">{msg}</div>}

      <div className="admin-stats">
        <div className="admin-stat"><span>Aktive abonnenter</span><b>{stats ? stats.activeCount : '…'}</b></div>
        <div className="admin-stat"><span>Anslått inntekt / mnd</span><b>{stats ? stats.mrr + ' kr' : '…'}</b></div>
        <div className="admin-stat"><span>Registrerte brukere</span><b>{stats ? stats.totalUsers : '…'}</b></div>
      </div>

      <h2>Pakker</h2>
      <p className="admin-sub">Endre tokens/dag og priser. Lagres direkte i databasen. (Selve Stripe-prisen endres i Stripe.)</p>
      <div className="admin-plans">
        {plans.map((p) => <PlanEditor key={p.tier} plan={p} onSave={savePlan} />)}
      </div>

      <h2>Kunder</h2>
      {loadingData ? <p>Laster…</p> : (
        <div className="admin-table">
          <div className="admin-row admin-th"><span>E-post</span><span>Nivå</span><span>Tokens</span><span>Status</span><span>Handling</span></div>
          {customers.map((c) => (
            <div className="admin-row" key={c.id}>
              <span title={c.id}>{c.email || '—'}</span>
              <span>
                <select defaultValue={c.plan || 'gratis'} onChange={(e) => setUser(c.id, { plan: e.target.value })}>
                  <option value="gratis">gratis</option><option value="pluss">pluss</option><option value="pro">pro</option>
                </select>
              </span>
              <span>{c.tokens_daily}</span>
              <span>{c.sub_status || '—'}</span>
              <span className="admin-actions">
                {c.stripe_subscription_id && <button className="admin-mini danger" onClick={() => cancel(c.id, true)}>Avbestill nå</button>}
                <button className="admin-mini" onClick={() => setUser(c.id, { is_admin: true })}>Gjør admin</button>
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="admin-foot">Alt lagres direkte. Stripe-priser (selve beløpet som trekkes) endres i Stripe; feltene her er visningsprisene + token-kvoter.</p>
    </div>
  )
}

function PlanEditor({ plan, onSave }) {
  const [tokens, setTokens] = useState(plan.tokens_daily)
  const [pm, setPm] = useState(plan.price_month_nok || 0)
  const [py, setPy] = useState(plan.price_year_nok || 0)
  return (
    <div className="admin-plan">
      <div className="admin-plan-name">{plan.name}</div>
      <label>Tokens/dag <input type="number" value={tokens} onChange={(e) => setTokens(+e.target.value)} /></label>
      <label>Pris/mnd (kr) <input type="number" value={pm} onChange={(e) => setPm(+e.target.value)} /></label>
      <label>Pris/år (kr) <input type="number" value={py} onChange={(e) => setPy(+e.target.value)} /></label>
      <button className="admin-mini" onClick={() => onSave(plan.tier, { tokens_daily: tokens, price_month_nok: pm, price_year_nok: py })}>Lagre</button>
    </div>
  )
}
