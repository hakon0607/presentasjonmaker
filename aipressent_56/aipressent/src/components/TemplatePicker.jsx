import { useEffect, useMemo, useState } from 'react'
import { LayoutTemplate, Search, X, Check } from 'lucide-react'
import { TEMPLATE_CATEGORIES, searchTemplates } from '../lib/templates'
import TemplateThumb from './TemplateThumb'

// Mal-album: ett langt rutenett der ALLE malene vises samtidig som ekte mini-
// scener. Søk + kategori-nedtrekk øverst, «Bruk»-bekreftelse nederst. Alt leser
// fra templates.js, så nye maler virker automatisk.
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

  const selected = results.find((t) => t.id === selId) || null

  return (
    <div className="modal-bg" onClick={busy ? undefined : onClose}>
      <div className="modal tpl-album" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-album-head">
          <h2><LayoutTemplate size={20} /> {heading}</h2>
          <button className="modal-x" onClick={onClose} disabled={busy} title="Lukk"><X size={18} /></button>
        </div>
        <p className="muted tpl-album-sub">{subtitle}</p>

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

        {results.length === 0 ? (
          <div className="tpl-stage-empty" style={{ minHeight: 200 }}>Ingen maler matchet.</div>
        ) : (
          <div className="tpl-gallery tpl-gallery-full">
            {results.map((t) => (
              <button key={t.id} className={'tpl-card' + (t.id === selId ? ' on' : '')}
                onClick={() => setSelId(t.id)} onDoubleClick={() => !busy && onPick(t)}
                title={`${t.name} – ${t.category}`}>
                <div className="tpl-card-prev"><TemplateThumb t={t} /></div>
                <div className="tpl-card-meta"><b>{t.name}</b><span className="muted small">{t.photo ? '📷 ' : ''}{t.category}</span></div>
              </button>
            ))}
          </div>
        )}

        <div className="tpl-album-bar">
          <span className="muted small">{results.length} {results.length === 1 ? 'mal' : 'maler'} · dobbeltklikk en mal for å bruke den med en gang</span>
          <button className="btn primary tpl-use-btn" disabled={busy || !selected} onClick={() => selected && onPick(selected)}>
            {busy ? 'Bytter …' : <><Check size={16} /> {selected ? `${actionLabel}: ${selected.name}` : actionLabel}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
