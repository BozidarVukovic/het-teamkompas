import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/impact-van-een-teamdag";
const IMAGE = "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg";

const toc = [
  ["De dag was waarschijnlijk niet mislukt", "niet-mislukt"],
  ["Inzicht is nog geen ander gedrag", "inzicht-gedrag"],
  ["Waarom oude patronen zo sterk zijn", "patronen"],
  ["Afspraken boven, twijfels onder", "onderstroom"],
  ["Veiligheid om te oefenen", "veiligheid"],
  ["Waarom algemene afspraken verdampen", "afspraken"],
  ["Een actielijst is nog geen eigenaarschap", "eigenaarschap"],
  ["Van groot voornemen naar klein experiment", "experiment"],
  ["Wat de leidinggevende daarna doet", "leidinggevende"],
  ["Borgen in het gewone werkritme", "borging"],
  ["Vijf vragen voordat iedereen naar huis gaat", "vijf-vragen"],
  ["Veelgestelde vragen", "faq"],
];

const opbrengsten = [
  "Mensen begrijpen elkaar beter dan de dag ervoor.",
  "Een lastig onderwerp is voor het eerst hardop besproken.",
  "Het team heeft gedeelde taal gekregen voor wat er speelt.",
  "Er zijn mogelijkheden gezien die eerder buiten beeld bleven.",
  "Even was er ruimte om buiten de dagelijkse routine te denken.",
];

const trap = [
  ["Weten", "Het team begrijpt wat er anders moet. Dit lukt op een goede dag bijna altijd."],
  ["Willen", "De motivatie is er, zeker in de energie van het moment."],
  ["Kunnen", "Nieuw gedrag vraagt vaardigheid en ruimte. Dat is zelden meteen aanwezig."],
  ["Doen", "De eerste keer vraagt moed, want niemand weet hoe anderen reageren."],
  ["Blijven doen", "Hier sneuvelen de meeste voornemens: het gewone werk komt ertussen."],
];

const remmers = ["tijdsdruk", "bestaande rolpatronen", "ingesleten routines", "sociale verwachtingen", "oude vergaderstructuren", "onduidelijke verantwoordelijkheden"];

const onderVragen = [
  "Vertrouwen we elkaar voldoende?",
  "Mag ik een collega echt aanspreken?",
  "Geldt deze afspraak ook voor de manager?",
  "Worden afwijkende meningen werkelijk gewaardeerd?",
  "Wie bepaalt uiteindelijk wat er gebeurt?",
  "Wat gebeurt er als ik me niet aan de nieuwe afspraak houd?",
  "Geloven we echt dat dit prioriteit heeft?",
];

const vaag = ["We gaan beter communiceren.", "We spreken elkaar vaker aan.", "We nemen meer eigenaarschap.", "We werken beter samen.", "We luisteren beter naar elkaar."];
const concreet = [
  "Aan het begin van ieder werkoverleg benoemen we samen de twee belangrijkste prioriteiten, en aan het einde wie welke vervolgstap doet.",
  "Merkt iemand dat een afspraak niet wordt nagekomen, dan benoemt diegene dat binnen twee werkdagen rechtstreeks bij de betrokken collega.",
  "Bij elk besluit vragen we expliciet welk bezwaar nog niet is uitgesproken.",
];

const experimentDelen = [
  ["Welk gedrag", "Wat gaan we concreet anders doen, in woorden die een buitenstaander zou kunnen zien?"],
  ["Welke situatie", "In welk overleg of moment passen we dit toe? Zonder plek blijft het vrijblijvend."],
  ["Hoe lang", "Een beperkte looptijd, bijvoorbeeld vier weken. Dat maakt het veilig om te proberen."],
  ["Wie trekt", "Eén eigenaar of een duo dat eraan herinnert. Iedereen verantwoordelijk maken werkt zelden."],
  ["Wanneer evalueren", "Een datum die al staat voordat het experiment begint."],
  ["Waaraan merken we het", "Een eenvoudige manier om te zien of het effect had. Geen meetsysteem, wel een gedeeld beeld."],
];

