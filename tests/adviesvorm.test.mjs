// Het resultaatscherm van de samenwerkroute.
//
// Het advies begon met "Jullie samenwerking" -- dezelfde kop bij elke vraag en
// elke collega -- en zette daarna alles open onder elkaar. Deze tests gaan over
// de drie stukken die nu bovenaan staan en over de kop die wél iets zegt.

import test from "node:test";
import assert from "node:assert/strict";

import { steltAdviesSamen } from "../src/lib/app/advies/regels.js";
import { SITUATIES, situatie, titelVan } from "../src/data/app/situaties.js";

const zelf = (kenmerkId, waarde) => ({ kenmerkId, waarde, bron: "user_confirmation" });

const adviesVoor = (situatieId, hun = [zelf("tempo", "bedachtzaam"), zelf("context", "veel")]) =>
  steltAdviesSamen({
    mijnKenmerken: [zelf("tempo", "snel")],
    hunKenmerken: hun,
    situatieId,
    naamAnder: "Anouk",
  });

/* ------------------------------------------------------------ de kop */

test("elke situatie heeft een kop die zegt wat je gaat doen en met wie", () => {
  SITUATIES.forEach((s) => {
    assert.ok(s.titel, `${s.id}: geen titel`);
    assert.ok(s.titel.includes("{naam}"), `${s.id}: de naam komt er niet in voor`);
  });
});

test("de kop zet de naam van de collega op de plek van de haakjes", () => {
  assert.equal(titelVan(situatie("feedback-geven"), "Anouk"), "Feedback geven aan Anouk");
  assert.equal(titelVan(situatie("benaderen"), "Dennis"), "Hoe je Dennis het beste benadert");
});

test("zonder situatie blijft er een bruikbare kop staan", () => {
  assert.equal(titelVan(null, "Anouk"), "Samenwerken");
});

test("geen enkele kop is de oude vaste kop", () => {
  SITUATIES.forEach((s) => {
    assert.notEqual(titelVan(s, "Anouk"), "Jullie samenwerking");
  });
});

/* -------------------------------------------- de drie stukken bovenaan */

test("het advies levert een kern, een openingszin en één aandachtspunt los aan", () => {
  const a = adviesVoor("feedback-geven");
  assert.ok(a.kernboodschap, "er hoort een kernboodschap te zijn");
  assert.equal(typeof a.kernboodschap, "string", "de kern is één zin, geen lijst");
  assert.ok(a.openingszin, "er hoort een zin te zijn om mee te beginnen");
  assert.equal(a.aandachtspunt, a.letOp[0] || null, "het aandachtspunt is het eerste punt");
});

test("de kern is de eerste samenvattende zin en staat daarmee niet dubbel", () => {
  const a = adviesVoor("feedback-geven");
  assert.equal(a.kernboodschap, a.samenvatting[0]);
});

test("de openingszin komt uit het eerste blok, niet uit het niets", () => {
  const a = adviesVoor("feedback-geven");
  assert.equal(a.openingszin, a.blokken[0].voorbeeldzin);
});

test("zonder gedeelde informatie blijft het advies eerlijk leeg", () => {
  const a = adviesVoor("feedback-geven", []);
  assert.equal(a.blokken.length, 0);
  assert.equal(a.openingszin, null, "zonder blokken is er geen zin om over te nemen");
  assert.equal(a.aandachtspunt, null);
  assert.ok(a.kernboodschap, "de kern komt van de situatie en blijft staan");
  assert.ok(a.opmerkingen.length > 0, "en er hoort te staan waaróm er weinig staat");
});

test("elke situatie levert een advies met dezelfde onderdelen op", () => {
  SITUATIES.filter((s) => s.voorGroep !== "alleen").forEach((s) => {
    const a = adviesVoor(s.id);
    assert.ok(a.kernboodschap, `${s.id}: geen kern`);
    assert.equal(a.soort, "persoon");
    assert.ok(Array.isArray(a.blokken), `${s.id}: geen blokken`);
  });
});
