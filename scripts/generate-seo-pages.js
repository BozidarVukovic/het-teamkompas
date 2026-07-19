// scripts/generate-seo-pages.js
// Draait automatisch na `npm run build` (via postbuild in package.json)
// Genereert per route een statische HTML met unieke meta-tags,
// gebaseerd op de door Vite gebouwde dist/index.html (inclusief juiste asset-hashes).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const baseHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

const pages = [
  {
    route: "teamscan",
    title: "Teamscan starten | inzicht in samenwerking, energie en veiligheid",
    description:
      "Start laagdrempelig een digitale teamscan. Krijg inzicht in samenwerking, psychologische veiligheid, energie, motivatie en verbeterkracht in je team.",
    url: "https://www.mijnteamkompas.nl/teamscan",
    image: "https://www.mijnteamkompas.nl/teamkompas-vier-domeinen.jpg",
    content: `
      <main>
        <h1>Teamscan starten — inzicht in samenwerking, energie en veiligheid</h1>
        <p>Met de digitale teamscan van Mijn Teamkompas krijg je snel en laagdrempelig zicht op wat er speelt in je team. De scan meet op vier domeinen tegelijk: psychologische veiligheid, energie en motivatie, verandering en duidelijkheid, en leren en verbeteren.</p>
        <h2>Wat meet de teamscan?</h2>
        <ul>
          <li><strong>Vertrouwen en veiligheid.</strong> Kunnen mensen zich uitspreken, fouten bespreken en elkaar aanspreken?</li>
          <li><strong>Energie en motivatie.</strong> Waar geven werk en samenwerking energie, en waar ontstaan belasting of frustratie?</li>
          <li><strong>Verandering en duidelijkheid.</strong> Begrijpen mensen wat er verandert en wat er van hen wordt gevraagd?</li>
          <li><strong>Leren en verbeteren.</strong> Hoe leert een team van ervaringen en worden verbeteringen vastgehouden?</li>
        </ul>
        <h2>Voor wie is de teamscan?</h2>
        <p>Geschikt voor teams in zakelijke dienstverlening, gemeenten, onderwijs en industrie.</p>
        <p>Plan een vrijblijvend kennismakingsgesprek via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/">Home</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/teamdag">Teamdag</a> <a href="/verkennen">Verkennend gesprek</a></nav>
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
];

for (const page of pages) {
  const metaTags = `
    <link rel="canonical" href="${page.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="nl_NL" />
    <meta property="og:site_name" content="Mijn Teamkompas" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:url" content="${page.url}" />
    <meta property="og:image" content="${page.image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${page.image}" />`;

  // Vervang de homepage title en description door pagina-specifieke versie
  let html = baseHtml
    .replace(
      /<title>.*?<\/title>/,
      `<title>${page.title}</title>`
    )
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${page.description}" />`
    );

  // Voeg canonical + OG + Twitter tags toe na de description tag
  html = html.replace(
    /(<meta name="description".*?\/>)/,
    `$1\n${metaTags}`
  );

  // Vervang de homepage seo-fallback content door pagina-specifieke content
  html = html.replace(
    /(<div id="seo-fallback">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/body>)/,
    `$1${page.content}\n    </div>\n  </div>\n  </body>`
  );

  const outDir = path.join(distDir, page.route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
  console.log(`✓ dist/${page.route}/index.html`);
}

console.log("\nKlaar — SEO-pagina's gegenereerd.");
