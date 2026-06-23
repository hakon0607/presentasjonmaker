import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

// Viser «Installer app» kun når nettleseren støtter installasjon og appen ikke alt er installert.
export default function InstallButton({ className = 'btn ghost', label = 'Installer app' }) {
  const [evt, setEvt] = useState(null)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setEvt(e) }
    const onInstalled = () => { setHidden(true); setEvt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    try { if (window.matchMedia('(display-mode: standalone)').matches) setHidden(true) } catch (_e) {}
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])
  if (hidden || !evt) return null
  return (
    <button className={className} onClick={async () => { try { evt.prompt(); await evt.userChoice } catch (_e) {} setEvt(null) }}>
      <Download size={16} /> {label}
    </button>
  )
}
