import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";
import { SEO_PAGINAS } from "../../content/seoPaginas";

// Kennispagina, november 2026. Waarom een eigen pagina naast
// /kleine-experimenten, waar growth mindset ook voorkomt: die pagina gaat over
// de werkvorm (een experiment opzetten en evalueren) en noemt de mindset als
// achtergrond. Deze pagina beantwoordt de vraag waar mensen op zoeken: wat is
// het in een team, hoe zie je het, en wat vraagt het van leidinggevende en
// organisatie. Voor het experiment zelf verwijst hij door.
//
// Twee dingen die hier bewust zo staan en zo moeten blijven:
// - Geen etiketten. Niemand "heeft" een fixed of growth mindset; het is een
//   richting, en het verschilt per situatie.
// - Werkdruk, bezetting en rollen worden niet teruggebracht tot houding. De
//   organisatie en de leidinggevende dragen verantwoordelijkheid voor de
//   voorwaarden om te leren.

const SEO = SEO_PAGINAS.growthMindset;
const ROUTE = "/kennis/growth-mindset-in-teams";

const onderdelen = [
  ["Overtuigingen", "Gelooft het team dat mensen en samenwerking zich kunnen ontwikkelen? Je hoort het in hoe er over collega's, fouten en nieuwe werkwijzen wordt gesproken.", "var(--tk-color-blue)"],
  ["Gedrag", "Doen mensen ook wat leren mogelijk maakt? Vragen stellen, om feedback vragen, iets nieuws proberen en samen terugkijken op wat er gebeurde.", "var(--tk-color-green)"],
  ["Werkomstandigheden", "Is er tijd om terug te kijken, ruimte om iets uit te proberen en duidelijkheid over wat er wordt verwacht? Zonder die voorwaarden blijft een goede houding bij goede bedoelingen.", "var(--tk-color-purple)"],
];

const zichtbaar = [
  "collega's vragen om hulp en feedback",
  "mensen zeggen dat ze iets nog niet weten of kunnen",
  "verschillende perspectieven worden onderzocht",
  "na een tegenslag past het team zijn aanpak aan",
  "verbeteringen worden klein uitgeprobeerd en geëvalueerd",
  "de leidinggevende vraagt zelf om feedback",
  "ieder verbindt de eigen verantwoordelijkheid aan het gezamenlijke resultaat",
];

const misverstanden = [
  ["Je hebt het of je hebt het niet", "Iedereen kijkt in sommige situaties vanuit groei en in andere vanuit vastigheid, bijvoorbeeld onder druk of na kritiek. Het is een richting om in te ontwikkelen, geen etiket voor mensen."],
  ["Het gaat om positief denken", "Het gaat niet om optimisme of de gedachte dat alles kan. Het gaat om de vraag hoe je beter wordt, met eerlijke feedback over waar je nu staat."],
  ["Fouten maken is altijd goed", "Leren van fouten betekent niet dat kwaliteit er minder toe doet. In werk waar veiligheid kritisch is, probeer je nieuwe werkwijzen uit binnen de geldende professionele kaders."],
  ["Het ligt aan de instelling van medewerkers", "Als leren niet lukt, ligt dat lang niet altijd aan de houding van mensen. Kijk ook naar tijd, bezetting, rolverdeling, besluitvorming en het voorbeeld van de leidinggevende."],
  ["Een training is genoeg", "Een workshop kan het gesprek openen. Gewoontes ontstaan door te oefenen in het eigen werk en daar regelmatig samen op terug te kijken."],
];

const beginnen = [
  ["1. Kies één terugkerend moment", "Bijvoorbeeld het wekelijkse overleg of de overdracht. Klein genoeg om morgen mee te starten."],
  ["2. Spreek één gedraging af", "Sluit elk overleg af met de vraag wat jullie deze week hebben geleerd. Of: wie iets nieuws probeert, vertelt na twee weken wat het opleverde."],
  ["3. Leg vast wanneer je terugkijkt", "Na drie tot vier weken bespreek je samen wat jullie merken, wat je vasthoudt en wat je aanpast."],
  ["4. Laat de leidinggevende beginnen", "Als die als eerste om feedback vraagt of vertelt wat niet lukte, wordt het voor anderen makkelijker om hetzelfde te doen."],
];

const reflectie = [
  "In ons team vragen we actief om feedback.",
  "We kunnen aangeven dat we iets nog niet weten of kunnen.",
  "Na een tegenvaller onderzoeken we wat we kunnen aanpassen.",
  "We komen terug op eerder afgesproken verbeteringen.",
  "Onze leidinggevende laat zien hoe hij of zij zelf leert.",
];

