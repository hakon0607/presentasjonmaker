import { useEffect, useMemo, useState } from 'react'
import { LayoutTemplate, Search, X, Check } from 'lucide-react'
import SlideStage from './SlideStage'
import { TEMPLATE_CATEGORIES, searchTemplates, sampleSlideForTemplate } from '../lib/templates'

// Lett, statisk mini-preview til rutenettet (raskt – ingen tung SlideStage per kort).
// Viser malens ekte farger, overskriftsfont og navn, så du kjenner igjen stilen.
function TemplateThumb({ t }) {
  const th = t.theme
  return (
    <div className="tpl-thumb" style={{ background: th.bg }}>
      <div className="tpl-thumb-name" style={{ color: th.title, fontFamily: `'${th.fontHead}', sans-serif` }}>{t.name}</div>
      <div className="tpl-thumb-bar" style={{ background: th.accent }} />
      <div className="tpl-thumb-lines">
        <span style={{ background: th.text }} />
        <span style={{ background: th.text }} />
      </div>
      <div className="tpl-thumb-corner" style={{ background: th.accent }} />
    </div>
  )
}

// Mal-album: stor ekte forhåndsvisning av valgt mal til venstre, søk + kategori-
// nedtrekk + rutenett til høyre. Alt leser fra templates.js, så nye maler virker
// automatisk.
export default function TemplatePicker({
  onPick, onClose,
  heading = 'Velg en mal',
  subtitle = 'Hver mal har sin egen stil, farger og fonter. Du kan bytte mal når som helst – teksten din beholdes.',
  actionLabel = 'Bruk mal',
  busy = false,
}) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('Alle')
  const results = useMemo(() => searchTemplates(query, cat), [query, cat])
  const [selId, setSelId] = useState(results[0]?.id || null)

  useEffect(() => {
    if (!results.length) { setSelId(null); return }
    if (!results.some((t) => t.id === selId)) setSelId(results[0].id)
  }, [results, selId])

  const selected = results.find((t) => t.id === selId) || results[0] || null

  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal tpl-album" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-album-head">
          <h2><LayoutTemplate size={20} /> {heading}</h2>
          <button className="modal-x" onClick={onClose} disabled={busy} title="Lukk"><X size={18} /></button>
        </div>
        <p className="muted tpl-album-sub">{subtitle}</p>

        <div className="tpl-album-body">
          {/* Venstre: stor, ekte forhåndsvisning av valgt mal */}
          <div className="tpl-stage">
            {selected ? (
              <>
                <div className="tpl-stage-prev"><SlideStage slide={sampleSlideForTemplate(selected)} /></div>
                <div className="tpl-stage-meta">
                  <div>
                    <b>{selected.name}</b>
                    <span className="muted small">{selected.category}</span>
                  </div>
                  <button className="btn primary tpl-stage-use" disabled={busy} onClick={() => onPick(selected)}>
                    {busy ? 'Bytter …' : <><Check size={16} /> {actionLabel}</>}
                  </button>
                </div>
              </>
            ) : (
              <div className="tpl-stage-empty">Ingen mal valgt</div>
            )}
          </div>

          {/* Høyre: søk + kategori-nedtrekk + rutenett */}
          <div className="tpl-browse">
            <div className="tpl-browse-top">
              <div className="tpl-search">
                <Search size={16} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} spellCheck lang="nb"
                  placeholder="Søk – f.eks. «krig», «mørk», «skole» … (finner også liknende)" autoFocus />
                {query && <button className="tpl-search-x" onClick={() => setQuery('')} title="Tøm">✕</button>}
              </div>
              <select className="tpl-catsel" value={cat} onChange={(e) => setCat(e.target.value)} title="Kategori">
                {TEMPLATE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === 'Alle' ? 'Alle kategorier' : c}</option>
                ))}
              </select>
            </div>

            <div className="tpl-gallery">
              {results.map((t) => (
                <button key={t.id} className={'tpl-card' + (t.id === selId ? ' on' : '')}
                  onClick={() => setSelId(t.id)} onDoubleClick={() => !busy && onPick(t)}
                  title={`${t.name} – ${t.category}`}>
                  <div className="tpl-card-prev"><TemplateThumb t={t} /></div>
                  <div className="tpl-card-meta"><b>{t.name}</b><span className="muted small">{t.category}</span></div>
                </button>
              ))}
            </div>

            <div className="tpl-album-foot">
              <span className="muted small">{results.length} {results.length === 1 ? 'mal' : 'maler'} · klikk for forhåndsvisning, dobbeltklikk for å bruke</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
