import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/eigenaarschap-in-teams";
const IMAGE = "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg";

const toc = [
  ["Wat is eigenaarschap?", "wat-is-eigenaarschap"],
  ["Geen karaktereigenschap", "geen-karaktereigenschap"],
  ["Psychologische veiligheid", "psychologische-veiligheid"],
  ["Autonomie en basisbehoeften", "autonomie"],
  ["Taakeisen en hulpbronnen", "jd-r"],
  ["Het brein en initiatief", "neuromanagement"],
  ["Hoe leiders eigenaarschap wegnemen", "leiders"],
  ["De rol van duidelijke kaders", "kaders"],
  ["Boven- en onderstroom", "boven-en-onderstroom"],
  ["Eigenaarschap en teamcultuur", "teamcultuur"],
  ["Veelgemaakte fouten", "fouten"],
  ["Praktische interventies", "interventies"],
  ["Wat kun je morgen doen?", "morgen"],
  ["Eigenaarschap en de teamscan", "teamscan"],
  ["Veelgestelde vragen", "faq"],
];

const isWel = [
  "initiatief nemen wanneer iets opgepakt moet worden",
  "verantwoordelijkheid voelen voor het gezamenlijke resultaat",
  "afspraken nakomen en problemen niet doorschuiven",
  "verbeteringen voorstellen en beslissingen durven nemen",
  "hulp vragen wanneer dat nodig is",
  "collega's aanspreken en leren van fouten",
  "verder kijken dan de eigen taak",
];
const isNiet = [
  "alles zelfstandig moeten oplossen",
  "overal persoonlijk verantwoordelijk voor zijn",
  "nooit hulp nodig hebben",
  "structureel extra werk verrichten",
  "problemen van de organisatie persoonlijk compenseren",
  "altijd beschikbaar zijn",
];

const behoeften = [
  ["Autonomie", "Invloed op hoe je je werk uitvoert en je doelen bereikt, binnen duidelijke kaders. Zonder invloed voelt verantwoordelijkheid leeg.", "var(--tk-color-orange)"],
  ["Competentie", "Het gevoel dat je de taak aankunt en jezelf kunt ontwikkelen. Zonder competentie voelt verantwoordelijkheid bedreigend.", "var(--tk-color-teal)"],
  ["Verbondenheid", "Het gevoel er samen voor te staan. Zonder verbondenheid wordt verantwoordelijkheid al snel individueel in plaats van gezamenlijk.", "var(--tk-color-blue)"],
];

const patroon = [
  ["Een medewerker komt met een probleem", "De vraag ligt op tafel."],
  ["De leidinggevende geeft direct de oplossing", "Snel, deskundig en goedbedoeld."],
  ["De medewerker voert die oplossing uit", "Zelf nadenken was niet nodig."],
  ["De leidinggevende ziet weinig initiatief", "En concludeert: er is te weinig eigenaarschap."],
  ["De leidinggevende gaat méér sturen", "Om grip te houden op het resultaat."],
  ["De medewerker leert af om zelf te denken", "Het patroon versterkt zichzelf."],
];

const fouten = [
  "Medewerkers vertellen dat ze meer eigenaarschap moeten tonen, zonder de context te onderzoeken.",
  "Verantwoordelijkheid geven zonder beslissingsruimte.",
  "Autonomie bieden zonder duidelijke doelen of kaders.",
  "Fouten afstraffen en tegelijk initiatief verwachten.",
  "Eigenaarschap verwarren met extra werk.",
  "Alleen individuele medewerkers aanspreken en de teamdynamiek negeren.",
  "Een training organiseren zonder het dagelijkse leiderschap te veranderen.",
  "Alleen sturen op KPI's.",
  "Verantwoordelijkheden onduidelijk verdelen.",
  "Te snel ingrijpen wanneer een team even worstelt.",
  "Initiatief alleen waarderen wanneer het meteen succesvol is.",
  "Structurele organisatieproblemen bij individuele medewerkers neerleggen.",
];

