import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/verandermanagement";
const IMAGE = "https://www.mijnteamkompas.nl/teamkompas-vier-domeinen.jpg";

const toc = [
  ["Waarom verandering zo moeilijk is", "waarom-moeilijk"],
  ["Mensen zijn niet tegen verandering", "misvatting"],
  ["Waarom communicatie niet volstaat", "communicatie"],
  ["De onderstroom bepaalt het resultaat", "onderstroom"],
  ["Psychologische veiligheid is geen luxe", "veiligheid"],
  ["Waarom grote programma's vastlopen", "programmas"],
  ["Leiders maken of breken verandering", "leiderschap"],
  ["Teamenergie bepaalt of het beklijft", "teamenergie"],
  ["Waarom verandertrajecten mislukken", "fouten"],
  ["Onze visie op duurzame verandering", "visie"],
  ["Praktijkvoorbeelden", "praktijk"],
  ["Wat kun je morgen al doen?", "morgen"],
  ["Veelgestelde vragen", "faq"],
];

const misflow = ["Nieuw plan", "Communicatie", "Onzekerheid", "Terugvallen op oude routines", "Verandering mislukt"];
const duurflow = ["Psychologische veiligheid", "Kleine experimenten", "Succeservaring", "Meer eigenaarschap", "Nieuw gedrag", "Nieuwe teamcultuur", "Duurzame verandering"];
const visieflow = ["Luisteren", "Meten", "Inzicht creëren", "Veiligheid vergroten", "Kleine experimenten", "Leren", "Eigenaarschap", "Nieuwe gewoontes", "Nieuwe teamcultuur"];

const fouten = [
  "Denken dat communicatie voldoende is",
  "Denken dat weerstand het probleem is",
  "Alleen het management betrekken",
  "Alles tegelijk willen veranderen",
  "Geen ruimte voor experimenten",
  "Geen veiligheid creëren",
  "Te weinig luisteren",
  "Te veel sturen",
  "Alleen de bovenstroom aanpakken",
  "Verandering zien als project in plaats van gedragsverandering",
];

const praktijk = [
  ["Een nieuw EPD of kwaliteitssysteem", "In de zorg wordt een nieuw registratiesysteem ingevoerd. De training is gegeven, toch blijven mensen oude sluiproutes gebruiken. Het systeem veranderde, de dagelijkse werkdruk en gewoontes niet."],
  ["Een reorganisatie of fusie", "Twee afdelingen worden samengevoegd. Op papier is de structuur helder, maar in de onderstroom spelen verlies, onzekerheid over de eigen plek en oude loyaliteiten die niemand uitspreekt."],
  ["Hybride werken", "Er komen afspraken over thuis- en kantoordagen. Sommige teams bloeien op, andere raken juist verbinding kwijt. Hetzelfde beleid, een heel ander effect, afhankelijk van vertrouwen en teamnormen."],
  ["Een nieuwe leidinggevende of overlegstructuur", "Een nieuwe manager wil het anders doen. Het team wacht af: is dit veilig, wat betekent dit voor mij? Pas als de eerste ervaringen goed uitpakken, komt er beweging."],
];

const morgen = [
  "Vraag je team niet of ze de verandering snappen, maar hoe ze die ervaren.",
  "Maak de verandering kleiner: kies één concreet gedrag om deze week te proberen.",
  "Luister eerst naar de bezwaren voordat je opnieuw uitlegt waarom het moet.",
  "Benoem hardop dat het even onhandig mag voelen; dat hoort bij leren.",
  "Vier een kleine succeservaring zodra die zich voordoet.",
  "Geef mensen invloed op het hoe, ook als het wat vaststaat.",
  "Bespreek wat mensen verliezen bij de verandering, niet alleen wat ze winnen.",
  "Ga zelf voor in het gewenste gedrag voordat je het van anderen vraagt.",
  "Plan een kort, terugkerend reflectiemoment: wat werkte, wat hield ons tegen?",
  "Neem niet meteen het probleem over als een team even worstelt.",
];

