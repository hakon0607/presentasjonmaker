import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Engangs-samtykke. Vises én gang, huskes i localStorage, popper aldri opp igjen etter «Godta».
export default function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (!localStorage.getItem('aip_consent')) setShow(true) } catch (_e) { /* ignore */ }
  }, [])

  const accept = () => {
    try { localStorage.setItem('aip_consent', '1') } catch (_e) { /* ignore */ }
    setShow(false)
  }

  if (!show) return null
  return (
    <div className="consent-bar">
      <span className="consent-text">
        Ved å bruke AiPresent godtar du våre <Link to="/vilkar">vilkår</Link> og <Link to="/personvern">personvernerklæring</Link>.
      </span>
      <button className="consent-btn" onClick={accept}>Godta</button>
    </div>
  )
}
