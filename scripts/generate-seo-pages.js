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
    title: "Teamdag organiseren voor betere samenwerking | Mijn Teamkompas",
    description:
      "Organiseer een teamdag die verder gaat dan een leuke sessie. Mijn Teamkompas helpt met teamscan, Insights Discovery en concrete vervolgstappen voor duurzame samenwerking.",
    url: "https://www.mijnteamkompas.nl/teamdag",
    image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    content: `
      <main>
        <h1>Een teamdag die meer oplevert dan een leuke dag</h1>
        <p>Mijn Teamkompas helpt teams een teamdag organiseren die begint bij wat er echt speelt. Met een teamscan, intake en eventueel Insights Discovery maken we zichtbaar waar samenwerking vastloopt en wat nodig is om in beweging te komen.</p>

        <h2>Herken je dit in jouw team?</h2>
        <ul>
          <li>Iedereen ziet wat er speelt, maar niemand benoemt het. De vergadering eindigt zoals hij begon.</li>
          <li>Er is een dag gepland, maar de echte vraag is nog niet scherp. De agenda staat vol, maar de onderstroom blijft onbesproken.</li>
          <li>Het team wil vooruit, maar loopt steeds vast op dezelfde patronen: rolverdeling, overlegdruk, verwachtingen die niet worden uitgesproken.</li>
          <li>Na een teamdag is er energie, maar twee weken later is er weinig veranderd. De afspraken zijn er, de opvolging niet.</li>
        </ul>

        <h2>Onze aanpak voor een teamdag</h2>
        <ol>
          <li><strong>Vraag scherp maken.</strong> We starten niet met werkvormen, maar met de vraag: waar moet deze dag echt aan bijdragen?</li>
          <li><strong>Teamscan als spiegel.</strong> De teamscan brengt in kaart hoe het team veiligheid, energie, verandering en samenwerking ervaart.</li>
          <li><strong>Programma op maat.</strong> We ontwerpen geen standaarddag, maar een dag die past bij het team, de leidinggevende en de specifieke ontwikkelvraag.</li>
          <li><strong>Van inzicht naar gedrag.</strong> Onderstroom bespreekbaar maken, gedrag ervaren in oefeningen, reflecteren en concrete afspraken maken.</li>
          <li><strong>Eigenaarschap en borging.</strong> We ronden af met persoonlijk eigenaarschap: wie neemt wat mee, wat doet het team morgen anders?</li>
        </ol>

        <h2>Teamdag met Insights Discovery</h2>
        <p>Insights Discovery geeft het team een gemeenschappelijke taal om te begrijpen waarom mensen reageren zoals ze reageren, op een rustige dag én onder druk. Ieder teamlid ontvangt na de dag een individueel profiel.</p>

        <h2>Veelgestelde vragen</h2>
        <p><strong>Hoe organiseer je een effectieve teamdag?</strong><br />Een effectieve teamdag begint met een scherpe ontwikkelvraag. Mijn Teamkompas gebruikt een teamscan en intake om te bepalen waar de teamdag echt aan moet bijdragen, zodat de dag verder gaat dan losse werkvormen.</p>
        <p><strong>Wat maakt een teamdag bij Mijn Teamkompas anders?</strong><br />Wij ontwerpen een teamdag niet vanuit standaardwerkvormen, maar vanuit de ontwikkelvraag van het team. Teamscan, intake en eventueel Insights Discovery bepalen wat nodig is voor duurzame verandering.</p>
        <p><strong>Kan Insights Discovery onderdeel zijn van de teamdag?</strong><br />Ja. Mijn Teamkompas gebruikt Insights Discovery niet als losse profieltraining, maar als onderdeel van een bredere aanpak rond teamontwikkeling, communicatie en samenwerking.</p>
        <p><strong>Voor welke organisaties is een teamdag geschikt?</strong><br />Een teamdag is geschikt voor teams in zakelijke dienstverlening, gemeenten, onderwijs en industrie, overal waar samenwerking, communicatie of eigenaarschap versterkt moet worden.</p>

        <h2>Een dag die begint bij wat er echt speelt</h2>
        <p>Plan een vrijblijvend kennismakingsgesprek. Dan kijken we samen wat jullie team nu het meest nodig heeft: een teamscan, een teamdag, of een combinatie. Mail naar <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a> of start met een <a href="/verkennen">verkennend gesprek</a>.</p>
        <nav><a href="/">Home</a> <a href="/teamscan">Teamscan</a> <a href="/teamcoaching">Teamcoaching</a> <a href="/verkennen">Verkennend gesprek</a></nav>
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
      "Ontdek hoe een Insights Discovery-profiel helpt om communicatie, zelfinzicht en samenwerking binnen teams te versterken.",
    url: "https://www.mijnteamkompas.nl/insights-discovery-profiel",
    image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    content: `
      <main>
        <h1>Insights Discovery-profiel voor betere samenwerking</h1>
        <p>Een Insights Discovery-profiel helpt professionals en teams om voorkeuren, kwaliteiten, communicatie en gedrag onder druk bespreekbaar te maken. Mijn Teamkompas gebruikt het profiel niet als los testproduct, maar als hulpmiddel binnen teamontwikkeling.</p>
        <h2>Wat levert het op?</h2>
        <ul>
          <li>Meer zelfinzicht in natuurlijke voorkeuren, kwaliteiten en valkuilen.</li>
          <li>Een gezamenlijke taal voor communicatie en samenwerking.</li>
          <li>Een startpunt voor een teamsessie, teamdag of ontwikkeltraject.</li>
        </ul>
        <p>Vraag een profiel of verkennend gesprek aan via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
        <nav><a href="/teamontwikkeling">Teamontwikkeling</a> <a href="/teamdag">Teamdag</a> <a href="/psychologische-veiligheid">Psychologische veiligheid</a> <a href="/verkennen">Verkennend gesprek</a></nav>
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