const managerGedrag = [
  ["Voorbeeldgedrag", "Doe zelf als eerste wat het team heeft afgesproken, ook als het ongemakkelijk uitkomt."],
  ["Aandacht en prioriteit", "Wat je consequent agendeert, wordt belangrijk. Wat je overslaat, verdwijnt."],
  ["Reageren op tegenspraak", "De eerste keer dat iemand je aanspreekt op een afspraak, bepaalt of het een tweede keer gebeurt."],
  ["Niet te snel overnemen", "Een team dat worstelt is aan het leren. Te vroeg oplossen haalt dat leren weg."],
  ["Eigen aandeel benoemen", "Vertel wat je zelf anders gaat doen. Dat maakt het gesprek gelijkwaardiger."],
  ["Ruimte beschermen", "Zorg dat de dagelijkse productie niet elk ontwikkelmoment opeet."],
];

const borgingsmomenten = ["het wekelijkse werkoverleg", "een korte check-in", "een maandelijkse teamreflectie", "bestaande KPI- of OGSM-besprekingen", "intervisie", "duo's die elkaar steunen", "een terugkerende evaluatie van teamafspraken", "een after action review", "een periodieke teamscan"];

const ritme = [
  ["Wekelijks", "Tien minuten aandacht voor het experiment: wat zagen we, wat hield ons tegen?"],
  ["Na vier weken", "Samen evalueren: houden, aanpassen of stoppen?"],
  ["Na drie maanden", "Opnieuw kijken welke afspraken nog werken en welke stil zijn verdwenen."],
];

const vijfVragen = [
  "Welk concreet gedrag moet na vandaag anders zichtbaar zijn?",
  "Hebben teamleden invloed gehad op de gekozen verbeterpunten?",
  "Zijn de belangrijkste twijfels en spanningen hardop besproken?",
  "Is duidelijk wie welk experiment trekt en wanneer we evalueren?",
  "Is de opvolging onderdeel geworden van ons normale werkritme?",
];

const faqs = [
  ["Waarom verandert er na een teamdag vaak zo weinig?", "Meestal doordat de dag als losstaande gebeurtenis wordt behandeld. Het team krijgt inzicht en energie, maar komt terug in dezelfde omgeving: dezelfde agenda, dezelfde rolpatronen, dezelfde overlegvormen. Zonder oefening, opvolging en een aangepaste omgeving is terugval een logisch gevolg, geen gebrek aan motivatie."],
  ["Betekent terugval dat de dag mislukt is?", "Zelden. Een dag kan waardevol zijn geweest omdat mensen elkaar beter begrijpen, een lastig onderwerp voor het eerst bespraken of gedeelde taal ontwikkelden. Het probleem zit in de verwachting dat één betekenisvolle dag automatisch blijvend gedrag oplevert."],
  ["Hoe zorg je dat afspraken blijven leven?", "Maak ze zo concreet dat een buitenstaander het gedrag zou kunnen zien, beperk het aantal tot één of twee, geef ze een eigenaar en een evaluatiedatum, en hang de opvolging aan een moment dat toch al bestaat, zoals het wekelijkse werkoverleg."],
  ["Waarom werken kleine experimenten beter dan een lange actielijst?", "Een lijst met tien verbeterpunten vraagt aandacht die er in de dagelijkse drukte niet is. Eén klein experiment is tijdelijk, overzichtelijk en veilig om te proberen. Het levert snel een ervaring op, en die ervaring is wat gedrag verandert."],
  ["Wat is de rol van de leidinggevende na de dag?", "Medewerkers kijken vooral naar wat de leidinggevende in de weken erna doet. Voorbeeldgedrag, blijvende aandacht, rustig reageren op tegenspraak en het beschermen van ontwikkeltijd wegen zwaarder dan wat er tijdens de dag is gezegd."],
  ["Hoe lang duurt het voordat nieuw teamgedrag normaal voelt?", "Daar bestaat geen vaste termijn voor. Wel geldt dat nieuw gedrag herhaling en zichtbare steun nodig heeft. Een ritme van wekelijkse aandacht en een evaluatie na enkele weken helpt meer dan een intensieve maar eenmalige inspanning."],
];

