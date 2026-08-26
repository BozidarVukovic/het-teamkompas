// scripts/generate-seo-pages.js
// Draait automatisch na `npm run build` (via postbuild in package.json)
// Genereert per route een statische HTML met unieke meta-tags,
// gebaseerd op de door Vite gebouwde dist/index.html (inclusief juiste asset-hashes).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const blogDir = path.join(__dirname, "../src/content/blog");
const baseHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

import { INTERNE_ITEMS } from "../src/data/kennisbank/items.js";

const SITE = "https://www.mijnteamkompas.nl";

// Valt een pagina terug op deze afbeelding, dan is er tenminste altijd iets te
// zien wanneer iemand de link deelt op LinkedIn of in een chat.
const DEFAULT_IMAGE = `${SITE}/teamkompas-workshop-hero.jpg`;

const pages = [
  {
    route: "gespreksvoorbereider",
    title: "Gespreksvoorbereider: een lastig gesprek voorbereiden | Mijn Teamkompas",
    description:
      "Bereid een lastig of belangrijk gesprek stap voor stap voor. Je schrijft zelf, de website zet je antwoorden in een vast gespreksformat. Zonder AI, alles blijft op je eigen apparaat.",
    url: "https://www.mijnteamkompas.nl/gespreksvoorbereider",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `<main><h1>Een lastig gesprek begint bij een goede voorbereiding</h1><p>Een lastig gesprek verloopt zelden zoals je het bedacht. Wat wel helpt, is vooraf scherp krijgen wat je precies hebt gezien, welk effect dat heeft en wat je wilt bereiken. Je beantwoordt een paar vragen en de website zet jouw antwoorden in een vast gespreksformat dat je kunt afdrukken of aanpassen.</p><h2>Zes gesprekssituaties</h2><ul><li>Een collega aanspreken op concreet gedrag</li><li>Onveilig gedrag bespreken, met een aparte veiligheidsroute</li><li>Een teamafspraak evalueren die niet werkt</li><li>Rolonduidelijkheid bespreken: wie beslist, wie voert uit, wie wordt geraadpleegd</li><li>Feedback vragen op je eigen gedrag, communicatie of leiderschap</li><li>Een verschil van inzicht bespreekbaar maken</li></ul><h2>Hoe het werkt</h2><p>De route helpt je onderscheid te maken tussen wat je hebt waargenomen en wat je daarvan hebt gemaakt, het effect zorgvuldig te beschrijven, een open vraag voor te bereiden en het gedeelde belang te benoemen. Het resultaat is een voorbereiding en geen tekst om voor te lezen.</p><h2>Zonder AI en zonder server</h2><p>Er komt geen chatbot of taalmodel aan te pas: jij schrijft de inhoud, de website combineert die met vaste tekstblokken. Wat je invult blijft op je eigen apparaat en gaat nooit naar een server. Deze tool geeft geen juridisch, psychologisch of arbeidsrechtelijk advies.</p><p><a href="/gespreksvoorbereider">Start de gespreksvoorbereider</a>, bekijk de <a href="/kennisbank">kennisbank</a> of doe de <a href="/gratis-teamscan">gratis teamscan</a>.</p></main>`,
  },
  {
    route: "kennisbank",
    title: "Kennisbank en kenniswijzer voor teams | Mijn Teamkompas",
    description:
      "Beantwoord vijf korte vragen en vind passende artikelen, werkvormen, reflectievragen, experimenten en downloads voor jouw teamsituatie.",
    url: "https://www.mijnteamkompas.nl/kennisbank",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `<main><h1>Vind wat jouw team nu nodig heeft</h1><p>Beantwoord vijf korte vragen en ontdek passende artikelen, werkvormen, reflectievragen en kleine interventies voor jouw teamsituatie. Geen algemeen advies, maar een praktische route naar een volgende stap.</p><h2>Hoe de kenniswijzer werkt</h2><p>Je geeft aan wat er speelt in je team, vanuit welke rol je zoekt, wat je wilt bereiken, hoeveel tijd je hebt en hoe je aan de slag wilt. Op basis van vaste kenmerken van onze content volgen maximaal zes suggesties, met bij elke suggestie de reden waarom die past. Er komt geen chatbot of taalmodel aan te pas.</p><h2>Wat je hier vindt</h2><ul><li>Artikelen over samenwerking, leiderschap, motivatie en verandering</li><li>Werkvormen die je zelf kunt begeleiden</li><li>Reflectievragen voor jezelf of voor het team</li><li>Teaminterventies en kleine experimenten</li><li>Canvassen, checklists en de reflectiekaart</li><li>De gratis persoonlijke teamscan en de volledige Teamscan</li></ul><p><a href="/kennisbank">Start de kenniswijzer</a>, bekijk <a href="/inspiratie">alle artikelen</a> of doe de <a href="/gratis-teamscan">gratis teamscan</a>.</p></main>`,
  },
  {
    route: "gratis-teamscan",
    title: "Gratis persoonlijke teamscan | Mijn Teamkompas",
    description: "Ontdek in 8 tot 10 minuten hoe jij de samenwerking binnen jouw team ervaart en ontvang direct jouw persoonlijke Teamkompas.",
    url: "https://www.mijnteamkompas.nl/gratis-teamscan",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `<main><h1>Ontdek hoe jij de samenwerking binnen jouw team ervaart</h1><p>Deze gratis individuele teamscan geeft in 8 tot 10 minuten inzicht in jouw persoonlijke beleving van veiligheid, communicatie, eigenaarschap, verbinding, energie en leiderschap.</p><h2>Direct inzicht en een persoonlijk rapport</h2><p>Na 24 vragen ontvang je een ontwikkelgerichte samenvatting, reflectievragen, kleine experimenten en een beveiligd persoonlijk rapport per e-mail. De uitkomst is geen oordeel of diagnose van het hele team.</p><p><a href="/gratis-teamscan">Start de gratis teamscan</a> of ontdek het verschil met de <a href="/teamscan">volledige Teamscan</a>.</p></main>`,
  },
  {
    route: "teamscan",
    title: "Online Teamscan: inzicht in jullie team | Mijn Teamkompas",
    description:
      "De online Teamscan maakt zichtbaar hoe teamleden de samenwerking ervaren. Bekijk wat de scan meet, hoe hij werkt en het voorbeeldrapport.",
    url: "https://www.mijnteamkompas.nl/teamscan",
    image: "https://www.mijnteamkompas.nl/teamkompas-voorbeeldrapport-overzicht.jpg",
    content: `
      <main>
        <h1>Online Teamscan voor meer inzicht in jullie samenwerking</h1>
        <p>De online teamscan maakt zichtbaar hoe teamleden de samenwerking ervaren. Geen cijfer voor het team, maar een gezamenlijke spiegel: wat gaat goed, waar ontstaan patronen en welke volgende stap maakt het meeste verschil?</p>
        <h2>Wat meet de Teamscan?</h2>
        <ul>
          <li><strong>Veiligheid en leiderschap.</strong> Kunnen mensen zich uitspreken, fouten bespreken en elkaar aanspreken?</li>
          <li><strong>Beleving van verandering.</strong> Begrijpen mensen wat er verandert en wat er van hen wordt gevraagd?</li>
          <li><strong>Energie en motivatie.</strong> Waar geven werk en samenwerking energie, en waar ontstaan belasting of frustratie?</li>
          <li><strong>Verbeteren en leren.</strong> Hoe leert een team van ervaringen en worden verbeteringen vastgehouden?</li>
        </ul>
        <h2>Hoe werkt de online teamscan?</h2>
        <p>Teamleden vullen de scan online in via een eigen link. De vragenlijst bestaat uit stellingen op een schaal van 1 tot 5 en een aantal open vragen; invullen kost ongeveer tien tot vijftien minuten. Er is een aparte variant voor teamleden en voor de leidinggevende, zodat verschillen in beeld tussen team en leiding zichtbaar worden. Daarna volgt een rapportage op teamniveau en een gesprek over wat de uitkomsten betekenen.</p>
        <h2>Wat er met de antwoorden gebeurt</h2>
        <p>Bij het invullen wordt geen naam en geen e-mailadres vastgelegd. Wat wordt opgeslagen is de rol, de gegeven antwoorden en het moment van inzending. De terugkoppeling gebeurt op teamniveau. In een heel klein team kan een bijdrage soms alsnog te herkennen zijn; benoem dat vooraf met elkaar.</p>
        <h2>Onderbouwing</h2>
        <p>De vier domeinen sluiten aan op inzichten uit onderzoek naar teamfunctioneren, waaronder psychologische veiligheid en het Job Demands-Resources-model. De Teamscan is gebaseerd op wetenschappelijke inzichten en is geen formeel gevalideerd meetinstrument met genormeerde scores of benchmarkcijfers.</p>
        <h2>Voor wie is de Teamscan?</h2>
        <p>Geschikt voor teams en managementteams in zakelijke dienstverlening, gemeenten, onderwijs, zorg en industrie. Vanaf ongeveer vijf deelnemers is een teambeeld zinvol te maken.</p>
        <p>Plan een vrijblijvend kennismakingsgesprek via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/">Home</a> <a href="/psychologische-veiligheid">Psychologische veiligheid</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/teamdag">Teamdag</a> <a href="/verkennen">Verkennend gesprek</a></nav>
      </main>`,
  },
  {
    route: "teamcoaching",
    title: "Teamcoaching | begeleiding bij samenwerking en leiderschap",
    description:
      "Teamcoaching van Mijn Teamkompas: praktische begeleiding bij samenwerking, communicatie, psychologische veiligheid en eigenaarschap binnen het team.",
    url: "https://www.mijnteamkompas.nl/teamcoaching",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `
      <main>
        <h1>Teamcoaching — begeleiding bij samenwerking en leiderschap</h1>
        <p>Mijn Teamkompas biedt teamcoaching die aansluit op wat er écht speelt in een team. Geen standaard programma, maar begeleiding op maat — gebaseerd op inzichten uit de teamscan of een intakegesprek.</p>
        <h2>Wanneer is teamcoaching zinvol?</h2>
        <ul>
          <li>Samenwerking loopt stroef of er is sprake van onderlinge spanning.</li>
          <li>Mensen spreken zich niet uit of vermijden moeilijke gesprekken.</li>
          <li>Er is een nieuwe leidinggevende of het team staat voor een verandering.</li>
          <li>Eigenaarschap en initiatief blijven achter bij de verwachtingen.</li>
        </ul>
        <p>Wij begeleiden teams in zakelijke dienstverlening, gemeenten, onderwijs en industrie.</p>
        <p>Plan een vrijblijvend kennismakingsgesprek via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/">Home</a> <a href="/teamscan">Teamscan</a> <a href="/teamdag">Teamdag</a> <a href="/verkennen">Verkennend gesprek</a></nav>
      </main>`,
  },
  {
    route: "teamdag",
    title: "Teamdag organiseren die echt iets verandert | Mijn Teamkompas",
    description:
      "Een teamdag organiseren die verder gaat dan een leuke dag? Ontdek een aanpak voor betere samenwerking, echte gesprekken en blijvende beweging.",
    url: "https://www.mijnteamkompas.nl/teamdag",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `
      <main>
        <h1>Teamdag organiseren die echt iets in beweging brengt</h1>
        <p>Veel teamdagen zijn prettig en geven tijdelijk energie. Toch verandert er weinig als de bedoeling niet scherp is, het echte gesprek uitblijft en opvolging ontbreekt. Mijn Teamkompas helpt teams een teamdag organiseren die patronen zichtbaar maakt en beweging creëert in het dagelijks werk.</p>

        <h2>Wanneer is het tijd voor een teamdag?</h2>
        <ul>
          <li>Collega's werken langs elkaar heen of maken andere keuzes dan verwacht.</li>
          <li>Rollen, verantwoordelijkheden en verwachtingen zijn niet scherp genoeg.</li>
          <li>Feedback blijft voorzichtig, terwijl irritaties of zorgen wel voelbaar zijn.</li>
          <li>Verandering zorgt voor spanning, onduidelijkheid of verlies van teamenergie.</li>
          <li>Sterke professionals vormen nog geen geheel of een nieuw team wil goed starten.</li>
          <li>Gesprekken blijven aan de oppervlakte en de onderstroom krijgt weinig taal.</li>
        </ul>

        <h2>Wat levert een goede teamdag op?</h2>
        <p>Een goede teamdag kan zorgen voor meer inzicht in terugkerende patronen, duidelijkere verwachtingen, een veiliger gesprek, sterkere verbinding, concrete afspraken, kleine experimenten en een aanpak voor opvolging.</p>

        <h2>Zo kun je een goede teamdag organiseren</h2>
        <ol>
          <li><strong>Bepaal wat er na de teamdag anders moet zijn.</strong> Maak de bedoeling concreet: vertrouwen, rolhelderheid, communicatie, eigenaarschap of omgaan met verandering.</li>
          <li><strong>Luister vooraf naar verschillende perspectieven.</strong> Vraag teamleden wat zij merken in de praktijk, waar energie zit en wat steeds terugkomt.</li>
          <li><strong>Combineer analyse met ontmoeting.</strong> Gebruik bijvoorbeeld een teamscan en geef ruimte aan verhalen en betekenisgeving.</li>
          <li><strong>Maak ook de onderstroom bespreekbaar.</strong> Onderzoek welke spanning, zorgen of gewoontes invloed hebben op gedrag.</li>
          <li><strong>Vertaal inzichten naar klein en concreet gedrag.</strong> Kies haalbare experimenten in plaats van grote voornemens.</li>
          <li><strong>Organiseer opvolging na de teamdag.</strong> Plan een kort vervolg om te leren, bij te sturen en afspraken levend te houden.</li>
        </ol>

        <h2>Voorbeeld van een inhoudelijke teamdag</h2>
        <p>Het definitieve programma wordt afgestemd op het team. Een passende opbouw bestaat vaak uit opening en gezamenlijke bedoeling, check-in, inzichten uit intake of teamscan, onderzoek naar samenwerking en patronen, een passende werkvorm, gesprek over boven- en onderstroom, keuzes maken, kleine experimenten formuleren en afspraken over opvolging.</p>

        <h2>Mogelijke thema's voor jullie teamdag</h2>
        <nav><a href="/psychologische-veiligheid">Psychologische veiligheid</a> <a href="/sociale-veiligheid">Sociale veiligheid</a> <a href="/teamontwikkeling">Samenwerken en communicatie</a> <a href="/teamscan">Teamenergie</a> <a href="/brein-en-samenwerking">Omgaan met verandering</a> <a href="/insights-discovery-profiel">Insights Discovery</a> <a href="/boven-en-onderstroom">Boven- en onderstroom</a> <a href="/kleine-experimenten">Kleine experimenten</a></nav>

        <h2>Onze aanpak: Luisteren – Meten – Bewegen</h2>
        <p><strong>Luisteren:</strong> begrijpen wat er binnen het team speelt via intake, observatie en verschillende perspectieven. <strong>Meten:</strong> patronen zichtbaar maken met de teamscan of passende werkvormen. <strong>Bewegen:</strong> inzichten vertalen naar haalbare experimenten, concrete afspraken en opvolging.</p>

        <h2>Waarom begeleiding door Mijn Teamkompas?</h2>
        <p>Geen standaardprogramma, maar aandacht voor inhoud én onderlinge dynamiek. We combineren analyse, gesprek en toepasbare werkvormen en geven ruimte aan wat zichtbaar en minder zichtbaar speelt. De nadruk ligt op beweging na de teamdag.</p>

        <h2>Praktische informatie</h2>
        <p>Geschikt voor teams die samenwerking, veiligheid, eigenaarschap of communicatie willen versterken. Een teamdag kan meestal op jullie eigen locatie of op een externe locatie plaatsvinden, als halve of hele dag. De voorbereiding bestaat uit een intake en waar passend aanvullende gesprekken of een teamscan. Het programma is maatwerk; prijs is op aanvraag.</p>

        <h2>FAQ over een teamdag organiseren</h2>
        <p><strong>Wat kost het organiseren van een teamdag?</strong><br />De prijs is op aanvraag, omdat voorbereiding, begeleiding en eventuele teamscan of Insights Discovery-profielen per team verschillen.</p>
        <p><strong>Hoe lang duurt een teamdag?</strong><br />Dat kan een halve of hele dag zijn, afhankelijk van de vraag, teamgrootte en gewenste verdieping.</p>
        <p><strong>Wat is een goed programma voor een teamdag?</strong><br />Een goed programma begint met een duidelijke bedoeling, combineert analyse met ontmoeting, maakt patronen bespreekbaar en eindigt met concrete afspraken.</p>
        <p><strong>Kunnen jullie de teamdag op onze eigen locatie begeleiden?</strong><br />Ja, dat kan meestal op jullie eigen locatie of op een externe locatie.</p>
        <p><strong>Hoe zorgen we dat de teamdag blijvend effect heeft?</strong><br />Door vooraf scherp te luisteren, tijdens de dag concrete experimenten te kiezen en na afloop opvolging te organiseren.</p>
        <p><strong>Is een teamscan noodzakelijk?</strong><br />Niet altijd. Een teamscan helpt als je patronen en verschillende perspectieven zichtbaar wilt maken.</p>
        <p><strong>Is de aanpak ook geschikt voor een managementteam?</strong><br />Ja. Managementteams hebben vaak baat bij heldere verwachtingen, besluitvorming, veiligheid en gesprek over boven- en onderstroom.</p>
        <p><strong>Hoeveel voorbereiding vraagt een teamdag?</strong><br />Reken op een intake en vaak enkele aanvullende gesprekken of een teamscan.</p>

        <h2>Welke beweging heeft jullie team nodig?</h2>
        <p>Bespreek jullie situatie vrijblijvend. Je hoeft nog geen vast programma te kiezen; we kijken eerst wat er speelt en welke vorm logisch is. Mail naar <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a> of start met een <a href="/verkennen">verkennend gesprek</a>.</p>
      </main>`,
  },
  {
    route: "teamontwikkeling",
    title: "Teamontwikkeling en teamcoaching | samenwerking verbeteren",
    description:
      "Versterk teamontwikkeling met teamscan, teamcoaching en begeleiding op samenwerking, psychologische veiligheid, eigenaarschap, motivatie en teamdag.",
    url: "https://www.mijnteamkompas.nl/teamontwikkeling",
    image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    content: `
      <main>
        <h1>Teamontwikkeling — samenwerking structureel verbeteren</h1>
        <p>Teamontwikkeling bij Mijn Teamkompas is meer dan een eenmalige interventie. We begeleiden teams en leidinggevenden bij duurzame verandering in samenwerking, eigenaarschap, psychologische veiligheid en motivatie.</p>
        <h2>De vier pijlers van teamontwikkeling</h2>
        <ul>
          <li><strong>Psychologische veiligheid.</strong> Teams groeien wanneer mensen zich vrij voelen om eerlijk te zijn.</li>
          <li><strong>Eigenaarschap en motivatie.</strong> We helpen teams de verbinding te herstellen tussen werk, zingeving en initiatief.</li>
          <li><strong>Verandering begrijpen.</strong> Mensen bewegen wanneer ze begrijpen waarom iets nodig is.</li>
          <li><strong>Leren en verbeteren.</strong> Verbeteringen beklijven alleen als ze landen in dagelijks gedrag.</li>
        </ul>
        <p>Plan een vrijblijvend kennismakingsgesprek via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/">Home</a> <a href="/teamscan">Teamscan</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/teamdag">Teamdag</a></nav>
      </main>`,
  },
  {
    route: "onze-aanpak",
    title: "Onze aanpak | van teamscan naar teamontwikkeling",
    description:
      "Ontdek hoe Mijn Teamkompas teams begeleidt van eerste vraag naar teamscan, analyse, dialoog, teamdag en borging in het dagelijks werk.",
    url: "https://www.mijnteamkompas.nl/onze-aanpak",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `
      <main>
        <h1>Onze aanpak — van teamscan naar duurzame teamontwikkeling</h1>
        <p>Mijn Teamkompas werkt in drie stappen: waarnemen, duiden en bewegen. We starten altijd met luisteren — naar de leidinggevende, het team en de context.</p>
        <h2>Stap 1 — Waarnemen</h2>
        <p>We luisteren, kijken en halen zorgvuldig op wat er speelt via een intakegesprek en de teamscan.</p>
        <h2>Stap 2 — Duiden</h2>
        <p>We verbinden signalen tot een helder beeld. Patronen worden zichtbaar en begrijpelijk.</p>
        <h2>Stap 3 — Bewegen</h2>
        <p>We vertalen het beeld naar een workshop, teamdag of gerichte interventie die direct uitvoerbaar is.</p>
        <p>Plan een vrijblijvend kennismakingsgesprek via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/">Home</a> <a href="/teamscan">Teamscan</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/verkennen">Verkennend gesprek</a></nav>
      </main>`,
  },
  {
    route: "insights-discovery-profiel",
    title: "Insights Discovery-profiel voor teams | Mijn Teamkompas",
    description:
      "Insights Discovery-profiel voor teams, teamdagen en teamontwikkeling. Lees over kleurenergieën, communicatieprofiel team en het verschil tussen DISC en Insights Discovery.",
    url: "https://www.mijnteamkompas.nl/insights-discovery-profiel",
    image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    content: `
      <main>
        <h1>Insights Discovery-profiel voor betere samenwerking</h1>
        <p>Een Insights Discovery-profiel helpt professionals en teams om communicatievoorkeuren, kwaliteiten, valkuilen en gedrag onder druk bespreekbaar te maken. Mijn Teamkompas gebruikt het profiel niet als los product, maar als hulpmiddel binnen teamontwikkeling, teamcoaching en teamdagen.</p>
        <h2>Wat is Insights Discovery?</h2>
        <p>Insights Discovery is een model voor persoonlijke en professionele ontwikkeling, gebaseerd op het gedachtegoed van Carl Jung. Het vertaalt psychologische voorkeuren naar vier kleurenergieën: vurig rood, stralend geel, zacht groen en helder blauw. Iedereen heeft alle vier de energieën in zich; de verhouding en context bepalen wat zichtbaar wordt.</p>
        <h2>Insights Discovery voor teams</h2>
        <p>Een Insights Discovery-profiel voor teams helpt bij zelfinzicht, communicatie, besluitvorming, feedback en samenwerking onder druk. Het profiel is geen oordeel, maar een communicatieprofiel team dat taal geeft aan verschillen en behoeften.</p>
        <h2>Wat is het verschil tussen DISC en Insights Discovery?</h2>
        <p>DISC beschrijft vooral zichtbaar gedrag. Insights Discovery kijkt breder naar psychologische voorkeuren in communicatie, besluitvorming, informatieverwerking en samenwerking. Beide modellen kunnen nuttig zijn, maar geen van beide vertelt de volledige waarheid over een persoon. De waarde ontstaat door het gesprek en de toepassing in de praktijk.</p>
        <h2>Insights Discovery teamdag</h2>
        <p>Tijdens een Insights Discovery teamdag koppelen we persoonlijke profielen aan echte situaties: vergaderingen, rolverdeling, feedback, spanning en teamafspraken. Zo wordt een persoonlijkheidsprofiel voor teams onderdeel van duurzame teamontwikkeling.</p>
        <h2>Veelgestelde vragen</h2>
        <p><strong>Worden mensen in hokjes geplaatst?</strong><br />Nee. We spreken over voorkeuren en kleurenergieën, niet over vaste identiteiten.</p>
        <p><strong>Is het geschikt voor selectie?</strong><br />Nee. In onze werkwijze is Insights Discovery bedoeld voor ontwikkeling en samenwerking, niet als zelfstandig beoordelingsinstrument.</p>
        <p><strong>Wordt een profiel vertrouwelijk behandeld?</strong><br />Ja. Vooraf spreken we af wie het profiel ontvangt, wat individueel blijft en wat iemand zelf met het team deelt.</p>
        <p>Vraag een profiel of verkennend gesprek aan via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/teamontwikkeling">Teamontwikkeling</a> <a href="/teamdag">Teamdag</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/psychologische-veiligheid">Psychologische veiligheid</a> <a href="/boven-en-onderstroom">Boven- en onderstroom</a> <a href="/brein-en-samenwerking">Neuromanagement</a> <a href="/kleine-experimenten">Kleine experimenten</a> <a href="/verkennen">Verkennend gesprek</a></nav>
      </main>`,
  },
  {
    route: "verkennen",
    title: "Verkennend gesprek | bespreek je teamvraag met Mijn Teamkompas",
    description:
      "Plan een vrijblijvend verkennend gesprek over teamontwikkeling, teamscan, samenwerking, psychologische veiligheid of leiderschapsbegeleiding.",
    url: "https://www.mijnteamkompas.nl/verkennen",
    image: "https://www.mijnteamkompas.nl/teamkompas-intakegesprek.jpg",
    content: `
      <main>
        <h1>Verkennend gesprek — bespreek je teamvraag vrijblijvend</h1>
        <p>Niet zeker wat je nodig hebt? Begin met een verkennend gesprek. In een uur bespreken we wat er speelt en kijken we welke aanpak het beste past.</p>
        <h2>Wat bespreken we?</h2>
        <ul>
          <li>Wat speelt er in het team of de organisatie?</li>
          <li>Welke aanpak past — teamscan, teamcoaching of teamdag?</li>
          <li>Wat zijn realistische verwachtingen en een passende tijdlijn?</li>
        </ul>
        <p>Het gesprek is gratis en verplicht je tot niets.</p>
        <p>Plan direct via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/">Home</a> <a href="/teamscan">Teamscan</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/teamdag">Teamdag</a></nav>
      </main>`,
  },
  {
    route: "inspiratie",
    title: "Inspiratie over teams, leiderschap en samenwerking | Mijn Teamkompas",
    description: "Lees artikelen over teamcultuur, leiderschap, eigenaarschap, psychologische veiligheid, verandering en samenwerken in teams.",
    url: "https://www.mijnteamkompas.nl/inspiratie",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    content: `<main><h1>Inspiratie voor teams die willen blijven groeien</h1><p>Artikelen met herkenbare situaties uit teams en organisaties, verbonden aan gedragswetenschap, teamdynamiek en praktische manieren om beweging te creëren.</p><h2>Artikelen over teams en samenwerking</h2><p>Ontdek inzichten over teamcultuur, leiderschap, verandering, bevlogenheid en samenwerking.</p></main>`,
  },
];