const faqs = [
  ["Wat is verandermanagement?", "Verandermanagement is het begeleiden van organisaties en teams door een verandering heen. Bij Mijn Teamkompas zien we het niet als een project met een begin- en einddatum, maar als een menselijk proces: verandering slaagt pas wanneer gedrag, vertrouwen en teamcultuur meebewegen, niet alleen de plannen en structuren."],
  ["Waarom mislukken zoveel veranderingen?", "Zelden door onwil. Meestal doordat de verandering vooral in de bovenstroom wordt aangepakt (plannen, communicatie, projectgroepen), terwijl de onderstroom van emoties, veiligheid en groepsnormen onbesproken blijft. Zonder ervaring, veiligheid en kleine successen vallen mensen onder druk terug op vertrouwde routines."],
  ["Hoe ga je om met weerstand tegen verandering?", "Behandel weerstand als informatie, niet als obstakel. Vaak zit eronder onzekerheid, verlies van autonomie of controle, of een gebrek aan vertrouwen. Luister naar wat mensen dreigen te verliezen, geef invloed op het hoe en maak de eerste stap klein en veilig. Dan verandert weerstand vaak in betrokkenheid."],
  ["Hoe creëer je draagvlak voor verandering?", "Draagvlak ontstaat niet door beter uit te leggen, maar door mensen mede-eigenaar te maken. Betrek het team bij het vertalen van de richting naar de dagelijkse praktijk, laat ze zelf kleine experimenten kiezen en zorg dat vroege ervaringen goed uitpakken. Betrokkenheid groeit door meedoen, niet door overtuigen."],
  ["Wat is gedragsverandering?", "Gedragsverandering betekent dat mensen daadwerkelijk anders gaan handelen in het dagelijkse werk, niet alleen anders gaan denken of praten. Gedrag verandert door ervaren, oefenen, veiligheid en succes beleven, en door herhaling totdat het nieuwe gedrag vanzelfsprekend wordt."],
  ["Waarom is psychologische veiligheid belangrijk bij verandering?", "Veranderen betekent tijdelijk minder competent zijn: je maakt fouten, weet het even niet en hebt hulp nodig. Alleen in een veilig klimaat durven mensen dat te laten zien, vragen te stellen en te experimenteren. Zonder psychologische veiligheid houden mensen zich in en verandert er weinig."],
  ["Hoe verander je teamgedrag?", "Door het gewenste gedrag klein en concreet te maken, het samen te oefenen en te ervaren dat het veilig en zinvol is. Nieuwe afspraken alleen veranderen zelden gedrag; herhaalde ervaring wel. Kleine experimenten en gezamenlijke reflectie zijn hierin krachtige hulpmiddelen."],
  ["Waarom werken kleine experimenten beter dan grote programma's?", "Een klein experiment is tijdelijk, veilig en concreet. Het levert snel een succeservaring op, en die versterkt motivatie en eigenaarschap. Grote programma's blijven vaak abstract en roepen meer onzekerheid op. Kleine stappen sluiten beter aan bij hoe mensen daadwerkelijk leren."],
  ["Wat is de rol van leiderschap tijdens verandering?", "Leiders maken verandering niet door harder te sturen, maar door te luisteren, nieuwsgierig te zijn, het gewenste gedrag voor te leven, veiligheid te creëren en ruimte en vertrouwen te geven. Wat een leider consequent aandacht geeft en zelf laat zien, wordt de norm."],
  ["Waarom vallen teams terug in oude patronen?", "Het brein spaart energie en grijpt onder druk terug op vertrouwde routines. Nieuw gedrag vraagt aandacht en brengt onzekerheid mee. Zonder herhaling, veiligheid en steun uit de omgeving is de kans groot dat een team enkele weken na een enthousiaste start weer werkt zoals daarvoor."],
  ["Hoe lang duurt cultuurverandering?", "Er is geen vaste termijn. Kleine gedragsveranderingen zijn soms snel merkbaar, maar een cultuur verandert pas wanneer nieuw gedrag lang genoeg wordt herhaald om vanzelfsprekend te worden. Consistentie over maanden is belangrijker dan een intensief maar kortstondig traject."],
  ["Hoe houd je een verandering vast?", "Door nieuw gedrag te verankeren in het dagelijkse werk: vaste momenten van reflectie, eigenaarschap per afspraak, aandacht voor initiatief en het herkennen van terugval. Verandering blijft niet bestaan door een afsluitende bijeenkomst, maar door het gedrag steeds opnieuw te oefenen en te ondersteunen."],
];

