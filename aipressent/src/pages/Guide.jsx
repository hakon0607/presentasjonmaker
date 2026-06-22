import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, Sparkles, Image as ImageIcon, Wand2, Play, Download, Share2, CheckCircle2, FileText, Film, RotateCw, MousePointerClick, Minimize2, LayoutGrid, User, KeyRound, Palette } from 'lucide-react'

const STEPS = [
  { I: KeyRound, t: '1. Lag en konto', d: 'Trykk «Lag konto», skriv navn, e-post og passord. Du må skrive passordet to ganger, og kan trykke øyet 👁️ for å se det. Etter registrering får du en bekreftelses-e-post – husk å sjekke søppelpost/spam-mappen, for den havner ofte der!' },
  { I: Wand2, t: '2. Lag alt med AI på sekunder', d: 'Trykk «Lag med AI». Fyll inn tittel, manus eller stikkord, og hvordan det skal se ut (f.eks. «lekent og fargerikt» eller «mørkt og stilig»). Alle feltene må fylles ut. AI skriver innholdet, velger farger, fonter og et design som matcher temaet, og legger automatisk på pynt, animasjon og manus – alt for 5 tokens.' },
  { I: ImageIcon, t: '3. Bilder – tre måter', d: 'Klikk et bildefelt og velg: «Søk på nett» (søk i millioner av gratis bilder), «Last opp fra PC» (ditt eget bilde), eller «Lag med AI» (beskriv det du vil ha). Med «Tilpass» velger du hvilken del av bildet som vises.' },
  { I: Film, t: '4. Animasjonspanelet', d: 'Trykk «Animasjon» i verktøylinja for å åpne det lille vinduet (du kan dra det rundt). Klikk et objekt på lysbildet og trykk «Legg til valgt». For hver animasjon velger du «Med forrige» (spiller samtidig) eller «Etter forrige» (i rekkefølge). Dra radene for å endre rekkefølgen, og trykk «Spill av» for å se det med en gang.' },
  { I: RotateCw, t: '5. Roter rett på lysbildet', d: 'Markér et objekt, så dukker det opp et lite rundt håndtak over det. Dra i håndtaket for å snurre objektet. Holder du inne Shift, hopper det i pene trinn på 15°.' },
  { I: MousePointerClick, t: '6. Klikk midt i teksten', d: 'Når du redigerer en tekst og klikker midt inni den, settes skrivemerket akkurat der du klikker – du slipper å flytte deg med piltastene.' },
  { I: Minimize2, t: '7. Enkel visning', d: 'Knappen helt til høyre i verktøylinja skrur på «enkel visning» og gjemmer de sjeldne knappene, så det blir ryddig. Trykk igjen for å få alle verktøyene tilbake. Du kan også dra i kanten av lysbilde-stripa til venstre for å gjøre den bredere.' },
  { I: LayoutGrid, t: '8. Pynt og tekst-kort kommer av seg selv', d: 'AI legger automatisk på figurer, geometrisk pynt og pene tekst-kort som passer temaet og fargene – du trenger ikke gjøre noe selv. To ulike tema får helt forskjellig utseende.' },
  { I: Sparkles, t: '9. Finpuss selv', d: 'Bruk verktøylinja til å legge til tekst, figurer (sirkel, pil, stjerne, hjerte …), tabeller og stickers. Dra ting rundt – hjelpelinjer hjelper deg å midtstille. Du kan kopiere lysbilder, endre rekkefølge ved å dra dem, og angre med Ctrl+Z. Alt lagres automatisk.' },
  { I: Wand2, t: '10. Endre ett lysbilde med AI', d: 'Knappen «AI-lysbilde» lar AI lage eller skrive om akkurat DET ene lysbildet du står på. Den ser hva som står på lysbildet og hvor, så du kan be den flytte på ting eller legge til noe – f.eks. «gjør dette til tre korte punkter» eller «flytt bildet til venstre».' },
  { I: Palette, t: '11. Visuell AI og Font AI', d: 'Ved lysbildet finner du to tryllestaver: 🎨 Visuell AI endrer farger, tema, bakgrunn og kan flytte/lage elementer (teksten din holdes lik). 🔤 Font AI endrer bare skrifttypen. Begge har en bryter for «Alle lysbilder» eller «Bare denne». Be om akkurat det du vil, f.eks. «roligere farge på overskriftene» eller «Arial-font».' },
  { I: FileText, t: '12. Manus til deg selv', d: 'AI skriver automatisk et manus (hva du skal si) til hvert lysbilde. Du ser det i feltet under lysbildet, det vises i presentasjons-modus, og følger med i PowerPoint-eksporten.' },
  { I: CheckCircle2, t: '13. Sjekk kvaliteten', d: 'Trykk «Sjekk», så ser AI over presentasjonen og gir vennlige tips: svarer den på temaet, er det god variasjon, henger den sammen?' },
  { I: Play, t: '14. Presentér', d: 'Trykk «Presenter» for fullskjerm med myke overganger og animasjonene som spiller av. Trykk «N» for å se manuset ditt mens du presenterer.' },
  { I: Download, t: '15. Eksporter', d: 'Last ned som PowerPoint eller PDF, eller åpne rett i Google Slides. Pynten og fargene følger med.' },
  { I: Share2, t: '16. Del – se eller redigere', d: 'Trykk «Del» og velg: «Bare se på» gir en lenke der andre kan se presentasjonen, mens «Kan redigere» gir en lenke der mottakeren får SIN EGEN kopi å redigere (din original røres ikke). Du kan også sende lenken rett på e-post.' },
  { I: User, t: '17. Profil & tokens', d: 'På «Profil» ser du navnet ditt, hvor mange presentasjoner du har laget, planen din og hvor mange tokens du har igjen til AI.' },
]

export default function Guide() {
  const { user } = useAuth()
  return (
    <div className="guide">
      <header className="land-nav">
        <Link className="logo-row" to="/"><span className="logo-mark">◆</span> AiPresent</Link>
        <nav className="land-links">
          {user ? <Link className="btn primary sm" to="/mine">Mine presentasjoner</Link>
            : <Link className="btn primary sm" to="/signup">Lag konto</Link>}
        </nav>
      </header>

      <div className="guide-body">
        <Link className="guide-back" to="/"><ChevronLeft size={16} /> Tilbake til forsiden</Link>
        <h1>Slik bruker du AiPresent</h1>
        <p className="muted">En enkel steg-for-steg-guide fra tom side til ferdig presentasjon.</p>

        <div className="guide-tour-cta">
          <div>
            <b>Vil du heller bli vist rundt i appen?</b>
            <span className="muted small">En interaktiv omvisning peker på hver knapp og forklarer hva den gjør.</span>
          </div>
          <Link className="btn primary" to={user ? '/mine?tour=1' : '/signup'}><Play size={16} /> Start omvisning</Link>
        </div>

        <ol className="guide-steps">
          {STEPS.map((s, i) => (
            <li className="guide-step" key={i}>
              <div className="guide-step-num">{i + 1}</div>
              <div className="guide-step-ic"><s.I size={20} /></div>
              <div className="guide-step-text">
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="guide-cta">
          <h2>Klar til å prøve?</h2>
          <Link className="btn primary big" to={user ? '/mine' : '/signup'}>{user ? 'Åpne appen →' : 'Kom i gang gratis →'}</Link>
        </div>
      </div>
    </div>
  )
}
