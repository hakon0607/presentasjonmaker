import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

// Viser en tydelig melding når nettet er borte, og forsvinner når det er tilbake.
export default function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (!offline) return null
  return (
    <div className="offline-bar">
      <WifiOff size={16} /> Ingen internettforbindelse – noen funksjoner virker ikke før du er på nett igjen.
    </div>
  )
}
