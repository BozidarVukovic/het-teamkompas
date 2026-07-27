import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/teamenergie";

const energiek = [
  "initiatief zonder dat iemand erom hoeft te vragen",
  "collega’s die elkaar ongevraagd helpen",
  "problemen die op tafel komen in plaats van in de wandelgang",
  "gezamenlijk eigenaarschap voor het resultaat",
  "herstel na een drukke of intensieve periode",
  "de bereidheid om te leren en iets anders te proberen",
  "het gevoel samen ergens naartoe te bewegen",
];

const signalen = [
  ["Wat je hoort en ziet", ["minder initiatief dan voorheen", "cynische of gelaten opmerkingen", "irritatie over kleine onderwerpen", "mensen die zich terugtrekken uit het gesprek"]],
  ["Wat er in het overleg gebeurt", ["steeds dezelfde problemen bespreken", "lange overleggen met weinig besluiten", "veel activiteit, weinig zichtbare beweging", "afnemende onderlinge aanspreekbaarheid"]],
  ["Wat je pas later merkt", ["afhankelijkheid van een paar kartrekkers", "weinig ruimte voor ontwikkeling", "toenemend verzuim of verloop", "goede mensen die stiller worden of vertrekken"]],
];

const energievreters = [
  ["Onduidelijkheid", "Onduidelijke rollen, prioriteiten en verwachtingen kosten voortdurend mentale energie, ook wanneer de hoeveelheid werk op zich meevalt. Mensen besteden aandacht aan uitzoeken wie waarover gaat in plaats van aan het werk zelf."],
  ["Onuitgesproken spanning", "Vermeden gesprekken en ingehouden irritaties verdwijnen niet; ze vragen elke dag opnieuw aandacht. Dit hangt samen met psychologische veiligheid, sociale veiligheid en met wat er in de onderstroom speelt zonder benoemd te worden."],
  ["Gebrek aan invloed", "Wanneer mensen verantwoordelijkheid dragen maar weinig autonomie, informatie of beslisruimte ervaren, ontstaat frustratie. Verantwoordelijkheid zonder invloed put teams langzaam uit."],
  ["Gebrekkige samenwerking", "Dubbel werk, slechte overdrachten, eilandvorming en informatie die blijft hangen zorgen ervoor dat een team steeds opnieuw herstelt wat elders misging. Dat herstelwerk is grotendeels onzichtbaar en kost veel energie."],
  ["Onzichtbare overbelasting", "Werkdruk ontstaat niet alleen door het aantal taken. Emotionele belasting, voortdurende onderbrekingen, rolconflicten, wisselende prioriteiten en te weinig herstel tellen minstens zo zwaar en blijven vaak buiten beeld."],
  ["Leiderschap dat onbedoeld energie wegneemt", "Ook goedbedoeld leiderschap kan energie kosten: micromanagement, steeds wisselende prioriteiten, problemen overnemen, besluiten uitstellen, of vooral aandacht geven aan wat misgaat. Het gaat om het patroon en het effect, niet om schuld."],
];

const energiebronnen = ["duidelijke doelen", "heldere prioriteiten", "rolhelderheid", "autonomie binnen kaders", "steun van collega’s", "steun van de leidinggevende", "erkenning en waardering", "ontwikkelmogelijkheden", "kwaliteiten die benut worden", "betekenisvol werk", "invloed op veranderingen", "ruimte voor herstel", "zichtbare voortgang", "gezamenlijke successen"];

const behoeften = [
  ["Autonomie", "Ervaren dat je invloed hebt op je eigen werk en keuzes."],
  ["Competentie", "Het gevoel dat je goed werk kunt leveren en jezelf ontwikkelt."],
  ["Verbondenheid", "Prettige, betrouwbare relaties met de mensen om je heen."],
  ["Betekenis", "Zien dat je werk ergens toe doet en bijdraagt aan een groter geheel."],
];

const related = [
  ["Bevlogenheid en het JD-R-model", "Hoe taakeisen en hulpbronnen samen bepalen of werk energie geeft of kost.", "/kennis/bevlogenheid-in-het-werk"],
  ["Psychologische veiligheid", "Zonder veiligheid blijven twijfels en spanning onbesproken, en dat kost een team voortdurend energie.", "/psychologische-veiligheid"],
  ["Boven- en onderstroom", "Veel energieverlies zit in wat wel gevoeld maar niet gezegd wordt.", "/boven-en-onderstroom"],
  ["Eigenaarschap in teams", "Invloed en verantwoordelijkheid horen bij elkaar; scheef je die, dan lekt energie weg.", "/kennis/eigenaarschap-in-teams"],
  ["Neuromanagement", "Onvoorspelbaarheid, gebrek aan grip en sociale dreiging versterken stressreacties in het brein.", "/brein-en-samenwerking"],
  ["Kleine experimenten", "Teams herstellen energie zelden in één grote ingreep, maar via haalbare stappen die ze uitproberen.", "/kleine-experimenten"],
];

