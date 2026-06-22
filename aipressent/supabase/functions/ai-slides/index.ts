// Edge Function (slug: smart-task)
// Modus: generate (standard), edit, theme, notes, slide, review, image. Krever OPENAI_API_KEY.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

const FONTS = 'Inter, Poppins, Montserrat, Nunito, Quicksand (rene sans), Playfair Display, Lora (elegant serif), Space Grotesk (moderne/teknisk), Roboto Mono (teknisk), Fredoka, Baloo 2 (runde/lekne/barn), Caveat (håndskrift)'

const THEME_RULES = `Lag et fargetema som passer ønsket. Felt "theme" er et objekt:
{"name":"kort navn","bg":"#hex","title":"#hex","text":"#hex","accent":"#hex","fontHead":"<font>","fontBody":"<font>","decor":"confetti|blobs|botanical|none"}
- fontHead og fontBody MÅ velges fra denne lista: ${FONTS}.
- Sørg for GOD KONTRAST: title og text må være lett lesbare mot bg.
- decor: "confetti" (lekent/barn), "blobs" (mykt/akvarell), "botanical" (pastell/natur), "none" (rent/profesjonelt).`

const SCHEMA = `Hvert lysbilde har "layout" (cover, section, bullets, statement, imageText, imageFull, twoColumn):
- cover: {"layout":"cover","title":"...","subtitle":"...","icon":"📚"}
- section: {"layout":"section","title":"...","icon":"🌟"}
- bullets: {"layout":"bullets","title":"...","bullets":["..."],"icon":"✅"}
- statement: {"layout":"statement","statement":"...","subtitle":"..."}
- imageText: {"layout":"imageText","title":"...","bullets":["..."],"image":{"caption":"Hva bildet skal vise"},"icon":"🖼️"}
- imageFull: {"layout":"imageFull","title":"...","image":{"caption":"Hva bildet skal vise"}}
- twoColumn: {"layout":"twoColumn","title":"...","columns":[{"heading":"...","bullets":["..."]},{"heading":"...","bullets":["..."]}],"icon":"⚖️"}`

function amountRule(a: string) {
  if (a === 'short') return 'Innholdet skal være KORTE stikkord (maks ~5 ord per punkt).'
  if (a === 'long') return 'Innholdet skal være hele, forklarende setninger.'
  return 'Variér tekstlengden – noen lysbilder med korte stikkord, andre med hele setninger.'
}

function sysGenerate(count: number, amount: string) {
  return `Du lager VISUELT FINE og VARIERTE presentasjoner på norsk.
Du får manus ELLER bare stikkord/tema. Er det kort, TOLK og bygg ut innholdet selv.
Svar KUN med gyldig JSON: {"title":"...","theme":{...},"slides":[ ... ]}
${SCHEMA}
${THEME_RULES}
Regler for lysbilder:
- Lag NØYAKTIG ${count} lysbilder. FØRSTE = "cover" (forside). SISTE = oppsummering ("statement" eller "bullets").
- Variér layoutene. Bruk imageText/imageFull der bilde passer, med tydelig norsk caption. Maks 5 punkter per liste. "icon" = én emoji.
- ${amountRule(amount)}
Ikke skriv noe annet enn JSON.`
}

function sysEdit(amount: string) {
  return `Du redigerer en presentasjon på norsk ut fra en oppsummering + instruksjon.
Svar KUN med gyldig JSON: {"title":"...","theme":{...},"slides":[ ... ]}
${SCHEMA}
${THEME_RULES}
Behold forside først og oppsummering sist. ${amountRule(amount)} Ikke skriv noe annet enn JSON.`
}

function sysSlide(amount: string) {
  return `Du lager ÉTT lysbilde på norsk ut fra dagens innhold + en instruksjon. Svar KUN med gyldig JSON: {"slide":{...}} der slide er ETT lysbilde-objekt.
${SCHEMA}
${amountRule(amount)} Ikke skriv noe annet enn JSON.`
}

