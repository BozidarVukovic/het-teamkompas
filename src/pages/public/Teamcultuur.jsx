import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/teamcultuur";
const IMAGE = "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg";

const toc = [
  ["Wat is teamcultuur?", "wat-is-teamcultuur"],
  ["Waarom gedrag sterker is dan afspraken", "gedrag-en-afspraken"],
  ["Hoe ontstaat teamcultuur?", "hoe-ontstaat-cultuur"],
  ["Waarom veranderen zo moeilijk is", "waarom-veranderen-moeilijk"],
  ["Boven- en onderstroom", "boven-en-onderstroom"],
  ["Psychologische veiligheid", "psychologische-veiligheid"],
  ["Het brein en oude patronen", "neuromanagement"],
  ["Kleine experimenten", "kleine-experimenten"],
  ["Van waarden naar zichtbaar gedrag", "zichtbaar-gedrag"],
  ["De rol van leiderschap", "leiderschap"],
  ["Praktijkvoorbeelden", "praktijkvoorbeelden"],
  ["Een gezonde cultuur is niet altijd comfortabel", "gezonde-cultuur"],
  ["Het cultuurspiegel-experiment", "experiment"],
  ["Veelgestelde vragen", "faq"],
];

const zeggen = [
  "We willen open communiceren",
  "Fouten zijn kansen om te leren",
  "Iedereen mag meedenken",
  "We geven elkaar feedback",
  "Medewerkers krijgen eigenaarschap",
];
const ervaren = [
  "Kritische vragen vertragen het overleg",
  "Fouten worden onthouden",
  "Besluiten staan vaak al vast",
  "Feedback wordt persoonlijk opgevat",
  "Belangrijke keuzes gaan terug naar de manager",
];

const experimenten = [
  "Start ieder overleg vier weken lang met een korte check-in.",
  "Laat tijdens ieder overleg een andere collega als eerste reageren.",
  "Sluit besluiten af met de vraag welke bezwaren nog niet zijn uitgesproken.",
  "Laat wekelijks één collega een fout of mislukking delen en benoemen wat daarvan geleerd is.",
  "Wijs een observator aan die alleen naar het groepsgedrag kijkt.",
  "Laat de leidinggevende als laatste zijn of haar mening geven.",
  "Bespreek wekelijks één afspraak en onderzoek of het gedrag daarbij aansluit.",
  "Eindig ieder overleg met de vraag wat het team vandaag heeft vermeden.",
];

const stappen = [
  ["Observeer het huidige patroon", "Kijk eerst naar wat er nu daadwerkelijk gebeurt, zonder te oordelen."],
  ["Kies één concreet gedrag", "Maak het klein en zichtbaar, geen abstracte waarde."],
  ["Ontwerp een klein experiment", "Tijdelijk, veilig en gezamenlijk uit te voeren."],
  ["Voer het kort uit", "Een paar weken is vaak genoeg om iets te leren."],
  ["Bespreek wat er werkelijk gebeurde", "Deel waarnemingen over het gedrag, niet alleen de inhoud."],
  ["Behoud, pas aan of stop", "Kies bewust wat je meeneemt naar de volgende ronde."],
  ["Herhaal wat werkt", "Nieuw gedrag wordt cultuur door herhaling."],
];

const reflectievragen = [
  "Wat gebeurt er in dit team wanneer iemand een fout maakt?",
  "Welk gedrag wordt hier beloond?",
  "Welke onderwerpen vermijden we?",
  "Wie heeft veel informele invloed?",
  "Wat moet je hier vooral niet doen?",
  "Welke afspraak spreken we regelmatig uit, maar leven we niet na?",
  "Wat gebeurt er wanneer iemand het oneens is met de leidinggevende?",
  "Welk patroon zouden nieuwe medewerkers waarschijnlijk snel opmerken?",
];

