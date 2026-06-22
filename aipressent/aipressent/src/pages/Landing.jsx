import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InstallButton from '../components/InstallButton'
import { Sparkles, Image as ImageIcon, Wand2, Play, Download, Share2, BookOpen } from 'lucide-react'

export default function Landing() {
  const { user } = useAuth()
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className="land">
      <header className="land-nav">
        <div className="logo-row"><span className="logo-mark">◆</span> AiPresent</div>
        <nav className="land-links">
          <Link to="/guide">Guide</Link>
          <InstallButton className="btn ghost sm" />
          {user ? <Link className="btn primary sm" to="/mine">Mine presentasjoner</Link>
            : <><Link to="/login">Logg inn</Link><Link className="btn primary sm" to="/signup">Lag konto</Link></>}
        </nav>
      </header>

      <section className="land-hero">
        <div className="land-hero-text">
          <span className="land-badge"><Sparkles size={14} /> Lag presentasjoner med AI</span>
          <h1>Lag en ferdig presentasjon på under ett minutt.</h1>
          <p className="land-sub">Skriv noen stikkord, så bygger AI-en hele presentasjonen – tekst, design og bilder – som du kan endre akkurat som du vil. Helt gratis.</p>
          <div className="land-cta">
            {user ? <Link className="btn primary big" to="/mine">Åpne appen →</Link>
              : <Link className="btn primary big" to="/signup">Kom i gang gratis →</Link>}
            <Link className="btn ghost big" to="/guide"><BookOpen size={18} /> Se hvordan</Link>
          </div>
        </div>
        <div className="land-hero-card">
          <div className="land-mini-slide">
            <div className="lms-title">Andre verdenskrig ✈️</div>
            <div className="lms-bar" />
            <div className="lms-rows"><span /><span /><span style={{ width: '60%' }} /></div>
            <div className="lms-img">🗺️</div>
          </div>
        </div>
      </section>

      <section className="land-feats">
        <Feat I={Wand2} t="AI lager alt" d="Stikkord inn – ferdige lysbilder, design og tekst ut. Du kan endre alt etterpå." />
        <Feat I={ImageIcon} t="Bilder automatisk" d="AI fyller inn passende bilder og lager tematiske illustrasjoner som passer emnet." />
        <Feat I={Play} t="Presentér rett i nettleseren" d="Full skjerm, myke overganger og eget manus til hvert lysbilde." />
        <Feat I={Download} t="Eksport & deling" d="Last ned som PowerPoint eller PDF, åpne i Google Slides, eller del en lenke." />
      </section>

      <section className="land-about">
        <div className="land-about-photo">
          {imgOk
            ? <img src="/meg.jpg" alt="Meg" onError={() => setImgOk(false)} />
            : <div className="land-photo-fallback">🙂</div>}
        </div>
        <div className="land-about-text">
          <h2>Hvorfor jeg lagde AiPresent</h2>
          <p>Hei! Jeg heter Håkon, og jeg er 14 år. Jeg lagde AiPresent fordi jeg syntes det tok altfor lang tid å lage presentasjoner til skolen – og at de ofte ble litt kjedelige.</p>
          <p>Jeg ville ha noe som lager et førsteutkast på sekunder, finner bilder selv, og fortsatt lar deg styre alt. Så satte jeg meg ned og bygde det, steg for steg. Dette er resultatet – og jeg håper det gjør skolehverdagen din litt lettere. 🚀</p>
          <Link className="btn primary" to={user ? '/mine' : '/signup'}>{user ? 'Åpne appen' : 'Prøv det gratis'}</Link>
        </div>
      </section>

      <footer className="land-foot">
        <span className="logo-row"><span className="logo-mark">◆</span> AiPresent</span>
        <span className="muted small">Laget av Håkon · <Link to="/guide">Guide</Link></span>
      </footer>
    </div>
  )
}

function Feat({ I, t, d }) {
  return (
    <div className="land-feat">
      <div className="land-feat-ic"><I size={22} /></div>
      <h3>{t}</h3>
      <p>{d}</p>
    </div>
  )
}
