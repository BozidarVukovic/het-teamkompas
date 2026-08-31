// Tests voor de navigatie.
//
// Het probleem dat deze navigatie oplost is een telefoonprobleem: zes
// onderdelen pasten niet naast elkaar, dus schoven ze opzij en bestond de helft
// niet meer. Deze tests bewaken beide kanten daarvan — dat het er niet stiekem
// weer meer worden, en dat elk scherm van de app onder een van de vier valt.

import test from "node:test";
import assert from "node:assert/strict";

import { ONDERDELEN, MAX_ONDERDELEN, isActief, actiefOnderdeel } from "../src/lib/app/navigatie.js";

// Elk scherm waar je vanuit de app kunt komen. Groeit deze lijst, dan moet er
// een onderdeel zijn dat hem opvangt.
const SCHERMEN = [
  "/app",
  "/app/samenwerken",
  "/app/team",
  "/app/ik",
  "/app/profiel",
  "/app/handleiding",
  "/app/gegevens",
];

test("er passen er vier op een telefoon, dus zijn het er niet meer", () => {
  assert.ok(ONDERDELEN.length <= MAX_ONDERDELEN, `${ONDERDELEN.length} onderdelen is er te veel`);
});

test("elk onderdeel heeft een pad, een label en een icoon-id", () => {
  ONDERDELEN.forEach((o) => {
    assert.ok(o.id, "onderdeel zonder id");
    assert.ok(o.pad.startsWith("/app"), `${o.id} wijst buiten de app`);
    assert.ok(o.label && o.label.length <= 14, `${o.id} heeft een label dat niet past`);
  });
});

test("de labels en paden zijn uniek", () => {
  assert.equal(new Set(ONDERDELEN.map((o) => o.id)).size, ONDERDELEN.length);
  assert.equal(new Set(ONDERDELEN.map((o) => o.pad)).size, ONDERDELEN.length);
  assert.equal(new Set(ONDERDELEN.map((o) => o.label)).size, ONDERDELEN.length);
});

test("op elk scherm licht er precies één onderdeel op", () => {
  SCHERMEN.forEach((pad) => {
    const raak = ONDERDELEN.filter((o) => isActief(o, pad));
    assert.equal(raak.length, 1, `${pad} licht ${raak.length} onderdelen op`);
  });
});

test("wie bij zichzelf is, ziet Ik oplichten", () => {
  ["/app/ik", "/app/profiel", "/app/handleiding", "/app/gegevens"].forEach((pad) => {
    assert.equal(actiefOnderdeel(pad).id, "ik", pad);
  });
});

test("Start licht alleen op het startscherm op", () => {
  assert.equal(actiefOnderdeel("/app").id, "start");
  assert.equal(actiefOnderdeel("/app/").id, "start");
  assert.notEqual(actiefOnderdeel("/app/team").id, "start");
});

test("een onderliggend scherm laat het onderdeel oplichten", () => {
  assert.equal(actiefOnderdeel("/app/profiel?doen=gedeeld".split("?")[0]).id, "ik");
  assert.equal(actiefOnderdeel("/app/samenwerken/eva").id, "samenwerken");
});

test("een adres buiten de app licht nergens op", () => {
  assert.equal(actiefOnderdeel("/teamscan"), null);
  assert.equal(actiefOnderdeel("/app/onbekend"), null);
});
