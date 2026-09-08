// Edge Function (slug: smart-task)
// Modus: generate (standard), edit, theme, notes, slide, review, image, rewrite. Krever OPENAI_API_KEY.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

const FONTS = 'Inter, Poppins, Montserrat, Nunito, Quicksand, Work Sans, Raleway, Rubik, Manrope, DM Sans, Outfit, Sora, Plus Jakarta Sans, Figtree, Barlow, Cabin, Mulish, Karla, Space Grotesk (rene sans); Playfair Display, Lora, DM Serif Display, Abril Fatface, Merriweather, PT Serif, Cormorant Garamond, EB Garamond, Libre Baskerville, Bitter, Spectral, Frank Ruhl Libre (serif/elegant); Bebas Neue, Anton, Oswald, Archivo Black, Bangers, Righteous, Fjalla One, Staatliches, Teko, Alfa Slab One, Titan One, Bungee, Passion One, Russo One, Luckiest Guy, Shrikhand, Bowlby One SC, Chewy (KRAFTIGE plakat/display); Caveat, Pacifico, Lobster, Dancing Script, Satisfy, Great Vibes, Sacramento, Kaushan Script, Permanent Marker, Shadows Into Light, Indie Flower, Patrick Hand, Amatic SC, Courgette (håndskrift/skript); Roboto Mono, JetBrains Mono, IBM Plex Mono (teknisk/mono); Fredoka, Baloo 2 (runde/lekne)'

const THEME_RULES = `Lag et fargetema som passer ønsket. Felt "theme" er et objekt:
{"name":"kort navn","bg":"#hex","title":"#hex","text":"#hex","accent":"#hex","fontHead":"<font>","fontBody":"<font>","decor":"confetti|blobs|botanical|none"}
- fontHead og fontBody MÅ velges fra denne lista: ${FONTS}.
- VELG FONT SOM PASSER STEMNINGEN: kraftige plakat-fonter (Bebas Neue, Anton, Archivo Black, Bangers) til sterke/dramatiske/sporty/historiske tema; elegant serif (Playfair Display, DM Serif Display, Abril Fatface) til seriøst/luksus; runde/lekne (Fredoka, Baloo 2, Righteous) til mat/barn; håndskrift (Caveat, Pacifico) til kreativt/personlig.
- Sørg for GOD KONTRAST: title og text må være lett lesbare mot bg.
- decor: "confetti|blobs|botanical|none" (brukes ikke alltid – appen legger på et eget mykt design).`

const SCHEMA = `Hvert lysbilde har "layout" (cover, section, bullets, statement, imageText, imageFull, twoColumn):
- cover: {"layout":"cover","title":"...","subtitle":"..."}
- section: {"layout":"section","title":"..."}
- bullets: {"layout":"bullets","title":"...","bullets":["..."]}
- statement: {"layout":"statement","statement":"...","subtitle":"..."}
- imageText: {"layout":"imageText","title":"...","bullets":["..."],"image":{"caption":"Hva bildet skal vise"}}
- imageFull: {"layout":"imageFull","title":"...","image":{"caption":"Hva bildet skal vise"}}
- twoColumn: {"layout":"twoColumn","title":"...","columns":[{"heading":"...","bullets":["..."]},{"heading":"...","bullets":["..."]}]}
I tillegg KAN hvert lysbilde ha "notes" (manus), "figure" (engelsk søkeord for et ikon) og "style". IKKE bruk emojis noe sted i teksten.`

function amountRule(a: string) {
  if (a === 'short') return 'Innholdet skal være KORTE stikkord (maks ~5 ord per punkt), men variér likevel formuleringene fra punkt til punkt.'
  if (a === 'long') return 'Innholdet skal være hele, forklarende setninger – variér setningslengde og rytme, og bland gjerne inn et kort, slående poeng innimellom.'
  return 'Variér tekstlengden tydelig – bland korte stikkord, hele setninger og små avsnitt slik at det føles levende og menneskelig.'
}

