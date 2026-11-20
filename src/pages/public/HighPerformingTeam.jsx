import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";
import { SEO_PAGINAS } from "../../content/seoPaginas";

// Pagina /high-performing-team, november 2026.
//
// De homepage opent sinds november met "Bouw aan een high performing team
// dat zelf blijft leren", maar de site had geen pagina die de zoekvraag zelf
// beantwoordt. Deze pagina doet dat: wat het is, kenmerken, fases, waarom
// teams het niet worden, wat het vraagt van de leidinggevende en hoe je
// begint. De homepage richt zich op begeleiding (ontwikkelen), deze pagina op
// de informatievraag (wat is het, kenmerken); zo concurreren ze niet.
//
// Grenzen: geen belofte dat een team high performing wordt, geen score of
// benchmark, prestatie niet losgezien van werkdruk en omstandigheden.

const SEO = SEO_PAGINAS.highPerformingTeam;

const kenmerken = [
  ["Een gedeeld doel", "Iedereen weet waar het team naartoe werkt en waarom. Prioriteiten zijn helder genoeg om ook nee te kunnen zeggen.", "var(--tk-color-blue)"],
  ["Psychologische veiligheid", "Mensen durven een vraag te stellen, een fout te melden en het oneens te zijn, zonder dat het hen iets kost.", "var(--tk-color-green)"],
  ["Duidelijke rollen en afspraken", "Wie beslist, wie voert uit en wie wordt geraadpleegd is helder. Afspraken worden nagekomen of bewust bijgesteld.", "var(--tk-color-teal)"],
  ["Elkaar aanspreken", "Teamleden spreken elkaar zelf aan op afspraken en gedrag. Dat hoeft niet via de leidinggevende.", "var(--tk-color-orange)"],
  ["Blijven leren", "Na een tegenvaller kijkt het team terug en past het zijn aanpak aan. Verbeteringen worden klein uitgeprobeerd en vastgehouden.", "var(--tk-color-purple)"],
  ["Gedeeld eigenaarschap", "Verantwoordelijkheid ligt niet bij een paar trekkers of bij de leidinggevende, maar bij het team als geheel.", "var(--tk-color-green)"],
];

const fases = [
  ["Forming", "Het team is nieuw of verandert. Mensen zijn beleefd, voorzichtig en kijken naar de leidinggevende voor richting."],
  ["Storming", "Verschillen komen boven: over aanpak, rollen en prioriteiten. Spanning is hier normaal en nodig."],
  ["Norming", "Het team maakt afspraken over hoe het samenwerkt. Er ontstaat vertrouwen en een gedeelde manier van werken."],
  ["Performing", "Het team regelt veel zelf, spreekt elkaar aan en levert consistent goed werk. De leidinggevende kan meer op afstand."],
];

const valkuilen = [
  ["Sterren in plaats van een team", "Een paar uitblinkers dragen het resultaat. Zodra een van hen uitvalt, valt het team terug."],
  ["Harmonie boven kwaliteit", "Het is gezellig en niemand wil de sfeer verstoren. Daardoor worden kritische vragen niet gesteld."],
  ["De leidinggevende trekt alles", "Problemen komen steeds terug bij de leidinggevende. Het team leert daardoor niet zelf oplossen."],
  ["Verbeteren zonder vasthouden", "Op een teamdag worden goede afspraken gemaakt, maar niemand komt erop terug."],
  ["Prestatie zonder voorwaarden", "Er wordt meer gevraagd terwijl werkdruk, bezetting of prioriteiten niet kloppen. Dat los je niet op met een andere houding."],
];

const leidinggevende = [
  "richting geven: waar werken we naartoe en wat ligt vast",
  "beslisruimte expliciet maken, zodat het team weet wat het zelf mag",
  "zelf om feedback vragen en laten zien wat je leert",
  "spanning bespreekbaar maken in plaats van haar weg te poetsen",
  "problemen niet steeds terugnemen, maar teruggeven met een vraag",
  "zorgen voor de voorwaarden: tijd, prioriteiten en duidelijke rollen",
];

const beginnen = [
  ["1. Maak een eerlijk beeld", "Hoe ervaren teamleden de samenwerking nu? Een teamscan of een paar goede gesprekken helpen om niet op aannames te sturen."],
  ["2. Kies één ontwikkeldoel", "Niet tien verbeterpunten, maar één doel dat het team zelf belangrijk vindt. Bijvoorbeeld: besluiten die we nemen, houden we ook vast."],
  ["3. Spreek één gedraging af", "Wat gaan we concreet anders doen? Klein genoeg om volgende week te beginnen, duidelijk genoeg om te zien of het gebeurt."],
  ["4. Kijk samen terug", "Na drie tot vier weken: wat merken we, wat houden we vast, wat passen we aan? Dat ritme is wat een team uiteindelijk sterk maakt."],
];