const SYS_THEME = `Du lager KUN et fargetema for en presentasjon, ut fra brukerens beskrivelse. Svar KUN med gyldig JSON: {"theme":{...}}
${THEME_RULES}`

const SYS_NOTES = `Du skriver manus/talenotater på norsk til en presentasjon.
Du får en nummerert liste over lysbildene. Skriv 2-4 naturlige setninger om hva presentøren skal SI til hvert lysbilde (ikke bare gjenta punktene – utdyp og bind sammen).
Svar KUN med gyldig JSON: {"notes":["manus til lysbilde 1","manus til lysbilde 2", ...]} med nøyaktig like mange elementer som det er lysbilder, i samme rekkefølge.`

const SYS_REVIEW = `Du er en hjelpsom, vennlig veileder som ser over en presentasjon på norsk.
Vurder grundig: er temaet besvart? Er det god variasjon i layout og lengde på punktene? Er teksten klar og passe kort? Henger den sammen (forside → innhold → oppsummering)?
Svar KUN med gyldig JSON: {"feedback":"vennlig helhetsvurdering i 2-3 setninger","tips":["konkret forbedring","konkret forbedring","konkret forbedring"]}`

const SYS_IMG_QUERY = `Du får et TEMA og en BESKRIVELSE (på norsk) av et bilde som trengs i en presentasjon.
Lag 5-7 ENGELSKE søkeord-fraser for å finne et passende ekte foto, sortert fra MEST spesifikk til MEST generell.
Den siste frasen skal være ETT enkelt, vanlig engelsk ord som nesten garantert gir treff (knyttet til temaet).
Korte fraser (1-4 ord), ingen skilletegn. Svar KUN med gyldig JSON: {"queries":["...","...","..."]}`

const SYS_IMG_PROMPT = `Du får et TEMA og en kort BESKRIVELSE (på norsk) av et bilde som trengs i en presentasjon.
Skriv ÉN grundig, presis bilde-prompt på ENGELSK (3-5 setninger) som gir et flott, relevant og DETALJERT bilde:
- Beskriv ett tydelig HOVEDMOTIV som passer temaet, pluss bakgrunn/setting, perspektiv, komposisjon, farger, lys og stemning.
- Vær konkret og spesifikk (f.eks. ikke "et fly", men "a World War 2 fighter plane silhouette against a dramatic evening sky").
- Avslutt med stilord som «high quality, sharp focus, detailed, professional».
- IKKE be om tekst, bokstaver, ord, tall, vannmerker, logoer eller collage i bildet (AI tegner det stygt). Ett rent, sammenhengende motiv.
- Hold det trygt og skolevennlig: ingen grafisk vold eller blod – beskriv saklig/illustrerende.
Svar KUN med gyldig JSON: {"prompt":"<detaljert engelsk beskrivelse>"}`

function extractJson(text: string) {
  const a = text.indexOf('{'); const b = text.lastIndexOf('}')
  if (a === -1 || b === -1) throw new Error('Fikk ikke gyldig svar fra AI')
  return JSON.parse(text.slice(a, b + 1))
}

async function ask(key: string, sys: string, user: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4.1-mini', temperature: 0.6, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error('OpenAI-feil: ' + (await res.text()).slice(0, 200))
  const data = await res.json()
  return extractJson(data?.choices?.[0]?.message?.content ?? '')
}

