import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { newDeck, THEMES } from '../lib/deck'
import { exportPptx } from '../lib/export'
import AiWizard from '../components/AiWizard'
import Tour from '../components/Tour'
import InstallButton from '../components/InstallButton'
import TokenBadge from '../components/TokenBadge'
import TokenMeter from '../components/TokenMeter'
import { Plus, Sparkles, Trash2, LogOut, Presentation, Download, HelpCircle, User, Play } from 'lucide-react'

export default function Home() {
  const { user, signOut, aiEnabled, tokens, tokensUnlimited, tokensCap } = useAuth()
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
    const { data } = await supabase.from('presentations').select('id, title, updated_at, t:data->theme').eq('owner_id', user.id).order('updated_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [user])
  useEffect(() => { load() }, [load])

  async function createBlank() {
    const deck = newDeck('Uten tittel', 'minimal')
    const { data, error } = await supabase.from('presentations')
      .insert({ owner_id: user.id, title: deck.title, theme: deck.theme?.name || 'Minimal', data: deck }).select('id').single()
    if (!error && data) nav('/p/' + data.id)
  }

  async function remove(id, e) {
    e.stopPropagation()
    if (!confirm('Slette denne presentasjonen?')) return
    await supabase.from('presentations').delete().eq('id', id)
    load()
  }

  return (
    <div className="home">
      <header className="home-top">
        <div className="logo-row"><span className="logo-mark">◆</span> AiPressent</div>
        <div className="home-top-right">
          <TokenBadge />
          <InstallButton className="chip" />
          <button className="chip" onClick={() => nav('/profil')}><User size={16} /> Profil</button>
          <button className="chip" onClick={() => setTourOpen(true)}><HelpCircle size={16} /> Se hvordan</button>
          <button className="chip" onClick={signOut}><LogOut size={16} /> Logg ut</button>
        </div>
      </header>

      <div className="home-body">
        {showWelcome && (
          <div className="welcome-banner">
            <button className="welcome-x" onClick={hideWelcome} title="Skjul">✕</button>
            <div className="welcome-ic">👋</div>
            <div className="welcome-text">
              <b>Velkommen til AiPressent!</b>
              <span>Ny her? Se den korte guiden eller få en omvisning som peker på hver knapp – inkludert det nye animasjonspanelet.</span>
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
            <button className="btn ghost" onClick={() => nav('/guide')}><HelpCircle size={18} /> Guide</button>
            <button className="btn ghost" onClick={() => setTourOpen(true)}><Play size={18} /> Omvisning</button>
            <button className="btn ghost" data-tour="new" onClick={createBlank}><Plus size={18} /> Ny presentasjon</button>
            {aiEnabled && <button className="btn primary" data-tour="ai" onClick={() => setAiOpen(true)}><Sparkles size={18} /> Lag med AI</button>}
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
              ? <button className="btn primary" onClick={() => setAiOpen(true)}><Sparkles size={18} /> Lag din første med AI</button>
              : <button className="btn primary" onClick={createBlank}><Plus size={18} /> Lag din første</button>}
          </div>
        ) : (
          <div className="grid" data-tour="grid">
            {items.map((p) => {
              const th = (typeof p.t === 'string' ? THEMES[p.t] : p.t) || THEMES.minimal
              return (
                <button key={p.id} className="proj" onClick={() => nav('/p/' + p.id)}>
                  <div className="proj-thumb" style={{ background: th.bg, color: th.title, fontFamily: th.fontHead }}>
                    <span>{p.title || 'Uten tittel'}</span>
                  </div>
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
