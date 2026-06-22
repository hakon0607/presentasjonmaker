import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function CopyDeck() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [err, setErr] = useState('')

  useEffect(() => {
    let on = true
    ;(async () => {
      if (!user) return
      try {
        const { data, error } = await supabase.from('presentations').select('data, title').eq('id', id).maybeSingle()
        if (error || !data) { if (on) setErr('Fant ikke presentasjonen, eller den er ikke delt for redigering.'); return }
        const deck = data.data || {}
        const newTitle = (deck.title || data.title || 'Delt presentasjon') + ' (kopi)'
        const { data: ins, error: ie } = await supabase.from('presentations')
          .insert({ owner_id: user.id, title: newTitle, theme: deck.theme?.name || 'Egendefinert', data: { ...deck, title: newTitle } })
          .select('id').single()
        if (ie || !ins) { if (on) setErr('Kunne ikke lage kopi: ' + (ie?.message || 'ukjent feil')); return }
        if (on) nav('/p/' + ins.id, { replace: true })
      } catch (e) { if (on) setErr('Noe gikk galt: ' + (e.message || e)) }
    })()
    return () => { on = false }
  }, [id, user])

  return (
    <div className="screen-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 14 }}>
      {err ? (
        <>
          <p className="err" style={{ maxWidth: 420, textAlign: 'center' }}>{err}</p>
          <button className="btn primary" onClick={() => nav('/mine')}>Til mine presentasjoner</button>
        </>
      ) : (
        <>
          <div className="spinner" />
          <p className="muted">Lager din egen kopi du kan redigere …</p>
        </>
      )}
    </div>
  )
}
