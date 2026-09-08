import { useLang } from '../i18n'

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={'lang-switch ' + className}>
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} aria-label="English">EN</button>
      <button type="button" className={lang === 'no' ? 'on' : ''} onClick={() => setLang('no')} aria-label="Norsk">NO</button>
    </div>
  )
}