// Skriveråd som gjør AI-teksten variert og menneskelig (ikke bare punktlister).
const VARIATION_RULE = `SKRIV VARIERT OG MENNESKELIG: ikke bruk samme mønster på hvert lysbilde. Bland korte stikkord, hele setninger og korte avsnitt. Variér setningslengde, rytme og åpning (noen punkter starter med et verb, andre med et tall, et spørsmål eller en kontrast). Unngå at alle punktene høres like ut. Bruk et naturlig, levende norsk – som en god lærer eller forteller, ikke en oppramsing. Ingen emojis.`

const SIL_LIST = `plane(fly/reise), jet(krig/jagerfly), tank(krig), soldier(krig/historie), medal(seier/historie), flag(land/historie), mountains(natur/fjell), tree(natur/skog), cloud(vær/himmel), sun(sol/sommer/varme), wave(hav/vann), leaf(natur/miljø/klima), burger-top(mat), fries(mat), drink(mat/drikke), book(skole/lesing/litteratur), pencil(skole/skriving/kunst), bulb(idé/oppfinnelse/læring), graduate(skole/eksamen/utdanning), rocket(rom/oppstart/fart), planet(rom/verdensrom/astronomi), astronaut(rom), star4(stjerne/glimt/mål), person(folk/menneske/samfunn), bird(dyr/natur/frihet), cat(dyr/kjæledyr), heart(kjærlighet/helse/følelser), ball(sport/fotball/lek), lightning(energi/elektrisitet/fart), compass(reise/retning/oppdagelse), pin(sted/geografi/kart), suitcase(reise/ferie)`

function sysGenerate(count: number, amount: string) {
  return `Du lager VISUELT FINE og VARIERTE presentasjoner på norsk.
Du får manus ELLER bare stikkord/tema. Er det kort, TOLK og bygg ut innholdet selv.
Svar KUN med gyldig JSON: {"title":"...","theme":{...},"slides":[ ... ]}
${SCHEMA}
${THEME_RULES}
Regler for lysbilder:
- Lag NØYAKTIG ${count} lysbilder. FØRSTE = "cover" (forside). SISTE = oppsummering ("statement" eller "bullets").
- Variér layoutene. Bruk imageText/imageFull der bilde passer, med tydelig norsk caption. Maks 5 punkter per liste. INGEN emojis.
- ${amountRule(amount)}
- ${VARIATION_RULE}
- VELG TEMA SOM ROPER UT INNHOLDET: farger, fonter og pynt skal matche emnet (mørkt/dempet for krig og alvor, varmt og lekent for mat og barn, friskt grønt for natur, osv.).
- VELG ÉN design-stil for HELE presentasjonen og sett samme "style" på HVERT lysbilde, fra denne lista (velg den som passer stemningen best – varier mellom presentasjoner):
  corners, bubbles, memphis, rings, dots, wave, frame, triangles, grid, stripes, arch, confetti2, bigblob, diagonal, brackets, halfTop, sidebar, topband, pluses, squares, sprinkles, wedge, orbit, ribbon
  (rene/moderne: corners, frame, brackets, sidebar, topband; lekne/energiske: bubbles, memphis, confetti2, sprinkles, pluses, squares; elegante: rings, arch, orbit, ribbon; dynamiske: triangles, wedge, diagonal, stripes; myke/organiske: wave, bigblob, halfTop; strukturerte: grid, dots)
- Gi HVERT lysbilde et "notes"-felt: 2-3 naturlige norske setninger med manus – hva presentøren skal SI (utdyp og bind sammen, ikke bare gjenta punktene).
- Gi HVERT lysbilde sitt EGET "figure"-felt = ETT enkelt ENGELSK søkeord for et ikon/figur som passer akkurat DETTE lysbildets innhold (f.eks. "fighter jet", "hamburger", "volcano", "atom", "castle", "heart", "soccer ball", "money", "brain"). Sett ALLTID et figure-søkeord på SÅ GODT SOM ALLE lysbildene (også forside og seksjoner) – velg det mest relevante. Bare utelat det hvis det er helt umulig å finne noe passende.
Ikke skriv noe annet enn JSON.`
}

