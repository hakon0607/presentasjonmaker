import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

// Tilbakeknapp som aldri lar deg bli «stuck»: går tilbake i historikken,
// eller til en trygg side hvis det ikke finnes noen historikk.
export default function BackButton({ to, label = 'Tilbake', fixed = false }) {
  const nav = useNavigate()
  const go = () => {
    if (to) nav(to)
    else if (typeof window !== 'undefined' && window.history.length > 1) nav(-1)
    else nav('/')
  }
  return (
    <button className={'back-btn' + (fixed ? ' back-btn-fixed' : '')} onClick={go} aria-label={label}>
      <ChevronLeft size={18} /> {label}
    </button>
  )
}
