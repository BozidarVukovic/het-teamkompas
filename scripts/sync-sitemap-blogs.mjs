// scripts/sync-sitemap-blogs.mjs
// Houdt de blogregels in public/sitemap.xml gelijk aan de artikelen in
// src/content/blog. Artikelen met een datum in de toekomst staan ingepland en
// horen nog niet in de sitemap; zodra hun datum is bereikt komen ze er bij de
// eerstvolgende build vanzelf in.
//
// Draait automatisch mee met `npm run build`.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "../src/content/blog");
const sitemapPath = path.join(__dirname, "../public/sitemap.xml");
const BASE = "https://www.mijnteamkompas.nl/blog/";

const vandaag = new Date();
vandaag.setHours(23, 59, 59, 999);

const artikelen = fs
  .readdirSync(blogDir)
  .filter((naam) => naam.endsWith(".md"))
  .map((naam) => {
    const slug = naam.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(blogDir, naam), "utf-8");
    const datum = (raw.match(/^date:\s*(\S+)/m) || [])[1] || "";
    return { slug, datum, tijd: Date.parse(datum) };
  })
  .filter((a) => !Number.isNaN(a.tijd));

const gepubliceerd = artikelen.filter((a) => a.tijd <= vandaag.getTime());
const gepland = artikelen.filter((a) => a.tijd > vandaag.getTime());

let sitemap = fs.readFileSync(sitemapPath, "utf-8");

// Bestaande blogregels eruit halen; we bouwen ze opnieuw op.
const blogBlok = /[ \t]*<url>\s*<loc>https:\/\/www\.mijnteamkompas\.nl\/blog\/[^<]+<\/loc>[\s\S]*?<\/url>\n/g;
sitemap = sitemap.replace(blogBlok, "");

const regels = gepubliceerd
  .sort((a, b) => a.tijd - b.tijd)
  .map(
    (a) =>
      `  <url>\n    <loc>${BASE}${a.slug}</loc>\n    <lastmod>${a.datum}</lastmod>\n` +
      `    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`
  )
  .join("");

sitemap = sitemap.replace("</urlset>", `${regels}</urlset>`);
fs.writeFileSync(sitemapPath, sitemap, "utf-8");

console.log(`Sitemap bijgewerkt: ${gepubliceerd.length} gepubliceerde artikelen.`);
if (gepland.length) {
  console.log(`Nog ingepland (niet in sitemap):`);
  gepland
    .sort((a, b) => a.tijd - b.tijd)
    .forEach((a) => console.log(`  ${a.datum}  ${a.slug}`));
}