function sysEdit(amount: string) {
  return `Du redigerer en presentasjon på norsk ut fra en oppsummering + instruksjon.
Svar KUN med gyldig JSON: {"title":"...","theme":{...},"slides":[ ... ]}
${SCHEMA}
${THEME_RULES}
Behold forside først og oppsummering sist. ${amountRule(amount)} ${VARIATION_RULE} Ikke skriv noe annet enn JSON.`
}

function sysSlide(amount: string) {
  return `Du lager ÉTT lysbilde på norsk ut fra dagens innhold + en instruksjon. Svar KUN med gyldig JSON: {"slide":{...}} der slide er ETT lysbilde-objekt.
${SCHEMA}
Hvis du får en beskrivelse av hvordan lysbildet ser ut nå (elementer og plassering), BRUK den: be brukeren om å flytte ting, legge til eller fjerne noe → ta utgangspunkt i det som finnes og behold det som ikke skal endres. Velg en "layout" som passer ønsket (f.eks. imageText hvis det skal være bilde ved siden av tekst, twoColumn for to kolonner). Beholder du eksisterende tekst, gjengi den nøyaktig.
${amountRule(amount)} Ikke skriv noe annet enn JSON.`
}

// Skriv om ÉN tekstboks etter brukerens instruksjon. Beholder mening, bytter form.
const SYS_REWRITE = `Du skriver om ÉN enkelt tekst på norsk (bokmål) etter brukerens instruksjon.
Du får DAGENS TEKST og en INSTRUKSJON (f.eks. «gjør den kortere», «mer formell», «som et spørsmål», «enklere språk», «mer levende»).
Svar KUN med gyldig JSON: {"text":"<den omskrevne teksten>"}
REGLER:
- Behold KJERNEBETYDNINGEN i teksten, men endre formen slik instruksjonen ber om.
- Behold samme SPRÅK (norsk) og omtrent samme format: er det en punktliste (flere linjer), skriv tilbake en punktliste med linjeskift mellom punktene; er det én setning, svar med én setning.
- Ikke legg til overskrifter, anførselstegn, nummerering eller forklaringer rundt teksten. Bare selve teksten.
- INGEN emojis. Hold lengden naturlig – ikke gjør en kort tekst kjempelang uten grunn.
Ikke skriv noe annet enn JSON.`

const SYS_DESIGN = `Du er en design-AI som lager fargetema for en presentasjon. Du far NAVAERENDE TEMA og ett eller flere onsker (tema-stemning, farger, evt. tekstfarge). Svar KUN med gyldig JSON: {"theme":{...}} med HELE tema-objektet.

Felt: {"name","bg":"#hex","title":"#hex","text":"#hex","accent":"#hex","fontHead","fontBody","style"}

REGLER:
- Endre BARE det onskene gjelder. Felt som ikke nevnes beholdes NOYAKTIG som i navaerende tema (samme verdi). Ikke ror fontHead/fontBody med mindre brukeren ber om det.
- FELT-BETYDNING (ikke bland): "title"=farge pa OVERSKRIFTER, "text"=farge pa BRODTEKST, "bg"=BAKGRUNN, "accent"=detalj/pynt. Plasser farger i riktig felt ut fra ordet de star ved ("X overskrift"=title, "X tekst/skrift"=text, "X bakgrunn"=bg).
- Oversett fargenavn til hex: bla=#2563eb, lyseblaa=#93c5fd, morkeblaa=#1e3a8a, gronn=#16a34a, hvit=#ffffff, rod=#dc2626, gul=#facc15, lilla=#7c3aed, rosa=#ec4899, oransje=#f97316, svart=#111111, graa=#6b7280, beige=#efe7d3, krem=#fdf6e3, brun=#92400e, gull=#d4af37, turkis=#14b8a6.
- TEKSTFARGE: Hvis brukeren IKKE har gitt eget tekstfarge-onske, velg title- og text-farger som er LETT LESBARE mot bg (mork tekst pa lys bg, lys tekst pa mork bg). Hvis brukeren HAR gitt tekstfarge-onske, folg det selv om kontrasten blir lav.
- Hvis brukeren ber om en stemning ("morkt og elegant", "lekent"), velg en hel, harmonisk palett (bg/title/text/accent) som passer. Du kan ogsa sette "style" til en passende verdi: corners, bubbles, memphis, rings, dots, wave, frame, triangles, grid, stripes, arch, confetti2, bigblob, diagonal, brackets, halfTop, sidebar, topband, pluses, squares, sprinkles, wedge, orbit, ribbon.
- Sorg ALLTID for at title og text ikke er lik bg (aldri usynlig tekst), med mindre brukeren eksplisitt ba om det.`

