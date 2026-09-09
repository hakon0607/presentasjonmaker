import BackButton from '../components/BackButton'

const MAIL = 'hakon.solvik@hotmail.com'

const TERMS = {
  title: 'Vilkår for bruk',
  updated: 'Sist oppdatert: 2026',
  sections: [
    ['1. Om tjenesten', 'AiPresent er en nettbasert tjeneste som bruker kunstig intelligens til å lage presentasjoner. Ved å bruke tjenesten godtar du disse vilkårene.'],
    ['2. Konto', 'Du må registrere en konto med en gyldig e-postadresse for å bruke tjenesten. Du er selv ansvarlig for å holde passordet ditt hemmelig og for aktivitet på kontoen din. Er du under 15 år, må du ha samtykke fra en forelder eller foresatt.'],
    ['3. Abonnement og betaling', 'Tjenesten har et gratis nivå og betalte abonnement (Pluss og Pro). Betaling skjer via Stripe. Abonnement fornyes automatisk hver periode til du sier det opp. Du kan når som helst si opp i appen, og beholder tilgangen ut den betalte perioden.'],
    ['4. Angrerett', 'Ved kjøp av digitale tjenester kan du ha angrerett i 14 dager. Tar du tjenesten i aktiv bruk i angreperioden, kan angreretten bortfalle. Du kan uansett når som helst si opp abonnementet.'],
    ['5. Riktig bruk', 'Du kan ikke bruke tjenesten til ulovlig innhold, til å krenke andres rettigheter, eller til å forsøke å omgå tekniske begrensninger. Vi kan stenge kontoer som bryter vilkårene.'],
    ['6. Ditt innhold', 'Du eier innholdet du lager i AiPresent. Du gir oss tillatelse til å lagre og behandle det som er nødvendig for å levere tjenesten (f.eks. lagre presentasjonene og bildene dine).'],
    ['7. Ansvar', 'Tjenesten leveres «som den er». AI-generert innhold kan inneholde feil – du er selv ansvarlig for å kontrollere innholdet før bruk. Vi er ikke ansvarlige for indirekte tap som følge av bruk av tjenesten.'],
    ['8. Endringer', 'Vi kan oppdatere vilkårene. Vesentlige endringer varsles i appen eller på e-post.'],
    ['9. Kontakt', `Spørsmål? Kontakt oss på ${MAIL}.`],
  ],
}

const PRIVACY = {
  title: 'Personvernerklæring',
  updated: 'Sist oppdatert: 2026',
  sections: [
    ['1. Hvem vi er', `AiPresent er behandlingsansvarlig for personopplysningene som samles inn gjennom tjenesten. Kontakt: ${MAIL}.`],
    ['2. Hva vi lagrer', 'Vi lagrer: e-postadresse og navn (for konto), presentasjonene og bildene du lager, og abonnement-status. Ved betaling behandler Stripe betalingsinformasjonen din – vi lagrer aldri kortnummeret ditt selv.'],
    ['3. Hvorfor', 'Vi bruker opplysningene for å levere tjenesten (lage og lagre presentasjoner), håndtere innlogging og abonnement, og for å kontakte deg om kontoen din.'],
    ['4. Hvem vi deler med (databehandlere)', 'Vi bruker betrodde tredjeparter for å drive tjenesten: Supabase (database og innlogging), OpenAI (AI-generering av tekst og bilder), Stripe (betaling), Vercel (hosting) og Resend (e-post). Disse behandler data på våre vegne.'],
    ['5. Lagringstid', 'Vi lagrer dataene dine så lenge du har en konto. Sletter du en presentasjon, fjernes den og tilhørende bilder. Sletter du kontoen, fjernes dataene dine.'],
    ['6. Dine rettigheter', 'Du har rett til innsyn i, retting av og sletting av dine personopplysninger. Ta kontakt på e-post, så hjelper vi deg.'],
    ['7. Informasjonskapsler', 'Vi bruker kun nødvendige informasjonskapsler for innlogging og for å huske innstillingene dine. Vi bruker ikke sporing til reklame.'],
    ['8. Kontakt', `Har du spørsmål om personvern? Kontakt ${MAIL}.`],
  ],
}

export default function Legal({ which }) {
  const doc = which === 'privacy' ? PRIVACY : TERMS
  return (
    <div className="legal-wrap">
      <BackButton />
      <h1>{doc.title}</h1>
      <p className="legal-updated">{doc.updated}</p>
      {doc.sections.map(([h, p], i) => (
        <section key={i} className="legal-sec">
          <h2>{h}</h2>
          <p>{p}</p>
        </section>
      ))}
      <p className="legal-note">Dette er en enkel standardtekst for å komme i gang. Før kommersiell lansering bør en voksen/juridisk kyndig se over den.</p>
    </div>
  )
}
