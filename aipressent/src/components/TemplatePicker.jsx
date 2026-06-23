import { useMemo, useState } from 'react'
import { LayoutTemplate, Search, X } from 'lucide-react'
import SlideStage from './SlideStage'
import { TEMPLATE_CATEGORIES, searchTemplates, sampleSlideForTemplate } from '../lib/templates'

// Mal-velger. Brukes både når man lager NY presentasjon og for å BYTTE mal
// underveis i editoren. Viser hver mal som et ekte mini-lysbilde.
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

  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal tpl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-modal-head">
          <h2 style={{ margin: 0 }}><LayoutTemplate size={20} /> {heading}</h2>
          <button className="modal-x" onClick={onClose} disabled={busy} title="Lukk"><X size={18} /></button>
        </div>
        <p className="muted" style={{ margin: '4px 0 12px' }}>{subtitle}</p>

        <div className="tpl-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} spellCheck lang="nb"
            placeholder="Søk – f.eks. «mørk», «skole», «elegant» …" autoFocus />
          {query && <button className="tpl-search-x" onClick={() => setQuery('')} title="Tøm">✕</button>}
        </div>

        <div className="tpl-cats">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button key={c} className={'tpl-cat' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="tpl-empty">Ingen maler matchet søket. Prøv et annet ord eller en annen kategori.</div>
        ) : (
          <div className="tpl-gallery">
            {results.map((t) => (
              <button key={t.id} className="tpl-card" onClick={() => !busy && onPick(t)} disabled={busy} title={`${t.name} – ${t.category}`}>
                <div className="tpl-card-prev"><SlideStage slide={sampleSlideForTemplate(t)} /></div>
                <div className="tpl-card-meta">
                  <b>{t.name}</b>
                  <span className="muted small">{t.category}</span>
                </div>
                <span className="tpl-card-use">{actionLabel}</span>
              </button>
            ))}
          </div>
        )}

        <div className="modal-foot" style={{ marginTop: 14 }}>
          <span className="muted small">{results.length} {results.length === 1 ? 'mal' : 'maler'}</span>
          <button className="btn ghost" onClick={onClose} disabled={busy}>Lukk</button>
        </div>
      </div>
    </div>
  )
}
