// Tests voor het percentage dat aangeeft hoe compleet een profiel is.
//
// Dit getal staat op twee schermen en stuurt aan wat iemand als volgende doet.
// Klopt het niet, dan wijst het de verkeerde kant op of geeft het een vals
// gevoel van klaar zijn.

import test from "node:test";
import assert from "node:assert/strict";

import { bepaalVoortgang, voortgangInEenZin, STAPPEN_PER_KENMERK } from "../src/lib/app/voortgang.js";
import { KENMERK_IDS } from "../src/data/app/kenmerken.js";
import { SECTIES } from "../src/data/app/handleiding.js";

const TEAM = { orgId: "org1", teamId: "teamA", teamNaam: "Thuis" };
const SLEUTEL = "org1/teamA";

const maak = ({ aantal = KENMERK_IDS.length, bevestigd = null, gedeeld = false } = {}) =>
  KENMERK_IDS.slice(0, aantal).map((id) => ({
    kenmerkId: id,
    waarde: "snel",
    bevestigd,
    gedeeldMet: gedeeld ? [SLEUTEL] : [],
  }));

test("een leeg profiel staat op nul", () => {
  const v = bepaalVoortgang({ kenmerken: [], actiefTeam: TEAM });
  assert.equal(v.percentage, 0);
  assert.equal(v.compleet, false);
  assert.equal(v.volgende.id, "ingevuld");
});

test("alleen invullen brengt je op een derde", () => {
  const v = bepaalVoortgang({ kenmerken: maak(), actiefTeam: TEAM });
  assert.equal(v.ingevuld, KENMERK_IDS.length);
  assert.equal(v.nagelopen, 0);
  assert.equal(v.percentage, 33);
  assert.equal(v.volgende.id, "nagelopen");
});

test("invullen en nalopen brengt je op twee derde", () => {
  const v = bepaalVoortgang({ kenmerken: maak({ bevestigd: "sterk" }), actiefTeam: TEAM });
  assert.equal(v.percentage, 67);
  assert.equal(v.volgende.id, "gedeeld");
});

test("alles ingevuld, nagelopen en gedeeld is honderd procent", () => {
  const v = bepaalVoortgang({
    kenmerken: maak({ bevestigd: "sterk", gedeeld: true }),
    actiefTeam: TEAM,
  });
  assert.equal(v.percentage, 100);
  assert.equal(v.compleet, true);
  assert.equal(v.volgende, null);
});

test("\"soms\" telt net zo goed als nagelopen — je hebt ernaar gekeken", () => {
  const v = bepaalVoortgang({ kenmerken: maak({ bevestigd: "soms" }), actiefTeam: TEAM });
  assert.equal(v.nagelopen, KENMERK_IDS.length);
});

test("een weggestreept kenmerk telt nergens mee", () => {
  const v = bepaalVoortgang({
    kenmerken: maak({ bevestigd: "nee", gedeeld: true }),
    actiefTeam: TEAM,
  });
  assert.equal(v.ingevuld, 0);
  assert.equal(v.gedeeld, 0);
  assert.equal(v.percentage, 0);
});

test("delen met een ander team telt niet mee voor dit team", () => {
  const kenmerken = maak().map((k) => ({ ...k, gedeeldMet: ["org1/teamB"] }));
  const v = bepaalVoortgang({ kenmerken, actiefTeam: TEAM });
  assert.equal(v.gedeeld, 0);
});

test("zonder team kun je niet delen en blijft twee derde het maximum", () => {
  const v = bepaalVoortgang({ kenmerken: maak({ bevestigd: "sterk", gedeeld: true }) });
  assert.equal(v.gedeeld, 0);
  assert.equal(v.percentage, 67);
});

test("de helft ingevuld geeft de helft van een derde", () => {
  const v = bepaalVoortgang({ kenmerken: maak({ aantal: 6 }), actiefTeam: TEAM });
  assert.equal(v.ingevuld, 6);
  assert.equal(v.percentage, 17);
});

test("onbekende kenmerken tellen niet mee", () => {
  const v = bepaalVoortgang({
    kenmerken: [{ kenmerkId: "bestaat-niet", waarde: "iets", bevestigd: "sterk" }],
    actiefTeam: TEAM,
  });
  assert.equal(v.percentage, 0);
});

test("het totaal klopt met het aantal kenmerken maal de drie stappen", () => {
  const v = bepaalVoortgang({ kenmerken: [], actiefTeam: TEAM });
  assert.equal(v.totaal, KENMERK_IDS.length * STAPPEN_PER_KENMERK);
  assert.equal(v.onderdelen.length, STAPPEN_PER_KENMERK);
  v.onderdelen.forEach((o) => {
    assert.equal(o.van, KENMERK_IDS.length);
    assert.ok(o.uitleg && o.knop && o.naar, `${o.id} is niet compleet`);
  });
});

test("de handleiding telt niet mee in het percentage, maar wordt wel geteld", () => {
  const handleiding = { [SECTIES[0].id]: { tekst: "iets" } };
  const met = bepaalVoortgang({ kenmerken: maak(), actiefTeam: TEAM, handleiding });
  const zonder = bepaalVoortgang({ kenmerken: maak(), actiefTeam: TEAM });
  assert.equal(met.percentage, zonder.percentage);
  assert.equal(met.handleidingSecties, 1);
  assert.equal(met.handleidingVan, SECTIES.length);
});

test("de zin erbij past bij waar je staat", () => {
  assert.match(voortgangInEenZin(bepaalVoortgang({ kenmerken: [], actiefTeam: TEAM })), /leeg/);
  assert.match(
    voortgangInEenZin(bepaalVoortgang({ kenmerken: maak({ aantal: 5 }), actiefTeam: TEAM })),
    /5 van de 12/
  );
  assert.match(
    voortgangInEenZin(bepaalVoortgang({ kenmerken: maak({ bevestigd: "sterk", gedeeld: true }), actiefTeam: TEAM })),
    /compleet/
  );
});
