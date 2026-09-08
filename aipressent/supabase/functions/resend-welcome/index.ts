// Sender en velkomst-e-post via Resend når noen lager konto.
// Secrets som må settes i Supabase:
//   RESEND_API_KEY  – API-nøkkelen fra Resend (re_...)
//   MAIL_FROM       – avsender, f.eks. "AiPresent <velkommen@aipresent.no>"
//                     (domenet må være verifisert i Resend). Uten den brukes Resend sin test-avsender.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const KEY = Deno.env.get('RESEND_API_KEY')
    if (!KEY) return json({ error: 'RESEND_API_KEY mangler' }, 400)
    const from = Deno.env.get('MAIL_FROM') || 'AiPresent <onboarding@resend.dev>'
    const { email, name, appUrl } = await req.json().catch(() => ({}))
    if (!email) return json({ error: 'Mangler e-post' }, 400)

    const navn = (name && String(name).trim()) || 'der'
    const url = appUrl || 'https://aipresent.no'
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1d1d1f">
        <div style="text-align:center;padding:28px 0 8px"><span style="font-size:22px;font-weight:800;letter-spacing:-.02em">◆ AiPresent</span></div>
        <div style="background:#f5f5f7;border-radius:18px;padding:28px">
          <h1 style="font-size:22px;margin:0 0 10px">Velkommen, ${navn}! 🎉</h1>
          <p style="line-height:1.6;margin:0 0 14px">Takk for at du lagde konto hos <b>AiPresent</b>. Nå kan du lage ferdige presentasjoner med kunstig intelligens på sekunder – bare skriv inn et tema, så ordner AI-en tekst, bilder og design.</p>
          <p style="line-height:1.6;margin:0 0 20px">Klar til å prøve?</p>
          <a href="${url}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:980px">Lag din første presentasjon →</a>
        </div>
        <p style="text-align:center;color:#6e6e73;font-size:13px;margin:18px 0">Spørsmål? Svar på denne e-posten eller kontakt hakon.solvik@hotmail.com</p>
      </div>`

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject: 'Velkommen til AiPresent 🎉', html }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return json({ error: data?.message || `Resend-feil (${r.status})` }, 400)
    return json({ ok: true, id: data?.id })
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 400)
  }
})
