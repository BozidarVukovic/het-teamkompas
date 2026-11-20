// De momentopname van de kennispagina's (scripts/seo-kennispaginas.json)
// mag niet stilletjes verouderen. Verandert de titel of omschrijving in de
// broncode, dan faalt deze test: draai dan scripts/maak-seo-snapshot.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_PAGINAS } from "../src/content/seoPaginas.js";

const wortel = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const momentopname = JSON.parse(fs.readFileSync(path.join(wortel, "scripts/seo-kennispaginas.json"), "utf-8"));
const vercel = JSON.parse(fs.readFileSync(path.join(wortel, "vercel.json"), "utf-8"));
const app = fs.readFileSync(path.join(wortel, "src/App.jsx"), "utf-8");
const centraal = Object.values(SEO_PAGINAS);

const staatInBron = (bron, tekst, veld) =>
  bron.includes(tekst) || bron.includes(tekst.replace(/&/g, "&amp;")) || centraal.some((p) => p[veld] === tekst);

for (const [route, pagina] of Object.entries(momentopname)) {
  test(`${route}: momentopname klopt met de broncode`, () => {
    const bron = fs.readFileSync(path.join(wortel, pagina.bron), "utf-8");
    assert.ok(staatInBron(bron, pagina.title, "title"), `titel niet (meer) in ${pagina.bron}: ${pagina.title}`);
    assert.ok(staatInBron(bron, pagina.description, "description"), `omschrijving niet (meer) in ${pagina.bron}`);
    assert.notEqual(pagina.description, SEO_PAGINAS.home.description, "omschrijving is die van de homepage");
    assert.match(pagina.content, /<h1>/);
  });

  test(`${route}: route en vercel-rewrite bestaan`, () => {
    assert.ok(app.includes(`path="/${route}"`), `geen Route voor /${route}`);
    assert.ok(vercel.rewrites.some((r) => r.source === `/${route}` && r.destination === `/${route}/index.html`));
  });
}