const SYS_EDITSLIDE = `Du er en presis redigerer for et presentasjons-lysbilde. Du får NÅVÆRENDE TEMA, en liste ELEMENTER (hver har "id", "type" (text/image/shape/table), x/y, w/h, og egenskaper som text, fontSize, color, align, bold, fit), og en forespørsel fra brukeren. Lerretet er 960 bredt og 540 høyt.

Svar KUN med gyldig JSON. Du kan returnere både element-endringer OG tema-endringer i samme svar:
{"changes":[{"id":"<id>", ...kun felt som endres...}], "theme":{...fullt tema KUN hvis tema/farge/font endres...} eller null, "scope":"slide" eller "all"}

GJØR NØYAKTIG DET BRUKEREN BER OM, OG BARE DET:

A) FLYTTE / BYTTE / STØRRELSE (bruk "changes"):
- Endre x, y, w, h, fontSize, align ("left|center|right"), bold/italic.
- "Bytt plass på bildet og teksten" = bytt x/y (og gjerne w/h) mellom bilde- og tekst-elementet.
- "Flytt X opp/ned/til siden" = juster x/y. "Større/mindre" = juster w/h (+fontSize for tekst).
- Bruk KUN id-ene du fikk. Ikke endre teksten (innholdet) med mindre brukeren ber om det.
- Alt må holde seg innenfor lerretet (x≥0, y≥0, x+w≤960, y+h≤540) og IKKE overlappe stygt.

B) FARGE / FONT / TEMA / STIL (bruk "theme" – returner HELE tema-objektet):
- Felt: {"name","bg":"#hex","title":"#hex","text":"#hex","accent":"#hex","fontHead","fontBody","style"}
- Overskrift/tittel-farge = "title", brødtekst = "text", bakgrunn = "bg", aksent = "accent".
- Oversett fargenavn til #hex (blå=#2563eb, grønn=#16a34a, hvit=#ffffff, rød=#dc2626, gul=#facc15, lilla=#7c3aed, rosa=#ec4899, oransje=#f97316, svart=#0a0a0a, grå=#6b7280).
- Font: bruk akkurat den fonten brukeren skriver (også Arial, Times New Roman osv. – ikke begrenset til en liste). Sett fontHead og/eller fontBody.
- Behold alle tema-felt brukeren IKKE nevner nøyaktig som i nåværende tema.
- "style" (valgfritt) = en av: corners, bubbles, memphis, rings, dots, wave, frame, triangles, grid, stripes, arch, confetti2, bigblob, diagonal, brackets, halfTop, sidebar, topband, pluses, squares, sprinkles, wedge, orbit, ribbon.
- "scope": "all" hvis tema-endringen tydelig gjelder HELE presentasjonen (standard for farge/font), "slide" hvis brukeren sier "dette lysbildet"/"denne siden".

VIKTIG:
- Ber brukeren bare om flytting → sett "theme": null.
- Ber brukeren bare om farge/font → returner "theme" og tom "changes": [].
- Ber brukeren om begge deler → returner begge.
- Ikke endre noe brukeren ikke nevner. Finner du ingenting å gjøre: {"changes":[],"theme":null}.`

