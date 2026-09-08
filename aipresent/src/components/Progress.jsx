import { useState, useRef, useEffect } from 'react'

// Animert "fremdrift" for AI-kall (vi vet ikke ekte prosent, så den teller jevnt opp og hopper til 100 når ferdig)
export function useProgress() {
  const [p, setP] = useState(0)
  const t = useRef(null)
  function stop() { if (t.current) { clearInterval(t.current); t.current = null } }
  function start() {
    setP(0); stop()
    t.current = setInterval(() => setP((x) => (x >= 96 ? x : Math.min(96, x + (x < 55 ? 3.5 : x < 80 ? 1.4 : 0.5)))), 220)
  }
  function done() { stop(); setP(100) }
  function reset() { stop(); setP(0) }
  useEffect(() => () => stop(), [])
  return { p, start, done, reset, set: setP, stop }
}

export function ProgressBar({ p, label }) {
  return (
    <div className="ai-prog-wrap">
      {label && <p className="muted ai-prog-label">{p < 100 ? label : 'Ferdig! 🎉'}</p>}
      <div className="ai-prog">
        <div className="ai-prog-bar"><div className="ai-prog-fill" style={{ width: p + '%' }} /></div>
        <div className="ai-prog-pct">{Math.round(p)}%</div>
      </div>
    </div>
  )
}