// ---------------------------------------------------------------------------
// Blogartikelen
//
// Zonder deze stap krijgt elk artikel de titel en omschrijving van de homepage
// mee in de ruwe HTML. Google voert JavaScript uit en ziet uiteindelijk wel het
// juiste, maar LinkedIn, WhatsApp en Slack doen dat niet: die tonen dan de
// homepagetekst zonder foto. Daarom bouwen we per gepubliceerd artikel een
// eigen statische versie.
// ---------------------------------------------------------------------------

const escapeHtml = (waarde = "") =>
  String(waarde).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function leesFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  let laatsteSleutel = "";
  match[1].split(/\r?\n/).forEach((regel) => {
    const veld = regel.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (veld) {
      laatsteSleutel = veld[1];
      data[laatsteSleutel] = veld[2].replace(/^(["'])(.*)\1$/, "$2").trim();
    } else if (/^\s+/.test(regel) && laatsteSleutel) {
      data[laatsteSleutel] = `${data[laatsteSleutel]} ${regel.trim()}`.trim();
    }
  });
  return { data, body: raw.slice(match[0].length).trim() };
}

// Kleine markdown-omzetter. Genoeg voor wat crawlers nodig hebben: koppen,
// alinea's, opsommingen, vetgedrukte tekst en links. Geen volledige parser.
function markdownNaarHtml(markdown) {
  const inline = (tekst) =>
    escapeHtml(tekst)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const blokken = markdown.split(/\n{2,}/);
  const uit = [];

  for (const blok of blokken) {
    const tekst = blok.trim();
    if (!tekst) continue;

    const kop = tekst.match(/^(#{2,4})\s+(.*)$/);
    if (kop) {
      const niveau = kop[1].length;
      uit.push(`<h${niveau}>${inline(kop[2])}</h${niveau}>`);
      continue;
    }

    if (/^[-*]\s+/.test(tekst)) {
      const items = tekst
        .split(/\n/)
        .filter((regel) => /^[-*]\s+/.test(regel))
        .map((regel) => `<li>${inline(regel.replace(/^[-*]\s+/, ""))}</li>`)
        .join("");
      uit.push(`<ul>${items}</ul>`);
      continue;
    }

    uit.push(`<p>${inline(tekst.replace(/\n/g, " "))}</p>`);
  }

  return uit.join("");
}

// Een artikel met een datum in de toekomst staat ingepland en hoort nog niet
// online. Dezelfde grens als in blogData.js en sync-sitemap-blogs.mjs.
const vandaag = new Date();
vandaag.setHours(23, 59, 59, 999);

const blogPaginas = fs
  .readdirSync(blogDir)
  .filter((naam) => naam.endsWith(".md"))
  .map((naam) => {
    const slug = naam.replace(/\.md$/, "");
    const { data, body } = leesFrontmatter(fs.readFileSync(path.join(blogDir, naam), "utf-8"));
    return { slug, data, body, tijd: Date.parse(data.date || "") };
  })
  .filter(({ tijd }) => !Number.isNaN(tijd) && tijd <= vandaag.getTime())
  .map(({ slug, data, body }) => {
    const titel = data.title || "Artikel";
    const beschrijving = data.description || data.lead || "";
    const afbeelding = data.image ? `${SITE}${data.image}` : DEFAULT_IMAGE;
    return {
      route: `blog/${slug}`,
      title: `${titel} | Mijn Teamkompas`,
      description: beschrijving,
      url: `${SITE}/blog/${slug}`,
      image: afbeelding,
      type: "article",
      published: data.date || "",
      content:
        `<main><article>` +
        `<h1>${escapeHtml(titel)}</h1>` +
        (data.lead ? `<p>${escapeHtml(data.lead)}</p>` : "") +
        markdownNaarHtml(body) +
        `<nav><a href="/inspiratie">Alle artikelen</a> <a href="/teamscan">Teamscan</a> ` +
        `<a href="/gratis-teamscan">Gratis teamscan</a></nav>` +
        `</article></main>`,
    };
  });

// Statische versie van elke kennisbankpagina met een eigen detailpagina.
// Zoekmachines en linkvoorbeelden krijgen zo echte inhoud te zien, ook zonder
// JavaScript. De React-pagina blijft de versie die bezoekers gebruiken.
const kennisbankPaginas = INTERNE_ITEMS.map((item) => {
  const inhoud = item.inhoud || {};
  const lijst = (waarden = []) => waarden.map((waarde) => `<li>${escapeHtml(waarde)}</li>`).join("");
  const stappen = (inhoud.stappen || [])
    .map((stap) => `<li><strong>${escapeHtml(stap.titel)}</strong> ${escapeHtml(stap.tekst)}</li>`)
    .join("");
  const velden = (inhoud.velden || [])
    .map((veld) => `<li><strong>${escapeHtml(veld.label)}</strong> ${escapeHtml(veld.uitleg || "")}</li>`)
    .join("");

  return {
    route: `kennisbank/${item.type}/${item.slug}`,
    title: `${item.titel} | Mijn Teamkompas`,
    description: item.samenvatting,
    url: `${SITE}${item.href}`,
    image: DEFAULT_IMAGE,
    type: "article",
    published: item.datum || "",
    content:
      `<main><article>`
      + `<h1>${escapeHtml(item.titel)}</h1>`
      + `<p>${escapeHtml(item.samenvatting)}</p>`
      + (inhoud.waarvoor ? `<h2>Waarvoor je dit gebruikt</h2><p>${escapeHtml(inhoud.waarvoor)}</p>` : "")
      + (inhoud.hypothese ? `<h2>Wat je onderzoekt</h2><p>${escapeHtml(inhoud.hypothese)}</p>` : "")
      + (inhoud.hoe ? `<h2>Hoe je het gebruikt</h2><p>${escapeHtml(inhoud.hoe)}</p>` : "")
      + (inhoud.benodigdheden ? `<h2>Wat je nodig hebt</h2><ul>${lijst(inhoud.benodigdheden)}</ul>` : "")
      + (stappen ? `<h2>Stap voor stap</h2><ol>${stappen}</ol>` : "")
      + (inhoud.vragen ? `<h2>De vragen</h2><ol>${lijst(inhoud.vragen)}</ol>` : "")
      + (inhoud.zinnen ? `<h2>Zinnen die je kunt gebruiken</h2><ul>${lijst(inhoud.zinnen)}</ul>` : "")
      + (velden ? `<h2>Het canvas</h2><ul>${velden}</ul>` : "")
      + (inhoud.waaraanMerkJeHet ? `<h2>Waaraan je merkt dat het werkt</h2><p>${escapeHtml(inhoud.waaraanMerkJeHet)}</p>` : "")
      + (inhoud.letOp ? `<h2>Let op</h2><p>${escapeHtml(inhoud.letOp)}</p>` : "")
      + `<nav><a href="/kennisbank">Naar de kennisbank</a> <a href="/inspiratie">Alle artikelen</a> `
      + `<a href="/gratis-teamscan">Gratis teamscan</a></nav>`
      + `</article></main>`,
  };
});

for (const page of [...pages, ...blogPaginas, ...kennisbankPaginas]) {
  const beeld = escapeHtml(page.image || DEFAULT_IMAGE);
  const titel = escapeHtml(page.title);
  const beschrijving = escapeHtml(page.description);
  const soort = page.type || "website";

  const metaTags = `
    <link rel="canonical" href="${page.url}" />
    <meta property="og:type" content="${soort}" />
    <meta property="og:locale" content="nl_NL" />
    <meta property="og:site_name" content="Mijn Teamkompas" />
    <meta property="og:title" content="${titel}" />
    <meta property="og:description" content="${beschrijving}" />
    <meta property="og:url" content="${page.url}" />
    <meta property="og:image" content="${beeld}" />${
      page.published ? `\n    <meta property="article:published_time" content="${page.published}" />` : ""
    }
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${titel}" />
    <meta name="twitter:description" content="${beschrijving}" />
    <meta name="twitter:image" content="${beeld}" />`;

  // Vervang de homepage title en description door pagina-specifieke versie.
  // De vervangingen gebeuren met een functie, zodat een dollarteken in de tekst
  // niet als verwijzing naar een regex-groep wordt gelezen.
  let html = baseHtml
    .replace(/<title>.*?<\/title>/, () => `<title>${titel}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      () => `<meta name="description" content="${beschrijving}" />`
    );

  // Vervang het terugvalblok met deel-tags door de pagina-specifieke versie.
  // Vervangen en niet toevoegen, want twee keer og:title in dezelfde pagina
  // levert onvoorspelbare voorbeelden op bij LinkedIn en WhatsApp.
  html = html.replace(
    /<!-- social-tags -->[\s\S]*?<!-- \/social-tags -->/,
    () => `<!-- social-tags -->${metaTags}\n    <!-- /social-tags -->`
  );

  // Vervang de homepage seo-fallback content door pagina-specifieke content
  html = html.replace(
    /<div id="seo-fallback">[\s\S]*?<\/div>\s*<\/div>\s*<\/body>/,
    () => `<div id="seo-fallback">${page.content}\n    </div>\n  </div>\n  </body>`
  );

  const outDir = path.join(distDir, page.route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
  console.log(`✓ dist/${page.route}/index.html`);
}

console.log(
  `\nKlaar — ${pages.length} vaste pagina's, ${blogPaginas.length} gepubliceerde artikelen en ${kennisbankPaginas.length} kennisbankpagina's gegenereerd.`
);