const SYS_THEME = `Du er en PRESIS tema-redigerer for en presentasjon. Du får et NÅVÆRENDE tema og en forespørsel fra brukeren. Svar KUN med gyldig JSON: {"theme":{...}} som inneholder HELE tema-objektet.

VIKTIGSTE REGEL: Endre KUN det brukeren faktisk ber om. Alle andre felt skal være NØYAKTIG som i det nåværende temaet.
- Ber brukeren om en spesifikk farge på et bestemt element, sett akkurat den fargen på riktig felt: overskrift/tittel = "title", brødtekst = "text", bakgrunn = "bg", aksent/detaljfarge = "accent". Oversett fargenavn til #hex (f.eks. blå=#2563eb, grønn=#16a34a, hvit=#ffffff, rød=#dc2626, gul=#facc15, lilla=#7c3aed, rosa=#ec4899, oransje=#f97316, svart=#0a0a0a, grå=#6b7280).
- Ber brukeren om en bestemt FONT (f.eks. "Arial", "Times New Roman", "Comic Sans"), bruk akkurat den fonten i fontHead OG fontBody – du er IKKE begrenset til en liste, bruk det brukeren skriver.
- Ber brukeren bare om en stemning/tema (f.eks. "lekent", "elegant", "mørkere"), velg da farger/font/style som passer – men endre fortsatt bare det som er relevant.
- Nevner brukeren ikke et felt, IKKE endre det.

Felt i "theme": {"name":"kort navn","bg":"#hex","title":"#hex","text":"#hex","accent":"#hex","fontHead":"<font>","fontBody":"<font>","style":"<stil>"}
- Sørg for at title og text er lesbare mot bg (hvis brukeren ber om farger som gir dårlig kontrast, følg brukeren likevel – de bestemmer).
- "style" = ÉN design-stil: corners, bubbles, memphis, rings, dots, wave, frame, triangles, grid, stripes, arch, confetti2, bigblob, diagonal, brackets, halfTop, sidebar, topband, pluses, squares, sprinkles, wedge, orbit, ribbon. Behold nåværende style hvis brukeren ikke ber om endret stil/stemning; ellers velg en som passer.

I TILLEGG: hvis brukeren ber om en TEKST-endring som ikke er en tema-farge (f.eks. større/mindre tekst, fet/kursiv, midtstilt/venstrejustert), legg det i et eget "tweaks"-objekt. Bare ta med feltene brukeren faktisk ber om:
{"tweaks":{"scaleHeadings":1.2, "scaleBody":1.0, "boldHeadings":true, "italicBody":false, "align":"center|left|right", "applyTo":"headings|body|all"}}
- scaleHeadings/scaleBody = ganger tekststørrelsen (1.2 = 20% større, 0.8 = mindre). Bruk bare hvis brukeren ber om størrelse.
- Hvis brukeren IKKE ber om noen tekst-endring, IKKE ta med "tweaks" i det hele tatt (eller sett den til null).`

function sysNotes(amount: string) {
  const len = amount === 'short' ? 'ÉN kort, naturlig setning' : amount === 'long' ? '4-6 utfyllende setninger med detaljer og overganger' : '2-4 naturlige setninger'
  return `Du skriver manus/talenotater på norsk til en presentasjon.
Du får en nummerert liste over lysbildene. Skriv ${len} om hva presentøren skal SI til hvert lysbilde (ikke bare gjenta punktene – utdyp og bind sammen).
Svar KUN med gyldig JSON: {"notes":["manus til lysbilde 1","manus til lysbilde 2", ...]} med nøyaktig like mange elementer som det er lysbilder, i samme rekkefølge.`
}
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