const related = [
  ["Neuromanagement", "Waarom het brein bij onzekerheid terugvalt op vertrouwde patronen.", "/brein-en-samenwerking"],
  ["Boven- en onderstroom", "Waarom de onderstroom bepaalt of een verandering beklijft.", "/boven-en-onderstroom"],
  ["Psychologische veiligheid", "De voorwaarde om te durven leren, fouten maken en experimenteren.", "/psychologische-veiligheid"],
  ["Kleine experimenten", "Hoe teams veranderen via kleine, veilige stappen in plaats van grote plannen.", "/kleine-experimenten"],
  ["Teamcultuur", "Hoe nieuw gedrag de nieuwe norm wordt in een team.", "/kennis/teamcultuur"],
  ["Eigenaarschap in teams", "Waarom verandering pas beklijft als mensen zich mede-eigenaar voelen.", "/kennis/eigenaarschap-in-teams"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Verandermanagement: waarom zoveel veranderingen mislukken (en hoe het wél lukt)",
      "name": "Verandermanagement",
      "url": `https://www.mijnteamkompas.nl${ROUTE}`,
      "image": IMAGE,
      "description": "Waarom mislukken zoveel veranderingen ondanks alle modellen? Over verandering als menselijk proces: gedrag, veiligheid, onderstroom, leiderschap en kleine experimenten.",
      "author": { "@type": "Organization", "name": "Mijn Teamkompas" },
      "publisher": { "@type": "Organization", "name": "Mijn Teamkompas", "url": "https://www.mijnteamkompas.nl" },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", "position": 2, "name": "Kennis", "item": "https://www.mijnteamkompas.nl/kennis/kenniskaart-teamontwikkeling" },
        { "@type": "ListItem", "position": 3, "name": "Verandermanagement", "item": `https://www.mijnteamkompas.nl${ROUTE}` },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
    },
  ],
};

function Flow({ steps, tone = "teal" }) {
  const kleur = tone === "strain" ? "var(--tk-color-orange)" : "var(--tk-color-teal)";
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, maxWidth: 560 }}>
      {steps.map((s, i) => (
        <li key={s} style={{ position: "relative" }}>
          <div style={{ background: "white", border: `1px solid var(--tk-color-border)`, borderLeft: `4px solid ${kleur}`, borderRadius: 14, padding: "13px 18px", fontWeight: 700, color: "var(--tk-color-ink)", boxShadow: "var(--tk-shadow-sm)" }}>{s}</div>
          {i < steps.length - 1 && <div aria-hidden="true" style={{ textAlign: "center", color: kleur, fontSize: 18, lineHeight: 1, margin: "4px 0" }}>↓</div>}
        </li>
      ))}
    </ol>
  );
}

