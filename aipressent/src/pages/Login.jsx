import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
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
        <div className="logo-row"><span className="logo-mark">◆</span> AiPressent</div>
        <h1>Logg inn</h1>
        <input type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="pw-row">
          <input type={showPw ? 'text' : 'password'} placeholder="Passord" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" className="pw-eye" onClick={() => setShowPw((v) => !v)} title={showPw ? 'Skjul passord' : 'Vis passord'} aria-label={showPw ? 'Skjul passord' : 'Vis passord'}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Logger inn …' : 'Logg inn'}</button>
        <p className="auth-alt">Ny her? <Link to="/signup">Lag konto</Link></p>
      </form>
    </div>
  )
}
