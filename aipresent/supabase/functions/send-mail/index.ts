// Edge Function (slug: send-mail)
// Sender en delelenke på e-post via Gmail SMTP.
// Krever secrets: GMAIL_USER og GMAIL_APP_PASSWORD (samme som du evt. brukte før).
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { to, title, link } = await req.json().catch(() => ({}))
    if (!to || !link) return json({ error: 'Mangler mottaker-e-post eller lenke.' })
    const user = Deno.env.get('GMAIL_USER')
    const pass = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!user || !pass) return json({ error: 'E-post er ikke satt opp ennå (mangler GMAIL_USER / GMAIL_APP_PASSWORD).' })

    const client = new SMTPClient({
      connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: user, password: pass } },
    })
    await client.send({
      from: `AiPressent <${user}>`,
      to: String(to),
      subject: `Presentasjon: ${title || 'AiPressent'}`,
      content: `Hei!\n\nHer er en presentasjon laget i AiPressent:\n${link}\n\nÅpne lenken i nettleseren for å se den.\n\nHilsen AiPressent`,
      html: `<p>Hei!</p><p>Her er en presentasjon laget i <b>AiPressent</b>:</p><p><a href="${link}">${title || link}</a></p><p style="color:#888;font-size:13px">Åpne lenken i nettleseren for å se den.</p>`,
    })
    await client.close()
    return json({ ok: true })
  } catch (e) {
    return json({ error: 'Kunne ikke sende e-post: ' + String(e).slice(0, 220) })
  }
})
