import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Ren token-måler i samme stil som Claude sin bruks-slider.
export default function TokenMeter() {
  const { tokens, tokensUnlimited, tokensFirst } = useAuth()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])

  if (tokensUnlimited) {
    return (
      <div className="token-meter">
        <div className="tm-left"><div className="tm-title">AI-tokens</div><div className="tm-sub">Ubegrenset ♾️</div></div>
        <div className="tm-track"><div className="tm-fill" style={{ width: '100%' }} /></div>
        <div className="tm-val">Ubegrenset</div>
      </div>
    )
  }

  const have = tokens == null ? 0 : tokens
  const max = Math.max(tokensFirst || 10, have, 1)
  const pct = Math.max(have > 0 ? 6 : 0, Math.min(100, Math.round((have / max) * 100)))

  // tid til neste påfyll (server fyller opp ved døgnskifte, UTC)
  const d = new Date()
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0)
  const ms = Math.max(0, next - now)
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  const reset = h > 0 ? `${h} t ${m} min` : `${m} min`

  return (
    <div className="token-meter">
      <div className="tm-left">
        <div className="tm-title">AI-tokens</div>
        <div className="tm-sub">Fylles opp om {reset}</div>
      </div>
      <div className="tm-track"><div className={'tm-fill' + (have <= 1 ? ' low' : '')} style={{ width: pct + '%' }} /></div>
      <div className="tm-val">{tokens == null ? '…' : tokens} igjen</div>
    </div>
  )
}
