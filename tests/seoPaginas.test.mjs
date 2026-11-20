// Titels en omschrijvingen voor de zoekresultaten. Zie src/content/seoPaginas.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_PAGINAS } from "../src/content/seoPaginas.js";
import { artikelPaginaTitel } from "../src/lib/seoTitel.js";

const wortel = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("index.html heeft dezelfde titel en omschrijving als SEO_PAGINAS.home", () => {
  const html = fs.readFileSync(path.join(wortel, "index.html"), "utf-8");
  const titel = html.match(/<title>(.*?)<\/title>/)[1];
  const omschrijving = html.match(/<meta name="description" content="(.*?)" \/>/)[1];
  assert.equal(titel, SEO_PAGINAS.home.title);
  assert.equal(omschrijving, SEO_PAGINAS.home.description);
});

test("de statische homepagekop is gelijk aan de kop in heroContent", async () => {
  const { heroContent } = await import("../src/content/heroContent.js");
  const html = fs.readFileSync(path.join(wortel, "index.html"), "utf-8");
  const kop = html.match(/<div id="seo-fallback">[\s\S]*?<h1>(.*?)<\/h1>/)[1];
  assert.equal(kop, heroContent.title);
});

test("titels blijven binnen wat Google toont en omschrijvingen hebben een bruikbare lengte", () => {
  for (const [sleutel, pagina] of Object.entries(SEO_PAGINAS)) {
    assert.ok(pagina.title.length <= 70, `${sleutel}: titel van ${pagina.title.length} tekens`);
    assert.ok(pagina.description.length >= 100 && pagina.description.length <= 165,
      `${sleutel}: omschrijving van ${pagina.description.length} tekens`);
    assert.ok(!/—/.test(pagina.title + pagina.description), `${sleutel}: geen em-dash`);
    assert.ok(pagina.url.startsWith("https://www.mijnteamkompas.nl/"), `${sleutel}: canonieke url`);
  }
});

test("artikeltitel: seoTitle gaat voor, merknaam alleen als het past", () => {
  assert.equal(artikelPaginaTitel({ title: "Kort" }), "Kort | Mijn Teamkompas");
  assert.equal(artikelPaginaTitel({ title: "Adam Smith", seoTitle: "Besluiten toetsen" }), "Besluiten toetsen | Mijn Teamkompas");
  const lang = "Een titel die op zichzelf al bijna zestig tekens lang is, echt waar";
  assert.equal(artikelPaginaTitel({ title: lang }), lang);
  assert.equal(artikelPaginaTitel({}), "Artikel | Mijn Teamkompas");
});

test("na een dubbele punt in een seoTitle volgt een kleine letter", () => {
  const map = path.join(wortel, "src/content/blog");
  for (const naam of fs.readdirSync(map).filter((n) => n.endsWith(".md"))) {
    const regel = fs.readFileSync(path.join(map, naam), "utf-8").match(/^seoTitle:\s*(.*)$/m);
    if (!regel) continue;
    assert.ok(!/:\s+[A-Z]/.test(regel[1].replace(/KPI's/g, "kpi's")), `${naam}: ${regel[1]}`);
  }
});
