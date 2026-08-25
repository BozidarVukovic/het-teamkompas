// scripts/valideer-kennisbank.mjs
//
// Controleert de content van de kennisbank vóór elke build. Ontbrekende of
// verkeerde metadata is hier goedkoop te herstellen en op de live site duur.
//
// Fouten stoppen de build. Waarschuwingen niet: die melden iets dat aandacht
// verdient maar de site niet stukmaakt.
//
// Draait automatisch mee met `npm run build`, of los met
// `npm run valideer:kennisbank`.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BASIS_ITEMS, INTERNE_ITEMS } from "../src/data/kennisbank/items.js";
import {
  CONTENTTYPE_IDS, DOEL_IDS, DOMEIN_IDS, ROL_IDS, SITUATIE_IDS, TAG_IDS, WERKWIJZE_IDS,
} from "../src/data/kennisbank/taxonomie.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wortel = path.join(__dirname, "..");
const fouten = [];
const waarschuwingen = [];

const fout = (id, tekst) => fouten.push(`${id}: ${tekst}`);
const waarschuw = (id, tekst) => waarschuwingen.push(`${id}: ${tekst}`);

// ── Bekende interne routes verzamelen ──────────────────────────────────────
const appBron = fs.readFileSync(path.join(wortel, "src/App.jsx"), "utf-8");
const routes = new Set([...appBron.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));
const blogSlugs = new Set(
  fs.readdirSync(path.join(wortel, "src/content/blog"))
    .filter((naam) => naam.endsWith(".md"))
    .map((naam) => naam.replace(/\.md$/, ""))
);
const kennisbankPaden = new Set(INTERNE_ITEMS.map((item) => item.href));

function bestaatPad(pad) {
  if (!pad || !pad.startsWith("/")) return true; // externe of lege verwijzing
  const schoon = pad.split("?")[0].split("#")[0];
  if (kennisbankPaden.has(schoon)) return true;
  if (routes.has(schoon)) return true;
  if (schoon.startsWith("/blog/")) return blogSlugs.has(schoon.slice(6));
  if (/\.(pdf|jpg|jpeg|png|svg|webp)$/i.test(schoon)) {
    return fs.existsSync(path.join(wortel, "public", schoon));
  }
  return false;
}

// ── Per contentitem ────────────────────────────────────────────────────────
const gezieneIds = new Map();
const gezieneHrefs = new Map();

BASIS_ITEMS.forEach((item) => {
  const id = item.id || "(item zonder id)";

  if (!item.id) fout(id, "heeft geen uniek identificatienummer");
  if (gezieneIds.has(item.id)) fout(id, "is dubbel geregistreerd");
  gezieneIds.set(item.id, true);

  if (gezieneHrefs.has(item.href)) {
    const melding = `deelt de url ${item.href} met ${gezieneHrefs.get(item.href)}`;
    if (item.intern) fout(id, melding); else waarschuw(id, melding);
  }
  gezieneHrefs.set(item.href, item.id);

  if (!item.titel) fout(id, "heeft geen titel");
  if (!item.samenvatting) fout(id, "heeft geen korte samenvatting");
  if (!CONTENTTYPE_IDS.includes(item.type)) fout(id, `heeft een onbekend contenttype: ${item.type}`);
  if (!item.intern && !item.url) fout(id, "heeft geen slug en geen url");
  if (item.intern && !item.slug) fout(id, "heeft geen slug voor de detailpagina");

  if (!item.domeinen.length) fout(id, "heeft geen domein");
  item.domeinen.forEach((domein) => {
    if (!DOMEIN_IDS.includes(domein)) fout(id, `gebruikt een onbekend domein: ${domein}`);
  });

  if (item.tijdMinuten === null || item.tijdMinuten === undefined) fout(id, "heeft geen tijdsindicatie");

  if (!item.rollen.length) fout(id, "heeft geen doelgroep");
  item.rollen.forEach((rol) => {
    if (!ROL_IDS.includes(rol)) fout(id, `gebruikt een onbekende rol: ${rol}`);
  });

  if (!item.doelen.length) fout(id, "heeft geen gewenst resultaat");
  item.doelen.forEach((doel) => {
    if (!DOEL_IDS.includes(doel)) fout(id, `gebruikt een onbekend gewenst resultaat: ${doel}`);
  });

  if (!item.werkwijzen.length) fout(id, "heeft geen manier van werken");
  item.werkwijzen.forEach((werkwijze) => {
    if (!WERKWIJZE_IDS.includes(werkwijze)) fout(id, `gebruikt een onbekende manier van werken: ${werkwijze}`);
  });

  if (!item.tags.length) fout(id, "heeft geen tags");
  item.tags.forEach((tag) => {
    if (!TAG_IDS.includes(tag)) fout(id, `gebruikt een onbekende tag: ${tag}`);
  });

  item.situaties.forEach((situatie) => {
    if (!SITUATIE_IDS.includes(situatie)) fout(id, `gebruikt een onbekende teamsituatie: ${situatie}`);
  });

  if (item.url && !bestaatPad(item.url)) fout(id, `verwijst naar een niet-bestaande pagina: ${item.url}`);
  if (item.bestand && !bestaatPad(item.bestand)) fout(id, `verwijst naar een niet-bestaand bestand: ${item.bestand}`);
  if (item.vervolgstap && !bestaatPad(item.vervolgstap.href)) {
    fout(id, `heeft een vervolgstap naar een niet-bestaande pagina: ${item.vervolgstap.href}`);
  }
  if (!item.vervolgstap) waarschuw(id, "heeft geen aanbevolen vervolgstap");
  if (item.intern && !item.inhoud) waarschuw(id, "heeft een eigen pagina maar geen inhoud");
});