function TagList({ items }) {
  return <ul className="tk-tag-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function Teamenergie() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "headline": "Teamenergie: waarom sommige teams leeglopen en andere blijven bewegen", "name": "Teamenergie in teams", "url": `https://www.mijnteamkompas.nl${ROUTE}`, "description": "Ontdek waardoor teams energie verliezen, welke energiebronnen motivatie en eigenaarschap versterken en hoe leiders teamenergie duurzaam kunnen verbeteren." },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", "position": 2, "name": "Kennis", "item": "https://www.mijnteamkompas.nl/blog" },
        { "@type": "ListItem", "position": 3, "name": "Teamenergie", "item": `https://www.mijnteamkompas.nl${ROUTE}` }
      ]}
    ]
  };

  return (
    <PageShell>
      <Helmet>
        <title>Teamenergie verbeteren: energiegevers en energievreters in teams | Mijn Teamkompas</title>
        <meta name="description" content="Ontdek waardoor teams energie verliezen, welke energiebronnen motivatie en eigenaarschap versterken en hoe leiders teamenergie duurzaam kunnen verbeteren." />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Teamenergie verbeteren: energiegevers en energievreters in teams | Mijn Teamkompas" />
        <meta property="og:description" content="Waardoor teams energie verliezen, welke energiebronnen ze versterken en hoe je teamenergie duurzaam verbetert." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:image" content="https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Section className="tk-knowledge-hero tk-jdr-hero">
        <div className="tk-jdr-hero-inner">
          <div className="tk-jdr-hero-text">
            <Eyebrow withDot>Kennis · energie en motivatie</Eyebrow>
            <h1 className="tk-heading-xl">Teamenergie: waarom sommige teams leeglopen en andere blijven bewegen</h1>
            <p className="tk-lead">Sommige teams werken hard, overleggen veel en bestaan uit betrokken mensen, en toch lijkt de energie langzaam weg te lopen. Gebrek aan energie betekent zelden dat medewerkers ongemotiveerd zijn. Vaker zit het in de manier waarop het werk en de samenwerking zijn georganiseerd.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Onderzoek waar jouw team energie wint en verliest</ButtonLink><ButtonLink href="/kennis/kenniskaart-teamontwikkeling" variant="secondary">Bekijk de kenniskaart</ButtonLink></div>
          </div>
          <img className="tk-jdr-hero-media" src="/teamkompas-samen-richting.jpg" alt="Een team dat samen richting bepaalt en in beweging blijft." />
        </div>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column">
          <div><Eyebrow>Herkenbaar</Eyebrow><h2 className="tk-heading-lg">Een betrokken team kan toch leeglopen.</h2></div>
          <div className="tk-rich-text"><p>Een team levert goed werk, de mensen vinden hun vak belangrijk en niemand doet minder zijn best dan vorig jaar. Toch kost bijna alles meer moeite dan het zou moeten. Overleggen stapelen zich op, dezelfde onderwerpen komen steeds terug en besluiten blijven liggen.</p><p>Van buitenaf lijkt dat al snel op een motivatieprobleem. Kijk je beter, dan zie je vaak iets anders: de energie lekt weg via hoe het werk is ingericht, hoe mensen samenwerken en hoe er wordt geleidinggegeven. Dat is goed nieuws, want aan die dingen valt iets te doen.</p></div>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Centrale boodschap</Eyebrow><h2 className="tk-heading-lg">Teamenergie ontstaat niet alleen uit de veerkracht van individuele mensen, maar vooral uit de manier waarop het werk, de samenwerking en het leiderschap zijn georganiseerd.</h2></div>
        <p className="tk-lead">Duidelijkheid, invloed, onderlinge relaties en de dagelijkse werkomgeving bepalen in belangrijke mate of energie behouden blijft of wegloopt. Teamenergie is daarmee geen vitaliteits- of welzijnsthema van losse medewerkers, maar een vraagstuk van teamdynamiek, samenwerking en leiderschap.</p>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Wat is teamenergie?</Eyebrow><h2 className="tk-heading-lg">Teamenergie is meer dan enthousiasme, gezelligheid of zichtbare drukte.</h2></div>
        <div className="tk-rich-text" style={{ maxWidth: 760, marginBottom: 8 }}><p>Een energiek team hoeft niet voortdurend uitbundig te zijn. De energie zit in het gedrag dat je terugziet in het dagelijkse werk:</p></div>
        <Card accent="var(--tk-color-green)"><TagList items={energiek} /></Card>
        <p className="tk-note">Een druk team is niet automatisch een energiek team. Veel activiteit kan ook een teken zijn dat een team hard rent om verlies te compenseren.</p>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Signalen</Eyebrow><h2 className="tk-heading-lg">Waaraan herken je dat een team energie verliest?</h2><p className="tk-lead">Eén signaal zegt weinig. Het gaat om terugkerende patronen en om combinaties die je over een langere periode ziet ontstaan.</p></div>
        <div className="tk-grid tk-grid-3">{signalen.map(([title, items]) => <Card key={title}><h3>{title}</h3><TagList items={items} /></Card>)}</div>
        <p className="tk-note">Achter deze signalen zit zelden onwil. Vaker zijn het reacties op onduidelijkheid, overbelasting of spanning die niet besproken wordt.</p>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Energievreters</Eyebrow><h2 className="tk-heading-lg">De belangrijkste energievreters in teams</h2><p className="tk-lead">Vijf van deze zes gaan over hoe werk en samenwerking zijn ingericht. Ze zijn dus grotendeels te beïnvloeden.</p></div>
        <div className="tk-grid tk-grid-3">{energievreters.map(([title, text]) => <Card key={title} accent="var(--tk-color-orange)"><h3>{title}</h3><p>{text}</p></Card>)}</div>
        <p className="tk-note">Meer over de rol van onbesproken spanning lees je bij <a href="/psychologische-veiligheid">psychologische veiligheid</a>, <a href="/sociale-veiligheid">sociale veiligheid</a> en de <a href="/boven-en-onderstroom">boven- en onderstroom</a>.</p>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Energiebronnen</Eyebrow><h2 className="tk-heading-lg">Waar sterke teams hun energie vandaan halen</h2></div>
        <div className="tk-jdr-two">
          <Card accent="var(--tk-color-teal)"><h3>Hulpbronnen in het werk</h3><p>Het Job Demands-Resources-model laat zien dat teams veel taakeisen aankunnen, zolang daar voldoende hulpbronnen tegenover staan. Deze bronnen zijn geen prettige extra’s, maar juist wat een team overeind houdt in drukke periodes.</p><TagList items={energiebronnen} /></Card>
          <Card accent="var(--tk-color-purple)"><h3>Waarom bronnen zo bepalend zijn</h3><p>Hoge taakeisen leiden niet vanzelf tot uitputting. Het schuurt vooral wanneer de eisen lang hoog blijven terwijl invloed, steun, duidelijkheid, waardering en herstel achterblijven. Wie de energie van een team wil versterken, kijkt daarom niet alleen naar wat eraf kan, maar ook naar welke bron ontbreekt. De achtergrond hiervan staat op de pagina over <a href="/kennis/bevlogenheid-in-het-werk">bevlogenheid en het JD-R-model</a>.</p></Card>
        </div>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Motivatie, energie en bevlogenheid</Eyebrow><h2 className="tk-heading-lg">Mensen laten zich niet motiveren, maar de omstandigheden kunnen motivatie wel voeden of ondermijnen.</h2></div>
        <div className="tk-knowledge-two-column"><div className="tk-rich-text"><p>Motivatie, energie, betrokkenheid en bevlogenheid hangen samen, maar zijn niet hetzelfde. Motivatie gaat over de reden waarom iemand iets doet. Energie gaat over de brandstof om het vol te houden. Bevlogenheid is de duurzamere vorm daarvan: energie, toewijding en opgaan in het werk, ook als het even tegenzit. Werkdruk en herstel bepalen mee of die bevlogenheid overeind blijft.</p><p>De zelfdeterminatietheorie beschrijft vier behoeften die motivatie voeden. Zijn ze onder druk, dan neemt de energie af, hoe hard mensen ook hun best doen.</p></div>
          <div className="tk-grid tk-grid-2">{behoeften.map(([title, text]) => <Card key={title} accent="var(--tk-color-blue)"><h3>{title}</h3><p>{text}</p></Card>)}</div>
        </div>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-knowledge-two-column"><div><Eyebrow>Nuance</Eyebrow><h2 className="tk-heading-lg">Een teamuitje lost het meestal niet op.</h2></div><div className="tk-rich-text"><p>Een dag weg met het team kan waardevol zijn voor contact en plezier, en soms is dat precies wat nodig is. Het levert alleen tijdelijke energie op, en dat is iets anders dan structurele teamenergie.</p><p>Rolonduidelijkheid, verstoorde samenwerking, uitgestelde besluiten, structurele overbelasting en onuitgesproken spanning verdwijnen niet door een leuke middag. Vaak zijn ze de maandag erna gewoon terug. Een teamuitje lost dus iets anders op dan een structureel teamvraagstuk. Wil je dat een dag samen wél iets verandert, kijk dan bij <a href="/teamdag">een teamdag organiseren</a> en de <a href="/kennis/impact-van-een-teamdag">borging na een teamdag</a>.</p></div></div>
      </Section>

      <Section>
        <div className="tk-section-heading"><Eyebrow>Praktische oefening</Eyebrow><h2 className="tk-heading-lg">Hoe maak je teamenergie bespreekbaar?</h2><p className="tk-lead">Een korte werkvorm voor een teamoverleg. Bespreek met elkaar drie vragen.</p></div>
        <ol className="tk-jdr-steps"><li><strong>Waar kregen we energie van?</strong><span>Benoem wat de afgelopen maand energie gaf, in het werk zelf en in de samenwerking.</span></li><li><strong>Waar verloren we onnodig energie?</strong><span>Zoek naar terugkerende werkwijzen die meer kosten dan ze opleveren.</span></li><li><strong>Welke kleine verandering zou direct ruimte geven?</strong><span>Kies iets dat haalbaar is en waar het team zelf invloed op heeft.</span></li></ol>
        <Card accent="var(--tk-color-purple)"><h3>Belangrijk bij het begeleiden</h3><p>Laat het team niet meteen oplossingen bedenken. Verzamel eerst de terugkerende patronen. Zo voorkom je dat losse irritaties worden opgelost terwijl het onderliggende teamprobleem blijft bestaan. De aanpak achter zulke <a href="/kleine-experimenten">kleine experimenten</a> werkt beter dan één groot plan.</p></Card>
      </Section>

      <Section className="tk-jdr-band">
        <div className="tk-section-heading"><Eyebrow>Luisteren, meten en bewegen</Eyebrow><h2 className="tk-heading-lg">Hoe Mijn Teamkompas met teamenergie werkt</h2></div>
        <div className="tk-grid tk-grid-3"><Card accent="var(--tk-color-blue)"><h3>Luisteren</h3><p>Luisteren naar wat mensen zeggen, maar ook onderzoeken wat niet wordt uitgesproken en waar de energie zichtbaar verandert. Vaak zit de meeste informatie in de <a href="/boven-en-onderstroom">onderstroom</a>.</p></Card><Card accent="var(--tk-color-green)"><h3>Meten</h3><p>Met data en gesprekken patronen zichtbaar maken in samenwerking, motivatie, werkdruk, veiligheid en <a href="/kennis/eigenaarschap-in-teams">eigenaarschap</a>. De <a href="/teamscan">teamscan</a> helpt daarbij.</p></Card><Card accent="var(--tk-color-orange)"><h3>Bewegen</h3><p>Geen groot veranderprogramma, maar één concrete en haalbare verbetering die het team kan testen, evalueren en bijstellen.</p></Card></div>
      </Section>

      <Section><div className="tk-section-heading"><Eyebrow>Andere thema’s</Eyebrow><h2 className="tk-heading-lg">De relatie met andere kennisgebieden van Mijn Teamkompas</h2></div><div className="tk-grid tk-grid-3">{related.map(([title, text, href]) => <a className="tk-related-card" href={href} key={title}><h3>{title}</h3><p>{text}</p><span>Lees verder →</span></a>)}</div></Section>

      <Section className="tk-jdr-reflection"><Card accent="var(--tk-color-orange)"><Eyebrow>Reflectie</Eyebrow><h2 className="tk-heading-lg">Welke terugkerende werkwijze kost jouw team op dit moment onnodig veel energie?</h2><p>Vraag tijdens het volgende overleg niet alleen wat er moet gebeuren, maar ook wat structureel energie kost. Kies vervolgens één patroon dat het team de komende twee weken anders aanpakt.</p></Card></Section>

      <Section className="tk-knowledge-final-cta"><div className="tk-knowledge-cta-card"><KompasDot size={34} /><div><Eyebrow>Van inzicht naar beweging</Eyebrow><h2 className="tk-heading-lg">Weet je team waar het energie van krijgt en waar het ongemerkt energie verliest?</h2><p>De teamscan van Mijn Teamkompas maakt patronen in samenwerking, motivatie, veiligheid, eigenaarschap en leiderschap zichtbaar. Van daaruit kiest een team één haalbare verbetering in plaats van weer een groot plan.</p><div className="tk-actions"><ButtonLink href="/teamscan">Start met de teamscan</ButtonLink><ButtonLink href="/teamdag" variant="secondary">Organiseer een teamdag</ButtonLink><ButtonLink href="/teamcoaching" variant="secondary">Bekijk teambegeleiding</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismakingsgesprek</ButtonLink></div></div></div></Section>
    </PageShell>
  );
}