// Wikimedia Commons – liste med forslag (thumb + tittel)
async function searchCommonsList(q: string): Promise<any[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`
    const r = await fetch(url, { headers: { 'User-Agent': 'AiPressent/1.0 (skoleprosjekt)' } })
    if (!r.ok) return []
    const d = await r.json().catch(() => ({}))
    const pages = d?.query?.pages ? Object.values(d.query.pages) : []
    return pages
      .map((p: any) => ({ ii: p.imageinfo?.[0], title: String(p.title || '').replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '') }))
      .filter((x: any) => x.ii && /jpeg|png/.test(x.ii.mime || '') && (x.ii.thumburl || x.ii.url))
      .map((x: any) => ({ url: x.ii.thumburl || x.ii.url, title: x.title }))
  } catch (_e) { return [] }
}

// Lager engelske søkeord ut fra tema + beskrivelse (AI), med temabaserte fallbacks
async function buildImgQueries(key: string, desc: string, topic: string): Promise<string[]> {
  let queries: string[] = []
  try {
    const p = await ask(key, SYS_IMG_QUERY, `Tema: ${topic || '(ukjent)'}\nBeskrivelse: ${desc || '(ingen)'}`)
    if (Array.isArray(p.queries)) queries = p.queries.filter((q: any) => typeof q === 'string' && q.trim()).map((q: string) => q.trim())
  } catch (_e) { /* fallback under */ }
  const words = desc.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter((w) => w.length > 2)
  if (words.length) queries.push(words.join(' '))
  if (topic && words.length) queries.push(`${topic} ${words.slice(0, 3).join(' ')}`)
  if (topic) queries.push(topic)
  return [...new Set(queries.filter(Boolean))].slice(0, 10)
}

// Wikimedia Commons – gratis, ingen nøkkel, bra på skole/historie
async function searchCommons(q: string): Promise<string[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|mime&iiurlwidth=1280&format=json&origin=*`
    const r = await fetch(url, { headers: { 'User-Agent': 'AiPressent/1.0 (skoleprosjekt)' } })
    if (!r.ok) return []
    const d = await r.json().catch(() => ({}))
    const pages = d?.query?.pages ? Object.values(d.query.pages) : []
    return pages
      .map((p: any) => p.imageinfo?.[0])
      .filter((ii: any) => ii && /jpeg|png/.test(ii.mime || ''))
      .map((ii: any) => ii.thumburl || ii.url)
      .filter(Boolean)
  } catch (_e) { return [] }
}

// Henter en bilde-URL og gjør den om til base64 (eller null hvis den ikke duger)
async function fetchAsB64(src: string): Promise<string | null> {
  try {
    const img = await fetch(src, { headers: { 'User-Agent': 'AiPressent/1.0' } })
    if (!img.ok) return null
    if (!(img.headers.get('content-type') || '').startsWith('image/')) return null
    const buf = new Uint8Array(await img.arrayBuffer())
    if (buf.length < 2000 || buf.length > 8_000_000) return null
    let bin = ''
    const chunk = 0x8000
    for (let i = 0; i < buf.length; i += chunk) bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunk)))
    return btoa(bin)
  } catch (_e) { return null }
}

// Sjekker om den innloggede brukeren har ai_enabled = true i profiles
async function aiAllowed(req: Request): Promise<boolean> {
  try {
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '').trim()
    const url = Deno.env.get('SUPABASE_URL')
    const srv = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anon = Deno.env.get('SUPABASE_ANON_KEY')
    if (!url || !srv || !jwt) return true // ikke konfigurert → ikke blokker
    const ures = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: `Bearer ${jwt}`, apikey: anon || srv } })
    if (!ures.ok) return false
    const user = await ures.json()
    if (!user?.id) return false
    const pres = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=ai_enabled`, { headers: { apikey: srv, Authorization: `Bearer ${srv}` } })
    if (!pres.ok) return true // ved feil → ikke blokker
    const rows = await pres.json()
    return !!(rows?.[0]?.ai_enabled)
  } catch (_e) { return true }
}

// ---- Token-system ----
const DAILY_CAP = 3      // daglig paafyll opp til dette
const FIRST_GRANT = 10   // ved foerste innlogging (settes som kolonne-default i SQL)
const COST: Record<string, number> = { generate: 5, edit: 2, slide: 1, review: 1, notes: 1, theme: 1, animate: 1 }

type Tok = { configured: boolean; uid?: string | null; tokens?: number; unlimited?: boolean; url?: string; srv?: string }

async function tokenAuth(req: Request): Promise<Tok> {
  try {
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '').trim()
    const url = Deno.env.get('SUPABASE_URL')
    const srv = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anon = Deno.env.get('SUPABASE_ANON_KEY')
    if (!url || !srv || !jwt) return { configured: false }
    const ures = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: `Bearer ${jwt}`, apikey: anon || srv } })
    if (!ures.ok) return { configured: true, uid: null }
    const user = await ures.json()
    const uid = user?.id
    if (!uid) return { configured: true, uid: null }
    const h = { apikey: srv, Authorization: `Bearer ${srv}` }
    const pres = await fetch(`${url}/rest/v1/profiles?id=eq.${uid}&select=tokens,tokens_unlimited,tokens_day`, { headers: h })
    const rows = pres.ok ? await pres.json() : []
    const row = rows?.[0]
    if (!row) return { configured: true, uid, tokens: FIRST_GRANT, unlimited: false, url, srv }
    const today = new Date().toISOString().slice(0, 10)
    let tokens = Number(row.tokens ?? FIRST_GRANT)
    const unlimited = !!row.tokens_unlimited
    if (row.tokens_day !== today) {
      tokens = Math.max(tokens, DAILY_CAP)
      await fetch(`${url}/rest/v1/profiles?id=eq.${uid}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ tokens, tokens_day: today }) })
    }
    return { configured: true, uid, tokens, unlimited, url, srv }
  } catch (_e) { return { configured: false } }
}

