import { useAuth } from '../context/AuthContext'
import { Zap, Infinity as InfinityIcon } from 'lucide-react'

// Liten teller som viser AI-tokens. Bilder er gratis, så dette gjelder kun tekst-AI.
export default function TokenBadge({ className = 'chip token-chip' }) {
  const { tokens, tokensUnlimited } = useAuth()
  if (tokensUnlimited) return <span className={className} title="Du har ubegrenset AI-tokens"><InfinityIcon size={15} /> Ubegrenset</span>
  const n = tokens == null ? '…' : tokens
  const low = typeof tokens === 'number' && tokens <= 1
  return <span className={className + (low ? ' token-low' : '')} title="AI-tokens – brukes til AI-funksjoner. Bilder er gratis."><Zap size={15} /> {n} tokens</span>
}
