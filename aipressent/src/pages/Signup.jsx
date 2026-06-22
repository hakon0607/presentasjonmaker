import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (password.length < 6) { setErr('Passordet må være minst 6 tegn.'); return }
    if (password !== confirm) { setErr('Passordene er ikke like – prøv igjen.'); return }
    setBusy(true)
    const { data, error } = await signUp(email, password, name.trim())
    setBusy(false)
    if (error) { setErr(error.message); return }
    // Hvis e-postbekreftelse kreves, finnes det ingen aktiv økt ennå
    if (!data?.session) { setSent(true); return }
    nav('/mine')
  }

  return (
    <div className="auth-wrap">
      {sent ? (
        <div className="auth-card">
          <div className="logo-row"><span className="logo-mark">◆</span> AiPresent</div>
          <h1>Sjekk e-posten din 📧</h1>
          <p>Vi har sendt en bekreftelses-e-post til <b>{email}</b>. Klikk lenken i e-posten for å fullføre.</p>
          <p className="warn-note">⚠️ Viktig: e-posten havner ofte i <b>søppelpost / spam-mappen</b> – sjekk der hvis du ikke ser den i innboksen!</p>
          <p className="auth-alt">Bekreftet? <Link to="/login">Logg inn</Link></p>
        </div>
      ) : (
      <form className="auth-card" onSubmit={submit}>
        <div className="logo-row"><span className="logo-mark">◆</span> AiPresent</div>
        <h1>Lag konto</h1>
        <input placeholder="Navn" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="pw-row">
          <input type={showPw ? 'text' : 'password'} placeholder="Passord (min. 6 tegn)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)} title={showPw ? 'Skjul passord' : 'Vis passord'} aria-label={showPw ? 'Skjul passord' : 'Vis passord'}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="pw-row">
          <input type={showPw ? 'text' : 'password'} placeholder="Gjenta passord" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        </div>
        {confirm.length > 0 && password !== confirm && <p className="muted" style={{ fontSize: '.82rem', color: '#fca5a5' }}>Passordene er ikke like ennå.</p>}
        <p className="muted" style={{ fontSize: '.82rem' }}>📧 Etter registrering får du en bekreftelses-e-post – husk å sjekke <b>spam-mappen</b>.</p>
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Lager konto …' : 'Lag konto'}</button>
        <p className="auth-alt">Har du konto? <Link to="/login">Logg inn</Link></p>
      </form>
      )}
    </div>
  )
}