export default function Verandermanagement() {
  return (
    <PageShell>
      <Helmet>
        <title>Verandermanagement: waarom verandering mislukt | Mijn Teamkompas</title>
        <meta name="description" content="Ontdek waarom zoveel veranderingen mislukken en hoe teams met psychologische veiligheid, eigenaarschap en kleine experimenten wél duurzaam veranderen." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Verandermanagement: waarom zoveel veranderingen mislukken (en hoe het wél lukt)" />
        <meta property="og:description" content="Verandering is minder rationeel dan we denken. Over gedrag, onderstroom, veiligheid, leiderschap en kleine experimenten die verandering wél laten beklijven." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:image" content={IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Verandermanagement: waarom verandering mislukt | Mijn Teamkompas" />
        <meta name="twitter:description" content="Waarom mislukken zoveel veranderingen, en hoe lukt het wél? Over verandering als menselijk proces." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <Section className="tk-knowledge-hero tk-jdr-hero">
        <div className="tk-jdr-hero-inner">
          <div className="tk-jdr-hero-text">
            <Eyebrow withDot>Kennis · verandermanagement</Eyebrow>
            <h1 className="tk-heading-xl">Verandermanagement: waarom zoveel veranderingen mislukken (en hoe het wél lukt)</h1>
            <p className="tk-lead">Een inspirerende kick-off. Nieuwe strategie, nieuwe kernwaarden, nieuwe posters, nieuwe projectgroepen. Iedereen enthousiast. En drie maanden later werkt vrijwel iedereen weer precies zoals daarvoor. Hoe kan dat?</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
          <img className="tk-jdr-hero-media" src="/teamkompas-vier-domeinen.jpg" alt="Verandering slaagt pas wanneer gedrag, vertrouwen en teamcultuur meebewegen, niet alleen de plannen." />
        </div>
      </Section>

      {/* Intro */}
      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>De kern</Eyebrow><h2 className="tk-heading-lg">Verandering is veel minder rationeel dan we denken.</h2></div>
          <div className="tk-rich-text">
            <p>Het ligt zelden aan onwil. De meeste mensen begrijpen prima waarom iets anders moet. En toch blijft het bekende gedrag terugkomen. De bekende verandermodellen (Kotter, Lewin, ADKAR) beschrijven keurig de stappen, maar verklaren niet waarom teams alsnog terugvallen.</p>
            <p>Bij Mijn Teamkompas kijken we anders naar verandering. Niet als een project met een plan en een deadline, maar als een menselijk proces. Verandering slaagt pas wanneer gedrag, veiligheid, energie en teamcultuur meebewegen. Deze pagina legt uit waarom zoveel verandertrajecten stranden, en wat wél helpt.</p>
          </div>
        </div>
      </Section>

      {/* Inhoudsopgave */}
      <Section aria-label="Inhoudsopgave">
        <div className="tk-section-heading"><Eyebrow>Op deze pagina</Eyebrow><h2 className="tk-heading-lg">Inhoudsopgave</h2></div>
        <nav aria-label="Inhoudsopgave">
          <ul className="tk-tag-list" style={{ gap: 10 }}>
            {toc.map(([label, id]) => (
              <li key={id}><a href={`#${id}`} className="tk-knowledge-topic tk-knowledge-topic-link">{label}</a></li>
            ))}
          </ul>
        </nav>
      </Section>

      {/* 1. Waarom moeilijk */}
      <Section id="waarom-moeilijk">
        <div className="tk-section-heading"><Eyebrow>Het brein en gewoonte</Eyebrow><h2 className="tk-heading-lg">Waarom verandering zo moeilijk is</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Ons brein houdt van voorspelbaarheid. Routines besparen energie: gedrag dat vaak wordt herhaald, vraagt steeds minder bewuste aandacht. Dat is nuttig, maar het maakt verandering lastig. Zodra iets nieuws wordt gevraagd, kost dat aandacht en energie, en dat voelt als inspanning.</p>
          <p>Daar komt bij dat veranderen betekent dat je je tijdelijk minder competent voelt. Je beheerste je werk, en nu moet het anders. Die onzekerheid activeert een stressrespons. In een verpleegteam dat een nieuw registratiesysteem krijgt, zie je dat terug: niet omdat mensen het systeem afwijzen, maar omdat het vertrouwde handelen even wegvalt. Wie begrijpt hoe het brein op onzekerheid reageert, kijkt milder en slimmer naar terugval. <a href="/brein-en-samenwerking">Lees meer over wat er in ons brein gebeurt tijdens samenwerking.</a></p>
        </div>
      </Section>

      {/* 2. Misvatting */}
      <Section id="misvatting" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>De grootste misvatting</Eyebrow><h2 className="tk-heading-lg">Mensen zijn niet tegen verandering</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Wat vaak "weerstand" wordt genoemd, is zelden verzet tegen de verandering zelf. Mensen hebben moeite met wat de verandering met zich meebrengt: onzekerheid, verlies van autonomie, verlies van controle, verlies van status, onduidelijkheid en een gebrek aan vertrouwen.</p>
          <p>Het SCARF-model van David Rock laat zien hoe gevoelig we zijn voor status, zekerheid, autonomie, verbondenheid en rechtvaardigheid. De Self-Determination Theory van Deci en Ryan voegt daaraan toe dat mensen behoefte hebben aan autonomie, competentie en verbondenheid. Raakt een verandering aan die behoeften, dan is voorzichtig of afwachtend reageren geen onwil, maar logisch gedrag. Wie weerstand zo leert lezen, kan er heel anders mee omgaan.</p>
        </div>
      </Section>

      {/* 3. Communicatie */}
      <Section id="communicatie">
        <div className="tk-section-heading"><Eyebrow>Informatie is niet genoeg</Eyebrow><h2 className="tk-heading-lg">Waarom communicatie meestal niet voldoende is</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Veel organisaties geloven: als we het maar vaak genoeg uitleggen, gaat het vanzelf leven. Toch verandert gedrag zelden door informatie. Je kunt iemand honderd keer vertellen dat feedback geven belangrijk is; pas als hij het een keer doet en merkt dat het veilig is, verschuift er iets.</p>
          <p>Gedrag verandert door ervaren, oefenen, veiligheid en succes beleven. Een nieuwe overlegvorm gaat pas leven als een team hem een paar keer heeft geprobeerd en gemerkt heeft dat het overleg beter wordt. Communicatie geeft richting, maar de verandering zelf gebeurt in de praktijk, niet in de presentatie.</p>
        </div>
      </Section>

      {/* Infographic 1 */}
      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Infographic</Eyebrow><h2 className="tk-heading-lg">Waarom verandering mislukt</h2></div>
        <Flow steps={misflow} tone="strain" />
        <p className="tk-note">Een plan en communicatie alleen laten de onzekerheid onaangeroerd. Zonder veilige ervaring valt een team terug op wat het kent.</p>
      </Section>

      {/* 4. Onderstroom */}
      <Section id="onderstroom">
        <div className="tk-section-heading"><Eyebrow>Zichtbaar en onzichtbaar</Eyebrow><h2 className="tk-heading-lg">De onderstroom bepaalt uiteindelijk het resultaat</h2></div>
        <div className="tk-jdr-two">
          <Card accent="var(--tk-color-green)">
            <h3>Bovenstroom</h3>
            <p>Alles wat zichtbaar en formeel is.</p>
            <ul className="tk-tag-list">{["plannen", "KPI's", "projectgroepen", "planning", "governance"].map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
          <Card accent="var(--tk-color-blue)">
            <h3>Onderstroom</h3>
            <p>Wat mensen voelen en ervaren, vaak onuitgesproken.</p>
            <ul className="tk-tag-list">{["emoties", "relaties", "vertrouwen", "veiligheid", "onuitgesproken verwachtingen", "groepsnormen"].map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
        </div>
        <div className="tk-rich-text" style={{ maxWidth: 820, marginTop: 18 }}>
          <p>Verandertrajecten worden meestal in de bovenstroom aangepakt: nieuwe structuren, doelen en overleggen. Maar of een verandering blijft bestaan, wordt in de onderstroom beslist. Als mensen elkaar niet vertrouwen of zich niet veilig voelen, verdwijnt nieuw gedrag zodra de aandacht wegvalt. <a href="/boven-en-onderstroom">Lees meer over de werking van de boven- en onderstroom.</a></p>
        </div>
      </Section>

      {/* 5. Veiligheid */}
      <Section id="veiligheid" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Voorwaarde om te leren</Eyebrow><h2 className="tk-heading-lg">Psychologische veiligheid is geen luxe</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Mensen veranderen pas wanneer ze fouten mogen maken, vragen durven stellen, onzeker mogen zijn, hulp durven vragen en feedback krijgen. Verandering betekent immers dat je het even niet weet. Zonder een veilig klimaat houden mensen dat verborgen, en dan stopt het leren.</p>
          <p>Amy Edmondson toonde aan dat psychologische veiligheid een van de sterkste voorspellers is van hoe teams leren en zich aanpassen. Het is dus geen zachte bijzaak, maar de bodem waarop verandering überhaupt kan groeien. <a href="/psychologische-veiligheid">Lees meer over psychologische veiligheid</a>, en over de ondergrens daarvan: <a href="/sociale-veiligheid">sociale veiligheid</a>.</p>
        </div>
      </Section>

      {/* 6. Grote programma's */}
      <Section id="programmas">
        <div className="tk-section-heading"><Eyebrow>Klein werkt beter</Eyebrow><h2 className="tk-heading-lg">Waarom grote veranderprogramma's vaak minder effectief zijn</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Lean, Agile, Kaizen, PDCA en de growth mindset delen één inzicht: je leert door te doen, in kleine stappen. Een groot veranderprogramma blijft vaak abstract en roept juist meer onzekerheid op. Een klein experiment maakt de verandering concreet, tijdelijk en veilig.</p>
          <p>Bovendien werkt het motiverend. Een kleine succeservaring geeft een gevoel van vooruitgang, en dat versterkt de motivatie om een volgende stap te zetten. Zo bouwt een team stap voor stap eigenaarschap op, in plaats van te wachten op het grote plan. <a href="/kleine-experimenten">Lees meer over kleine experimenten in teams.</a></p>
        </div>
      </Section>

      {/* 7. Leiderschap */}
      <Section id="leiderschap" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Sturen of ruimte geven</Eyebrow><h2 className="tk-heading-lg">Leiders maken of breken verandering</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Leiders drijven verandering niet door harder te sturen. Ze doen het door te luisteren, nieuwsgierig te zijn, het gewenste gedrag voor te leven, veiligheid te creëren, ruimte te geven, vragen te stellen en vertrouwen te schenken.</p>
        </div>
        <div className="tk-jdr-two" style={{ marginTop: 18 }}>
          <Card accent="var(--tk-color-orange)">
            <h3>Traditioneel sturen</h3>
            <ul className="tk-tag-list">{["oplossing opleggen", "controle op iedere stap", "communiceren als eenrichtingsverkeer", "afrekenen op resultaat", "zelf het laatste woord"].map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
          <Card accent="var(--tk-color-teal)">
            <h3>Dienend leiderschap</h3>
            <ul className="tk-tag-list">{["vragen stellen", "ruimte en kaders geven", "luisteren naar de onderstroom", "fouten benutten om te leren", "voorbeeldgedrag tonen"].map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
        </div>
        <p className="tk-note">Wat een leider consequent aandacht geeft en zelf laat zien, wordt de norm. <a href="/teamcoaching">Lees meer over teamcoaching en leiderschapsbegeleiding.</a></p>
      </Section>

      {/* 8. Teamenergie */}
      <Section id="teamenergie">
        <div className="tk-section-heading"><Eyebrow>Belasting of kans</Eyebrow><h2 className="tk-heading-lg">Teamenergie bepaalt of verandering blijft bestaan</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Het Job Demands-Resources-model helpt verklaren waarom dezelfde verandering in het ene team energie geeft en in het andere uitput. Heeft een team al weinig hulpbronnen en veel taakeisen, dan voelt iedere verandering als extra belasting bovenop een volle emmer. Is een team bevlogen en in balans, dan wordt verandering eerder als kans gezien.</p>
          <p>Voordat je een verandering doorvoert, loont het dus om te kijken naar de energie van een team. Soms is ruimte maken en werkdruk verlagen de belangrijkste eerste stap. <a href="/kennis/bevlogenheid-in-het-werk">Lees meer over bevlogenheid en het JD-R-model.</a></p>
        </div>
      </Section>

      {/* Infographic 2 */}
      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Infographic</Eyebrow><h2 className="tk-heading-lg">Hoe duurzame verandering ontstaat</h2></div>
        <Flow steps={duurflow} tone="teal" />
        <p className="tk-note">Verandering die begint bij veiligheid en kleine successen, groeit stap voor stap uit tot nieuw gedrag en een nieuwe teamcultuur.</p>
      </Section>

      {/* 9. Fouten */}
      <Section id="fouten">
        <div className="tk-section-heading"><Eyebrow>Valkuilen</Eyebrow><h2 className="tk-heading-lg">Waarom zoveel verandertrajecten mislukken</h2></div>
        <ul className="tk-tag-list" style={{ gap: 10 }}>
          {fouten.map((f) => <li key={f} style={{ background: "rgba(180,55,47,0.07)", borderColor: "rgba(180,55,47,0.25)" }}>{f}</li>)}
        </ul>
      </Section>

      {/* 10. Visie */}
      <Section id="visie" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Onze aanpak</Eyebrow><h2 className="tk-heading-lg">Onze visie op duurzame verandering</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820, marginBottom: 8 }}>
          <p>Duurzame verandering begint niet met een plan, maar met het begrijpen van mensen. Wij werken daarom van luisteren en meten, via veiligheid en kleine experimenten, naar eigenaarschap en nieuwe gewoontes die uiteindelijk een nieuwe teamcultuur vormen.</p>
        </div>
        <Flow steps={visieflow} tone="teal" />
      </Section>

      {/* Praktijk */}
      <Section id="praktijk">
        <div className="tk-section-heading"><Eyebrow>In de praktijk</Eyebrow><h2 className="tk-heading-lg">Verandering in herkenbare situaties</h2></div>
        <div className="tk-grid tk-grid-3">
          {praktijk.map(([t, d]) => (
            <Card accent="var(--tk-color-teal)" key={t}><h3>{t}</h3><p>{d}</p></Card>
          ))}
        </div>
      </Section>

      {/* Morgen */}
      <Section id="morgen" className="tk-jdr-reflection">
        <Card>
          <Eyebrow>Wat kun je morgen al doen?</Eyebrow>
          <h2 className="tk-heading-lg">Tien praktische stappen voor managers en teams</h2>
          <ul className="tk-tag-list">{morgen.map((m) => <li key={m}>{m}</li>)}</ul>
        </Card>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <div className="tk-section-heading"><Eyebrow>Veelgestelde vragen</Eyebrow><h2 className="tk-heading-lg">Veelgestelde vragen over verandermanagement</h2></div>
        <div className="tk-grid" style={{ maxWidth: 860 }}>
          {faqs.map(([q, a]) => (
            <details key={q} className="tk-card" style={{ padding: "18px 22px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--tk-color-ink)", fontSize: 17, lineHeight: 1.4 }}>{q}</summary>
              <p style={{ margin: "12px 0 0", color: "var(--tk-color-muted)", lineHeight: 1.75 }}>{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Verder lezen */}
      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Verder lezen</Eyebrow><h2 className="tk-heading-lg">De fundamenten onder duurzame verandering</h2></div>
        <div className="tk-grid tk-grid-3">
          {related.map(([title, text, href]) => (
            <a className="tk-related-card" href={href} key={title}><h3>{title}</h3><p>{text}</p><span>Lees verder →</span></a>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="tk-knowledge-final-cta">
        <div className="tk-knowledge-cta-card">
          <KompasDot size={34} />
          <div>
            <Eyebrow>Van plan naar beweging</Eyebrow>
            <h2 className="tk-heading-lg">Wil je weten hoe jouw team verandering ervaart?</h2>
            <p>Met de teamscan van Mijn Teamkompas brengen we niet alleen de bovenstroom in beeld, maar juist ook de onderstroom. Zo ontstaat inzicht in wat verandering belemmert én wat beweging mogelijk maakt. Een sterke basis voor een teamdag of begeleiding waarin het team zelf de eerste stappen zet.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek de teamscan</ButtonLink><ButtonLink href="/teamdag" variant="secondary">Bekijk de teamdag</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