const related = [
  ["Een teamdag organiseren", "Praktische voorbereiding, programma-opbouw en begeleiding van de dag zelf.", "/teamdag"],
  ["Kleine experimenten", "Hoe teams nieuw gedrag klein, veilig en concreet uitproberen.", "/kleine-experimenten"],
  ["Boven- en onderstroom", "Waarom afspraken kwetsbaar blijven zolang de onderstroom onbesproken is.", "/boven-en-onderstroom"],
  ["Eigenaarschap in teams", "Waarom verantwoordelijkheid meer vraagt dan een naam achter een actie.", "/kennis/eigenaarschap-in-teams"],
  ["Verandermanagement", "Waarom veranderingen stranden en wat duurzame beweging mogelijk maakt.", "/kennis/verandermanagement"],
  ["Teamcultuur", "Hoe nieuw gedrag uiteindelijk de nieuwe norm wordt.", "/kennis/teamcultuur"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Waarom een teamdag vaak weinig verandert en hoe je zorgt dat hij wél impact heeft",
      name: "De impact van een teamdag",
      url: `https://www.mijnteamkompas.nl${ROUTE}`,
      image: IMAGE,
      description: "Waarom vallen teams na een inspirerende teamdag terug in oud gedrag? Over terugval, borging en het vertalen van inzicht naar kleine experimenten.",
      author: { "@type": "Organization", name: "Mijn Teamkompas" },
      publisher: { "@type": "Organization", name: "Mijn Teamkompas", url: "https://www.mijnteamkompas.nl" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", position: 2, name: "Kennis", item: "https://www.mijnteamkompas.nl/kennis/kenniskaart-teamontwikkeling" },
        { "@type": "ListItem", position: 3, name: "De impact van een teamdag", item: `https://www.mijnteamkompas.nl${ROUTE}` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

export default function ImpactVanEenTeamdag() {
  return (
    <PageShell>
      <Helmet>
        <title>Waarom een teamdag vaak weinig verandert | Mijn Teamkompas</title>
        <meta name="description" content="Waarom vallen teams na een inspirerende teamdag terug in oud gedrag? Ontdek hoe je inzichten vertaalt naar kleine experimenten en blijvend resultaat." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Waarom een teamdag vaak weinig verandert (en hoe het wél blijft hangen)" />
        <meta property="og:description" content="Terugval na een goede teamdag is zelden een motivatieprobleem. Over patronen, onderstroom, eigenaarschap en borgen in het gewone werkritme." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:image" content={IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Waarom een teamdag vaak weinig verandert | Mijn Teamkompas" />
        <meta name="twitter:description" content="Over terugval na een goede teamdag, en hoe inzicht wél tot ander gedrag leidt." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <Section className="tk-knowledge-hero tk-jdr-hero">
        <div className="tk-jdr-hero-inner">
          <div className="tk-jdr-hero-text">
            <Eyebrow withDot>Kennis · impact en borging</Eyebrow>
            <h1 className="tk-heading-xl">Waarom een teamdag vaak weinig verandert</h1>
            <p className="tk-lead">Een geslaagde dag. Er wordt open gesproken, er ontstaan goede ideeën, en aan het einde spreekt iedereen af om het anders te gaan doen. De energie is voelbaar. Enkele weken later is de agenda weer vol, worden dezelfde gesprekken vermeden en zijn de oude irritaties terug.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Bekijk de teamscan</ButtonLink><ButtonLink href="/teamdag" variant="secondary">Een teamdag organiseren</ButtonLink></div>
          </div>
          <img className="tk-jdr-hero-media" src="/teamkompas-samen-richting.jpg" alt="Een team dat samen terugkijkt op gemaakte afspraken en bepaalt wat er in het dagelijkse werk verandert." />
        </div>
      </Section>

      {/* Intro */}
      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>De centrale vraag</Eyebrow><h2 className="tk-heading-lg">Hoe kan een team na zo'n dag toch weer precies hetzelfde doen?</h2></div>
          <div className="tk-rich-text">
            <p>Het is een vraag die veel leidinggevenden en HR-professionals herkennen, en meestal wordt hij te snel beantwoord met "er was te weinig commitment". Terugval is zelden een motivatieprobleem.</p>
            <p>Bestaande patronen zijn eenvoudigweg sterker dan goede voornemens. Afspraken blijven te algemeen, de dagelijkse omgeving verandert niet mee, oude prikkels lokken oud gedrag uit, en de vragen die in de onderstroom leven blijven onbesproken. Daar komt bij dat er vaak geen ritme is om erop terug te komen.</p>
            <p>Op deze pagina staat wat er in die weken na zo'n dag gebeurt, en wat helpt om inzicht om te zetten in gedrag dat blijft. Wil je vooral weten hoe je de dag zelf voorbereidt, dan is de pagina over <a href="/teamdag">een teamdag organiseren met blijvend resultaat</a> een beter startpunt.</p>
          </div>
        </div>
      </Section>

      {/* Inhoudsopgave */}
      <Section aria-label="Inhoudsopgave">
        <div className="tk-section-heading"><Eyebrow>Op deze pagina</Eyebrow><h2 className="tk-heading-lg">Inhoudsopgave</h2></div>
        <nav aria-label="Inhoudsopgave">
          <ul className="tk-tag-list" style={{ gap: 10 }}>
            {toc.map(([label, id]) => <li key={id}><a href={`#${id}`} className="tk-knowledge-topic tk-knowledge-topic-link">{label}</a></li>)}
          </ul>
        </nav>
      </Section>

      {/* Niet mislukt */}
      <Section id="niet-mislukt">
        <div className="tk-section-heading"><Eyebrow>Eerst iets rechtzetten</Eyebrow><h2 className="tk-heading-lg">De dag was waarschijnlijk niet mislukt</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Terugval betekent niet automatisch dat de dag slecht was. Er kan juist veel gebeurd zijn dat waarde heeft.</p>
        </div>
        <ul className="tk-tag-list" style={{ marginTop: 14 }}>{opbrengsten.map((o) => <li key={o}>{o}</li>)}</ul>
        <p className="tk-note">Het knelpunt ontstaat bij de verwachting dat één betekenisvolle dag automatisch leidt tot blijvend gedrag. Zo'n dag kan een startpunt zijn; het veranderproces zelf is hij zelden.</p>
      </Section>

      {/* Inzicht is geen gedrag */}
      <Section id="inzicht-gedrag" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Van begrijpen naar doen</Eyebrow><h2 className="tk-heading-lg">Inzicht is nog geen ander gedrag</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Tussen begrijpen wat anders moet en het ook daadwerkelijk blijven doen, zitten meer stappen dan we meestal aannemen.</p>
        </div>
        <ol className="tk-jdr-steps" style={{ marginTop: 22 }}>
          {trap.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}
        </ol>
        <div className="tk-rich-text" style={{ maxWidth: 820, marginTop: 20 }}>
          <p>Op de dag zelf staan mensen vaak bij "willen". Daarna keren ze terug in een omgeving die het oude gedrag blijft ondersteunen:</p>
        </div>
        <ul className="tk-tag-list" style={{ marginTop: 12 }}>{remmers.map((r) => <li key={r}>{r}</li>)}</ul>
      </Section>

      {/* Patronen / brein */}
      <Section id="patronen">
        <div className="tk-section-heading"><Eyebrow>Waarom het zo gaat</Eyebrow><h2 className="tk-heading-lg">Waarom oude patronen zo sterk zijn</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Bekend gedrag vraagt minder mentale inspanning dan nieuw gedrag. Dat is prettig in een drukke week, maar het betekent ook dat we onder druk vrijwel automatisch terugvallen op de route die we kennen. Nieuw gedrag vraagt aandacht op het moment dat aandacht schaars is.</p>
          <p>Daar komt bij dat het nieuwe gedrag sociaal risico met zich meebrengt. Wie voor het eerst een collega aanspreekt, weet niet hoe dat valt. Eén inzicht op één dag is dan te weinig om een nieuw patroon op te bouwen; daarvoor is herhaling nodig, en het gevoel dat het veilig is om te oefenen. <a href="/brein-en-samenwerking">Lees meer over wat er in ons brein gebeurt tijdens samenwerking.</a></p>
        </div>
      </Section>

      {/* Onderstroom */}
      <Section id="onderstroom" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Boven en onder</Eyebrow><h2 className="tk-heading-lg">Afspraken boven, twijfels onder</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Tijdens zo'n dag worden vaak goede afspraken gemaakt in de bovenstroom: helder, opgeschreven, met instemming van iedereen. Ondertussen blijven er in de onderstroom vragen leven die niemand hardop stelt.</p>
        </div>
        <ul className="tk-tag-list" style={{ marginTop: 14 }}>{onderVragen.map((v) => <li key={v}>{v}</li>)}</ul>
        <p className="tk-note">Zolang deze vragen onbesproken blijven, blijft elke afspraak kwetsbaar. Ze wordt bij de eerste drukke week stilletjes ingeruild voor de oude gewoonte. <a href="/boven-en-onderstroom">Lees hoe boven- en onderstroom samenwerken.</a></p>
      </Section>

      {/* Veiligheid */}
      <Section id="veiligheid">
        <div className="tk-section-heading"><Eyebrow>Voorwaarde om te oefenen</Eyebrow><h2 className="tk-heading-lg">Veiligheid om te oefenen</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Nieuw gedrag oefenen betekent dat het een keer onhandig gaat. Een team kan dat alleen aan wanneer mensen ruimte ervaren om een fout toe te geven, twijfel te uiten, feedback te geven, een afwijkend perspectief in te brengen, elkaar aan afspraken te herinneren en te zeggen dat iets niet werkt.</p>
          <p>Dat is iets anders dan een prettige sfeer waarin iedereen het met elkaar eens is. Veiligheid maakt verschil en ongemak juist bruikbaar: het gesprek kan schuren zonder dat de relatie eronder lijdt. <a href="/psychologische-veiligheid">Lees meer over psychologische veiligheid in teams</a>, en over de ondergrens daarvan: <a href="/sociale-veiligheid">sociale veiligheid</a>.</p>
        </div>
      </Section>

      {/* Afspraken concreet */}
      <Section id="afspraken" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Intentie versus gedrag</Eyebrow><h2 className="tk-heading-lg">Waarom algemene afspraken verdampen</h2></div>
        <div className="tk-jdr-two">
          <Card accent="var(--tk-color-orange)">
            <h3>Intentie</h3>
            <p>Klinkt goed, maar niemand weet wat je morgen anders ziet.</p>
            <ul className="tk-tag-list">{vaag.map((v) => <li key={v}>{v}</li>)}</ul>
          </Card>
          <Card accent="var(--tk-color-teal)">
            <h3>Observeerbaar gedrag</h3>
            <p>Zo concreet dat een buitenstaander het zou kunnen zien gebeuren.</p>
            <ul className="tk-tag-list">{concreet.map((c) => <li key={c}>{c}</li>)}</ul>
          </Card>
        </div>
        <p className="tk-note">Een goede test: kan iemand die er niet bij was, aan het gedrag zien of de afspraak wordt nagekomen? Zo niet, dan is het nog een intentie.</p>
      </Section>

      {/* Eigenaarschap */}
      <Section id="eigenaarschap">
        <div className="tk-section-heading"><Eyebrow>Meer dan een naam achter een actie</Eyebrow><h2 className="tk-heading-lg">Een actielijst is nog geen eigenaarschap</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Aan het einde van de dag staat er vaak een lijst op de flip-over, met namen erachter. Dat voelt als afronding, maar het zegt weinig over de vraag of iemand zich ook echt verantwoordelijk voelt.</p>
          <p>Eigenaarschap wordt waarschijnlijker wanneer mensen invloed hadden op het vraagstuk zelf, begrijpen waarom het nodig is, mochten meedenken over de aanpak, ruimte hebben om te experimenteren, weten wat binnen hun invloed valt en terugkoppeling krijgen over het resultaat. En wanneer ze naast verantwoordelijkheid ook bevoegdheden en tijd krijgen. <a href="/kennis/eigenaarschap-in-teams">Lees meer over hoe eigenaarschap in teams ontstaat.</a></p>
        </div>
      </Section>

      {/* Experiment */}
      <Section id="experiment" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>De praktische kern</Eyebrow><h2 className="tk-heading-lg">Van groot voornemen naar klein experiment</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Eén of twee concrete veranderingen testen werkt beter dan een lijst met tien verbeterpunten. Een experiment is tijdelijk, overzichtelijk en veilig genoeg om te proberen. Zo'n experiment bevat meestal deze zes onderdelen:</p>
        </div>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 18 }}>
          {experimentDelen.map(([t, d]) => <Card accent="var(--tk-color-teal)" key={t}><h3>{t}</h3><p>{d}</p></Card>)}
        </div>
        <Card accent="var(--tk-color-green)" style={{ marginTop: 20 }}>
          <h3>Voorbeeld</h3>
          <p><strong>Experiment:</strong> vier weken lang begint ieder werkoverleg met een check-in van maximaal vijf minuten, waarin elk teamlid benoemt wat hij nodig heeft om goed mee te kunnen doen.</p>
          <p><strong>Evaluatievraag:</strong> heeft dit geholpen om spanningen, prioriteiten of hulpvragen eerder zichtbaar te maken?</p>
        </Card>
        <p className="tk-note"><a href="/kleine-experimenten">Lees meer over werken met kleine experimenten.</a></p>
      </Section>

      {/* Leidinggevende */}
      <Section id="leidinggevende">
        <div className="tk-section-heading"><Eyebrow>Wat het team ziet</Eyebrow><h2 className="tk-heading-lg">Wat de leidinggevende daarna doet</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>De leidinggevende heeft een dubbele rol: ruimte geven aan het team, en tegelijk grote invloed op welk gedrag de weken erna overleeft. Medewerkers kijken vooral naar wat er ná de dag gebeurt.</p>
        </div>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 18 }}>
          {managerGedrag.map(([t, d]) => <Card accent="var(--tk-color-blue)" key={t}><h3>{t}</h3><p>{d}</p></Card>)}
        </div>
        <p className="tk-note">Meer over deze rol lees je op onze pagina over <a href="/teamcoaching">teamcoaching en leiderschapsbegeleiding</a>.</p>
      </Section>

      {/* Borging */}
      <Section id="borging" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Zonder extra projectlast</Eyebrow><h2 className="tk-heading-lg">Borgen in het gewone werkritme</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Borging hoeft geen apart project te worden. Ze werkt beter wanneer ze meelift op momenten die er toch al zijn:</p>
        </div>
        <ul className="tk-tag-list" style={{ marginTop: 14 }}>{borgingsmomenten.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 22 }}>
          {ritme.map(([t, d]) => <Card accent="var(--tk-color-teal)" key={t}><h3>{t}</h3><p>{d}</p></Card>)}
        </div>
        <p className="tk-note">Houd het licht. Een ritme dat als administratie voelt, verdwijnt net zo snel als de afspraak die het moest beschermen.</p>
      </Section>

      {/* Vijf vragen */}
      <Section id="vijf-vragen" className="tk-jdr-reflection">
        <Card>
          <Eyebrow>Direct te gebruiken</Eyebrow>
          <h2 className="tk-heading-lg">Vijf vragen voordat iedereen naar huis gaat</h2>
          <p>Loop deze vragen aan het einde van de dag samen langs. Blijft er één onbeantwoord, dan weet je waar de kans op terugval zit.</p>
          <ol style={{ margin: "16px 0 0", paddingLeft: 22 }}>
            {vijfVragen.map((v) => <li key={v} style={{ marginBottom: 10, lineHeight: 1.7, color: "var(--tk-color-ink)", fontWeight: 600 }}>{v}</li>)}
          </ol>
        </Card>
      </Section>

      {/* Onze aanpak */}
      <Section>
        <div className="tk-section-heading"><Eyebrow>Onze aanpak</Eyebrow><h2 className="tk-heading-lg">Een dag als moment in een beweging</h2></div>
        <div className="tk-grid tk-grid-3">
          <Card accent="var(--tk-color-green)"><h3>Luisteren</h3><p>Vooraf en tijdens de dag begrijpen wat er werkelijk speelt, vanuit meerdere perspectieven en niet alleen vanuit de leidinggevende.</p></Card>
          <Card accent="var(--tk-color-blue)"><h3>Meten</h3><p>Patronen zichtbaar maken met gesprekken of de <a href="/teamscan">teamscan</a>. Meten is geen doel, maar een gezamenlijke spiegel.</p></Card>
          <Card accent="var(--tk-color-teal)"><h3>Bewegen</h3><p>Inzichten vertalen naar klein, observeerbaar gedrag dat het team zelf kan oefenen en evalueren.</p></Card>
        </div>
        <p className="tk-note">In deze aanpak is de dag zelf geen losse gebeurtenis, maar één moment in een langere ontwikkelbeweging. Waar dat past, gebruiken we ook <a href="/insights-discovery-profiel">Insights Discovery</a> om verschillen tussen mensen bespreekbaar te maken.</p>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Veelgestelde vragen</Eyebrow><h2 className="tk-heading-lg">Veelgestelde vragen over impact en borging</h2></div>
        <div className="tk-grid" style={{ maxWidth: 860 }}>
          {faqs.map(([q, a]) => (
            <details key={q} className="tk-card" style={{ padding: "18px 22px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--tk-color-ink)", fontSize: 17, lineHeight: 1.4 }}>{q}</summary>
              <p style={{ margin: "12px 0 0", color: "var(--tk-color-muted)", lineHeight: 1.75 }}>{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Afsluiting */}
      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Tot slot</Eyebrow><h2 className="tk-heading-lg">Wat blijft er over van de dag?</h2></div>
          <div className="tk-rich-text">
            <p>Kort samengevat: terugval zegt weinig over motivatie en veel over de omgeving waarin mensen terugkomen. Concreet gedrag, een besproken onderstroom, echt eigenaarschap, één klein experiment en een licht ritme van opvolging maken samen het verschil.</p>
            <p><strong>Een kleine opdracht voor het eerstvolgende overleg:</strong> pak één afspraak van jullie laatste teamdag. Vraag niet of iedereen hem nog kent, maar welk concreet gedrag hiervan de afgelopen week zichtbaar was. Bespreek daarna welke kleine aanpassing de afspraak weer werkbaar maakt.</p>
            <p>Welke afspraak van jullie laatste teamdag is stil uit het dagelijkse werk verdwenen, en wat zegt dat over de manier waarop jullie verandering proberen vast te houden?</p>
          </div>
        </div>
      </Section>

      {/* Verder lezen */}
      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Verder lezen</Eyebrow><h2 className="tk-heading-lg">Verdieping rond gedrag en borging</h2></div>
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
            <Eyebrow>Van dag naar beweging</Eyebrow>
            <h2 className="tk-heading-lg">Een dag die ook daarna verschil maakt</h2>
            <p>Wil je weten hoe voorbereiding, begeleiding en opvolging met elkaar samenhangen? Op de pagina over het organiseren van een teamdag staat de praktische kant: van het scherp maken van het vraagstuk tot de afspraken die daarna nog leven.</p>
            <div className="tk-actions"><ButtonLink href="/teamdag">Bekijk de aanpak voor een teamdag</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