async function setTokens(url: string, srv: string, uid: string, n: number) {
  await fetch(`${url}/rest/v1/profiles?id=eq.${uid}`, { method: 'PATCH', headers: { apikey: srv, Authorization: `Bearer ${srv}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ tokens: Math.max(0, n) }) })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  let _rUid: string | null = null, _rN = 0, _rUrl = '', _rSrv = ''
  try {
    const body = await req.json().catch(() => ({}))

    // E-post-deling: sender delelenken via Gmail SMTP. Krever ikke OpenAI.
    if (body.mode === 'email') {
      const to = body.to, title = body.title, link = body.link
      if (!to || !link) return json({ error: 'Mangler mottaker-e-post eller lenke.' })
      const user = Deno.env.get('GMAIL_USER'), pass = Deno.env.get('GMAIL_APP_PASSWORD')
      if (!user || !pass) return json({ error: 'E-post er ikke satt opp: legg til GMAIL_USER og GMAIL_APP_PASSWORD som Secrets på smart-task.' })
      try {
        const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
        const client = new SMTPClient({ connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: user, password: pass } } })
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
        return json({ error: 'Sending feilet: ' + String((e as Error)?.message || e).slice(0, 220) })
      }
    }

    // Token-saldo (gratis å sjekke)
    if (body.mode === 'tokens') {
      const t = await tokenAuth(req)
      return json({ tokens: t.unlimited ? null : (t.tokens ?? FIRST_GRANT), unlimited: !!t.unlimited, cap: DAILY_CAP, first: FIRST_GRANT, cost: COST })
    }

    const key = Deno.env.get('OPENAI_API_KEY')
    if (!key) return json({ error: 'Mangler OPENAI_API_KEY' })

    // Trekk tokens for AI-handlinger som koster penger (bilder + e-post er gratis)
    const modeName = body.mode || 'generate'
    if (modeName in COST) {
      const t = await tokenAuth(req)
      if (t.configured && t.uid && !t.unlimited) {
        const cost = COST[modeName]
        const have = t.tokens ?? 0
        if (have < cost) return json({ error: `Du har ikke nok tokens. Denne handlingen koster ${cost}, og du har ${have}. Du får påfyll i morgen.`, tokens: have, needed: cost, noTokens: true })
        await setTokens(t.url!, t.srv!, t.uid, have - cost)
        _rUid = t.uid; _rN = cost; _rUrl = t.url!; _rSrv = t.srv!
      }
    }
    const amount = body.textAmount || 'auto'

    if (body.mode === 'theme') {
      const parsed = await ask(key, SYS_THEME, `Visuelt ønske: ${body.visualStyle || 'noe pent og passende'}`)
      return json({ theme: parsed.theme || {} })
    }

    if (body.mode === 'notes') {
      const parsed = await ask(key, SYS_NOTES, `Lysbilder:\n${body.current || ''}`)
      return json({ notes: Array.isArray(parsed.notes) ? parsed.notes : [] })
    }

    if (body.mode === 'slide') {
      const parsed = await ask(key, sysSlide(amount), `Dagens lysbilde:\n${body.current || '(tomt)'}\n\nInstruksjon: ${body.instruction || 'lag et fint lysbilde'}`)
      return json({ slide: parsed.slide || parsed })
    }

    if (body.mode === 'review') {
      const parsed = await ask(key, SYS_REVIEW, `Tema: ${body.title || '(ukjent)'}\n\nLysbilder:\n${body.current || ''}`)
      return json({ feedback: parsed.feedback || '', tips: Array.isArray(parsed.tips) ? parsed.tips : [] })
    }

    if (body.mode === 'animate') {
      const list = Array.isArray(body.slides) ? body.slides : []
      const desc = list.map((s: { title?: string; items?: number }, i: number) =>
        `${i + 1}. "${(s.title || '(uten tittel)').slice(0, 60)}" (${s.items || 0} elementer)`).join('\n')
      const SYS_ANIM = `Du velger fine, smakfulle animasjoner for en presentasjon (stemning: ${body.mood || 'noytral'}).
For HVERT lysbilde velg:
- "transition": hvordan HELE lysbildet kommer inn. Velg blant: "fade", "slideLeft", "slideUp", "zoom".
- "preset": hvordan elementene (tittel, punkter, bilder) beveger seg inn. Velg blant: "fadeUp", "fadeIn", "zoomIn", "slideRight", "pop".
- "stagger": millisekunder mellom hvert element (0-200). Bruk 90-140 for vanlige lysbilder, lavere for forsider.
Regler: Forsiden (lysbilde 1) boer ha en rolig, elegant inngang (gjerne "zoom"+"zoomIn" eller "fade"+"fadeUp"). Varier litt mellom lysbildene saa det ikke blir kjedelig, men hold det ELEGANT og rolig - ikke kaotisk. "pop" passer lekne/morsomme lysbilder, ikke seriose.
Svar KUN med gyldig JSON: {"slides":[{"transition":"...","preset":"...","stagger":110}, ...]} - NOEYAKTIG ${list.length} objekter, i samme rekkefolge.`
      const parsed = await ask(key, SYS_ANIM, `Lysbilder:\n${desc}`)
      const allowT = ['fade', 'slideLeft', 'slideUp', 'zoom']
      const allowP = ['fadeUp', 'fadeIn', 'zoomIn', 'slideRight', 'pop']
      const arr = (Array.isArray(parsed.slides) ? parsed.slides : []).map((x: { transition?: string; preset?: string; stagger?: number }) => ({
        transition: allowT.includes(x?.transition || '') ? x.transition : 'fade',
        preset: allowP.includes(x?.preset || '') ? x.preset : 'fadeUp',
        stagger: Math.max(0, Math.min(200, Number(x?.stagger) || 110)),
      }))
      return json({ slides: arr })
    }

    if (body.mode === 'stock_search') {
      const desc = String(body.prompt || '').slice(0, 200).trim()
      const topic = String(body.topic || '').slice(0, 100).trim()
      const queries = await buildImgQueries(key, desc, topic)
      const seen = new Set<string>()
      const out: any[] = []
      for (const q of queries) {
        const items = await searchCommonsList(q)
        for (const it of items) {
          if (out.length >= 28) break
          if (seen.has(it.url)) continue
          seen.add(it.url); out.push(it)
        }
        if (out.length >= 28) break
      }
      return json({ results: out })
    }

    if (body.mode === 'stock_fetch') {
      const b64 = await fetchAsB64(String(body.url || ''))
      if (!b64) return json({ error: 'Klarte ikke å hente bildet' })
      return json({ image: b64 })
    }

    if (body.mode === 'stock') {
      const desc = String(body.prompt || '').slice(0, 200).trim()
      const topic = String(body.topic || '').slice(0, 100).trim()

      let queries: string[] = []
      try {
        const p = await ask(key, SYS_IMG_QUERY, `Tema: ${topic || '(ukjent)'}\nBeskrivelse: ${desc || '(ingen)'}`)
        if (Array.isArray(p.queries)) queries = p.queries.filter((q: any) => typeof q === 'string' && q.trim()).map((q: string) => q.trim())
      } catch (_e) { /* fortsetter med fallback */ }
      // TEMABASERTE fallbacks (ikke generelle ord som "photo" – de gir feil bilder)
      const words = desc.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter((w) => w.length > 2)
      if (words.length) queries.push(words.join(' '))
      if (topic && words.length) queries.push(`${topic} ${words.slice(0, 3).join(' ')}`)
      if (topic) queries.push(topic)
      queries = [...new Set(queries.filter(Boolean))].slice(0, 10)

      for (const q of queries) {
        const urls = await searchCommons(q)
        for (const src of urls.slice(0, 8)) {
          const b64 = await fetchAsB64(src)
          if (b64) return json({ image: b64, q })
        }
      }
      return json({ error: 'no-image' })
    }

    if (body.mode === 'image') {
      const desc = String(body.prompt || '').slice(0, 300).trim()
      const topic = String(body.topic || '').slice(0, 100).trim()
      // 1) lag en grundig, detaljert engelsk bilde-prompt
      let prompt = desc || 'a nice, relevant illustration'
      try {
        const p = await ask(key, SYS_IMG_PROMPT, `Tema: ${topic || '(ukjent)'}\nBeskrivelse: ${desc || '(ingen)'}`)
        if (p?.prompt && typeof p.prompt === 'string' && p.prompt.trim()) prompt = p.prompt.trim().slice(0, 950)
      } catch (_e) { /* bruker desc direkte */ }
      // 2) generer bildet – prøv GRATIS Pollinations først (ingen nøkkel/konto nødvendig)
      try {
        const seed = Math.floor(Math.random() * 1_000_000)
        const purl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`
        const b64 = await fetchAsB64(purl)
        if (b64) return json({ image: b64, src: 'pollinations' })
      } catch (_e) { /* faller videre til OpenAI */ }

      // 3) fallback: OpenAI-modeller (hvis kontoen har tilgang)
      const models = ['gpt-image-1', 'dall-e-3', 'dall-e-2']
      let lastErr = 'Klarte ikke å lage bildet akkurat nå – prøv igjen.'
      for (const model of models) {
        try {
          const res = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, prompt, n: 1, size: '1024x1024' }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) { lastErr = data?.error?.message || JSON.stringify(data).slice(0, 200); continue }
          const d0 = data?.data?.[0] || {}
          if (d0.b64_json) return json({ image: d0.b64_json, model })
          if (d0.url) { const b64 = await fetchAsB64(d0.url); if (b64) return json({ image: b64, model }) }
        } catch (e) { lastErr = String(e) }
      }
      return json({ error: lastErr })
    }

    if (body.mode === 'edit') {
      const parsed = await ask(key, sysEdit(amount), `Dagens lysbilder:\n${body.current || ''}\n\nInstruksjon: ${body.instruction || ''}`)
      return json({ title: parsed.title || '', theme: parsed.theme || {}, slides: parsed.slides || [] })
    }

    // standard: generate
    const count = Math.max(3, Math.min(20, Number(body.count) || 7))
    const userMsg = `Tittel (kan være tom): ${body.title || ''}
Visuelt ønske: ${body.visualStyle || '(velg selv noe som passer)'}
Antall lysbilder: ${count}

Manus eller stikkord:
${body.manuscript || ''}`
    const parsed = await ask(key, sysGenerate(count, amount), userMsg)
    return json({ title: parsed.title || '', theme: parsed.theme || {}, slides: parsed.slides || [] })
  } catch (err) {
    if (_rUid && _rN > 0) { try { const t2 = await tokenAuth(req); await setTokens(_rUrl, _rSrv, _rUid, (t2.tokens ?? 0) + _rN) } catch (_e) { /* ignore */ } }
    return json({ error: String(err) })
  }
})
