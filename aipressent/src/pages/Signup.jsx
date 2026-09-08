import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useT } from '../i18n'

export default function Signup() {
  const { signUp } = useAuth()
  const t = useT()
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
    if (password.length < 6) { setErr(t('auth.pwTooShort')); return }
    if (password !== confirm) { setErr(t('auth.pwMismatch')); return }
    setBusy(true)
    const { data, error } = await signUp(email, password, name.trim())
    setBusy(false)
    if (error) { setErr(error.message); return }
    // velkomst-e-post (fire-and-forget – blokkerer ikke registreringen)
    try { supabase.functions.invoke('resend-welcome', { body: { email, name: name.trim(), appUrl: window.location.origin } }) } catch (_e) { /* ignore */ }
    if (!data?.session) { setSent(true); return }
    nav('/mine')
  }

  return (
    <div className="auth-wrap">
      {sent ? (
        <div className="auth-card">
          <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
          <h1>{t('auth.checkEmail')}</h1>
          <p>{t('auth.confirmSent', { email })}</p>
          <p className="warn-note">{t('auth.spamNote')}</p>
          <p className="auth-alt">{t('auth.confirmed')} <Link to="/login">{t('auth.login')}</Link></p>
        </div>
      ) : (
      <form className="auth-card" onSubmit={submit}>
        <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
        <h1>{t('auth.signup')}</h1>
        <input placeholder={t('auth.namePh')} value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder={t('auth.emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="pw-row">
          <input type={showPw ? 'text' : 'password'} placeholder={t('auth.passwordPh6')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)} title={showPw ? t('auth.hidePassword') : t('auth.showPassword')} aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="pw-row">
          <input type={showPw ? 'text' : 'password'} placeholder={t('auth.repeatPassword')} value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        </div>
        {confirm.length > 0 && password !== confirm && <p className="muted" style={{ fontSize: '.82rem', color: '#fca5a5' }}>{t('auth.pwNotEqualYet')}</p>}
        <p className="muted" style={{ fontSize: '.82rem' }}>{t('auth.signupSpamHint')}</p>
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? t('auth.creating') : t('auth.signup')}</button>
        <p className="auth-alt">{t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link></p>
      </form>
      )}
    </div>
  )
}
