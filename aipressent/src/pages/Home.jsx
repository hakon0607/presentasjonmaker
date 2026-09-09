import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { newDeck, THEMES } from '../lib/deck'
import { exportPptx } from '../lib/export'
import AiWizard from '../components/AiWizard'
import { canCreatePresentation } from '../lib/limits'
import { fireNoTokens } from '../lib/tokenGate'
import SlideStage from '../components/SlideStage'
import Tour from '../components/Tour'
import InstallButton from '../components/InstallButton'
import TokenBadge from '../components/TokenBadge'
import TokenMeter from '../components/TokenMeter'
import { cleanupOrphanImages } from '../lib/storage'
import { Plus, Sparkles, Trash2, LogOut, Presentation, Download, HelpCircle, User, Play, Search } from 'lucide-react'

export default function Home() {
  const { user, signOut, aiEnabled, tokens, tokensUnlimited, tokensCap, plan } = useAuth()
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiOpen, setAiOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => { try { return localStorage.getItem('ap_welcome_hidden') !== '1' } catch (_e) { return true } })
  function hideWelcome() { try { localStorage.setItem('ap_welcome_hidden', '1') } catch (_e) { /* ignore */ } setShowWelcome(false) }
  const [sp, setSp] = useSearchParams()
  useEffect(() => {
    if (sp.get('tour') === '1') { setTourOpen(true); sp.delete('tour'); setSp(sp, { replace: true }) }
  }, [])

  async function downloadProj(id, e) {
    e.stopPropagation()
    const { data } = await supabase.from('presentations').select('data').eq('id', id).single()
    if (data?.data) { try { await exportPptx(data.data) } catch (_e) { /* nedlasting startet uansett */ } }
  }

  async function openEditorTour() {
    setTourOpen(false)
    if (items.length) { nav('/p/' + items[0].id + '?tour=1'); return }
    const deck = newDeck('Uten tittel', 'minimal')
    const { data, error } = await supabase.from('presentations')
      .insert({ owner_id: user.id, title: deck.title, theme: deck.theme?.name || 'Minimal', data: deck }).select('id').single()
    if (!error && data) nav('/p/' + data.id + '?tour=1')
  }

  const load = useCallback(async () => {
    setLoading(true)
    if (!user) { setItems([]); setLoading(false); return }
    const { data } = await supabase.from('presentations').select('id, title, updated_at, cover:data->slides->0, t:data->theme').eq('owner_id', user.id).order('updated_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [user])
  useEffect(() => { load() }, [load])
  // Rydd foreldreløse bilder fra storage maks én gang per døgn (i bakgrunnen).
  useEffect(() => {
    if (!user) return
    try {
      const k = 'ap_lastSweep_' + user.id
      const last = +(localStorage.getItem(k) || 0)
      if (Date.now() - last > 86400000) { localStorage.setItem(k, String(Date.now())); cleanupOrphanImages(user.id) }
    } catch (_e) { /* ignore */ }
  }, [user])

  async function openAi() {
    if (!tokensUnlimited && typeof tokens === 'number' && tokens < 5) { fireNoTokens({ needed: 5, have: tokens }); return }
    if (!(await canCreatePresentation(user.id, plan, tokensUnlimited))) return
    setAiOpen(true)
  }

  async function createBlank() {
    if (!(await canCreatePresentation(user.id, plan, tokensUnlimited))) return
    const deck = newDeck('Uten tittel', 'minimal')
    const { data, error } = await supabase.from('presentations')
      .insert({ owner_id: user.id, title: deck.title, theme: deck.theme?.name || 'Minimal', data: deck }).select('id').single()
    if (!error && data) nav('/p/' + data.id)
  }

  async function remove(id, e) {
    e.stopPropagation()
    if (!confirm('Slette denne presentasjonen?')) return
    await supabase.from('presentations').delete().eq('id', id)
    cleanupOrphanImages(user.id)   // fjern bildene til den slettede (og andre foreldreløse) fra storage
    load()
  }

  return (
    <div className="home">
      <header className="home-top">
        <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
        <div className="home-top-right">
          <TokenBadge />
          {plan === 'pluss' || plan === 'pro' || tokensUnlimited
            ? <button className="chip plan-chip" onClick={() => nav('/profil')}><Sparkles size={15} /> {tokensUnlimited ? 'Pro' : plan.charAt(0).toUpperCase() + plan.slice(1)}</button>
            : <button className="chip upgrade-chip" onClick={() => nav('/priser')}><Sparkles size={15} /> Oppgrader</button>}
          <button className="chip" onClick={() => nav('/profil')}><User size={16} /> Profil</button>
          <button className="chip" onClick={signOut}><LogOut size={16} /> Logg ut</button>
        </div>
      </header>

      <div className="home-body">
        {showWelcome && (
          <div className="welcome-banner">
            <button className="welcome-x" onClick={hideWelcome} title="Skjul">✕</button>
            <div className="welcome-ic">👋</div>
            <div className="welcome-text">
              <b>Velkommen til AiPresent!</b>
              <span>Ny her? Se den korte guiden eller få en omvisning som peker på hver knapp i appen.</span>
            </div>
            <div className="welcome-btns">
              <button className="btn primary" onClick={() => nav('/guide')}><HelpCircle size={17} /> Se guiden</button>
              <button className="btn ghost" onClick={() => setTourOpen(true)}><Play size={17} /> Omvisning</button>
            </div>
          </div>
        )}
        <div className="home-head">
          <h1>Dine presentasjoner</h1>
          <div className="home-actions">
            <button className="btn ghost" data-tour="new" onClick={createBlank}><Plus size={18} /> Ny presentasjon</button>
            {aiEnabled && <button className="btn primary" data-tour="ai" onClick={openAi}><Sparkles size={18} /> Lag med AI</button>}
          </div>
        </div>
        <TokenMeter />
        <p className="token-hint">AI-funksjoner bruker tokens. Å lage presentasjoner og AI-bilder er gratis. 🖼️</p>

        {loading ? (
          <div className="screen-center"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty">
            <Presentation size={42} />
            <p>Ingen presentasjoner ennå.</p>
            {aiEnabled
              ? <button className="btn primary" onClick={openAi}><Sparkles size={18} /> Lag din første med AI</button>
              : <button className="btn primary" onClick={() => setTplOpen(true)}><Plus size={18} /> Lag din første</button>}
          </div>
        ) : (
          <div className="grid" data-tour="grid">
            {items.map((p) => {
              const th = (typeof p.t === 'string' ? THEMES[p.t] : p.t) || THEMES.minimal
              return (
                <button key={p.id} className="proj" onClick={() => nav('/p/' + p.id)}>
                  {p.cover && p.cover.elements
                    ? <div className="proj-thumb live"><SlideStage slide={p.cover} /></div>
                    : <div className="proj-thumb" style={{ background: th.bg, color: th.title, fontFamily: th.fontHead }}>
                        <span>{p.title || 'Uten tittel'}</span>
                      </div>}
                  <div className="proj-foot">
                    <div className="proj-name">{p.title || 'Uten tittel'}</div>
                    <span className="proj-dl" onClick={(e) => downloadProj(p.id, e)} title="Last ned som PowerPoint"><Download size={15} /></span>
                    <span className="proj-del" onClick={(e) => remove(p.id, e)} title="Slett"><Trash2 size={15} /></span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {aiOpen && aiEnabled && <AiWizard onClose={() => setAiOpen(false)} userId={user.id} nav={nav} />}
      {tourOpen && <Tour onClose={() => setTourOpen(false)} onFinish={openEditorTour} steps={[
        { sel: '[data-tour="new"]', title: 'Ny presentasjon', text: 'Start en helt tom presentasjon som du bygger selv fra bunnen.' },
        ...(aiEnabled ? [{ sel: '[data-tour="ai"]', title: 'Lag med AI', text: 'Skriv noen stikkord eller et lite manus, så lager AI hele presentasjonen – tekst, design og bilder – på sekunder.' }] : []),
        { sel: '[data-tour="grid"]', title: 'Presentasjonene dine', text: 'Alt du lager havner her og lagres automatisk. Klikk en for å åpne og redigere.' },
        { sel: null, title: 'Vil du se selve redigeringen?', text: 'Trykk «Ferdig» nedenfor, så åpner vi en presentasjon og viser deg alle verktøyene inne i editoren.' },
      ]} />}
    </div>
  )
}
