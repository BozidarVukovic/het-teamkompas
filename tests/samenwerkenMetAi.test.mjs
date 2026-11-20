// Aanbodpagina Samenwerken met AI: herkomst voor analytics en de telling van
// passende aanvragen in de beheeromgeving.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bepaalHerkomst, onthoudPad, vorigeInternePagina } from "../src/lib/herkomst.js";
import { AI_INTERESSE, aiAanvraagOverzicht, getCurrentPageInfo, CONTACT_INTEREST_FILTERS } from "../src/contactMetadata.js";

test("herkomst: direct, intern, zoekmachine, extern, LinkedIn", () => {
  assert.deepEqual(bepaalHerkomst("", "www.mijnteamkompas.nl"), { herkomst: "direct" });
  assert.deepEqual(bepaalHerkomst("https://www.mijnteamkompas.nl/?utm=x", "www.mijnteamkompas.nl"), { herkomst: "intern", vorige_pagina: "/" });
  assert.equal(bepaalHerkomst("https://www.google.nl/", "mijnteamkompas.nl").herkomst, "zoekmachine");
  assert.equal(bepaalHerkomst("https://www.linkedin.com/feed/", "mijnteamkompas.nl").herkomst, "linkedin");
  assert.equal(bepaalHerkomst("https://example.org/pad?naam=jan", "mijnteamkompas.nl").herkomst, "extern");
  assert.equal(bepaalHerkomst("geen url", "mijnteamkompas.nl").herkomst, "onbekend");
});

test("herkomst bevat nooit een querystring", () => {
  const uit = JSON.stringify(bepaalHerkomst("https://www.mijnteamkompas.nl/blog/x?email=a@b.nl", "www.mijnteamkompas.nl"));
  assert.ok(!uit.includes("email") && !uit.includes("?"));
});

test("passende aanvragen worden apart geteld, onbeoordeeld telt niet als passend", () => {
  const o = aiAanvraagOverzicht([
    { interesse: AI_INTERESSE, passend: true },
    { interesse: AI_INTERESSE, passend: false },
    { interesse: AI_INTERESSE },
    { interesse: AI_INTERESSE, passend: null },
    { interesse: "Teamdag", passend: true },
  ]);
  assert.deepEqual(o, { totaal: 5, ai: 4, passend: 1, nietPassend: 1, teBeoordelen: 2 });
});

test("de AI-pagina is herkenbaar als bron en als filter", () => {
  assert.equal(getCurrentPageInfo("/samenwerken-met-ai"), "Samenwerken met AI pagina");
  assert.ok(CONTACT_INTEREST_FILTERS.some((f) => f.value === AI_INTERESSE));
});

test("herkomst binnen de site: het vorige pad gaat voor de referrer", () => {
  onthoudPad("/");
  onthoudPad("/samenwerken-met-ai");
  assert.equal(vorigeInternePagina(), "/");
  assert.deepEqual(bepaalHerkomst("", "mijnteamkompas.nl", vorigeInternePagina()), { herkomst: "intern", vorige_pagina: "/" });
});
