import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n'

export default function Login() {
  const { signIn } = useAuth()
  const t = useT()
  const nav = useNavigate()
  const loc = useLocation()
  const dest = loc.state?.from || '/mine'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) setErr(error.message); else nav(dest, { replace: true })
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
        <h1>{t('auth.login')}</h1>
        <input type="email" placeholder={t('auth.emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="pw-row">
          <input type={showPw ? 'text' : 'password'} placeholder={t('auth.passwordPh')} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)} title={showPw ? t('auth.hidePassword') : t('auth.showPassword')} aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? t('auth.loggingIn') : t('auth.login')}</button>
        <p className="auth-alt">{t('auth.newHere')} <Link to="/signup">{t('auth.createAccount')}</Link></p>
      </form>
    </div>
  )
}
