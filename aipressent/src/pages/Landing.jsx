import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InstallButton from '../components/InstallButton'
import { useT } from '../i18n'
import { Sparkles, Image as ImageIcon, Wand2, Play, Download, BookOpen } from 'lucide-react'

export default function Landing() {
  const { user } = useAuth()
  const t = useT()
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className="land">
      <header className="land-nav">
        <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
        <nav className="land-links">
          <Link to="/guide">{t('landing.guide')}</Link>
          <InstallButton className="btn ghost sm" />
          {user ? <Link className="btn primary sm" to="/mine">{t('landing.myPresentations')}</Link>
            : <><Link to="/login">{t('landing.login')}</Link><Link className="btn primary sm" to="/signup">{t('landing.createAccount')}</Link></>}
        </nav>
      </header>

      <section className="land-hero">
        <div className="land-hero-text">
          <span className="land-badge"><Sparkles size={14} /> {t('landing.badge')}</span>
          <h1>{t('landing.h1')}</h1>
          <p className="land-sub">{t('landing.sub')}</p>
          <div className="land-cta">
            {user ? <Link className="btn primary big" to="/mine">{t('landing.openApp')}</Link>
              : <Link className="btn primary big" to="/signup">{t('landing.startFree')}</Link>}
            <Link className="btn ghost big" to="/guide"><BookOpen size={18} /> {t('landing.seeHow')}</Link>
          </div>
        </div>
        <div className="land-hero-card">
          <div className="land-mini-slide">
            <div className="lms-title">{t('landing.demoTitle')}</div>
            <div className="lms-bar" />
            <div className="lms-rows"><span /><span /><span style={{ width: '60%' }} /></div>
            <div className="lms-img">🗺️</div>
          </div>
        </div>
      </section>

      <section className="land-feats">
        <Feat I={Wand2} t={t('landing.f1t')} d={t('landing.f1d')} />
        <Feat I={ImageIcon} t={t('landing.f2t')} d={t('landing.f2d')} />
        <Feat I={Play} t={t('landing.f3t')} d={t('landing.f3d')} />
        <Feat I={Download} t={t('landing.f4t')} d={t('landing.f4d')} />
      </section>

      <section className="land-about">
        <div className="land-about-photo">
          {imgOk
            ? <img src="/meg.jpg" alt="Håkon" onError={() => setImgOk(false)} />
            : <div className="land-photo-fallback">🙂</div>}
        </div>
        <div className="land-about-text">
          <h2>{t('landing.aboutTitle')}</h2>
          <p>{t('landing.aboutP1')}</p>
          <p>{t('landing.aboutP2')}</p>
          <Link className="btn primary" to={user ? '/mine' : '/signup'}>{user ? t('landing.aboutCtaOpen') : t('landing.aboutCta')}</Link>
        </div>
      </section>

      <footer className="land-foot">
        <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
        <span className="muted small">{t('landing.footBy')} · <Link to="/guide">{t('landing.guide')}</Link> · <Link to="/vilkar">Vilkår</Link> · <Link to="/personvern">Personvern</Link></span>
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
