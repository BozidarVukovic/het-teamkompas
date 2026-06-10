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
    title: "Teamdag organiseren | dialoog en concrete afspraken",
    description:
      "Een teamdag van Mijn Teamkompas: gestructureerde dialoog op basis van de teamscan, met heldere uitkomsten, gedeelde afspraken en concrete vervolgstappen.",
    url: "https://www.mijnteamkompas.nl/teamdag",
    image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    content: `
      <main>
        <h1>Teamdag organiseren — dialoog, inzicht en concrete afspraken</h1>
        <p>Een teamdag van Mijn Teamkompas is geen standaard teambuilding. Het is een gestructureerde dag die voortbouwt op de uitkomsten van de teamscan. Het team bespreekt wat er speelt, trekt conclusies en maakt samen afspraken die de volgende dag al uitvoerbaar zijn.</p>
        <h2>Hoe ziet een teamdag eruit?</h2>
        <ul>
          <li>Presentatie van de teamscanresultaten aan het team.</li>
          <li>Gestructureerde dialoog over thema's die eruit springen.</li>
          <li>Gezamenlijk formuleren van verbeterpunten en acties.</li>
          <li>Heldere afspraken die direct toepasbaar zijn in de praktijk.</li>
        </ul>
        <p>Plan een vrijblijvend kennismakingsgesprek via <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>
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
