import { useEffect, useState } from 'react'
import { Zap, X } from 'lucide-react'
import { onNoTokens } from '../lib/tokenGate'
import { useAuth } from '../context/AuthContext'

// Millisekunder til neste påfyll (UTC-midnatt – samme grense som serveren bruker).
function nextRefillMs() {
  const now = new Date()
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  return Math.max(0, next - now.getTime())
}

export default function NoTokensModal() {
  const { tokensCap, tokensUnlimited } = useAuth()
  const [info, setInfo] = useState(null)   // {needed, have} eller null
  const [, setTick] = useState(0)

  useEffect(() => onNoTokens((i) => setInfo(i || {})), [])
  useEffect(() => {
    if (!info) return
    const t = setInterval(() => setTick((x) => x + 1), 30000)
    const esc = (e) => { if (e.key === 'Escape') setInfo(null) }
    window.addEventListener('keydown', esc)
    return () => { clearInterval(t); window.removeEventListener('keydown', esc) }
  }, [info])

  if (!info || tokensUnlimited) return null

  const msLeft = nextRefillMs()
  const progress = Math.max(0, Math.min(1, 1 - msLeft / 86400000))
  const hrs = Math.floor(msLeft / 3600000)
  const mins = Math.floor((msLeft % 3600000) / 60000)
  const cap = tokensCap || 3
  const close = () => setInfo(null)

  return (
    <div className="nt-overlay" onClick={close}>
      <div className="nt-card" onClick={(e) => e.stopPropagation()}>
        <button className="nt-x" onClick={close} aria-label="Lukk"><X size={18} /></button>
        <div className="nt-icon"><Zap size={26} /></div>
        <h2 className="nt-title">Tom for tokens</h2>
        <p className="nt-sub">
          {typeof info.needed === 'number'
            ? <>Denne handlingen koster <b>{info.needed}</b> tokens{typeof info.have === 'number' ? <>, og du har <b>{info.have}</b> igjen.</> : '.'}</>
            : <>Du har ikke nok tokens til denne handlingen akkurat nå.</>}
          {' '}AI-bilder og det å lage tomme presentasjoner er alltid gratis.
        </p>

        <div className="nt-refill">
          <div className="nt-refill-top">
            <span>Neste påfyll</span>
            <span className="nt-refill-time">om {hrs}t {mins}m</span>
          </div>
          <div className="nt-bar"><div className="nt-bar-fill" style={{ width: (progress * 100).toFixed(1) + '%' }} /></div>
          <div className="nt-refill-foot">Du får automatisk <b>{cap}</b> tokens ved midnatt.</div>
        </div>

        <button className="btn primary nt-ok" onClick={close}>Skjønner</button>
      </div>
    </div>
  )
}
