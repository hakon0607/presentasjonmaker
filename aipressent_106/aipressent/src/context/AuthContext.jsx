import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState(() => { try { const v = localStorage.getItem('ap_tok'); return v == null || v === '' ? null : Number(v) } catch (_e) { return null } })          // tall, eller null = ubegrenset/ukjent
  const [tokensUnlimited, setTokensUnlimited] = useState(() => { try { return localStorage.getItem('ap_unlim') === '1' } catch (_e) { return false } })
  const [tokensCap, setTokensCap] = useState(3)
  const [tokensFirst, setTokensFirst] = useState(10)
  const [plan, setPlan] = useState('gratis')
  const [isAdmin, setIsAdmin] = useState(false)

  async function refreshTokens(u) {
    const usr = u ?? user
    if (!usr) { setTokens(null); setTokensUnlimited(false); return }
    try {
      const { data } = await supabase.functions.invoke('smart-task', { body: { mode: 'tokens' } })
      if (data && !data.error) {
        setTokensUnlimited(!!data.unlimited)
        setTokens(data.unlimited ? null : (data.tokens ?? 0))
        if (data.cap) setTokensCap(data.cap)
        if (data.first) setTokensFirst(data.first)
        setPlan(data.plan || 'gratis')
        setIsAdmin(!!data.admin)
        try {
          localStorage.setItem('ap_unlim', data.unlimited ? '1' : '0')
          localStorage.setItem('ap_tok', data.unlimited ? '' : String(data.tokens ?? 0))
        } catch (_e) { /* ignore */ }
      }
    } catch (_e) { /* ikke blokker appen */ }
  }

  useEffect(() => {
    let cleaned = false
    const maybeClean = (u) => {
      if (u && !cleaned) { cleaned = true; import('../lib/storage').then((m) => m.cleanupOrphanImages(u.id)).catch(() => {}) }
    }
    supabase.auth.getSession().then(({ data }) => { const u = data.session?.user ?? null; setUser(u); refreshTokens(u); maybeClean(u); setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { const u = session?.user ?? null; setUser(u); refreshTokens(u); maybeClean(u) })
    // hold data ferskt: oppdater når fanen får fokus igjen eller blir synlig
    const onFocus = () => { supabase.auth.getSession().then(({ data }) => { if (data.session?.user) refreshTokens(data.session.user) }) }
    const onVis = () => { if (document.visibilityState === 'visible') onFocus() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)
    const cleanup = () => { window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVis) }
    return () => { sub.subscription.unsubscribe(); cleanup() }
  }, [])

  const signUp = (email, password, name) => supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()
  return <AuthContext.Provider value={{ user, loading, aiEnabled: !!user, tokens, tokensUnlimited, tokensCap, tokensFirst, plan, isAdmin, refreshTokens, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
