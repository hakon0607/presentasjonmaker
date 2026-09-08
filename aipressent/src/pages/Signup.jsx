import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

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
  const [step, setStep] = useState('form')   // 'form' | 'code'
  const [code, setCode] = useState('')
  const [resent, setResent] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (password.length < 6) { setErr('Passordet må være minst 6 tegn.'); return }
    if (password !== confirm) { setErr('Passordene er ikke like – prøv igjen.'); return }
    setBusy(true)
    const { data, error } = await signUp(email, password, name.trim())
    setBusy(false)
    if (error) { setErr(error.message); return }
    if (data?.session) { welcomeAndGo() }   // bekreftelse av
    else setStep('code')                     // bekreftelse på -> vis kodefelt
  }

  function welcomeAndGo() {
    try { supabase.functions.invoke('resend-welcome', { body: { email, name: name.trim(), appUrl: window.location.origin } }) } catch (_e) { /* ignore */ }
    nav('/mine')
  }

  async function verify(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
    setBusy(false)
    if (error) { setErr('Feil eller utløpt kode. Sjekk e-posten og prøv igjen.'); return }
    if (data?.session) welcomeAndGo()
  }

  async function resend() {
    setErr(''); setResent(false)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) setErr(error.message); else setResent(true)
  }

  return (
    <div className="auth-wrap">
      {step === 'code' ? (
        <form className="auth-card" onSubmit={verify}>
          <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
          <h1>Skriv inn koden 📧</h1>
          <p className="muted" style={{ fontSize: '.9rem', margin: 0 }}>Vi sendte en kode til <b>{email}</b>. Skriv den inn for å fullføre. Sjekk gjerne <b>spam-mappen</b>.</p>
          <input className="code-input" inputMode="numeric" autoComplete="one-time-code" placeholder="Kode fra e-post" value={code} onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))} required />
          {err && <p className="err">{err}</p>}
          <button className="btn primary" disabled={busy || !code}>{busy ? 'Sjekker …' : 'Fullfør registrering'}</button>
          <p className="auth-alt">
            Fikk du ingen kode? <button type="button" className="linklike" onClick={resend}>Send på nytt</button>
            {resent && <span style={{ color: '#1faf6b' }}> · sendt!</span>}
          </p>
        </form>
      ) : (
        <form className="auth-card" onSubmit={submit}>
          <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
          <h1>Lag konto</h1>
          <input placeholder="Navn" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="pw-row">
            <input type={showPw ? 'text' : 'password'} placeholder="Passord (min. 6 tegn)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Skjul passord' : 'Vis passord'}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <div className="pw-row">
            <input type={showPw ? 'text' : 'password'} placeholder="Gjenta passord" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
          </div>
          {confirm.length > 0 && password !== confirm && <p className="muted" style={{ fontSize: '.82rem', color: '#fca5a5' }}>Passordene er ikke like ennå.</p>}
          <p className="muted" style={{ fontSize: '.82rem' }}>📧 Du får en <b>kode</b> på e-post for å bekrefte – husk å sjekke spam-mappen.</p>
          {err && <p className="err">{err}</p>}
          <button className="btn primary" disabled={busy}>{busy ? 'Lager konto …' : 'Lag konto'}</button>
          <p className="auth-alt">Har du konto? <Link to="/login">Logg inn</Link></p>
        </form>
      )}
    </div>
  )
}