const interventies = [
  ["Stel vragen voordat je oplossingen geeft", ["Wat zie jij als het belangrijkste probleem?", "Wat heb je al geprobeerd?", "Welke mogelijkheden zie je?", "Wat kun je zelf besluiten?", "Welke ruimte of ondersteuning heb je nodig?"]],
  ["Maak beslissingsruimte expliciet", ["Bepaal samen welke beslissingen medewerkers zelfstandig nemen.", "Benoem wanneer afstemming nodig is.", "Wees helder over wat bij de leidinggevende blijft."]],
  ["Laat het team zelf een experiment kiezen", ["Kies samen één klein probleem.", "Test enkele weken een nieuw gedrag of proces.", "Bespreek daarna wat het opleverde."]],
  ["Werk met een eigenaar per actie", ["Wie is de eigenaar?", "Wat is het gewenste resultaat?", "Welke ruimte heeft de eigenaar?", "Wie kan ondersteunen en wanneer koppelen we terug?"]],
  ["Bespreek de belemmeringen", ["Waar wachten we op toestemming?", "Waar is de beslissingsruimte onduidelijk?", "Welk initiatief is eerder ontmoedigd?", "Wat maakt aanspreken moeilijk?"]],
  ["Geef aandacht aan initiatief, niet alleen aan succes", ["Waardeer vroegtijdig een probleem melden.", "Waardeer hulp vragen en een lastig gesprek starten.", "Waardeer leren van wat niet werkte."]],
  ["Gebruik korte, vaste reflectiemomenten", ["Waar namen we deze week eigenaarschap?", "Waar wachtten we af, en wat hield ons tegen?", "Welk klein experiment proberen we komende week?"]],
];

const morgen = [
  "Voor welke beslissingen vragen medewerkers nog toestemming terwijl dat niet nodig is?",
  "Wanneer gaf ik voor het laatst direct een oplossing in plaats van een vraag?",
  "Weten medewerkers welke ruimte ze werkelijk hebben?",
  "Hoe reageer ik wanneer een initiatief niet goed uitpakt?",
  "Welke problemen neem ik steeds terug van het team?",
  "Zijn doelen en verantwoordelijkheden voldoende duidelijk?",
  "Durven collega's elkaar aan te spreken?",
  "Welke hulpbronnen ontbreken om verantwoordelijkheid te kunnen dragen?",
  "Welk klein experiment kunnen we morgen starten?",
];

const faqs = [
  ["Wat is eigenaarschap in een team?", "Eigenaarschap is het gedrag waarmee mensen verantwoordelijkheid voelen en nemen voor het gezamenlijke resultaat: initiatief nemen, afspraken nakomen, problemen niet doorschuiven, verbeteringen voorstellen, hulp vragen en leren van fouten. Het gaat om meer dan de eigen taak, en het is gezond wanneer iemand ook grenzen aangeeft en op tijd om hulp vraagt."],
  ["Waarom nemen medewerkers niet vanzelf verantwoordelijkheid?", "Meestal ligt dat niet aan motivatie of karakter, maar aan de omgeving. Mensen nemen eerder verantwoordelijkheid wanneer het doel duidelijk is, ze invloed en autonomie ervaren, zich veilig voelen om fouten te bespreken, verantwoordelijkheden helder zijn en initiatief wordt gewaardeerd. Ontbreekt dat, dan is afwachten vaak een logische reactie."],
  ["Hoe kun je eigenaarschap in een team vergroten?", "Begin bij de context: maak beslissingsruimte expliciet, stel vragen voordat je oplossingen geeft, zorg voor duidelijke kaders en voldoende hulpbronnen, en waardeer initiatief ook als het niet meteen slaagt. Laat het team zelf kleine experimenten kiezen en reflecteer regelmatig op wat helpt en wat afremt."],
  ["Is meer autonomie hetzelfde als loslaten?", "Nee. Autonomie betekent invloed hebben op de manier waarop je werk uitvoert, binnen duidelijke doelen en kaders. Alles loslaten zonder richting vergroot juist de onzekerheid. Heldere kaders en beslissingsruimte gaan samen: ze verminderen twijfel en maken echt eigenaarschap mogelijk."],
  ["Waarom werkt 'jullie moeten meer eigenaarschap tonen' meestal niet?", "Zo'n boodschap legt de verantwoordelijkheid volledig bij de medewerker, terwijl gedrag ontstaat in de wisselwerking met leiderschap, teamcultuur en werkcontext. Zonder te onderzoeken welke omstandigheden afwachtend gedrag veroorzaken, verandert er zelden iets. Vaak versterkt de oproep het gevoel dat problemen eenzijdig worden neergelegd."],
  ["Wat heeft psychologische veiligheid met eigenaarschap te maken?", "Initiatief nemen brengt risico met zich mee: een idee kan worden afgewezen, een beslissing kan verkeerd uitpakken. In een psychologisch veilig team durven mensen fouten, twijfels en afwijkende meningen te bespreken, en spreken ze elkaar juist beter aan. Die veiligheid is een voorwaarde voor verantwoordelijkheid nemen."],
];