const faqs = [
  ["Wat is een high performing team?", "Een team dat consistent goed werk levert en zichzelf blijft verbeteren. Het onderscheidt zich niet door de talenten van losse mensen, maar door hoe het samenwerkt: een gedeeld doel, psychologische veiligheid, duidelijke afspraken, elkaar aanspreken en samen leren."],
  ["Wat zijn de kenmerken van een high performing team?", "Een gedeeld doel, psychologische veiligheid, duidelijke rollen en afspraken, elkaar aanspreken, blijven leren en gedeeld eigenaarschap. Die kenmerken versterken elkaar; één ervan ontbreekt zelden alleen."],
  ["Hoe lang duurt het om een high performing team te worden?", "Dat verschilt sterk per team en per situatie. Gewoontes veranderen in maanden, niet in een dag. Bovendien is het geen eindstation: na een reorganisatie, nieuwe collega's of een nieuwe leidinggevende valt elk team een stap terug."],
  ["Is een teamdag genoeg?", "Een teamdag kan het gesprek openen en een richting geven. Wat een team daarna in het dagelijks werk oefent en samen evalueert, bepaalt of er iets verandert."],
  ["Kun je meten of een team high performing is?", "Er bestaat geen eenduidige score. Je kunt wel volgen hoe teamleden de samenwerking ervaren, welk gedrag je ziet veranderen en of een afgesproken werkresultaat verbetert, zoals betere opvolging van besluiten of minder herstelwerk."],
];

