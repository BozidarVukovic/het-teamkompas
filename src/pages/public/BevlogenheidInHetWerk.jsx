import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/bevlogenheid-in-het-werk";

const demands = ["hoge werkdruk", "veel onderbrekingen", "onduidelijke prioriteiten", "administratieve belasting", "emotioneel zwaar werk", "rolonduidelijkheid", "tegenstrijdige verwachtingen", "conflicten", "voortdurende veranderingen", "onvoldoende herstel", "slecht werkende systemen", "gebrek aan personeel of tijd"];
const resources = ["autonomie", "invloed op het eigen werk", "steun van collega’s", "steun van de leidinggevende", "duidelijke doelen", "heldere rollen", "bruikbare feedback", "erkenning en waardering", "ontwikkelmogelijkheden", "psychologische veiligheid", "voldoende tijd en middelen", "vertrouwen", "betekenisvol werk", "ruimte voor herstel", "goede samenwerking"];
const signals = [
  ["Bij de medewerker", ["vermoeidheid die niet goed herstelt", "minder concentratie", "cynisme of afstand nemen", "sneller geïrriteerd raken", "minder initiatief", "fouten of vergeetachtigheid", "het gevoel nooit klaar te zijn", "werk mee naar huis nemen, letterlijk of in gedachten"]],
  ["In het team", ["minder onderlinge hulp", "meer misverstanden", "terugkerende irritaties", "besluiten worden vooruitgeschoven", "mensen spreken zich minder uit", "verantwoordelijkheden worden doorgeschoven", "overleg kost energie, maar levert weinig op", "verschillen in belasting worden onvoldoende besproken"]],
  ["In de organisatie", ["voortdurend wisselende prioriteiten", "structurele onderbezetting", "onduidelijke verantwoordelijkheden", "veel verbeterinitiatieven zonder samenhang", "weinig invloed op besluiten", "systemen en processen die extra werk veroorzaken", "focus op individuele veerkracht zonder de werkomgeving te verbeteren"]],
];
const related = [
  ["Psychologische veiligheid", "Mensen moeten zich veilig genoeg voelen om aan te geven dat de belasting te hoog is, een fout is gemaakt of hulp nodig is.", "/psychologische-veiligheid"],
  ["Sociale veiligheid", "Onveilig gedrag, uitsluiting of intimidatie zijn zware taakeisen die veel energie kunnen kosten.", "/sociale-veiligheid"],
  ["Boven- en onderstroom", "De zichtbare werkdruk bevindt zich vaak in de bovenstroom. Onuitgesproken spanning en frustratie zitten vaker in de onderstroom.", "/boven-en-onderstroom"],
  ["Neuromanagement", "Aanhoudende onvoorspelbaarheid, gebrek aan controle en sociale dreiging kunnen stressreacties versterken.", "/brein-en-samenwerking"],
  ["Kleine experimenten", "Teams hoeven niet alles in één keer op te lossen. Ze kunnen hulpbronnen en werkwijzen stap voor stap versterken.", "/kleine-experimenten"],
  ["Leiderschap", "Leiders hebben invloed op prioriteiten, autonomie, steun, duidelijkheid en betekenis.", "/teamcoaching"],
];

function TagList({ items }) {
  return <ul className="tk-tag-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function RouteColumn({ title, tone, steps }) {
  return (
    <div className={`tk-jdr-route tk-jdr-route-${tone}`}>
      <h3>{title}</h3>
      <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
    </div>
  );
}