const faqs = [
  ["Wat is teamcultuur?", "Teamcultuur is het geheel van dagelijkse gedragspatronen, gewoontes en ongeschreven regels die bepalen hoe mensen binnen een team samenwerken. De cultuur wordt vooral zichtbaar in wat mensen werkelijk doen, niet alleen in de waarden en afspraken die officieel zijn vastgelegd."],
  ["Hoe ontstaat teamcultuur?", "Teamcultuur ontstaat door herhaalde ervaringen. Teamleden leren welk gedrag wordt beloond, geaccepteerd, genegeerd of gecorrigeerd. Na verloop van tijd worden deze gedragspatronen vanzelfsprekend en ontstaan ongeschreven regels."],
  ["Waarom is cultuur veranderen zo moeilijk?", "Cultuurverandering is moeilijk omdat bestaand gedrag vaak diep is ingesleten en een beschermende functie kan hebben. Mensen vallen onder druk gemakkelijk terug op bekende patronen. Duurzame verandering vraagt daarom om veiligheid, herhaling, leiderschap en concrete nieuwe ervaringen."],
  ["Hoe kun je de cultuur binnen een team veranderen?", "Begin met het zichtbaar maken van bestaande patronen. Vertaal algemene waarden naar concreet gedrag en kies vervolgens één klein experiment. Bespreek regelmatig wat er gebeurt, wat werkt en waar het team terugvalt. Nieuw gedrag moet vaak genoeg worden herhaald om onderdeel te worden van de cultuur."],
  ["Welke rol speelt psychologische veiligheid bij cultuurverandering?", "Psychologische veiligheid maakt het mogelijk om vragen, fouten, zorgen en afwijkende meningen te bespreken. Zonder deze veiligheid zullen mensen zich eerder aanpassen of stilhouden, waardoor bestaande patronen moeilijker veranderen."],
  ["Wat is het verschil tussen teamcultuur en organisatiecultuur?", "Organisatiecultuur gaat over bredere waarden, systemen en patronen binnen de gehele organisatie. Teamcultuur gaat over de dagelijkse samenwerking binnen een specifiek team. Binnen dezelfde organisatie kunnen daardoor verschillende teamculturen bestaan."],
  ["Welke rol heeft een leidinggevende bij teamcultuur?", "Een leidinggevende beïnvloedt de cultuur vooral door voorbeeldgedrag, reacties en aandacht. Teamleden kijken niet alleen naar wat een leider zegt, maar vooral naar wat de leider doet wanneer iemand een fout maakt, kritiek geeft of verantwoordelijkheid neemt."],
  ["Kun je teamcultuur meten?", "Teamcultuur kan niet volledig in één cijfer worden samengevat, maar patronen kunnen wel zichtbaar worden gemaakt. Dat kan met teamscans, interviews, observaties, reflectievragen en gesprekken over concreet gedrag. Combineer metingen altijd met een verdiepend gesprek."],
];

const related = [
  ["Psychologische veiligheid", "De voedingsbodem waarop leren en cultuurverandering mogelijk worden.", "/psychologische-veiligheid"],
  ["Boven- en onderstroom", "Waarom de zichtbare afspraken en de onzichtbare beleving uit elkaar kunnen lopen.", "/boven-en-onderstroom"],
  ["Kleine experimenten", "Hoe teams nieuw gedrag klein, veilig en concreet uitproberen.", "/kleine-experimenten"],
  ["Brein en samenwerking", "Waarom het brein terugvalt op vertrouwde patronen, ook als ze niet helpen.", "/brein-en-samenwerking"],
  ["Sociale veiligheid", "De ondergrens van respectvol met elkaar omgaan, waarop cultuur kan groeien.", "/sociale-veiligheid"],
  ["Teamontwikkeling", "Van inzicht naar concrete stappen in de dagelijkse samenwerking.", "/teamontwikkeling"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Teamcultuur: waarom gedrag sterker is dan afspraken",
      "name": "Teamcultuur",
      "url": `https://www.mijnteamkompas.nl${ROUTE}`,
      "image": IMAGE,
      "description": "Wat is teamcultuur en waarom is cultuur veranderen zo moeilijk? Ontdek hoe gedrag, psychologische veiligheid, leiderschap en kleine experimenten samen cultuurverandering mogelijk maken.",
      "author": { "@type": "Organization", "name": "Mijn Teamkompas" },
      "publisher": { "@type": "Organization", "name": "Mijn Teamkompas", "url": "https://www.mijnteamkompas.nl" },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", "position": 2, "name": "Kennis", "item": "https://www.mijnteamkompas.nl/kennis/kenniskaart-teamontwikkeling" },
        { "@type": "ListItem", "position": 3, "name": "Teamcultuur", "item": `https://www.mijnteamkompas.nl${ROUTE}` },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
    },
  ],
};

function Voorbeeld({ titel, children }) {
  return (
    <Card accent="var(--tk-color-teal)">
      <h3>{titel}</h3>
      {children}
    </Card>
  );
}