export default function HighPerformingTeam() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: "High performing team: kenmerken en hoe je er een ontwikkelt", url: SEO.url, description: SEO.description, inLanguage: "nl-NL", publisher: { "@type": "Organization", name: "Mijn Teamkompas" } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", position: 2, name: "High performing team", item: SEO.url },
      ] },
      { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };

  return (
    <PageShell>
      <Helmet>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <link rel="canonical" href={SEO.url} />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={SEO.url} />
        <meta property="og:image" content={SEO.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Section className="tk-knowledge-hero tk-jdr-hero">
        <div className="tk-jdr-hero-inner">
          <div className="tk-jdr-hero-text">
            <Eyebrow withDot>Kennis · teamontwikkeling</Eyebrow>
            <h1 className="tk-heading-xl">High performing team: kenmerken en hoe je er een ontwikkelt</h1>
            <p className="tk-lead">Een high performing team levert consistent goed werk en blijft zichzelf verbeteren. Dat komt zelden door een paar uitblinkers. Het komt door hoe het team samenwerkt: wat het met elkaar afspreekt, hoe het met fouten en verschillen omgaat en hoeveel het zelf oppakt zonder dat de leidinggevende hoeft te trekken.</p>
            <div className="tk-actions">
              <ButtonLink href="/gratis-teamscan">Doe de gratis teamscan</ButtonLink>
              <ButtonLink href="/teamontwikkeling" variant="secondary">Zo begeleiden wij teams</ButtonLink>
            </div>
          </div>
          <img className="tk-jdr-hero-media" src="/teamkompas-workshop-hero.jpg" alt="Team in gesprek tijdens een begeleide sessie met een kompaswerkvorm" />
        </div>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Definitie</Eyebrow><h2 className="tk-heading-lg">Wat is een high performing team?</h2></div>
          <div className="tk-rich-text">
            <p><strong>Een high performing team is een team dat consistent goed resultaat levert en daarbij zelf blijft leren en bijsturen.</strong></p>
            <p>Het verschil met een goed team zit vaak niet in kennis of inzet. Het zit in de manier waarop het team omgaat met wat er misgaat. Een goed team lost problemen op. Een high performing team leert ervan, zodat hetzelfde probleem niet steeds terugkomt.</p>
            <p>Onderzoek van Google naar zijn eigen teams (Project Aristotle) wees psychologische veiligheid aan als belangrijkste factor voor teameffectiviteit, vóór de samenstelling van het team. Wie er in het team zit, bleek minder bepalend dan hoe mensen met elkaar omgaan. <a href="https://boommanagement.nl/artikel/wat-leren-7-stappen-van-googles-high-performance-teams/" rel="noopener noreferrer" target="_blank">Lees een samenvatting</a>.</p>
          </div>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading">
          <Eyebrow>Kenmerken</Eyebrow>
          <h2 className="tk-heading-lg">Zes kenmerken van een high performing team</h2>
          <p className="tk-lead">Ze versterken elkaar. Waar één ontbreekt, staan de andere vaak ook onder druk.</p>
        </div>
        <div className="tk-grid tk-grid-3">
          {kenmerken.map(([titel, tekst, kleur]) => <Card key={titel} accent={kleur}><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
        <p className="tk-note">Meer over twee van deze kenmerken lees je bij <a href="/psychologische-veiligheid">psychologische veiligheid</a> en <a href="/kennis/eigenaarschap-in-teams">eigenaarschap in teams</a>.</p>
      </Section>

      <Section>
        <div className="tk-section-heading">
          <Eyebrow>Fases</Eyebrow>
          <h2 className="tk-heading-lg">Van nieuw team naar performing</h2>
          <p className="tk-lead">Het bekende model van Tuckman beschrijft de fases die een team doorloopt. Performing is geen eindstation: bij een reorganisatie, nieuwe collega's of een nieuwe leidinggevende valt elk team een stap terug.</p>
        </div>
        <div className="tk-grid tk-grid-2">
          {fases.map(([titel, tekst]) => <Card key={titel} accent="var(--tk-color-blue)"><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading">
          <Eyebrow>Valkuilen</Eyebrow>
          <h2 className="tk-heading-lg">Waarom veel teams het niet worden</h2>
        </div>
        <div className="tk-grid tk-grid-3">
          {valkuilen.map(([titel, tekst]) => <Card key={titel} accent="var(--tk-color-orange)"><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
        <p className="tk-note">Over de tweede valkuil gaat het artikel <a href="/blog/waarom-aardige-teams-gevaarlijk-kunnen-zijn">waarom aardige teams gevaarlijk kunnen zijn</a>.</p>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Leiderschap</Eyebrow><h2 className="tk-heading-lg">Wat het vraagt van de leidinggevende</h2></div>
          <div className="tk-rich-text">
            <p>Een high performing team ontstaat niet doordat de leidinggevende harder trekt. Het ontstaat doordat de leidinggevende steeds meer bij het team kan leggen, binnen heldere kaders.</p>
            <ul>{leidinggevende.map((t) => <li key={t}>{t}</li>)}</ul>
            <p>Hierbij helpt <a href="/individuele-coaching">coaching voor leidinggevenden</a>.</p>
          </div>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading">
          <Eyebrow>Beginnen</Eyebrow>
          <h2 className="tk-heading-lg">Hoe je team ernaartoe werkt</h2>
          <p className="tk-lead">Geen groot programma, maar een vast ritme van kiezen, oefenen en terugkijken. Dat ritme is ook wat wij bedoelen met een team dat blijft leren.</p>
        </div>
        <div className="tk-grid tk-grid-2">
          {beginnen.map(([titel, tekst]) => <Card key={titel} accent="var(--tk-color-green)"><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
        <p className="tk-note">Lees verder over <a href="/kennis/growth-mindset-in-teams">growth mindset in teams</a> en over het traject <a href="/teamontwikkeling#samen-leren-en-verbeteren">Samen leren en verbeteren</a>.</p>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Veelgestelde vragen</Eyebrow><h2 className="tk-heading-lg">Vragen over high performing teams</h2></div>
        <div style={{ display: "grid", gap: 12, maxWidth: 860 }}>
          {faqs.map(([vraag, antwoord]) => (
            <Card key={vraag}><h3>{vraag}</h3><p>{antwoord}</p></Card>
          ))}
        </div>
      </Section>

      <Section className="tk-knowledge-final-cta">
        <div className="tk-knowledge-cta-card">
          <KompasDot size={34} />
          <div>
            <Eyebrow>Volgende stap</Eyebrow>
            <h2 className="tk-heading-lg">Waar staat jouw team nu?</h2>
            <p>Begin met de gratis teamscan, of bespreek in een vrijblijvend gesprek wat jouw team nodig heeft om de volgende stap te zetten.</p>
            <div className="tk-actions">
              <ButtonLink href="/gratis-teamscan">Doe de gratis teamscan</ButtonLink>
              <ButtonLink href="/verkennen" variant="secondary">Plan een vrijblijvend kennismakingsgesprek</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
