// scripts/maak-seo-snapshot.mjs
//
// Maakt scripts/seo-kennispaginas.json: per kennispagina de titel, de
// omschrijving en een vereenvoudigde HTML-versie van de inhoud, zoals de
// pagina er na het laden uitziet. generate-seo-pages.js zet die inhoud in
// de statische HTML, zodat Google bij de eerste lezing de echte pagina ziet
// in plaats van de homepage.
//
// Waarom een momentopname en geen handgeschreven kopie. De andere vaste
// pagina's hebben een handgeschreven terugvaltekst in generate-seo-pages.js,
// en die liep steeds achter op de echte pagina. Deze momentopname komt uit
// de pagina zelf. Hij veroudert wel als een pagina verandert; draai dit
// script dan opnieuw. tests/seoKennispaginas.test.mjs slaat alarm als de
// titel of omschrijving in de broncode niet meer overeenkomt.
//
// Gebruik (vraagt Playwright, staat bewust niet in package.json):
//   npm run build
//   npx serve dist -s -l 4173            (of een andere statische server)
//   node scripts/maak-seo-snapshot.mjs http://localhost:4173
//
// Waarom november 2026: Search Console liet zien dat juist deze pagina's de
// meeste vertoningen hadden (eigenaarschap, psychologische en sociale
// veiligheid) en tegelijk het laagst stonden. Ze kregen tot dan toe de
// HTML van de homepage mee.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const KENNISPAGINAS = [
  ["psychologische-veiligheid", "src/App.jsx"],
  ["sociale-veiligheid", "src/App.jsx"],
  ["boven-en-onderstroom", "src/App.jsx"],
  ["brein-en-samenwerking", "src/App.jsx"],
  ["kleine-experimenten", "src/App.jsx"],
  ["kennis/eigenaarschap-in-teams", "src/pages/public/EigenaarschapInTeams.jsx"],
  ["kennis/teamcultuur", "src/pages/public/Teamcultuur.jsx"],
  ["kennis/teamenergie", "src/pages/public/Teamenergie.jsx"],
  ["kennis/bevlogenheid-in-het-werk", "src/pages/public/BevlogenheidInHetWerk.jsx"],
  ["kennis/verandermanagement", "src/pages/public/Verandermanagement.jsx"],
  ["kennis/impact-van-een-teamdag", "src/pages/public/ImpactVanEenTeamdag.jsx"],
  ["kennis/kenniskaart-teamontwikkeling", "src/pages/public/KenniskaartTeamontwikkeling.jsx"],
];

function haalInhoud() {
  const root = document.querySelector("#root").cloneNode(true);
  root.querySelectorAll("header, footer, nav[aria-label='Hoofdmenu'], script, style, svg, img, button, form, iframe, [role='dialog'], #seo-fallback").forEach((n) => n.remove());
  const toegestaan = new Set(["H1", "H2", "H3", "P", "UL", "OL", "LI", "A", "STRONG", "EM", "DETAILS", "SUMMARY"]);
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const schoon = (t) => t.replace(/\s+/g, " ");
  function zet(node) {
    if (node.nodeType === 3) return esc(schoon(node.textContent));
    if (node.nodeType !== 1) return "";
    const binnen = Array.from(node.childNodes).map(zet).join("");
    const tag = node.tagName;
    if (!toegestaan.has(tag)) return /^(DIV|SECTION|ARTICLE|MAIN|ASIDE)$/.test(tag) ? `\n${binnen}\n` : binnen;
    if (tag === "DETAILS" || tag === "SUMMARY") return tag === "SUMMARY" ? `<h3>${binnen.trim()}</h3>` : binnen;
    if (tag === "A") {
      const href = node.getAttribute("href") || "";
      if (!href.startsWith("/") && !href.startsWith("https://")) return binnen;
      return `<a href="${href.replace(/"/g, "&quot;")}">${binnen.trim()}</a>`;
    }
    const t = tag.toLowerCase();
    if (!binnen.trim()) return "";
    return `<${t}>${binnen.trim()}</${t}>`;
  }
  const html = zet(root)
    .split("\n").map((r) => r.trim()).filter(Boolean).join("\n")
    .replace(/<p>\s*<\/p>/g, "");
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || "",
    image: document.querySelector('meta[property="og:image"]')?.content || "",
    content: `<main>\n${html}\n</main>`,
  };
}

async function main() {
  const basis = (process.argv[2] || "http://localhost:4173").replace(/\/$/, "");
  const doel = path.join(path.dirname(fileURLToPath(import.meta.url)), "seo-kennispaginas.json");
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const pagina = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const uit = {};
  for (const [route, bron] of KENNISPAGINAS) {
    await pagina.goto(`${basis}/${route}`, { waitUntil: "networkidle" });
    await pagina.waitForFunction(() => document.querySelector("h1") && !document.querySelector("#seo-fallback"), null, { timeout: 15000 }).catch(() => {});
    const data = await pagina.evaluate(haalInhoud);
    if (!data.content.includes("<h1>")) throw new Error(`${route}: geen h1 gevonden`);
    uit[route] = { bron, ...data };
    console.log(`✓ ${route}  ${data.title}  (${data.content.length} tekens)`);
  }
  await browser.close();
  fs.writeFileSync(doel, `${JSON.stringify(uit, null, 2)}\n`, "utf-8");
  console.log(`\nGeschreven: ${path.relative(process.cwd(), doel)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