// Verwijzingen naar gerelateerde content mogen niet dood zijn.
BASIS_ITEMS.forEach((item) => {
  (item.gerelateerd || []).forEach((referentie) => {
    const doelItem = referentie.startsWith("art:")
      ? BASIS_ITEMS.find((ander) => ander.url === referentie.slice(4))
      : BASIS_ITEMS.find((ander) => ander.id === referentie);
    if (!doelItem) waarschuw(item.id, `verwijst naar onbekende gerelateerde content: ${referentie}`);
    else if (doelItem.id === item.id) fout(item.id, "verwijst naar zichzelf als gerelateerde content");
  });
});

// ── De verrijking van de blogartikelen ─────────────────────────────────────
// artikelen.js kan hier niet worden geïmporteerd, omdat het via blogData.js
// import.meta.glob gebruikt. We lezen de tabel daarom als tekst.
const artikelBron = fs.readFileSync(path.join(wortel, "src/data/kennisbank/artikelen.js"), "utf-8");
const tabel = artikelBron.match(/export const ARTIKEL_TAGS = \{([\s\S]*?)\n\};/);
if (!tabel) {
  waarschuwingen.push("artikelen.js: ARTIKEL_TAGS kon niet worden gelezen");
} else {
  const regels = [...tabel[1].matchAll(/"([^"]+)":\s*\[([^\]]*)\]/g)];
  regels.forEach(([, slug, waarden]) => {
    if (!blogSlugs.has(slug)) waarschuw("artikelverrijking", `${slug} bestaat niet meer in src/content/blog`);
    waarden.split(",").map((deel) => deel.trim().replace(/^"|"$/g, "")).filter(Boolean).forEach((tag) => {
      if (!TAG_IDS.includes(tag)) fout("artikelverrijking", `${slug} gebruikt een onbekende tag: ${tag}`);
    });
  });
  const zonderVerrijking = [...blogSlugs].filter((slug) => !regels.some(([, s]) => s === slug));
  if (zonderVerrijking.length) {
    waarschuwingen.push(
      `artikelverrijking: ${zonderVerrijking.length} artikel(en) zonder handmatige tags. `
      + `Ze doen mee op basis van hun eigen frontmatter: ${zonderVerrijking.join(", ")}`
    );
  }
}

// ── Uitkomst ───────────────────────────────────────────────────────────────
console.log(`Kennisbank gecontroleerd: ${BASIS_ITEMS.length} items, waarvan ${INTERNE_ITEMS.length} met een eigen pagina.`);
if (waarschuwingen.length) {
  console.log(`\n${waarschuwingen.length} waarschuwing(en):`);
  waarschuwingen.forEach((regel) => console.log(`  · ${regel}`));
}
if (fouten.length) {
  console.error(`\n${fouten.length} fout(en):`);
  fouten.forEach((regel) => console.error(`  ✗ ${regel}`));
  process.exit(1);
}
console.log("\nGeen fouten gevonden.");