function sysQuiz(n: number, diff: string) {
  return `Du lager en quiz på norsk (bokmål). Svar KUN med gyldig JSON:
{"questions":[{"q":"spørsmål?","options":["a","b","c","d"],"correct":0,"explain":"kort forklaring"}]}
Regler:
- Lag NØYAKTIG ${n} spørsmål om temaet/innholdet.
- Hvert spørsmål har PRESIS 4 svaralternativer. "correct" = indeksen (0-3) til det riktige.
- Vanskelighetsgrad: ${diff}.
- Varier spørsmålene, ikke gjenta deg. Hold alternativene korte. Kun ÉN klart riktig svar per spørsmål.
- Plasser det riktige svaret på tilfeldig posisjon (ikke alltid samme).
- "explain" = 1 kort setning som forklarer hvorfor svaret er riktig.
Ikke skriv noe annet enn JSON.`
}

// Wikimedia Commons – liste med forslag (thumb + tittel)
async function searchCommonsList(q: string): Promise<any[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`
    const r = await fetch(url, { headers: { 'User-Agent': 'AiPresent/1.0 (skoleprosjekt)' } })
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
    const r = await fetch(url, { headers: { 'User-Agent': 'AiPresent/1.0 (skoleprosjekt)' } })
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

// Openverse – stort gratis bildebibliotek (Flickr, museer m.m.), ingen nøkkel
async function searchOpenverseList(q: string): Promise<any[]> {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=24&mature=false`
    const r = await fetch(url, { headers: { 'User-Agent': 'AiPresent/1.0 (skoleprosjekt)' } })
    if (!r.ok) return []
    const d = await r.json().catch(() => ({}))
    const res = Array.isArray(d?.results) ? d.results : []
    return res
      .filter((x: any) => x && (x.thumbnail || x.url))
      .map((x: any) => ({ url: x.thumbnail || x.url, title: String(x.title || '').slice(0, 60) }))
  } catch (_e) { return [] }
}
async function searchOpenverse(q: string): Promise<string[]> {
  const list = await searchOpenverseList(q)
  return list.map((x) => x.url).filter(Boolean)
}