const aansluiting = [
  ["Teamscan", "Onderzoek hoe teamleden de voorwaarden voor samenwerking en leren ervaren, als vertrekpunt voor het gesprek.", "/teamscan"],
  ["Teamdag", "Van inzicht naar een gezamenlijk ontwikkeldoel, concrete afspraken en één of twee kleine experimenten.", "/teamdag"],
  ["Teamcoaching", "Oefenen in het echte werk en samen terugkijken op wat er gebeurde, ook als het schuurt.", "/teamcoaching"],
  ["Coaching voor leidinggevenden", "Richting geven, feedback vragen en leren bespreekbaar maken, binnen heldere kaders.", "/individuele-coaching"],
  ["Kleine experimenten", "Hoe je een verbetering klein opzet, uitprobeert en evalueert.", "/kleine-experimenten"],
  ["Psychologische veiligheid", "Zonder veiligheid vraagt niemand om feedback of zegt iemand dat hij iets nog niet kan.", "/psychologische-veiligheid"],
];

function TagList({ items }) {
  return <ul className="tk-tag-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function GrowthMindsetInTeams() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: "Growth mindset in teams: van idee naar gewoonte", url: SEO.url, description: SEO.description, inLanguage: "nl-NL", publisher: { "@type": "Organization", name: "Mijn Teamkompas" } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", position: 2, name: "Kennis", item: "https://www.mijnteamkompas.nl/kennisbank" },
        { "@type": "ListItem", position: 3, name: "Growth mindset in teams", item: SEO.url },
      ] },
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
            <Eyebrow withDot>Kennis · verbeteren en leren</Eyebrow>
            <h1 className="tk-heading-xl">Growth mindset in teams: van idee naar gewoonte</h1>
            <p className="tk-lead">Een growth mindset binnen een team is de gedeelde overtuiging dat mensen en teams hun vaardigheden en samenwerking kunnen ontwikkelen door feedback, oefening, passende ondersteuning en leren van ervaringen. Hier lees je wat dat in het dagelijks werk betekent, wat het vraagt van teamleden en leidinggevenden, en hoe je klein begint.</p>
            <div className="tk-actions">
              <ButtonLink href="/teamontwikkeling#team-dat-blijft-leren">Zo begeleiden wij teams</ButtonLink>
              <ButtonLink href="/gratis-teamscan" variant="secondary">Doe de gratis teamscan</ButtonLink>
            </div>
          </div>
          <img className="tk-jdr-hero-media" src="/blog/images/experimenteren.jpg" alt="Begeleider bij een flip-over met de cyclus van proberen, kijken en leren" />
        </div>
      </Section>

      <Section>
        <div className="tk-section-heading">
          <Eyebrow>Wat het is</Eyebrow>
          <h2 className="tk-heading-lg">Drie onderdelen die samen bepalen of een team leert</h2>
          <p className="tk-lead">Een growth mindset is meer dan een overtuiging. Het wordt pas zichtbaar als gedrag en werkomstandigheden meebewegen.</p>
        </div>
        <div className="tk-grid tk-grid-3">
          {onderdelen.map(([titel, tekst, kleur]) => <Card key={titel} accent={kleur}><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading">
          <Eyebrow>Herkenbaar</Eyebrow>
          <h2 className="tk-heading-lg">Hoe je het terugziet in het dagelijks werk</h2>
          <p className="tk-lead">Geen grote woorden, maar kleine dingen die vaak genoeg gebeuren om gewoon te worden.</p>
        </div>
        <Card accent="var(--tk-color-green)"><TagList items={zichtbaar} /></Card>
        <p className="tk-note">Leren hoort samen te gaan met kwaliteit, haalbaarheid en duidelijke afspraken. Een team dat veel probeert maar niets vasthoudt, leert net zo weinig als een team dat niets probeert.</p>
      </Section>

      <Section>
        <div className="tk-section-heading">
          <Eyebrow>Feedback, leiderschap en werkomstandigheden</Eyebrow>
          <h2 className="tk-heading-lg">Leren is niet alleen een kwestie van houding</h2>
        </div>
        <div className="tk-grid tk-grid-3">
          <Card accent="var(--tk-color-teal)"><h3>Feedback</h3><p>Feedback helpt pas als het veilig genoeg is om erom te vragen en er iets mee te doen. Een team dat alleen feedback hoort als het misgaat, leert vooral voorzichtig zijn. Lees meer over <a href="/psychologische-veiligheid">psychologische veiligheid</a>.</p></Card>
          <Card accent="var(--tk-color-blue)"><h3>Leiderschap</h3><p>Teams kijken naar wat de leidinggevende doet. Wie zelf om feedback vraagt, hardop zegt wat hij nog leert en ruimte geeft binnen heldere kaders, maakt leren normaal. Wie elke fout zelf oplost, maakt het team afhankelijk.</p></Card>
          <Card accent="var(--tk-color-orange)"><h3>Werkomstandigheden</h3><p>Werkdruk, onderbezetting, onduidelijke rollen of trage besluitvorming los je niet op met een andere houding. Daar zijn de organisatie en de leidinggevende aan zet. Een lerend team kan die knelpunten wel eerder bespreekbaar maken. Zie ook <a href="/kennis/teamenergie">teamenergie</a>.</p></Card>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading">
          <Eyebrow>Misverstanden</Eyebrow>
          <h2 className="tk-heading-lg">Wat een growth mindset niet is</h2>
        </div>
        <div className="tk-grid tk-grid-3">
          {misverstanden.map(([titel, tekst]) => <Card key={titel} accent="var(--tk-color-purple)"><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
      </Section>

      <Section>
        <div className="tk-section-heading">
          <Eyebrow>Klein beginnen</Eyebrow>
          <h2 className="tk-heading-lg">Hoe een team morgen kan starten</h2>
          <p className="tk-lead">Je hoeft geen cultuurtraject te starten om te beginnen. Eén moment, één afspraak en een vaste terugblik zijn genoeg voor de eerste stap.</p>
        </div>
        <div className="tk-grid tk-grid-2">
          {beginnen.map(([titel, tekst]) => <Card key={titel} accent="var(--tk-color-green)"><h3>{titel}</h3><p>{tekst}</p></Card>)}
        </div>
        <p className="tk-note">Meer over het opzetten en evalueren van een kleine verbetering lees je bij <a href="/kleine-experimenten">kleine experimenten</a>.</p>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-knowledge-two-column">
          <div>
            <Eyebrow>Reflectie</Eyebrow>
            <h2 className="tk-heading-lg">Vijf stellingen om met je team te bespreken</h2>
          </div>
          <div className="tk-rich-text">
            <p>Leg ze in het volgende overleg op tafel en vraag hoe herkenbaar ze zijn. De verschillen in antwoorden zijn vaak interessanter dan het gemiddelde.</p>
            <ol>{reflectie.map((r) => <li key={r}>{r}</li>)}</ol>
            <p>Dit zijn vragen om het gesprek te openen. Het is geen gevalideerde meting en er hoort geen score bij.</p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column">
          <div>
            <Eyebrow>Onderzoek</Eyebrow>
            <h2 className="tk-heading-lg">Wat onderzoek wel en niet zegt</h2>
          </div>
          <div className="tk-rich-text">
            <p>Het begrip growth mindset komt uit het werk van psycholoog Carol Dweck. Onderzoek van Canning en collega's (2020) keek naar organisaties in plaats van individuen. Medewerkers die hun organisatie zagen als een plek waar talent vastligt, rapporteerden onder meer minder vertrouwen en betrokkenheid dan medewerkers in organisaties waar ontwikkeling als mogelijk werd gezien.</p>
            <p>Het gaat om verbanden uit vragenlijstonderzoek. Het laat niet zien dat een bepaalde training of aanpak, ook de onze, deze uitkomsten oplevert. Bron: <a href="https://pubmed.ncbi.nlm.nih.gov/31502926/" rel="noopener noreferrer" target="_blank">Canning e.a., Cultures of Genius at Work (2020)</a>.</p>
          </div>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading">
          <Eyebrow>Hoe wij hierbij helpen</Eyebrow>
          <h2 className="tk-heading-lg">Elk onderdeel van onze begeleiding draagt iets bij</h2>
        </div>
        <div className="tk-grid tk-grid-3">
          {aansluiting.map(([titel, tekst, href]) => (
            <a className="tk-related-card" href={href} key={titel}><h3>{titel}</h3><p>{tekst}</p><span>Lees verder →</span></a>
          ))}
        </div>
      </Section>

      <Section className="tk-knowledge-final-cta">
        <div className="tk-knowledge-cta-card">
          <KompasDot size={34} />
          <div>
            <Eyebrow>Volgende stap</Eyebrow>
            <h2 className="tk-heading-lg">Wil je weten waar jouw team nu staat?</h2>
            <p>Begin met de gratis teamscan, of bespreek in een vrijblijvend gesprek wat jullie team nodig heeft om samen te blijven leren.</p>
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
