// Tests voor de tellingen die op het scherm komen.
//
// Het gaat hier niet om rekenen maar om overeenstemming: de voortgangsbalk, het
// profielscherm, de volgende stap en Mijn gegevens moeten hetzelfde zeggen, en
// wat ze zeggen moet kloppen met wat er werkelijk bij je collega's terechtkomt.

import test from "node:test";
import assert from "node:assert/strict";

import { bruikbareKenmerken, gedeeldeKenmerken, telKenmerken, sleutelVan } from "../src/lib/app/telling.js";
import { KENMERK_IDS, deelzin } from "../src/data/app/kenmerken.js";
import { bepaalVoortgang } from "../src/lib/app/voortgang.js";

const TEAM = { orgId: "org1", teamId: "teamA", teamNaam: "Directie" };
const SLEUTEL = "org1/teamA";

const k = (kenmerkId, extra = {}) => ({
  kenmerkId,
  waarde: "snel",
  ...extra,
});

// Elk kenmerk krijgt een geldige waarde, anders is er geen deelzin.
const geldig = (kenmerkId, extra = {}) => {
  const waarden = { tempo: "snel", context: "kort", structuur: "ruimte", denken: "alleen" };
  return { kenmerkId, waarde: waarden[kenmerkId] || "snel", ...extra };
};

test("een kenmerk zonder waarde telt niet mee", () => {
  assert.equal(bruikbareKenmerken([{ kenmerkId: "tempo", waarde: "" }]).length, 0);
});

test("een weggestreept kenmerk telt niet mee", () => {
  assert.equal(bruikbareKenmerken([geldig("tempo", { bevestigd: "nee" })]).length, 0);
});

test("een kenmerk dat niet meer bestaat, telt nergens mee", () => {
  // Dit is het geval waar de vier tellingen uiteen zouden lopen: de balk kijkt
  // naar de twaalf vaste kenmerken, de rest naar alles wat er is opgeslagen.
  const lijst = [geldig("tempo"), { kenmerkId: "oud-kenmerk", waarde: "iets" }];
  assert.deepEqual(bruikbareKenmerken(lijst).map((x) => x.kenmerkId), ["tempo"]);
});

test("een waarde die niet bij het kenmerk hoort, telt niet mee", () => {
  // Zonder leesbare zin valt er niets te delen, dus hoort het ook nergens
  // meegeteld te worden.
  assert.equal(bruikbareKenmerken([{ kenmerkId: "tempo", waarde: "verzonnen" }]).length, 0);
});

test("delen telt alleen voor het team waarmee je deelt", () => {
  const lijst = [geldig("tempo", { gedeeldMet: [SLEUTEL] }), geldig("context", { gedeeldMet: ["org1/teamB"] })];
  assert.deepEqual(gedeeldeKenmerken(lijst, TEAM).map((x) => x.kenmerkId), ["tempo"]);
});

test("zonder team deel je met niemand", () => {
  const lijst = [geldig("tempo", { gedeeldMet: [SLEUTEL] })];
  assert.deepEqual(gedeeldeKenmerken(lijst, null), []);
  assert.equal(sleutelVan(null), null);
});

test("het totaal is het vaste aantal kenmerken, niet wat er toevallig in de opslag staat", () => {
  const lijst = [geldig("tempo"), { kenmerkId: "oud-kenmerk", waarde: "iets" }];
  const t = telKenmerken({ kenmerken: lijst, actiefTeam: TEAM });
  assert.equal(t.van, KENMERK_IDS.length);
  assert.equal(t.ingevuld, 1, "het oude kenmerk telt niet mee");
});

test("de voortgangsbalk en de telling zeggen hetzelfde", () => {
  const lijst = KENMERK_IDS.map((id, i) => ({
    kenmerkId: id,
    waarde: "snel",
    bevestigd: i < 5 ? "sterk" : null,
    gedeeldMet: i < 3 ? [SLEUTEL] : [],
  })).filter((x) => deelzin(x.kenmerkId, x.waarde));

  const t = telKenmerken({ kenmerken: lijst, actiefTeam: TEAM });
  const v = bepaalVoortgang({ kenmerken: lijst, actiefTeam: TEAM });

  assert.equal(t.ingevuld, v.ingevuld);
  assert.equal(t.nagelopen, v.nagelopen);
  assert.equal(t.aantalGedeeld, v.gedeeld);
  assert.equal(t.van, v.van);
});

test("een oud kenmerk laat de balk en het profielscherm niet uiteenlopen", () => {
  const lijst = [
    ...KENMERK_IDS.map((id) => ({ kenmerkId: id, waarde: "snel", gedeeldMet: [SLEUTEL] })).filter((x) =>
      deelzin(x.kenmerkId, x.waarde)
    ),
    { kenmerkId: "verdwenen-kenmerk", waarde: "iets", gedeeldMet: [SLEUTEL] },
  ];

  const t = telKenmerken({ kenmerken: lijst, actiefTeam: TEAM });
  const v = bepaalVoortgang({ kenmerken: lijst, actiefTeam: TEAM });

  assert.equal(t.aantalGedeeld, v.gedeeld, "hier zei het ene scherm 13 en het andere 12");
  assert.ok(t.aantalGedeeld <= t.van);
});

test("zonder gegevens komt er nul uit in plaats van een fout", () => {
  const t = telKenmerken();
  assert.equal(t.ingevuld, 0);
  assert.equal(t.aantalGedeeld, 0);
  assert.deepEqual(bruikbareKenmerken(), []);
  assert.deepEqual(bruikbareKenmerken(null), []);
  assert.deepEqual(gedeeldeKenmerken(null, TEAM), []);
});
