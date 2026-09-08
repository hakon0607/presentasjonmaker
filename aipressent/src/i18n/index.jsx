import { createContext, useContext, useEffect, useState } from 'react'
import { dict } from './dict'

const LangCtx = createContext(null)
const FALLBACK = 'no'

function detect() {
  return 'no'   // appen er kun på norsk
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detect())
  const setLang = (l) => {
    if (!dict[l]) return
    setLangState(l)
    try { localStorage.setItem('aip_lang', l) } catch (_e) {}
    try { document.documentElement.lang = l } catch (_e) {}
  }
  useEffect(() => { try { document.documentElement.lang = lang } catch (_e) {} }, [lang])

  const t = (key, vars) => {
    const walk = (root) => { let n = root; for (const p of String(key).split('.')) n = n?.[p]; return n }
    let out = walk(dict[lang])
    if (out == null) out = walk(dict[FALLBACK])
    if (out == null) return key
    if (vars) for (const k in vars) out = String(out).replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k])
    return out
  }

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }
export function useT() { return useContext(LangCtx).t }