const related = [
  ["Psychologische veiligheid", "De voorwaarde om initiatief, fouten en twijfels bespreekbaar te maken.", "/psychologische-veiligheid"],
  ["Teamcultuur", "Welk gedrag in een team normaal en veilig is geworden.", "/kennis/teamcultuur"],
  ["Boven- en onderstroom", "Waarom eigenaarschap in de bovenstroom wordt gevraagd en in de onderstroom wordt afgeremd.", "/boven-en-onderstroom"],
  ["Bevlogenheid en het JD-R-model", "Hoe taakeisen en hulpbronnen de ruimte voor verantwoordelijkheid bepalen.", "/kennis/bevlogenheid-in-het-werk"],
  ["Kleine experimenten", "Hoe teams nieuw gedrag klein, veilig en concreet uitproberen.", "/kleine-experimenten"],
  ["Brein en samenwerking", "Waarom het brein bij dreiging kiest voor bekende, veilige patronen.", "/brein-en-samenwerking"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Eigenaarschap in teams: waarom mensen niet vanzelf verantwoordelijkheid nemen",
      "name": "Eigenaarschap in teams",
      "url": `https://www.mijnteamkompas.nl${ROUTE}`,
      "image": IMAGE,
      "description": "Waarom nemen medewerkers niet vanzelf verantwoordelijkheid? Ontdek hoe psychologische veiligheid, autonomie, leiderschap en werkcontext eigenaarschap in teams beïnvloeden.",
      "author": { "@type": "Organization", "name": "Mijn Teamkompas" },
      "publisher": { "@type": "Organization", "name": "Mijn Teamkompas", "url": "https://www.mijnteamkompas.nl" },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", "position": 2, "name": "Kennis", "item": "https://www.mijnteamkompas.nl/kennis/kenniskaart-teamontwikkeling" },
        { "@type": "ListItem", "position": 3, "name": "Eigenaarschap in teams", "item": `https://www.mijnteamkompas.nl${ROUTE}` },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
    },
  ],
};

