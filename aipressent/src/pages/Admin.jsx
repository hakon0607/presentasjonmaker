import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { user, isAdmin, loading } = useAuth()
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [msg, setMsg] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  async function load() {
    setLoadingData(true)
    try {
      const s = await supabase.functions.invoke('admin-api', { body: { action: 'stats' } })
      const l = await supabase.functions.invoke('admin-api', { body: { action: 'list' } })
      if (s.data && !s.data.error) setStats(s.data)
      if (l.data && !l.data.error) setCustomers(l.data.customers || [])
      if (s.data?.error) setMsg(s.data.error)
    } catch (e) { setMsg(String(e.message || e)) }
    setLoadingData(false)
  }
  useEffect(() => { if (isAdmin) load() }, [isAdmin])

  async function cancel(uid, immediate) {
    if (!confirm(immediate ? 'Avbestille umiddelbart (mister tilgang nå)?' : 'Avbestille ved periodeslutt?')) return
    setMsg('')
    const { data } = await supabase.functions.invoke('admin-api', { body: { action: 'cancel', uid, immediate } })
    if (data?.error) setMsg(data.error); else { setMsg('Avbestilling registrert.'); load() }
  }

  if (loading) return <div className="admin-wrap">Laster…</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <div className="admin-wrap"><h1>Ingen tilgang</h1><p>Denne siden er kun for administratorer.</p></div>

  return (
    <div className="admin-wrap">
      <h1>Admin</h1>
      {msg && <div className="admin-msg">{msg}</div>}
      <div className="admin-stats">
        <div className="admin-stat"><span>Aktive abonnenter</span><b>{stats ? stats.activeCount : '…'}</b></div>
        <div className="admin-stat"><span>Anslått inntekt / mnd</span><b>{stats ? stats.mrr + ' kr' : '…'}</b></div>
        <div className="admin-stat"><span>Registrerte brukere</span><b>{stats ? stats.totalUsers : '…'}</b></div>
      </div>
      {stats?.byPlan && (
        <div className="admin-byplan">
          {Object.entries(stats.byPlan).map(([k, v]) => <span key={k}>{k}: <b>{v}</b></span>)}
        </div>
      )}

      <h2>Kunder</h2>
      {loadingData ? <p>Laster kundeliste…</p> : (
        <div className="admin-table">
          <div className="admin-row admin-th"><span>E-post</span><span>Nivå</span><span>Status</span><span>Fornyes</span><span>Handling</span></div>
          {customers.map((c) => (
            <div className="admin-row" key={c.id}>
              <span title={c.id}>{c.email || '—'}</span>
              <span>{c.plan}</span>
              <span>{c.sub_status || '—'}</span>
              <span>{c.sub_period_end ? new Date(c.sub_period_end).toLocaleDateString('no-NO') : '—'}</span>
              <span>
                {c.stripe_subscription_id
                  ? <><button className="admin-mini" onClick={() => cancel(c.id, false)}>Si opp v/periodeslutt</button>
                       <button className="admin-mini danger" onClick={() => cancel(c.id, true)}>Avbestill nå</button></>
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="admin-foot">Priser justeres i Stripe. Token-kvoter per nivå justeres i Supabase-tabellen <code>plans</code>. Sett admin med <code>is_admin = true</code> på en bruker i <code>profiles</code>.</p>
    </div>
  )
}
