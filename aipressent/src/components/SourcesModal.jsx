import { CheckCircle2 } from 'lucide-react'

const enc = encodeURIComponent
const gLink = (q) => 'https://www.google.com/search?q=' + enc(q)
const wLink = (q) => 'https://no.wikipedia.org/w/index.php?search=' + enc(q)
const sLink = (q) => 'https://www.google.com/search?q=' + enc('site:snl.no ' + q)

// Finn tittelen på et lysbilde = den største tekstbiten (hopp over etiketter som «OVERSIKT»).
function slideTitle(slide) {
  const texts = (slide.elements || []).filter((e) => e.type === 'text' && e.text && String(e.text).trim())
  if (!texts.length) return ''
  const sorted = [...texts].sort((a, b) => (b.fontSize || 0) - (a.fontSize || 0))
  for (const t of sorted) {
    const s = String(t.text).trim().replace(/\s+/g, ' ')
    if (/^(presentasjon|oversikt|takk|sammendrag|konklusjon|innhold|agenda|intro|innledning)$/i.test(s)) continue
    if (s.length < 2) continue
    return s
  }
  return String(sorted[0].text).trim().replace(/\s+/g, ' ')
}

export default function SourcesModal({ deck, onClose }) {
  const topic = (deck?.title || '').trim() || 'Presentasjon'
  const seen = new Set()
  const sections = []
  for (const sl of (deck?.slides || [])) {
    const t = slideTitle(sl)
    if (!t || /^takk$/i.test(t)) continue
    const key = t.toLowerCase()
    if (seen.has(key) || key === topic.toLowerCase()) continue
    seen.add(key)
    sections.push(t)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><CheckCircle2 size={20} /> Kilder & faktasjekk</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Presentasjonen er laget av AI ut fra emnet du ga, og kan inneholde feil. Lenkene under er <b>ikke</b> kilder AI-en faktisk brukte – de er pålitelige steder å <b>dobbeltsjekke</b> fakta selv.
        </p>

        <label>Hovedtema</label>
        <div className="src-row src-main">
          <span className="src-title">{topic}</span>
          <span className="src-links">
            <a href={sLink(topic)} target="_blank" rel="noreferrer">SNL</a>
            <a href={wLink(topic)} target="_blank" rel="noreferrer">Wikipedia</a>
            <a href={gLink(topic)} target="_blank" rel="noreferrer">Google</a>
          </span>
        </div>

        {sections.length > 0 && (
          <>
            <label>Sjekk hver del</label>
            <div className="src-list">
              {sections.map((t, i) => (
                <div className="src-row" key={i}>
                  <span className="src-title">{t}</span>
                  <span className="src-links">
                    <a href={gLink(t + ' ' + topic)} target="_blank" rel="noreferrer">Google</a>
                    <a href={wLink(t)} target="_blank" rel="noreferrer">Wikipedia</a>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="muted" style={{ fontSize: '.8rem', marginTop: 14 }}>
          Tips: Store norske leksikon (snl.no) og Wikipedia er gode startpunkt for skolebruk. Sjekk alltid tall, datoer og navn mot en pålitelig kilde før du bruker dem.
        </p>
        <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Lukk</button></div>
      </div>
    </div>
  )
}