export default function EigenaarschapInTeams() {
  return (
    <PageShell>
      <Helmet>
        <title>Eigenaarschap in teams vergroten | Mijn Teamkompas</title>
        <meta name="description" content="Waarom nemen medewerkers niet vanzelf verantwoordelijkheid? Ontdek hoe psychologische veiligheid, autonomie, leiderschap en werkcontext eigenaarschap in teams beïnvloeden." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Eigenaarschap in teams: waarom mensen niet vanzelf verantwoordelijkheid nemen" />
        <meta property="og:description" content="Eigenaarschap is meestal geen karaktereigenschap, maar gedrag dat ontstaat binnen een bepaalde omgeving. Over veiligheid, autonomie, leiderschap en werkcontext." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:image" content={IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Eigenaarschap in teams vergroten | Mijn Teamkompas" />
        <meta name="twitter:description" content="Waarom nemen medewerkers niet vanzelf verantwoordelijkheid? Over veiligheid, autonomie, leiderschap en werkcontext." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <Section className="tk-knowledge-hero tk-jdr-hero">
        <div className="tk-jdr-hero-inner">
          <div className="tk-jdr-hero-text">
            <Eyebrow withDot>Kennis · eigenaarschap</Eyebrow>
            <h1 className="tk-heading-xl">Eigenaarschap in teams: waarom mensen niet vanzelf verantwoordelijkheid nemen</h1>
            <p className="tk-lead">Een probleem is al dagen bekend. Iedereen zag het, iedereen besprak het, en toch zette niemand de eerste stap. "Mijn team toont te weinig eigenaarschap", is dan een begrijpelijke gedachte. Maar is dat de juiste conclusie?</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
          <img className="tk-jdr-hero-media" src="/teamkompas-samen-richting.jpg" alt="Een team dat samen richting bepaalt en verantwoordelijkheid deelt." />
        </div>
      </Section>

      {/* Intro */}
      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Het centrale inzicht</Eyebrow><h2 className="tk-heading-lg">Eigenaarschap ontstaat niet alleen in de medewerker.</h2></div>
          <div className="tk-rich-text">
            <p>Het ontstaat in de wisselwerking tussen de medewerker, het team, het leiderschap en de organisatiecontext. Dezelfde persoon kan in het ene team volop initiatief nemen en in het andere juist afwachten. Dat verschil zegt zelden iets over motivatie, en veel vaker over de omstandigheden.</p>
            <p>Medewerkers nemen eerder verantwoordelijkheid wanneer het doel duidelijk is, ze invloed en autonomie ervaren, ze zich veilig voelen om fouten en twijfels te bespreken, verantwoordelijkheden helder zijn, leidinggevenden niet iedere oplossing overnemen, initiatief echt wordt gewaardeerd en werkdruk en hulpbronnen in balans zijn.</p>
            <p>Een team kun je dus niet simpelweg aanspreken met "toon meer eigenaarschap". De organisatie en de leidinggevende hebben de taak om te onderzoeken welke omstandigheden afwachtend gedrag veroorzaken.</p>
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

      {/* Wat is eigenaarschap */}
      <Section id="wat-is-eigenaarschap">
        <div className="tk-section-heading"><Eyebrow>Definitie</Eyebrow><h2 className="tk-heading-lg">Wat is eigenaarschap?</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Eigenaarschap wordt zichtbaar in gedrag: initiatief nemen, verantwoordelijkheid voelen voor het resultaat, afspraken nakomen, problemen niet doorschuiven, verbeteringen voorstellen, collega's aanspreken en durven beslissen. Het betekent ook verder kijken dan de eigen taak, en juist hulp vragen en van fouten leren wanneer dat nodig is.</p>
        </div>
        <div className="tk-jdr-two" style={{ marginTop: 22 }}>
          <Card accent="var(--tk-color-green)">
            <h3>Eigenaarschap is</h3>
            <ul className="tk-tag-list">{isWel.map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
          <Card accent="var(--tk-color-orange)">
            <h3>Eigenaarschap is niet</h3>
            <ul className="tk-tag-list">{isNiet.map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
        </div>
        <p className="tk-note">Gezond eigenaarschap betekent ook dat iemand grenzen aangeeft, risico's bespreekt en op tijd om hulp vraagt. Alles alleen dragen is geen eigenaarschap, maar een risico.</p>
      </Section>

      {/* Geen karaktereigenschap */}
      <Section id="geen-karaktereigenschap" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Gedrag, geen karakter</Eyebrow><h2 className="tk-heading-lg">Waarom eigenaarschap geen karaktereigenschap is</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Neem een verpleegkundige die op haar oude afdeling voortdurend verbetervoorstellen deed, en op een nieuwe afdeling stil werd. Of een beleidsmedewerker bij de gemeente die zelf besluiten nam, totdat zijn voorstellen een paar keer werden teruggedraaid en fouten zwaar werden becommentarieerd. Vanaf dat moment legde hij alles eerst voor. Zijn karakter was niet veranderd; zijn omgeving wel.</p>
          <p>Gedrag wordt gevormd door eerdere ervaringen, informele groepsnormen, leiderschap, besluitvorming, psychologische veiligheid, autonomie, rolhelderheid, werkdruk, beschikbare ondersteuning en de manier waarop fouten worden behandeld. Wie afwachtend gedrag alleen verklaart met "ongemotiveerd" of "onwillig", kijkt langs al die factoren heen, en mist daarmee de plek waar verandering mogelijk is.</p>
        </div>
      </Section>

      {/* Psychologische veiligheid */}
      <Section id="psychologische-veiligheid">
        <div className="tk-section-heading"><Eyebrow>Veiligheid</Eyebrow><h2 className="tk-heading-lg">Psychologische veiligheid en eigenaarschap</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Verantwoordelijkheid nemen vraagt dat mensen zich veilig genoeg voelen om een afwijkende mening te geven, een fout toe te geven, een probleem vroeg te melden, kritische vragen te stellen, hulp te vragen, een experiment voor te stellen en soms de leidinggevende tegen te spreken. Ontbreekt die ruimte, dan is zwijgen en afwachten de veiligste keuze.</p>
          <p>Psychologische veiligheid betekent niet dat alles vrijblijvend wordt. In een veilig team kunnen mensen elkaar juist beter aanspreken, omdat fouten, gedrag en verantwoordelijkheden bespreekbaar zijn. Amy Edmondson liet zien dat dit klimaat een sterke voorspeller is van hoe teams leren en presteren. <a href="/psychologische-veiligheid">Lees meer over psychologische veiligheid in teams.</a></p>
        </div>
      </Section>

      {/* Autonomie / SDT */}
      <Section id="autonomie" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Drie basisbehoeften</Eyebrow><h2 className="tk-heading-lg">Autonomie, competentie en verbondenheid</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>De Self-Determination Theory van Deci en Ryan beschrijft drie psychologische basisbehoeften die motivatie voeden. Wanneer aan deze behoeften wordt voldaan, ontstaat eerder eigen initiatief. Autonomie betekent daarbij niet dat medewerkers onbeperkt hun gang gaan, maar dat ze binnen duidelijke kaders invloed hebben op hoe ze hun werk doen en hun doelen bereiken.</p>
        </div>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 18 }}>
          {behoeften.map(([t, d, kleur]) => (
            <Card accent={kleur} key={t}><h3>{t}</h3><p>{d}</p></Card>
          ))}
        </div>
        <p className="tk-note">Een leidinggevende die verantwoordelijkheid overdraagt maar iedere stap blijft voorschrijven, geeft taken door zonder invloed. Dat levert uitvoering op, geen eigenaarschap.</p>
      </Section>

      {/* JD-R */}
      <Section id="jd-r">
        <div className="tk-section-heading"><Eyebrow>Balans van eisen en bronnen</Eyebrow><h2 className="tk-heading-lg">Eigenaarschap vanuit het JD-R-model</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Het Job Demands-Resources-model helpt begrijpen wanneer verantwoordelijkheid energie geeft en wanneer het uitput. Aan de ene kant staan taakeisen: hoge werkdruk, emotionele belasting, complexe besluitvorming, onduidelijke prioriteiten, personele tekorten en conflicterende verwachtingen. Aan de andere kant staan hulpbronnen: autonomie, feedback, sociale steun, duidelijke doelen, ontwikkelmogelijkheden, voldoende informatie en tijd, en steun van de leidinggevende.</p>
          <p>Verantwoordelijkheid geven zonder voldoende hulpbronnen leidt zelden tot eigenaarschap. Vaker ontstaat stress of terugtrekgedrag, en het gevoel dat problemen bij medewerkers worden neergelegd zonder dat ze echte invloed krijgen. <a href="/kennis/bevlogenheid-in-het-werk">Lees meer over bevlogenheid en het JD-R-model.</a></p>
        </div>
      </Section>

      {/* Neuromanagement */}
      <Section id="neuromanagement" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Het brein bij risico</Eyebrow><h2 className="tk-heading-lg">Waarom initiatief risico voelt</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Ons brein reageert sterk op onzekerheid, statusverlies, verlies van controle en sociale dreiging. Initiatief nemen bevat precies die risico's: een idee kan worden afgewezen, een beslissing kan verkeerd uitpakken, iemand kan kritiek krijgen, een collega kan zich gepasseerd voelen of de leidinggevende grijpt alsnog in.</p>
          <p>Het SCARF-model van David Rock vat vijf sociale gevoeligheden samen die hierin meespelen: status, zekerheid, autonomie, verbondenheid en rechtvaardigheid. Wordt een van deze bedreigd, dan kiest het brein eerder voor bekende, veilige patronen. In organisaties zie je dat terug als toestemming vragen, beslissingen uitstellen, problemen doorschuiven, vasthouden aan procedures en wachten tot de leidinggevende ingrijpt. <a href="/brein-en-samenwerking">Lees meer over wat er in ons brein gebeurt tijdens samenwerking.</a></p>
        </div>
      </Section>

      {/* Leiders nemen eigenaarschap weg */}
      <Section id="leiders">
        <div className="tk-section-heading"><Eyebrow>Onbedoeld effect</Eyebrow><h2 className="tk-heading-lg">Hoe leiders onbedoeld eigenaarschap wegnemen</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Veel leidinggevenden nemen eigenaarschap weg zonder het te merken, meestal vanuit betrokkenheid, snelheid, deskundigheid of verantwoordelijkheidsgevoel. Ze lossen ieder probleem direct op, geven te snel advies, vragen overal vooraf toestemming voor, draaien besluiten terug, corrigeren zodra iemand afwijkt van de voorkeursoplossing, controleren iedere stap en nemen steeds zelf het laatste woord. Of ze maken mensen verantwoordelijk zonder beslisruimte, geven vooral aandacht als iets misgaat, en belonen initiatief met nog meer werk.</p>
        </div>
        <ol className="tk-jdr-steps" style={{ marginTop: 24 }}>
          {patroon.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}
        </ol>
        <p className="tk-note">Dit is een zichzelf versterkend patroon: hoe meer de leidinggevende overneemt, hoe minder het team zelf denkt, en hoe sterker de indruk ontstaat dat er weinig eigenaarschap is.</p>
      </Section>

      {/* Kaders */}
      <Section id="kaders" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Ruimte én richting</Eyebrow><h2 className="tk-heading-lg">De rol van duidelijke kaders</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Eigenaarschap ontstaat niet door alles los te laten. Teams hebben duidelijkheid nodig over het gezamenlijke doel, de gewenste resultaten, verantwoordelijkheden, beslissingsruimte, grenzen, beschikbare middelen, momenten van afstemming en escalatieroutes. Heldere kaders verminderen onzekerheid en vergroten juist de autonomie: mensen weten waar ze zelf over gaan.</p>
        </div>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 18 }}>
          <Card accent="var(--tk-color-green)"><h3>Zelf beslissen</h3><p>Beslissingen die medewerkers zelfstandig mogen nemen, zonder vooraf te overleggen.</p></Card>
          <Card accent="var(--tk-color-orange)"><h3>Eerst afstemmen</h3><p>Beslissingen waarbij afstemming met het team of de leidinggevende nodig is.</p></Card>
          <Card accent="var(--tk-color-blue)"><h3>Bij de organisatie</h3><p>Beslissingen die bij de leidinggevende of de organisatie blijven liggen.</p></Card>
        </div>
      </Section>

      {/* Boven- en onderstroom */}
      <Section id="boven-en-onderstroom">
        <div className="tk-section-heading"><Eyebrow>Zichtbaar en onzichtbaar</Eyebrow><h2 className="tk-heading-lg">Wat de bovenstroom vraagt en de onderstroom afremt</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Eigenaarschap wordt vaak wél in de bovenstroom gevraagd, maar in de onderstroom afgeremd. Formeel mag iedereen meedenken, maar kritische ideeën worden niet gewaardeerd. Op papier ligt verantwoordelijkheid in het team, maar in de praktijk beslist de manager. Een fout mag officieel worden gemaakt, maar blijft informeel lang aan iemand kleven. En teamleden spreken elkaar niet aan uit angst voor spanning.</p>
          <p>Zolang die onderstroom onbesproken blijft, verandert de oproep tot meer eigenaarschap weinig. <a href="/boven-en-onderstroom">Lees meer over de werking van de boven- en onderstroom binnen teams.</a></p>
        </div>
      </Section>

      {/* Teamcultuur */}
      <Section id="teamcultuur" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Wat normaal is geworden</Eyebrow><h2 className="tk-heading-lg">Eigenaarschap en teamcultuur</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>De teamcultuur bepaalt welk gedrag normaal en sociaal veilig is. In sommige teams is het gewoon om problemen vroeg te benoemen, elkaar aan afspraken te houden, initiatief te nemen, hulp te vragen en besluiten samen te dragen. In andere teams ontstaat een patroon van afwachten, klagen zonder actie, problemen bij de leidinggevende neerleggen en de eigen taak niet overstijgen.</p>
          <p>Zo'n cultuur verandert niet door nieuwe afspraken alleen. Ze verandert wanneer een team herhaaldelijk ander gedrag oefent en ervaart dat dit veilig en zinvol is. <a href="/kennis/teamcultuur">Lees meer over teamcultuur</a> en over <a href="/kleine-experimenten">kleine experimenten in teams</a>.</p>
        </div>
      </Section>

      {/* Veelgemaakte fouten */}
      <Section id="fouten">
        <div className="tk-section-heading"><Eyebrow>Valkuilen</Eyebrow><h2 className="tk-heading-lg">Veelgemaakte fouten bij het vergroten van eigenaarschap</h2></div>
        <ol style={{ maxWidth: 860, margin: 0, paddingLeft: 22, columnCount: 1 }} className="tk-rich-text">
          {fouten.map((f) => <li key={f} style={{ marginBottom: 10, lineHeight: 1.7 }}>{f}</li>)}
        </ol>
      </Section>

      {/* Praktische interventies */}
      <Section id="interventies" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Direct toepasbaar</Eyebrow><h2 className="tk-heading-lg">Praktische interventies voor meer eigenaarschap</h2></div>
        <div className="tk-grid tk-grid-3">
          {interventies.map(([titel, punten]) => (
            <Card accent="var(--tk-color-teal)" key={titel}>
              <h3>{titel}</h3>
              <ul className="tk-tag-list">{punten.map((p) => <li key={p}>{p}</li>)}</ul>
            </Card>
          ))}
        </div>
        <p className="tk-note">Verbind deze reflectie aan retrospectives uit lean en agile: kort, regelmatig en gericht op leren. Zie ook <a href="/kleine-experimenten">kleine experimenten in teams</a>.</p>
      </Section>

      {/* Wat kun je morgen doen */}
      <Section id="morgen" className="tk-jdr-reflection">
        <Card>
          <Eyebrow>Wat kun je morgen al doen?</Eyebrow>
          <h2 className="tk-heading-lg">Een checklist voor leidinggevenden en teams</h2>
          <ul className="tk-tag-list">{morgen.map((m) => <li key={m}>{m}</li>)}</ul>
        </Card>
      </Section>

      {/* Teamscan */}
      <Section id="teamscan">
        <div className="tk-section-heading"><Eyebrow>Zichtbaar maken</Eyebrow><h2 className="tk-heading-lg">Eigenaarschap en de teamscan</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 820 }}>
          <p>Eigenaarschap laat zich niet los meten van psychologische veiligheid, rolhelderheid, leiderschap, samenwerking, vertrouwen, autonomie, aanspreekgedrag, werkdruk, hulpbronnen en gedeelde doelen. Al die onderwerpen bepalen samen of mensen ruimte ervaren om verantwoordelijkheid te nemen.</p>
          <p>De <a href="/teamscan">online teamscan</a> van Mijn Teamkompas maakt zichtbaar waar medewerkers ruimte ervaren, waar verantwoordelijkheden onduidelijk zijn, waar leiderschap initiatief stimuleert of afremt, en waar de bovenstroom en de onderstroom van elkaar verschillen. Dat levert een concreet vertrekpunt op om te bepalen welke kleine interventies het meeste effect hebben.</p>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Veelgestelde vragen</Eyebrow><h2 className="tk-heading-lg">Veelgestelde vragen over eigenaarschap</h2></div>
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
        <div className="tk-section-heading"><Eyebrow>Verder lezen</Eyebrow><h2 className="tk-heading-lg">Verdieping rond eigenaarschap</h2></div>
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
            <Eyebrow>Van aanspreken naar begrijpen</Eyebrow>
            <h2 className="tk-heading-lg">Hoe staat het met eigenaarschap binnen jouw team?</h2>
            <p>Medewerkers aanspreken op verantwoordelijkheid is eenvoudig. Begrijpen wat hen helpt of belemmert om die verantwoordelijkheid ook echt te nemen, vraagt meer aandacht. Met de teamscan van Mijn Teamkompas maken we zichtbaar waar eigenaarschap wordt gestimuleerd en waar onbedoelde belemmeringen zitten. Zo ontstaat een concreet vertrekpunt om initiatief, samenwerking en verantwoordelijkheid duurzaam te versterken.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismaking</ButtonLink></div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
