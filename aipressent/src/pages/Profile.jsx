import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { cleanupOrphanImages } from '../lib/storage'
import { ChevronLeft, LogOut, Sparkles, Presentation, Coins, Plus, Trash2, HardDrive } from 'lucide-react'

export default function Profile() {
  const { user, signOut, tokens, tokensUnlimited, tokensCap, tokensFirst, refreshTokens } = useAuth()
  const nav = useNavigate()
  const [count, setCount] = useState(null)
  const [cleaning, setCleaning] = useState(false)
  const [cleanMsg, setCleanMsg] = useState('')
  const name = user?.user_metadata?.display_name || (user?.email || '').split('@')[0] || 'Bruker'
  const initial = name.charAt(0).toUpperCase()

  useEffect(() => {
    let on = true
    if (user) {
      supabase.from('presentations').select('id', { count: 'exact', head: true }).eq('owner_id', user.id)
        .then(({ count }) => { if (on) setCount(count ?? 0) })
    }
    refreshTokens()
    return () => { on = false }
  }, [])

  const max = tokensUnlimited ? 100 : (tokensFirst || 10)
  const cur = tokensUnlimited ? 100 : (tokens ?? 0)

  async function runCleanup() {
    if (!user || cleaning) return
    setCleaning(true); setCleanMsg('')
    const { removed } = await cleanupOrphanImages(user.id)
    setCleanMsg(removed > 0 ? `Fjernet ${removed} ubrukte ${removed === 1 ? 'bilde' : 'bilder'} fra lagringen.` : 'Ingen ubrukte bilder å fjerne – alt er ryddig. 👍')
    setCleaning(false)
  }

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
          <div className="profile-stat"><b>{tokensUnlimited ? 'Pro' : 'Gratis'}</b><span><Sparkles size={13} /> Plan</span></div>
        </div>
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

      <div className="profile-card">
        <h3 style={{ marginTop: 0 }}><HardDrive size={18} /> Lagring</h3>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          AI-bilder lagres trygt i skyen. Bilder fra slettede presentasjoner ryddes automatisk, men du kan også rydde med én gang her – det fjerner alle bilder som ikke lenger er i bruk i noen presentasjon.
        </p>
        <button className="btn ghost" onClick={runCleanup} disabled={cleaning}>
          <Trash2 size={16} /> {cleaning ? 'Rydder …' : 'Rydd opp i lagring nå'}
        </button>
        {cleanMsg && <p style={{ marginTop: 10, marginBottom: 0, fontWeight: 600 }}>{cleanMsg}</p>}
      </div>

      <div className="profile-future">
        ✨ Mer kommer her snart – temaer du har laget, statistikk, og innstillinger.
      </div>

      <button className="btn ghost" onClick={signOut}><LogOut size={18} /> Logg ut</button>
    </div>
  )
}
