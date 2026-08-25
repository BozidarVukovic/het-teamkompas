// scripts/sync-sitemap-kennisbank.mjs
// Houdt de kennisbankregels in public/sitemap.xml gelijk aan de content in
// src/data/kennisbank. Alleen items met een eigen detailpagina komen erin;
// items die naar een bestaande pagina verwijzen staan daar al.
//
// Tijdelijke filtercombinaties (/kennisbank?situatie=...) horen er nadrukkelijk
// niet in: dat zijn persoonlijke weergaves van bestaande content en de pagina
// zet daarvoor zelf al noindex.
//
// Draait automatisch mee met `npm run build`.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INTERNE_ITEMS } from "../src/data/kennisbank/items.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemapPath = path.join(__dirname, "../public/sitemap.xml");
const SITE = "https://www.mijnteamkompas.nl";

let sitemap = fs.readFileSync(sitemapPath, "utf-8");

// Bestaande kennisbankregels eruit halen; we bouwen ze opnieuw op.
const blok = /[ \t]*<url>\s*<loc>https:\/\/www\.mijnteamkompas\.nl\/kennisbank[^<]*<\/loc>[\s\S]*?<\/url>\n/g;
sitemap = sitemap.replace(blok, "");

const vandaag = new Date().toISOString().slice(0, 10);

const landing =
  `  <url>\n    <loc>${SITE}/kennisbank</loc>\n    <lastmod>${vandaag}</lastmod>\n` +
  `    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n  </url>\n`;

const regels = INTERNE_ITEMS
  .slice()
  .sort((a, b) => a.href.localeCompare(b.href))
  .map(
    (item) =>
      `  <url>\n    <loc>${SITE}${item.href}</loc>\n    <lastmod>${item.datum || vandaag}</lastmod>\n` +
      `    <changefreq>monthly</changefreq>\n    <priority>0.70</priority>\n  </url>\n`
  )
  .join("");

sitemap = sitemap.replace("</urlset>", `${landing}${regels}</urlset>`);
fs.writeFileSync(sitemapPath, sitemap, "utf-8");

console.log(`Sitemap bijgewerkt: kennisbank met ${INTERNE_ITEMS.length} detailpagina's.`);
