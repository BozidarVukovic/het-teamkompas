// Onderdelen die een team aan of uit kan zetten.
//
// Eén vraag loopt door al deze tests heen: bij twijfel, staat het uit? Het
// alternatief is dat een team ineens iets ziet waar het niet om heeft
// gevraagd, en dat is precies waarom deze schakelaar bestaat.

import test from "node:test";
import assert from "node:assert/strict";

import {
  ONDERDEEL_IDS,
  ONDERDELEN,
  aanstaand,
  gevolgLabel,
  isAan,
  onderdeel,
  schoneInstellingen,
  standLabel,
} from "../src/lib/app/onderdelen.js";

/* ------------------------------------------------------------ de catalogus */

test("elk onderdeel heeft een naam, een korte regel en een plek", () => {
  assert.ok(ONDERDELEN.length > 0);
  ONDERDELEN.forEach((o) => {
    assert.ok(/^[a-z][a-z-]*$/.test(o.id), `${o.id}: de id hoort kleine letters te zijn`);
    assert.ok(o.naam && o.naam.length <= 60, `${o.id}: geen bruikbare naam`);
    assert.ok(o.kort && o.kort.length <= 160, `${o.id}: geen korte regel`);
    assert.ok(o.uitleg && o.uitleg.length > o.kort.length, `${o.id}: de uitleg zegt niet meer dan de korte regel`);
    assert.ok(o.staatBij, `${o.id}: er staat niet bij waar het te vinden is`);
  });
});

test("een onderdeel is op te zoeken, en onzin levert niets op", () => {
  assert.equal(onderdeel("kwartaaldoelen").naam, "Kwartaaldoelen en keuzes");
  assert.equal(onderdeel("bestaat-niet"), null);
  assert.equal(onderdeel(""), null);
});

/* ------------------------------------------------------- bij twijfel: uit */

test("zonder instellingen staat alles uit", () => {
  ONDERDEEL_IDS.forEach((id) => {
    assert.equal(isAan(null, id), false, `${id}: zonder document hoort het uit te staan`);
    assert.equal(isAan({}, id), false, `${id}: zonder veld ook`);
    assert.equal(isAan(undefined, id), false);
  });
});

test("alleen een uitdrukkelijke true telt als aan", () => {
  // Een string "true", een 1 of een lege string komen uit de opslag of uit een
  // oudere versie van de app. Geen daarvan is een keuze die iemand maakte.
  [true].forEach((w) => assert.equal(isAan({ kwartaaldoelen: w }, "kwartaaldoelen"), true));
  ["true", 1, "ja", {}, [], 0, false, null, undefined].forEach((w) => {
    assert.equal(isAan({ kwartaaldoelen: w }, "kwartaaldoelen"), false, `${JSON.stringify(w)} hoort niet als aan te tellen`);
  });
});

test("een onbekend onderdeel staat altijd uit", () => {
  assert.equal(isAan({ verzonnen: true }, "verzonnen"), false);
});

test("aanstaand geeft de onderdelen die echt aanstaan", () => {
  assert.deepEqual(aanstaand({}).map((o) => o.id), []);
  assert.deepEqual(aanstaand({ kwartaaldoelen: true }).map((o) => o.id), ["kwartaaldoelen"]);
});

/* ------------------------------------------------------------ het opslaan */

test("wat de opslag in gaat bevat alleen bekende onderdelen", () => {
  const uit = schoneInstellingen({ kwartaaldoelen: true, verzonnen: true, doorUid: "ada" });
  assert.equal(uit.kwartaaldoelen, true);
  assert.equal(uit.verzonnen, undefined, "een onbekende sleutel hoort hier te verdwijnen");
  assert.equal(uit.doorUid, undefined, "de schrijver komt er los bij, niet via dit object");
  assert.equal(uit.versie, 1);
});

test("elk bekend onderdeel krijgt een waarde, ook als het ontbrak", () => {
  // Anders blijft een onderdeel dat later aan de lijst is toegevoegd
  // ongedefinieerd, en dat leest op het scherm als "onbekend" in plaats van
  // als "uit".
  const uit = schoneInstellingen({});
  ONDERDEEL_IDS.forEach((id) => assert.equal(uit[id], false, `${id}: hoort expliciet uit te staan`));
});

test("rommel in, geldige stand uit", () => {
  const uit = schoneInstellingen({ kwartaaldoelen: "ja" });
  assert.equal(uit.kwartaaldoelen, false, "alles wat geen true is, is uit");
});

/* -------------------------------------------------------- wat erbij staat */

test("de stand staat er ook in woorden", () => {
  // Betekenis mag niet alleen van een positie of een kleur afhangen.
  assert.equal(standLabel(true), "Staat aan voor het team");
  assert.equal(standLabel(false), "Staat uit");
});

test("vóór de klik staat er wat de klik doet", () => {
  const aanzetten = gevolgLabel("kwartaaldoelen", true);
  assert.match(aanzetten, /Iedereen in dit team/);
  assert.match(aanzetten, /Ik → Mijn kwartaaldoelen/);

  const uitzetten = gevolgLabel("kwartaaldoelen", false);
  assert.match(uitzetten, /blijft bewaard/, "uitzetten gooit niets weg, en dat hoort er te staan");
  assert.doesNotMatch(uitzetten, /verwijder|wis|weggegooid/i);
});

test("een onbekend onderdeel heeft geen gevolgtekst", () => {
  assert.equal(gevolgLabel("verzonnen", true), "");
});
