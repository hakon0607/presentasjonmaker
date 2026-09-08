import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const LEN = 8

function OtpBoxes({ otp, setOtp, onComplete }) {
  const refs = useRef([])
  const set = (i, d) => {
    const arr = [...otp]; arr[i] = d; setOtp(arr)
    if (d && i < LEN - 1) refs.current[i + 1]?.focus()
    if (arr.every((x) => x !== '')) onComplete?.(arr.join(''))
  }
  return (
    <div className="otp-row">
      {Array.from({ length: LEN }).map((_, i) => (
        <input
          key={i} ref={(el) => (refs.current[i] = el)} className="otp-box"
          inputMode="numeric" maxLength={1} value={otp[i] || ''}
          onChange={(e) => set(i, e.target.value.replace(/\D/g, '').slice(-1) || '')}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus() }}
          onPaste={(e) => {
            const p = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, LEN)
            if (p) { e.preventDefault(); const arr = Array.from({ length: LEN }, (_, k) => p[k] || ''); setOtp(arr); refs.current[Math.min(p.length, LEN - 1)]?.focus(); if (p.length === LEN) onComplete?.(p) }
          }}
        />
      ))}
    </div>
  )
}

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
  const [step, setStep] = useState('form')   // 'form' | 'code' | 'offer'
  const [otp, setOtp] = useState(Array(LEN).fill(''))
  const [resent, setResent] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (password.length < 6) { setErr('Passordet må være minst 6 tegn.'); return }
    if (password !== confirm) { setErr('Passordene er ikke like – prøv igjen.'); return }
    setBusy(true)
    const { data, error } = await signUp(email, password, name.trim())
    setBusy(false)
    if (error) { setErr(error.message); return }
    if (data?.session) { sendWelcome(); setStep('offer') }
    else setStep('code')
  }

  function sendWelcome() {
    try { supabase.functions.invoke('resend-welcome', { body: { email, name: name.trim(), appUrl: window.location.origin } }) } catch (_e) { /* ignore */ }
  }

  async function verify(codeStr) {
    const token = (codeStr || otp.join('')).trim()
    if (token.length < LEN) return
    setErr(''); setBusy(true)
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    setBusy(false)
    if (error) { setErr('Feil eller utløpt kode. Prøv igjen.'); setOtp(Array(LEN).fill('')); return }
    if (data?.session) { sendWelcome(); setStep('offer') }
  }

  async function resend() {
    setErr(''); setResent(false)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) setErr(error.message); else setResent(true)
  }

  // ---- STEG: tilbud etter registrering ----
  if (step === 'offer') {
    return (
      <div className="auth-wrap">
        <div className="auth-card offer-card">
          <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
          <h1>Kontoen er klar! 🎉</h1>
          <p className="muted" style={{ margin: '0 0 6px' }}>Vil du låse opp mer med en gang?</p>
          <div className="offer-plans">
            <div className="offer-plan">
              <div className="offer-name">Pluss</div>
              <div className="offer-price"><b>39</b> kr/mnd</div>
              <ul><li><Check size={14} /> 15 presentasjoner</li><li><Check size={14} /> Uendelig sider</li><li><Check size={14} /> Ingen vannmerke</li><li><Check size={14} /> AI-opplesning</li></ul>
            </div>
            <div className="offer-plan feat">
              <div className="offer-name">Pro</div>
              <div className="offer-price"><b>79</b> kr/mnd</div>
              <ul><li><Check size={14} /> Uendelig alt</li><li><Check size={14} /> Flest tokens</li><li><Check size={14} /> Ingen vannmerke</li><li><Check size={14} /> AI-opplesning</li></ul>
            </div>
          </div>
          <button className="btn primary" onClick={() => nav('/priser')}>Se pakker og kjøp</button>
          <button className="skip-link" onClick={() => nav('/mine')}>Hopp over for nå →</button>
        </div>
      </div>
    )
  }

  // ---- STEG: kode ----
  if (step === 'code') {
    return (
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={(e) => { e.preventDefault(); verify() }}>
          <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
          <h1>Skriv inn koden 📧</h1>
          <p className="muted" style={{ fontSize: '.9rem', margin: 0 }}>Vi sendte en 6-sifret kode til <b>{email}</b>. Sjekk gjerne <b>spam-mappen</b>.</p>
          <OtpBoxes otp={otp} setOtp={setOtp} onComplete={(c) => verify(c)} />
          {err && <p className="err">{err}</p>}
          <button className="btn primary" disabled={busy || otp.some((x) => !x)}>{busy ? 'Sjekker …' : 'Fullfør registrering'}</button>
          <p className="auth-alt">
            Fikk du ingen kode? <button type="button" className="linklike" onClick={resend}>Send på nytt</button>
            {resent && <span style={{ color: '#1faf6b' }}> · sendt!</span>}
          </p>
        </form>
      </div>
    )
  }

  // ---- STEG: skjema ----
  return (
    <div className="auth-wrap">
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
    </div>
  )
}