export default function BevlogenheidInHetWerk() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "headline": "Bevlogenheid in het werk", "name": "Bevlogenheid en het JD-R-model", "url": `https://www.mijnteamkompas.nl${ROUTE}`, "description": "Ontdek met het JD-R-model hoe taakeisen en hulpbronnen invloed hebben op werkdruk, motivatie, energie, bevlogenheid en duurzame inzetbaarheid." },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", "position": 2, "name": "Kennis", "item": "https://www.mijnteamkompas.nl/blog" },
        { "@type": "ListItem", "position": 3, "name": "Bevlogenheid in het werk", "item": `https://www.mijnteamkompas.nl${ROUTE}` }
      ]}
    ]
  };

  return (
    <PageShell>
      <Helmet>
        <title>Bevlogenheid en het JD-R-model | Mijn Teamkompas</title>
        <meta name="description" content="Ontdek met het JD-R-model hoe taakeisen en hulpbronnen invloed hebben op werkdruk, motivatie, energie, bevlogenheid en duurzame inzetbaarheid." />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Bevlogenheid en het JD-R-model | Mijn Teamkompas" />
        <meta property="og:description" content="Hoe taakeisen en hulpbronnen invloed hebben op energie, motivatie, werkstress en duurzame inzetbaarheid." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Section className="tk-knowledge-hero tk-jdr-hero">
        <Eyebrow withDot>Kennis · energie en motivatie</Eyebrow>
        <h1 className="tk-heading-xl">Bevlogenheid in het werk</h1>
        <p className="tk-lead">Sommige werkdagen vliegen voorbij. Je voelt energie, krijgt iets voor elkaar en ervaart dat je werk ertoe doet. Op andere dagen lijkt iedere taak meer moeite te kosten. Bevlogenheid is geen vaste eigenschap van een medewerker. Het ontstaat in de wisselwerking tussen wat het werk van iemand vraagt en wat het werk, het team en de organisatie daarvoor teruggeven.</p>
        <div className="tk-actions"><ButtonLink href="/teamscan">Onderzoek wat jouw team energie geeft</ButtonLink><ButtonLink href="/kennis/kenniskaart-teamontwikkeling" variant="secondary">Bekijk de kenniskaart</ButtonLink></div>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Herkenbaar</Eyebrow><h2 className="tk-heading-lg">Betrokken mensen kunnen toch energie verliezen.</h2></div>
          <div className="tk-rich-text"><p>Een team kan bestaan uit betrokken professionals die hun werk belangrijk vinden en toch steeds minder energie ervaren. Overleggen stapelen zich op, prioriteiten veranderen, systemen werken niet mee en besluiten blijven liggen.</p><p>Ondertussen wordt van mensen gevraagd om flexibel, positief en zelfstandig te blijven. Van buitenaf lijkt dat soms op een motivatieprobleem.</p><p>Het Job Demands-Resources-model, kortweg het JD-R-model, helpt om breder te kijken: naar de persoon én naar de omstandigheden waarin iemand probeert goed werk te leveren.</p></div>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Centrale boodschap</Eyebrow><h2 className="tk-heading-lg">Bevlogenheid ontstaat wanneer wat het werk van mensen vraagt in balans is met de hulpbronnen die zij hebben om hun werk goed, gezond en betekenisvol te kunnen doen.</h2></div>
        <p className="tk-lead">Mensen kunnen best veel van hun werk aan, zolang daar voldoende hulpbronnen tegenover staan. Hoge werkdruk hoeft niet automatisch tot uitputting te leiden. Problemen ontstaan vooral wanneer taakeisen lang hoog blijven, terwijl invloed, steun, herstel, duidelijkheid en waardering achterblijven.</p>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Wat is bevlogenheid?</Eyebrow><h2 className="tk-heading-lg">Bevlogenheid is meer dan druk zijn of altijd enthousiast lijken.</h2></div>
        <div className="tk-grid tk-grid-3"><Card accent="var(--tk-color-orange)"><h3>Energie</h3><p>Mensen voelen zich vitaal en hebben mentale energie om hun werk te doen.</p></Card><Card accent="var(--tk-color-green)"><h3>Toewijding</h3><p>Mensen ervaren betrokkenheid, betekenis, trots en enthousiasme.</p></Card><Card accent="var(--tk-color-blue)"><h3>Opgaan in het werk</h3><p>Mensen kunnen zich concentreren en ervaren regelmatig dat de tijd snel voorbijgaat.</p></Card></div>
        <p className="tk-note">Bevlogen medewerkers zijn niet onbeperkt belastbaar. Juist betrokken mensen kunnen lang doorgaan wanneer de omstandigheden uit balans raken.</p>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Het JD-R-model eenvoudig uitgelegd</Eyebrow><h2 className="tk-heading-lg">Kijk naar taakeisen én hulpbronnen.</h2></div>
        <div className="tk-jdr-two"><Card accent="var(--tk-color-orange)"><h3>Taakeisen</h3><p>Taakeisen zijn aspecten van het werk die langdurig fysieke, mentale of emotionele inspanning vragen. Ze zijn niet per definitie negatief: een uitdagende opdracht of drukke periode kan ook energie en ontwikkeling geven, zolang het haalbaar blijft.</p><TagList items={demands} /></Card><Card accent="var(--tk-color-teal)"><h3>Hulpbronnen</h3><p>Hulpbronnen helpen mensen doelen te bereiken, met taakeisen om te gaan, zich te ontwikkelen en betekenis te ervaren. Alleen werkdruk verlagen is daarom niet altijd genoeg; hulpbronnen vergroten kan minstens zo belangrijk zijn.</p><TagList items={resources} /></Card></div>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Visueel model</Eyebrow><h2 className="tk-heading-lg">Twee routes die tegelijk kunnen spelen.</h2></div>
        <div className="tk-jdr-model" aria-label="JD-R-model met uitputtingsroute en motivatie- en bevlogenheidsroute">
          <RouteColumn title="Uitputtingsroute" tone="strain" steps={["Hoge of langdurige taakeisen", "Aanhoudende belasting", "Onvoldoende herstel", "Vermoeidheid en uitputting", "Risico op verzuim, afstand nemen of uitval"]} />
          <div className="tk-jdr-buffer"><KompasDot size={38} /><strong>Hulpbronnen verzachten belasting</strong><span>Grip, steun, duidelijkheid, waardering en herstel maken zwaar werk beter hanteerbaar.</span></div>
          <RouteColumn title="Motivatie- en bevlogenheidsroute" tone="energy" steps={["Voldoende hulpbronnen", "Meer grip, steun en betekenis", "Leren en presteren", "Energie en betrokkenheid", "Bevlogenheid en duurzame inzetbaarheid"]} />
        </div>
        <p className="tk-note">Het gaat niet alleen om hoeveel werk iemand heeft, maar ook om de omstandigheden waarin dat werk moet worden gedaan.</p>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Signalen</Eyebrow><h2 className="tk-heading-lg">Wanneer raakt de balans verstoord?</h2><p className="tk-lead">Eén signaal betekent niet direct dat iemand niet bevlogen is of dreigt uit te vallen. Let vooral op terugkerende patronen en combinaties van signalen.</p></div>
        <div className="tk-grid tk-grid-3">{signals.map(([title, items]) => <Card key={title}><h3>{title}</h3><TagList items={items} /></Card>)}</div>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column"><div><Eyebrow>Werkdruk</Eyebrow><h2 className="tk-heading-lg">Hoge werkdruk is niet het hele verhaal.</h2></div><div className="tk-rich-text"><p>Twee medewerkers kunnen onder dezelfde werkdruk iets heel anders ervaren. Dat kan samenhangen met autonomie, ervaring, steun, herstel, duidelijkheid, persoonlijke omstandigheden of de betekenis die iemand aan het werk ontleent.</p><p>Alleen vragen of de werkdruk te hoog is, maakt het gesprek vaak te smal. Betere vragen zijn bijvoorbeeld: waar verlies je momenteel de meeste energie, welke hulpbron ontbreekt, waar heb je wel en geen invloed op en wat moeten we als team anders organiseren?</p></div></div>
      </Section>

      <Section className="tk-jdr-band"><div className="tk-section-heading"><Eyebrow>Gezamenlijke verantwoordelijkheid</Eyebrow><h2 className="tk-heading-lg">Bevlogenheid vraagt iets van medewerker, team en organisatie.</h2></div><div className="tk-grid tk-grid-3"><Card><h3>De medewerker</h3><p>Een medewerker kan grenzen en behoeften bespreekbaar maken, herstel serieus nemen, hulp vragen en actief meedenken over verbeteringen. Dat maakt het nog geen volledig individuele verantwoordelijkheid.</p></Card><Card><h3>Het team</h3><p>Een team kan werk eerlijker verdelen, steun organiseren, prioriteiten bespreken, verwachtingen verduidelijken en elkaar helpen om te herstellen en te leren.</p></Card><Card><h3>Leidinggevende en organisatie</h3><p>Leidinggevenden en organisaties beïnvloeden prioriteiten, rollen, capaciteit, autonomie, besluitvorming, sociale veiligheid, waardering en de inrichting van het werk.</p></Card></div><p className="tk-note">Een workshop vitaliteit, fruit op het werk of individuele training helpt beperkt wanneer structurele knelpunten blijven bestaan.</p></Section>

      <Section><div className="tk-section-heading"><Eyebrow>Praktische oefening</Eyebrow><h2 className="tk-heading-lg">Breng de energiebalans van het team in kaart</h2><p className="tk-lead">Een werkvorm van twintig tot dertig minuten voor een teamoverleg of teamsessie.</p></div><ol className="tk-jdr-steps"><li><strong>Wat vraagt energie?</strong><span>Laat ieder teamlid individueel twee of drie terugkerende taakeisen benoemen.</span></li><li><strong>Wat geeft of beschermt energie?</strong><span>Laat ieder teamlid twee of drie belangrijke hulpbronnen benoemen.</span></li><li><strong>Wat valt op?</strong><span>Bespreek overeenkomsten, verschillen en patronen zonder direct oplossingen te bedenken.</span></li><li><strong>Kies één beïnvloedbare factor</strong><span>Kies één taakeis die kan worden verminderd of één hulpbron die kan worden versterkt.</span></li><li><strong>Maak er een klein experiment van</strong><span>Spreek af wat jullie proberen, wie betrokken is, hoelang het duurt, wanneer jullie evalueren en waaraan je merkt dat het helpt.</span></li></ol><Card accent="var(--tk-color-purple)"><h3>Voorbeelden van kleine experimenten</h3><TagList items={["één overleg per week schrappen of verkorten", "aan het begin van de week gezamenlijk prioriteiten bepalen", "één storend administratief proces vereenvoudigen", "vaste momenten creëren voor onderlinge hulp", "rollen bij een terugkerende taak verduidelijken", "na een drukke periode bewust hersteltijd organiseren", "een wekelijkse energievraag toevoegen aan het werkoverleg"]} /></Card></Section>

      <Section className="tk-jdr-band"><div className="tk-knowledge-two-column"><div><Eyebrow>Persoonlijke hulpbronnen</Eyebrow><h2 className="tk-heading-lg">Veerkracht helpt, maar vervangt geen goede werkomstandigheden.</h2></div><div className="tk-rich-text"><p>Het JD-R-model laat ook ruimte voor persoonlijke hulpbronnen, zoals zelfvertrouwen, optimisme, vakmanschap, veerkracht, het vermogen om hulp te vragen en ervaren invloed.</p><p>Deze eigenschappen kunnen helpen. Ze zijn alleen geen vervanging voor goede werkomstandigheden. Een veerkrachtige medewerker kan veel dragen, maar ook veerkracht heeft grenzen.</p></div></div></Section>

      <Section><div className="tk-section-heading"><Eyebrow>Andere thema’s</Eyebrow><h2 className="tk-heading-lg">De relatie met andere kennisgebieden van Mijn Teamkompas</h2></div><div className="tk-grid tk-grid-3">{related.map(([title, text, href]) => <a className="tk-related-card" href={href} key={title}><h3>{title}</h3><p>{text}</p><span>Lees verder →</span></a>)}</div></Section>

      <Section className="tk-jdr-reflection"><Card accent="var(--tk-color-orange)"><Eyebrow>Reflectie</Eyebrow><h2 className="tk-heading-lg">Welke taakeis kost jouw team momenteel de meeste energie en welke hulpbron zou het grootste verschil maken?</h2><p>Praten jullie vooral over wat mensen beter moeten doen, of ook over wat zij nodig hebben om goed te kunnen werken?</p></Card></Section>

      <Section className="tk-knowledge-final-cta"><div className="tk-knowledge-cta-card"><KompasDot size={34} /><div><Eyebrow>Van inzicht naar actie</Eyebrow><h2 className="tk-heading-lg">Van inzicht naar een gezonder werkend team</h2><p>Het gesprek over bevlogenheid begint niet bij de vraag hoe mensen harder of positiever kunnen werken. Het begint bij nieuwsgierig onderzoeken wat het werk van mensen vraagt, welke hulpbronnen beschikbaar zijn en wat het team samen kan veranderen.</p><div className="tk-actions"><ButtonLink href="/teamscan">Start met de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismakingsgesprek</ButtonLink><ButtonLink href="/kennis/kenniskaart-teamontwikkeling" variant="secondary">Bekijk de kenniskaart</ButtonLink><ButtonLink href="/teamontwikkeling" variant="secondary">Bekijk teamontwikkeling</ButtonLink></div></div></div></Section>
    </PageShell>
  );
}