export default function Teamcultuur() {
  return (
    <PageShell>
      <Helmet>
        <title>Teamcultuur: waarom gedrag sterker is dan afspraken | Mijn Teamkompas</title>
        <meta name="description" content="Wat is teamcultuur en waarom is cultuur veranderen zo moeilijk? Ontdek hoe gedrag, psychologische veiligheid, leiderschap en kleine experimenten samen cultuurverandering mogelijk maken." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Teamcultuur: waarom gedrag sterker is dan afspraken | Mijn Teamkompas" />
        <meta property="og:description" content="Teamcultuur is niet wat een organisatie zegt belangrijk te vinden, maar het gedrag dat mensen samen normaal zijn gaan vinden. Over cultuurverandering die werkt." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:image" content={IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Teamcultuur: waarom gedrag sterker is dan afspraken | Mijn Teamkompas" />
        <meta name="twitter:description" content="Wat is teamcultuur en waarom is cultuur veranderen zo moeilijk? Over gedrag, veiligheid, leiderschap en kleine experimenten." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <Section className="tk-knowledge-hero tk-jdr-hero">
        <div className="tk-jdr-hero-inner">
          <div className="tk-jdr-hero-text">
            <Eyebrow withDot>Kennis · teamcultuur</Eyebrow>
            <h1 className="tk-heading-xl">Teamcultuur: waarom gedrag sterker is dan afspraken</h1>
            <p className="tk-lead">"We moeten aan de cultuur werken." Het is een van de meest uitgesproken zinnen binnen organisaties. Toch blijkt het verrassend moeilijk om uit te leggen wat cultuur eigenlijk is. Cultuur is veel concreter dan het lijkt: ze is zichtbaar in het dagelijkse gedrag van mensen.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
          <img className="tk-jdr-hero-media" src="/teamkompas-workshop-hero.jpg" alt="Teamcultuur wordt zichtbaar in het dagelijkse gedrag en de ongeschreven regels binnen een team." />
        </div>
      </Section>

      {/* Intro + kernzin */}
      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Wat cultuur werkelijk is</Eyebrow><h2 className="tk-heading-lg">Cultuur wordt zichtbaar in wat mensen iedere dag doen.</h2></div>
          <div className="tk-rich-text">
            <p>Cultuur wordt vaak gezien als iets ongrijpbaars dat je vooral aanvoelt. Maar ze zit niet alleen in kernwaarden aan de muur, een strategisch plan of de afspraken van een teamdag. Cultuur wordt zichtbaar in wie er tijdens een overleg spreekt en wie stil blijft, in hoe een team reageert wanneer iemand een fout maakt, en in de vraag of collega's elkaar echt aanspreken of vooral over elkaar praten.</p>
            <p>Teamcultuur is daarom niet alleen wat een organisatie zegt belangrijk te vinden. Teamcultuur is het gedrag dat mensen samen normaal zijn gaan vinden.</p>
          </div>
        </div>
        <div className="tk-note" style={{ fontWeight: 700, color: "var(--tk-color-ink)", borderLeft: "4px solid var(--tk-color-teal)", paddingLeft: 18 }}>
          Teamcultuur is het geheel van dagelijkse gedragspatronen en ongeschreven regels die bepalen hoe mensen binnen een team samenwerken.
        </div>
      </Section>

      {/* Inhoudsopgave */}
      <Section aria-label="Inhoudsopgave">
        <div className="tk-section-heading"><Eyebrow>Op deze pagina</Eyebrow><h2 className="tk-heading-lg">Inhoudsopgave</h2></div>
        <nav aria-label="Inhoudsopgave">
          <ul className="tk-tag-list" style={{ gap: 10 }}>
            {toc.map(([label, id]) => (
              <li key={id}>
                <a href={`#${id}`} className="tk-knowledge-topic tk-knowledge-topic-link">{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      {/* Wat is teamcultuur */}
      <Section id="wat-is-teamcultuur">
        <div className="tk-section-heading"><Eyebrow>Definitie</Eyebrow><h2 className="tk-heading-lg">Wat is teamcultuur?</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Teamcultuur bestaat uit de gewoontes, verwachtingen en ongeschreven regels die binnen een team zijn ontstaan. Die regels staan meestal niet in een handboek, en toch weten teamleden vaak precies welk gedrag wel en niet wordt gewaardeerd.</p>
        </div>
        <ul className="tk-tag-list" style={{ marginTop: 16 }}>
          {["Durven collega's elkaar aan te spreken?", "Worden fouten besproken of verborgen?", "Wordt hulp vragen gewaardeerd of gezien als zwakte?", "Krijgen afwijkende meningen ruimte?", "Worden besluiten samen onderzocht of van bovenaf genomen?", "Spreekt men mét elkaar of vooral óver elkaar?", "Worden afspraken ook nagekomen als de leidinggevende wegkijkt?"].map((q) => <li key={q}>{q}</li>)}
        </ul>
        <div className="tk-rich-text" style={{ maxWidth: 820, marginTop: 18 }}>
          <p>Een team kan op papier dezelfde organisatiewaarden hebben als een ander team, maar in de praktijk een heel andere cultuur ontwikkelen. Binnen dezelfde organisatie kan het ene team open, nieuwsgierig en lerend zijn, terwijl een ander team voorzichtig, afwachtend of conflictvermijdend functioneert. Daarom bestaat er niet alleen zoiets als organisatiecultuur: binnen organisaties bestaan vaak meerdere teamculturen naast elkaar.</p>
        </div>
      </Section>

      {/* Gedrag sterker dan afspraken + contrastblok */}
      <Section id="gedrag-en-afspraken" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Gedrag versus afspraken</Eyebrow><h2 className="tk-heading-lg">Waarom gedrag sterker is dan afspraken</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Vrijwel iedere organisatie heeft waarden en gedragsafspraken: respect, verbinding, eigenaarschap, openheid, vertrouwen. Maar de werkelijke cultuur wordt bepaald door wat er gebeurt wanneer het spannend wordt. Wat gebeurt er als iemand een fout maakt, als een collega het oneens is, als een afspraak niet wordt nagekomen of als de werkdruk oploopt? Juist dan wordt zichtbaar welke normen echt gelden.</p>
          <p>Afspraken vertellen hoe we graag zouden willen samenwerken. Gedrag laat zien hoe we daadwerkelijk samenwerken. Wanneer woorden en gedrag elkaar tegenspreken, wint gedrag bijna altijd.</p>
        </div>
        <div className="tk-jdr-two" style={{ marginTop: 24 }}>
          <Card accent="var(--tk-color-orange)">
            <h3>Wat we zeggen</h3>
            <ul className="tk-tag-list">{zeggen.map((z) => <li key={z}>{z}</li>)}</ul>
          </Card>
          <Card accent="var(--tk-color-teal)">
            <h3>Wat mensen ervaren</h3>
            <ul className="tk-tag-list">{ervaren.map((e) => <li key={e}>{e}</li>)}</ul>
          </Card>
        </div>
        <p className="tk-note">De cultuur wordt niet gevormd door de afspraak, maar door de ervaring die zich daarna herhaalt.</p>
      </Section>

      {/* Hoe ontstaat cultuur */}
      <Section id="hoe-ontstaat-cultuur">
        <div className="tk-section-heading"><Eyebrow>Hoe cultuur ontstaat</Eyebrow><h2 className="tk-heading-lg">Cultuur ontstaat in duizenden kleine interacties</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Teamcultuur ontstaat niet op één moment. Iedere reactie binnen een team bevat informatie over welk gedrag veilig, gewenst en normaal is. Wordt een kritisch idee direct afgekapt, dan leren anderen dat terughoudendheid verstandiger kan zijn. Vertelt een manager open over een eigen fout, dan leert het team dat kwetsbaarheid mogelijk is.</p>
          <p>De cultuur wordt gevormd door herhaling. Niet door één incident, maar door het patroon dat uit meerdere ervaringen ontstaat. Mensen observeren voortdurend welk gedrag wordt beloond, genegeerd of gecorrigeerd, wie ruimte krijgt en waarover het stil blijft. Uit die waarnemingen ontstaan ongeschreven regels. Na verloop van tijd passen mensen hun gedrag automatisch aan de groep aan. Zo wordt gedrag een patroon, en wordt het patroon onderdeel van de cultuur.</p>
        </div>
      </Section>

      {/* Waarom veranderen moeilijk is */}
      <Section id="waarom-veranderen-moeilijk" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Weerstand tegen verandering</Eyebrow><h2 className="tk-heading-lg">Waarom teams zo moeilijk veranderen</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Veel cultuurprogramma's beginnen met goede bedoelingen: nieuwe waarden, bijeenkomsten, gedragsafspraken. Toch valt een groot deel van de teams na verloop van tijd terug in oude patronen. Dat komt niet alleen doordat mensen ongemotiveerd zijn. Cultuurverandering is moeilijk omdat het bestaande gedrag vaak een functie heeft gekregen.</p>
          <p>Stil blijven kan bescherming bieden tegen kritiek. Besluiten bij de manager neerleggen kan bescherming bieden tegen verantwoordelijkheid. Conflicten vermijden kan de schijnbare harmonie bewaren. Oud gedrag is dus niet altijd onlogisch; het is vaak een aanpassing aan eerdere ervaringen. Een traject dat alleen vertelt welk gedrag gewenst is, maar niet onderzoekt waarom het oude gedrag ontstond, blijft aan de oppervlakte. Teams veranderen pas wanneer ze naast nieuwe afspraken ook begrijpen welk patroon ze samen in stand houden.</p>
        </div>
      </Section>

      {/* Boven- en onderstroom */}
      <Section id="boven-en-onderstroom">
        <div className="tk-section-heading"><Eyebrow>Zichtbaar en onzichtbaar</Eyebrow><h2 className="tk-heading-lg">De boven- en onderstroom van teamcultuur</h2></div>
        <div className="tk-jdr-two">
          <Card accent="var(--tk-color-green)">
            <h3>Bovenstroom</h3>
            <p>Alles wat zichtbaar, formeel en georganiseerd is.</p>
            <ul className="tk-tag-list">{["doelen", "rollen", "processen", "structuren", "verantwoordelijkheden", "overlegvormen", "KPI's", "werkafspraken"].map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
          <Card accent="var(--tk-color-blue)">
            <h3>Onderstroom</h3>
            <p>Wat mensen voelen, denken en ervaren, maar niet altijd uitspreken.</p>
            <ul className="tk-tag-list">{["vertrouwen", "onzekerheid", "irritatie", "loyaliteit", "eerdere teleurstellingen", "informele invloed", "angst voor gezichtsverlies", "onuitgesproken verwachtingen"].map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
        </div>
        <div className="tk-rich-text" style={{ maxWidth: 820, marginTop: 18 }}>
          <p>Veel cultuurveranderingen worden vooral vanuit de bovenstroom aangepakt. Maar wanneer de onderstroom niet wordt onderzocht, blijven oude patronen bestaan. Een team kan afspreken meer feedback te geven; als mensen in de onderstroom bang zijn dat openheid tegen hen gebruikt wordt, verandert het gedrag nauwelijks. De bovenstroom kan richting geven, de onderstroom bepaalt vaak of mensen daadwerkelijk durven bewegen. <a href="/boven-en-onderstroom">Lees meer over de werking van de boven- en onderstroom binnen teams.</a></p>
        </div>
      </Section>

      {/* Psychologische veiligheid */}
      <Section id="psychologische-veiligheid" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>De voedingsbodem</Eyebrow><h2 className="tk-heading-lg">Psychologische veiligheid als voedingsbodem</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Een gezonde teamcultuur vraagt om psychologische veiligheid. Dat betekent niet dat iedereen het altijd met elkaar eens is, of dat gesprekken altijd comfortabel blijven. Het betekent dat mensen voldoende ruimte ervaren om interpersoonlijk risico te nemen: vragen stellen, twijfel uitspreken, fouten toegeven, hulp vragen, een afwijkende mening delen en elkaar aanspreken.</p>
          <p>Zonder die veiligheid passen mensen zich aan. Ze zeggen minder, stellen minder vragen en houden fouten voor zichzelf. Aan de oppervlakte kan dan rust ontstaan, terwijl belangrijke informatie onbesproken blijft. Psychologische veiligheid is daarom geen zachte toevoeging, maar de voedingsbodem waarop leren, verbeteren en cultuurverandering mogelijk worden. <a href="/psychologische-veiligheid">Lees meer over psychologische veiligheid in teams.</a></p>
          <p><a href="/sociale-veiligheid">Sociale veiligheid</a> hangt hiermee samen, maar betekent niet precies hetzelfde: sociale veiligheid is de ondergrens (vrij zijn van pesten, uitsluiting en intimidatie), psychologische veiligheid is de bovengrens (durven bijdragen). Het een maakt het ander mogelijk.</p>
        </div>
      </Section>

      {/* Neuromanagement */}
      <Section id="neuromanagement">
        <div className="tk-section-heading"><Eyebrow>Het brein en gewoonte</Eyebrow><h2 className="tk-heading-lg">Waarom het brein terugvalt op oude patronen</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Ons brein probeert voortdurend energie te besparen. Gedrag dat vaak wordt herhaald, vraagt steeds minder bewuste aandacht. Dat is nuttig, maar het speelt ook binnen teams. Wanneer overleg steeds op dezelfde manier verloopt, ontstaat een routine. Wanneer de manager uiteindelijk steeds de beslissing neemt, wacht het team daar sneller op. Deze patronen voelen na verloop van tijd vertrouwd, ook wanneer ze niet effectief zijn.</p>
          <p>Nieuw gedrag vraagt meer aandacht en energie, en brengt onzekerheid met zich mee: mensen weten nog niet hoe anderen zullen reageren. Daardoor kan een team tijdens een teamdag enthousiast besluiten om het anders te doen, en enkele weken later toch terugvallen. Meestal niet doordat de motivatie verdween, maar doordat het oude patroon sterker is ingesleten. Cultuurverandering vraagt daarom om herhaling en om steun uit de omgeving. <a href="/brein-en-samenwerking">Lees meer over wat er in ons brein gebeurt tijdens samenwerking.</a></p>
        </div>
      </Section>

      {/* Kleine experimenten */}
      <Section id="kleine-experimenten" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>De motor van verandering</Eyebrow><h2 className="tk-heading-lg">Kleine experimenten als motor voor cultuurverandering</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Veel organisaties benaderen cultuurverandering als een groot programma. Dat kan richting geven, maar de werkelijke verandering ontstaat in het dagelijkse gedrag van teams. Daarom zijn kleine experimenten vaak krachtiger dan grote abstracte voornemens. Een klein experiment maakt nieuw gedrag concreet, tijdelijk en onderzoekbaar: het team probeert een werkwijze een korte periode uit en onderzoekt daarna samen wat het effect was.</p>
        </div>
        <ul className="tk-tag-list" style={{ marginTop: 8 }}>{experimenten.map((e) => <li key={e}>{e}</li>)}</ul>
        <ol className="tk-jdr-steps" style={{ marginTop: 26 }}>
          {stappen.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}
        </ol>
        <p className="tk-note"><a href="/kleine-experimenten">Lees meer over kleine experimenten in teams.</a></p>
      </Section>

      {/* Van waarden naar zichtbaar gedrag */}
      <Section id="zichtbaar-gedrag">
        <div className="tk-section-heading"><Eyebrow>Concreet maken</Eyebrow><h2 className="tk-heading-lg">Cultuur veranderen begint met zichtbaar gedrag</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Teams praten bij cultuurverandering vaak in algemene begrippen: opener worden, meer vertrouwen, beter samenwerken, meer eigenaarschap tonen. Die uitspraken klinken logisch, maar zijn nog niet concreet genoeg om gedrag te veranderen. De eerste stap is abstracte begrippen vertalen naar zichtbaar gedrag.</p>
        </div>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 18 }}>
          <Card accent="var(--tk-color-teal)"><h3>Meer openheid</h3><ul className="tk-tag-list">{["zorgen eerder uitspreken", "actief vragen naar afwijkende meningen", "gemaakte fouten delen", "besluiten niet mooier voorstellen dan ze zijn"].map((i) => <li key={i}>{i}</li>)}</ul></Card>
          <Card accent="var(--tk-color-green)"><h3>Meer eigenaarschap</h3><ul className="tk-tag-list">{["zelf met een voorstel komen", "afspraken nakomen", "tijdig aangeven wanneer iets niet lukt", "een volgende stap voorstellen"].map((i) => <li key={i}>{i}</li>)}</ul></Card>
          <Card accent="var(--tk-color-blue)"><h3>Beter samenwerken</h3><ul className="tk-tag-list">{["elkaar tijdig betrekken", "informatie actief delen", "hulp vragen en aanbieden", "gezamenlijke doelen zwaarder laten wegen"].map((i) => <li key={i}>{i}</li>)}</ul></Card>
        </div>
        <p className="tk-note">Pas wanneer een team gezamenlijk kan beschrijven welk gedrag het vaker en minder vaak wil zien, wordt cultuurverandering praktisch.</p>
      </Section>

      {/* Leiderschap */}
      <Section id="leiderschap" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Voorbeeldgedrag</Eyebrow><h2 className="tk-heading-lg">De rol van leiderschap</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Leiders hebben veel invloed op teamcultuur, niet alleen door formele besluiten, maar vooral door hun dagelijkse reacties. Teamleden letten nauwkeurig op wat een leider doet wanneer het spannend wordt. Een leider die openheid vraagt maar defensief reageert op feedback, leert het team voorzichtig te zijn. Een leider die eigenaarschap stimuleert maar ieder voorstel zelf aanpast, leert het team om af te wachten.</p>
          <p>Wat een leider consequent aandacht geeft, wordt belangrijk. Wat een leider accepteert, wordt onderdeel van de norm. Effectief leiderschap bij cultuurverandering betekent het gewenste gedrag voorleven, nieuwsgierig blijven bij een andere mening, fouten gebruiken als bron voor leren, duidelijk begrenzen wanneer gedrag schadelijk is, en aandacht geven aan gedrag en niet alleen aan resultaten. Cultuurverandering vraagt geen perfecte leider, maar een leider die eigen gedrag durft te onderzoeken en zichtbaar blijft leren. <a href="/teamcoaching">Lees meer over teamcoaching en leiderschapsbegeleiding.</a></p>
        </div>
      </Section>

      {/* Praktijkvoorbeelden */}
      <Section id="praktijkvoorbeelden">
        <div className="tk-section-heading"><Eyebrow>In de praktijk</Eyebrow><h2 className="tk-heading-lg">Drie praktijkvoorbeelden</h2></div>
        <div className="tk-grid tk-grid-3">
          <Voorbeeld titel="Feedback afspreken is nog geen feedbackcultuur">
            <p>Een team spreekt af elkaar meer feedback te geven. Toch gebeurt er weinig: niemand wil als eerste het risico nemen. De afspraak zit in de bovenstroom, de terughoudendheid in de onderstroom. Wanneer de teamleider zelf begint ("ik heb vorige week te snel besloten, wat hadden jullie van mij nodig?") en niet in de verdediging schiet, ontstaat een nieuwe ervaring. Herhaalt die zich, dan kan langzaam een feedbackcultuur groeien.</p>
          </Voorbeeld>
          <Voorbeeld titel="Eigenaarschap zonder ruimte werkt niet">
            <p>Een manager vraagt om meer eigenaarschap, maar corrigeert voorstellen regelmatig. Het team leert dat zelfstandige besluiten onzekerheid opleveren. In een experiment mogen medewerkers binnen een afgebakend onderwerp zelf beslissen; de manager stelt alleen vragen. Na vier weken bespreken ze wat werkte, waar twijfel ontstond en welke kaders onduidelijk waren. Door naast eigenaarschap ook de ruimte te veranderen, ontstaat nieuw gedrag.</p>
          </Voorbeeld>
          <Voorbeeld titel="Stilte tijdens overleggen">
            <p>Steeds dezelfde drie mensen domineren het overleg; anderen zeggen weinig, maar hebben achteraf wél ideeën. In een experiment krijgt iedereen eerst twee minuten om gedachten op te schrijven, daarna deelt ieder kort zijn perspectief. Meer mensen brengen informatie in en de besluiten worden beter. Stilte bleek geen gebrek aan betrokkenheid, maar behoefte aan tijd om te ordenen.</p>
          </Voorbeeld>
        </div>
      </Section>

      {/* Reflectieblok */}
      <Section className="tk-jdr-reflection">
        <Card>
          <Eyebrow>Reflectie voor je team</Eyebrow>
          <h2 className="tk-heading-lg">Hoe weet je welke cultuur je team werkelijk heeft?</h2>
          <p>Vrijwel iedereen noemt respect, vertrouwen en samenwerking belangrijk. Interessanter is wat mensen werkelijk ervaren. Gebruik deze vragen tijdens een teamoverleg:</p>
          <ul className="tk-tag-list">{reflectievragen.map((v) => <li key={v}>{v}</li>)}</ul>
        </Card>
      </Section>

      {/* Gezonde cultuur */}
      <Section id="gezonde-cultuur">
        <div className="tk-section-heading"><Eyebrow>Ongemak hoort erbij</Eyebrow><h2 className="tk-heading-lg">Een gezonde teamcultuur is niet altijd comfortabel</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Een gezonde cultuur betekent niet dat er geen spanning of conflict is. Waar mensen echt samenwerken, ontstaan verschillen van inzicht. Het verschil zit niet in de afwezigheid van spanning, maar in hoe het team ermee omgaat: verschillen benoemen zonder elkaar af te wijzen, ongemak verdragen zonder meteen naar harmonie te zoeken, inhoud en persoon uit elkaar houden, en na een moeilijk gesprek opnieuw verbinding maken.</p>
          <p>Een cultuur waarin iedereen altijd vriendelijk knikt, kan aan de oppervlakte prettig lijken. Wanneer belangrijke zorgen niet worden uitgesproken, is die harmonie echter kwetsbaar. Een gezonde cultuur voelt daarom niet altijd comfortabel, maar maakt het wel mogelijk om samen te leren en moeilijke vraagstukken werkelijk te bespreken.</p>
        </div>
      </Section>

      {/* Teamcultuur vs organisatiecultuur */}
      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Twee niveaus</Eyebrow><h2 className="tk-heading-lg">Teamcultuur en organisatiecultuur</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Teamcultuur en organisatiecultuur zijn verbonden, maar niet hetzelfde. Organisatiecultuur wordt beïnvloed door brede factoren als strategie, leiderschapsstijl, beloningssystemen, structuur en geschiedenis. Teamcultuur ontstaat dichter bij het dagelijkse werk: de directe leidinggevende, de samenstelling van het team, onderlinge ervaringen, werkdruk, overlegpatronen en informele leiders.</p>
          <p>Daardoor kunnen binnen dezelfde organisatie grote cultuurverschillen bestaan. Een brede organisatieverandering krijgt pas betekenis wanneer teams de gewenste waarden vertalen naar hun eigen dagelijkse gedrag. Organisatiecultuur wordt uiteindelijk zichtbaar in lokale teamculturen.</p>
        </div>
      </Section>

      {/* Cultuurspiegel-experiment */}
      <Section id="experiment">
        <div className="tk-section-heading"><Eyebrow>Direct toepasbaar</Eyebrow><h2 className="tk-heading-lg">Het cultuurspiegel-experiment</h2></div>
        <p className="tk-lead" style={{ margin: "0 0 20px" }}>Probeer dit experiment twee weken lang met je team.</p>
        <ol className="tk-jdr-steps">
          <li><strong>Kies één terugkerend moment</strong><span>Een overleg, dagstart of ander moment waarop het team samenkomt.</span></li>
          <li><strong>Benoem het gewenste gedrag</strong><span>Eén concreet gedrag dat jullie vaker willen zien, bijvoorbeeld elkaar laten uitspreken of hulp vragen.</span></li>
          <li><strong>Wijs een observator aan</strong><span>Eén teamlid let op het groepsgedrag, niet op de inhoud.</span></li>
          <li><strong>Reflecteer vijf minuten</strong><span>Wanneer zagen we het gewenste gedrag, wat hielp, wanneer vielen we terug?</span></li>
          <li><strong>Evalueer na twee weken</strong><span>Doorgaan, aanpassen, stoppen of een nieuw experiment starten.</span></li>
        </ol>
        <p className="tk-note">Cultuur verandert niet doordat een team één keer het goede gesprek voert. Cultuur verandert wanneer een team nieuw gedrag vaak genoeg oefent om het normaal te maken.</p>
      </Section>

      {/* Reflectievraag afsluiter */}
      <Section className="tk-jdr-reflection">
        <Card>
          <Eyebrow>Reflectievraag</Eyebrow>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--tk-color-ink)", lineHeight: 1.4 }}>Welk gedrag is binnen jullie team zo normaal geworden dat niemand het meer ter discussie stelt?</p>
        </Card>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <div className="tk-section-heading"><Eyebrow>Veelgestelde vragen</Eyebrow><h2 className="tk-heading-lg">Veelgestelde vragen over teamcultuur</h2></div>
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
      <Section>
        <div className="tk-section-heading"><Eyebrow>Verder lezen</Eyebrow><h2 className="tk-heading-lg">Verdieping op de fundamenten van teamcultuur</h2></div>
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
            <Eyebrow>Van patroon naar beweging</Eyebrow>
            <h2 className="tk-heading-lg">Welke patronen bepalen jullie teamcultuur?</h2>
            <p>Een teamcultuur verandert niet door nog meer afspraken te maken. Verandering begint met het zichtbaar maken van de patronen die de samenwerking iedere dag beïnvloeden. Met de teamscan van Mijn Teamkompas onderzoeken teams hoe zij samenwerken, welke patronen hen helpen en waar ruimte voor ontwikkeling ligt.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
