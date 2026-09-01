// Tests voor de lijst met mensen over wie je advies kunt vragen.
//
// Deze lijst staat op twee schermen. Liep hij uiteen, dan zag je op het
// startscherm iemand staan die bij "Samenwerken met..." ontbrak.

import test from "node:test";
import assert from "node:assert/strict";

import { collegasVan, collegaInEenZin } from "../src/lib/app/collegas.js";

const LEDEN = [
  { uid: "u1", naam: "Bozidar", rol: "beheerder" },
  { uid: "u2", naam: "Nikki" },
  { uid: "u3", naam: "Aad" },
];

const GEDEELD = {
  u2: { kenmerken: [{ kenmerkId: "tempo" }, { kenmerkId: "contact" }] },
};

const PROFIELEN = [{ id: "p1", naam: "Eva", kenmerken: [{ kenmerkId: "tempo" }], toegevoegdDoorNaam: "Bozidar" }];

test("jezelf sta je niet tussen", () => {
  const lijst = collegasVan({ leden: LEDEN, eigenUid: "u1" });
  assert.deepEqual(lijst.map((c) => c.naam), ["Aad", "Nikki"]);
});

test("toegevoegde profielen staan gewoon in dezelfde lijst", () => {
  const lijst = collegasVan({ leden: LEDEN, profielleden: PROFIELEN, eigenUid: "u1" });
  assert.deepEqual(lijst.map((c) => c.naam), ["Aad", "Eva", "Nikki"]);
});

test("de lijst staat op alfabet, zodat hij niet van volgorde wisselt", () => {
  const omgedraaid = collegasVan({ leden: [...LEDEN].reverse(), profielleden: PROFIELEN, eigenUid: "u1" });
  const normaal = collegasVan({ leden: LEDEN, profielleden: PROFIELEN, eigenUid: "u1" });
  assert.deepEqual(omgedraaid.map((c) => c.sleutel), normaal.map((c) => c.sleutel));
});

test("wat iemand deelde komt uit de gedeelde kopie, niet uit het profiel zelf", () => {
  const lijst = collegasVan({ leden: LEDEN, gedeeld: GEDEELD, eigenUid: "u1" });
  const nikki = lijst.find((c) => c.naam === "Nikki");
  const aad = lijst.find((c) => c.naam === "Aad");
  assert.equal(nikki.punten, 2);
  assert.equal(aad.punten, 0);
});

test("een toegevoegd profiel is als zodanig herkenbaar", () => {
  const eva = collegasVan({ profielleden: PROFIELEN }).find((c) => c.naam === "Eva");
  assert.equal(eva.doorBeheerder, true);
  assert.equal(eva.sleutel, "p1");
});

test("de regel onder een naam zegt waar het vandaan komt", () => {
  const lijst = collegasVan({ leden: LEDEN, gedeeld: GEDEELD, profielleden: PROFIELEN, eigenUid: "u1" });
  const zin = (n) => collegaInEenZin(lijst.find((c) => c.naam === n));
  assert.equal(zin("Nikki"), "2 punten gedeeld");
  assert.equal(zin("Aad"), "Heeft nog niets gedeeld");
  assert.equal(zin("Eva"), "1 punt · toegevoegd door Bozidar");
});

test("een ingevulde functie staat vooraan", () => {
  assert.equal(
    collegaInEenZin({ functie: "Teamleider", punten: 3 }),
    "Teamleider · 3 punten gedeeld"
  );
  assert.equal(
    collegaInEenZin({ functie: "Adviseur", punten: 0 }),
    "Adviseur · Heeft nog niets gedeeld"
  );
});

test("zonder functie blijft de regel zoals hij was", () => {
  assert.equal(collegaInEenZin({ punten: 3 }), "3 punten gedeeld");
});

test("één punt is geen punten", () => {
  assert.equal(collegaInEenZin({ punten: 1 }), "1 punt gedeeld");
  assert.equal(collegaInEenZin({ punten: 2 }), "2 punten gedeeld");
});

test("zonder gegevens is de lijst leeg in plaats van kapot", () => {
  assert.deepEqual(collegasVan(), []);
  assert.deepEqual(collegasVan({ leden: null, profielleden: null }), []);
  assert.equal(collegaInEenZin(null), "");
});
