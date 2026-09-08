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
    const pricing = url.replace(/\/$/, '') + '/priser'
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1d1d1f">
        <div style="text-align:center;padding:28px 0 8px"><span style="font-size:22px;font-weight:800;letter-spacing:-.02em">◆ AiPresent</span></div>
        <div style="background:#f5f5f7;border-radius:18px;padding:28px">
          <h1 style="font-size:22px;margin:0 0 10px">Velkommen, ${navn}! 🎉</h1>
          <p style="line-height:1.6;margin:0 0 14px">Takk for at du lagde konto hos <b>AiPresent</b>. Nå kan du lage ferdige presentasjoner med kunstig intelligens på sekunder – skriv inn et tema, så ordner AI-en tekst, bilder og design.</p>
          <a href="${url}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:980px">Lag din første presentasjon →</a>

          <div style="border-top:1px solid #e5e5ea;margin:26px 0 18px"></div>
          <h2 style="font-size:18px;margin:0 0 8px">Vil du ha mer? ✨</h2>
          <p style="line-height:1.6;margin:0 0 14px">Oppgrader og lås opp flere presentasjoner, ubegrenset sider, ingen vannmerke og AI-opplesning:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="background:#fff;border:1px solid #e5e5ea;border-radius:12px;padding:14px;text-align:center;width:48%">
                <div style="font-weight:800">Pluss</div>
                <div style="font-size:22px;font-weight:800;margin:4px 0">39 kr<span style="font-size:13px;color:#6e6e73">/mnd</span></div>
                <div style="color:#6e6e73;font-size:13px">15 presentasjoner · uendelig sider · opplesning · ingen vannmerke</div>
              </td>
              <td style="width:4%"></td>
              <td style="background:#fff;border:1px solid #0071e3;border-radius:12px;padding:14px;text-align:center;width:48%">
                <div style="font-weight:800;color:#0071e3">Pro</div>
                <div style="font-size:22px;font-weight:800;margin:4px 0">79 kr<span style="font-size:13px;color:#6e6e73">/mnd</span></div>
                <div style="color:#6e6e73;font-size:13px">Uendelig alt · flest tokens · opplesning · ingen vannmerke</div>
              </td>
            </tr>
          </table>
          <div style="text-align:center;margin-top:18px">
            <a href="${pricing}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:980px">Se pakker og oppgrader →</a>
          </div>
        </div>
        <p style="text-align:center;color:#6e6e73;font-size:13px;margin:18px 0">Spørsmål? Kontakt hakon.solvik@hotmail.com</p>
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