// Henter en bilde-URL og gjør den om til base64 (eller null hvis den ikke duger)
async function fetchAsB64(src: string): Promise<string | null> {
  try {
    const img = await fetch(src, { headers: { 'User-Agent': 'AiPresent/1.0' } })
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
const COST: Record<string, number> = { generate: 5, edit: 2, slide: 1, review: 1, notes: 1, theme: 1, animate: 1, quiz: 3, rewrite: 1 }

type Tok = { configured: boolean; uid?: string | null; tokens?: number; unlimited?: boolean; url?: string; srv?: string; plan?: string; admin?: boolean; daily?: number }

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
    const pres = await fetch(`${url}/rest/v1/profiles?id=eq.${uid}&select=tokens,tokens_unlimited,tokens_day,tokens_daily,plan,is_admin`, { headers: h })
    const rows = pres.ok ? await pres.json() : []
    const row = rows?.[0]
    if (!row) return { configured: true, uid, tokens: FIRST_GRANT, unlimited: false, url, srv, plan: 'gratis', admin: false }
    const today = new Date().toISOString().slice(0, 10)
    let tokens = Number(row.tokens ?? FIRST_GRANT)
    const unlimited = !!row.tokens_unlimited
    const daily = Number(row.tokens_daily ?? DAILY_CAP)   // daglig kvote etter abonnement-nivå
    if (row.tokens_day !== today) {
      tokens = Math.max(tokens, daily)
      await fetch(`${url}/rest/v1/profiles?id=eq.${uid}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ tokens, tokens_day: today }) })
    }
    return { configured: true, uid, tokens, unlimited, url, srv, plan: row.plan || 'gratis', admin: !!row.is_admin, daily }
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
          from: `AiPresent <${user}>`,
          to: String(to),
          subject: `Presentasjon: ${title || 'AiPresent'}`,
          content: `Hei!\n\nHer er en presentasjon laget i AiPresent:\n${link}\n\nÅpne lenken i nettleseren for å se den.\n\nHilsen AiPresent`,
          html: `<p>Hei!</p><p>Her er en presentasjon laget i <b>AiPresent</b>:</p><p><a href="${link}">${title || link}</a></p><p style="color:#888;font-size:13px">Åpne lenken i nettleseren for å se den.</p>`,
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
      return json({ tokens: t.unlimited ? null : (t.tokens ?? FIRST_GRANT), unlimited: !!t.unlimited, cap: t.daily ?? DAILY_CAP, first: FIRST_GRANT, cost: COST, plan: t.plan ?? 'gratis', admin: !!t.admin })
    }

    // Pixabay – ekte foto etter søkeord. Krever PIXABAY_KEY som Secret. Gratis, ingen tokens, ingen OpenAI.
    if (body.mode === 'pixabay') {
      const pkey = Deno.env.get('PIXABAY_KEY')
      if (!pkey) return json({ error: 'Pixabay er ikke satt opp: legg til PIXABAY_KEY som Secret på smart-task.' })
      const q = String(body.query || body.prompt || body.topic || '').slice(0, 100).trim()
      if (!q) return json({ error: 'Mangler søkeord.' })
      try {
        const url = `https://pixabay.com/api/?key=${pkey}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=24&min_width=1200`
        const r = await fetch(url)
        if (!r.ok) return json({ error: 'Pixabay-feil: ' + r.status })
        const d = await r.json().catch(() => ({}))
        const hits = Array.isArray(d?.hits) ? d.hits : []
        for (const h of hits) {
          const src = h.webformatURL || h.largeImageURL || h.fullHDURL
          if (!src) continue
          const b64 = await fetchAsB64(src)
          if (b64) return json({ image: b64, credit: h.user || '' })
        }
        return json({ error: 'Fant ingen bilder for «' + q + '».' })
      } catch (e) { return json({ error: 'Pixabay feilet: ' + String((e as Error)?.message || e).slice(0, 150) }) }
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

    if (body.mode === 'design') {
      const cur = body.theme && typeof body.theme === 'object' ? JSON.stringify(body.theme) : 'ingen'
      const colorWish = (body.colors || '').trim()
      const themeWish = (body.themeWish || '').trim()
      const textWish = (body.textColor || '').trim()
      const parts = []
      if (themeWish) parts.push(`TEMA-ONSKE (stemning/stil): ${themeWish}`)
      if (colorWish) parts.push(`FARGE-ONSKE: ${colorWish}`)
      if (textWish) parts.push(`TEKSTFARGE-ONSKE: ${textWish}`)
      const userMsg = `NAVAERENDE TEMA (JSON): ${cur}\n\n${parts.join('\n')}\n\nLag det FULLE tema-objektet. Endre BARE det onskene gjelder; behold alt annet fra navaerende tema. Hvis TEKSTFARGE-ONSKE er tomt, velg title- og text-farger som er lett lesbare mot bakgrunnen.`
      const parsed = await ask(key, SYS_DESIGN, userMsg)
      return json({ theme: parsed.theme || null })
    }

    if (body.mode === 'editslide') {
      const els = Array.isArray(body.elements) ? body.elements : []
      const cur = body.theme && typeof body.theme === 'object' ? JSON.stringify(body.theme) : 'ingen'
      const userMsg = `LERRETET er 960 bredt og 540 høyt (x=0 venstre, y=0 topp).\n\nNÅVÆRENDE TEMA (JSON): ${cur}\n\nELEMENTER på lysbildet du ser på (JSON):\n${JSON.stringify(els)}\n\nBRUKEREN BER OM: ${body.instruction || 'gjør det penere'}\n\nGjør NØYAKTIG det brukeren ber om. Endre KUN det som trengs. Pass på at ting holder seg innenfor lerretet og ikke overlapper stygt.`
      const parsed = await ask(key, SYS_EDITSLIDE, userMsg)
      return json({ changes: Array.isArray(parsed.changes) ? parsed.changes : [], theme: parsed.theme || null, scope: parsed.scope === 'all' ? 'all' : 'slide' })
    }

    if (body.mode === 'theme') {
      const cur = body.current && typeof body.current === 'object' ? JSON.stringify(body.current) : 'ingen'
      const userMsg = `NÅVÆRENDE TEMA (JSON): ${cur}\n\nBRUKEREN BER OM: ${body.visualStyle || 'noe pent og passende'}\n\nEndre KUN det brukeren faktisk ber om. Behold alt annet. Returner det FULLE tema-objektet, og legg til "tweaks" KUN for det brukeren ber om av tekst-endringer.`
      const parsed = await ask(key, SYS_THEME, userMsg)
      return json({ theme: parsed.theme || {}, tweaks: parsed.tweaks || null })
    }

    if (body.mode === 'notes') {
      const parsed = await ask(key, sysNotes(body.amount || 'medium'), `Lysbilder:\n${body.current || ''}`)
      return json({ notes: Array.isArray(parsed.notes) ? parsed.notes : [] })
    }

    if (body.mode === 'slide') {
      const layoutTxt = body.layout ? `\n\nSLIK SER LYSBILDET UT NA (elementer og plassering, lerret 960x540):\n${body.layout}` : ''
      const parsed = await ask(key, sysSlide(amount), `Dagens innhold:\n${body.current || '(tomt)'}${layoutTxt}\n\nInstruksjon: ${body.instruction || 'lag et fint lysbilde'}`)
      return json({ slide: parsed.slide || parsed })
    }

    // Skriv om ÉN tekstboks (brukes av «Omskriv»-knappen på en markert tekst)
    if (body.mode === 'rewrite') {
      const cur = String(body.text || '').slice(0, 4000)
      if (!cur.trim()) return json({ error: 'Ingen tekst å skrive om.' })
      const instr = String(body.instruction || 'gjør den litt bedre').slice(0, 400)
      const topic = String(body.topic || '').slice(0, 120)
      const userMsg = `TEMA (kontekst): ${topic || '(ukjent)'}\n\nDAGENS TEKST:\n${cur}\n\nINSTRUKSJON: ${instr}\n\nSkriv om teksten etter instruksjonen og behold meningen. Svar KUN med {"text":"..."}.`
      const parsed = await ask(key, SYS_REWRITE, userMsg)
      const txt = typeof parsed.text === 'string' ? parsed.text : ''
      return json({ text: txt })
    }

    if (body.mode === 'review') {
      const parsed = await ask(key, SYS_REVIEW, `Tema: ${body.title || '(ukjent)'}\n\nLysbilder:\n${body.current || ''}`)
      return json({ feedback: parsed.feedback || '', tips: Array.isArray(parsed.tips) ? parsed.tips : [] })
    }

    if (body.mode === 'quiz') {
      const n = Math.max(3, Math.min(50, Number(body.count) || 10))
      const diff = body.difficulty || 'middels'
      const parsed = await ask(key, sysQuiz(n, diff), `Tema/innhold: ${body.topic || body.manuscript || 'allmennkunnskap'}`)
      const qs = (Array.isArray(parsed.questions) ? parsed.questions : [])
        .filter((q: any) => q && q.q && Array.isArray(q.options) && q.options.length >= 2)
        .map((q: any) => ({ q: String(q.q), options: q.options.slice(0, 4).map((o: any) => String(o)), correct: Math.max(0, Math.min(3, Number(q.correct) || 0)), explain: String(q.explain || '') }))
      return json({ questions: qs })
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
        const items = [...await searchCommonsList(q), ...await searchOpenverseList(q)]
        for (const it of items) {
          if (out.length >= 40) break
          if (seen.has(it.url)) continue
          seen.add(it.url); out.push(it)
        }
        if (out.length >= 40) break
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
        const urls = [...await searchCommons(q), ...await searchOpenverse(q)]
        for (const src of urls.slice(0, 10)) {
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
