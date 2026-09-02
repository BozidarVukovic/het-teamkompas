// Tests voor wat er precies bij je teamgenoten terechtkomt.
//
// Dit is de privacybelofte van de app: je teamgenoten zien alleen wat je zelf
// hebt gedeeld, altijd als leesbare zin, en per team apart. Die belofte werd
// uitgevoerd in dezelfde functie die ook naar de database schreef, waardoor er
// geen enkele test op stond — op het enige wat er echt toe doet.

import test from "node:test";
import assert from "node:assert/strict";

import { sectiesAlsLijst, stelGedeeldeKopieSamen } from "../src/lib/app/gedeeldeKopie.js";
import { KENMERKEN, deelzin } from "../src/data/app/kenmerken.js";
import { SECTIES } from "../src/data/app/handleiding.js";

const HIER = "org1/teamA";
const ELDERS = "org1/teamB";

const eersteWaarde = (id) => KENMERKEN.find((k) => k.id === id).opties[0].id;

const kenmerk = (id, over = {}) => ({
  kenmerkId: id,
  waarde: eersteWaarde(id),
  gedeeldMet: [HIER],
  ...over,
});

const sectie = (id, over = {}) => ({
  sectieId: id,
  tekst: "Iets wat ik over mezelf heb opgeschreven.",
  gedeeldMet: [HIER],
  ...over,
});

const maak = (over = {}) =>
  stelGedeeldeKopieSamen({ naam: "Nikki", sleutel: HIER, kenmerken: [], handleiding: {}, ...over });

/* ------------------------------------------------- wat er wél in mag */

test("wat je aanvinkt komt erin, als leesbare zin", () => {
  const kopie = maak({ kenmerken: [kenmerk("tempo")] });
  assert.equal(kopie.kenmerken.length, 1);
  assert.equal(kopie.kenmerken[0].zin, deelzin("tempo", eersteWaarde("tempo")));
  assert.ok(kopie.kenmerken[0].zin.length > 0);
});

test("een gedeelde handleidingsectie komt erin met zijn titel", () => {
  const kopie = maak({ handleiding: { [SECTIES[0].id]: sectie(SECTIES[0].id) } });
  assert.equal(kopie.handleiding.length, 1);
  assert.equal(kopie.handleiding[0].titel, SECTIES[0].titel);
});

test("de secties staan in de volgorde van de app, niet van het invullen", () => {
  const handleiding = {};
  [...SECTIES].reverse().forEach((s) => {
    handleiding[s.id] = sectie(s.id);
  });
  const kopie = maak({ handleiding });
  assert.deepEqual(
    kopie.handleiding.map((s) => s.sectieId),
    SECTIES.map((s) => s.id)
  );
});

/* ------------------------------------------------ wat er niet in mag */

test("wat je niet hebt aangevinkt komt er niet in", () => {
  const kopie = maak({ kenmerken: [kenmerk("tempo", { gedeeldMet: [] })] });
  assert.equal(kopie, null, "zonder iets gedeelds hoort er geen kopie te zijn");
});

test("wat je met een ánder team deelt, komt hier niet in", () => {
  const kopie = maak({
    kenmerken: [kenmerk("tempo", { gedeeldMet: [ELDERS] }), kenmerk("contact")],
    handleiding: { [SECTIES[0].id]: sectie(SECTIES[0].id, { gedeeldMet: [ELDERS] }) },
  });
  assert.deepEqual(kopie.kenmerken.map((k) => k.kenmerkId), ["contact"]);
  assert.deepEqual(kopie.handleiding, []);
});

test("een weggestreept kenmerk komt er niet in, ook niet als het aangevinkt staat", () => {
  const kopie = maak({ kenmerken: [kenmerk("tempo", { bevestigd: "nee" })] });
  assert.equal(kopie, null);
});

test("een kenmerk zonder waarde komt er niet in", () => {
  assert.equal(maak({ kenmerken: [kenmerk("tempo", { waarde: "" })] }), null);
});

test("een waarde die niet bij het kenmerk hoort, komt er niet in", () => {
  // Zonder leesbare zin valt er niets te delen; een ruwe waarde hoort nooit in
  // de kopie terecht te komen.
  assert.equal(maak({ kenmerken: [kenmerk("tempo", { waarde: "verzonnen" })] }), null);
});

test("een kenmerk dat niet meer bestaat, komt er niet in", () => {
  assert.equal(maak({ kenmerken: [{ kenmerkId: "oud", waarde: "iets", gedeeldMet: [HIER] }] }), null);
});

test("een lege handleidingsectie komt er niet in", () => {
  assert.equal(maak({ handleiding: { [SECTIES[0].id]: sectie(SECTIES[0].id, { tekst: "" }) } }), null);
});

test("de kopie bevat geen bron en geen bevestiging", () => {
  const kopie = maak({
    kenmerken: [kenmerk("tempo", { bron: "insights_discovery", bevestigd: "sterk", laatstBevestigdOp: "2026-01-01" })],
  });
  assert.deepEqual(Object.keys(kopie.kenmerken[0]).sort(), ["kenmerkId", "waarde", "zin"]);
  assert.deepEqual(Object.keys(kopie).sort(), ["handleiding", "kenmerken", "naam"]);
});

test("er komt niets in de kopie dat niet gedeeld is", () => {
  const kopie = maak({
    kenmerken: [
      kenmerk("tempo"),
      kenmerk("contact", { gedeeldMet: [] }),
      kenmerk("feedback", { gedeeldMet: [ELDERS] }),
    ],
  });
  assert.deepEqual(kopie.kenmerken.map((k) => k.kenmerkId), ["tempo"]);
});

/* ----------------------------------------------------- geen kopie */

test("niets gedeeld betekent geen kopie, niet een lege kopie", () => {
  // Dit is het verschil tussen "ik deel niets" en "er staat een leeg document
  // op mijn naam bij dit team".
  assert.equal(maak(), null);
  assert.equal(maak({ kenmerken: [], handleiding: {} }), null);
});

test("zonder team is er geen kopie", () => {
  assert.equal(stelGedeeldeKopieSamen({ sleutel: null, kenmerken: [kenmerk("tempo")] }), null);
  assert.equal(stelGedeeldeKopieSamen(), null);
});

test("alleen een handleidingsectie is genoeg voor een kopie", () => {
  const kopie = maak({ handleiding: { [SECTIES[0].id]: sectie(SECTIES[0].id) } });
  assert.ok(kopie);
  assert.deepEqual(kopie.kenmerken, []);
});

/* ------------------------------ eigen woorden bij een toegevoegd profiel */

// Bij een profiel dat een beheerder toevoegde is er geen eigenaar die per
// sectie een vinkje zet. Wat de beheerder erin zet, ziet het team. De vorm moet
// wel dezelfde zijn als bij een echte teamgenoot, anders moet de advieslogica
// onderscheid gaan maken tussen de twee.
test("sectiesAlsLijst geeft dezelfde vorm als een gedeelde kopie", () => {
  const lijst = sectiesAlsLijst({ "hoe-ik-werk": "Ik werk het liefst met een duidelijk doel." });
  assert.equal(lijst.length, 1);
  assert.deepEqual(Object.keys(lijst[0]).sort(), ["sectieId", "tekst", "titel"]);
  assert.equal(lijst[0].sectieId, "hoe-ik-werk");
  assert.equal(lijst[0].titel, SECTIES.find((s) => s.id === "hoe-ik-werk").titel);
});

test("sectiesAlsLijst houdt de volgorde van de app aan, niet van het object", () => {
  const laatste = SECTIES[SECTIES.length - 1].id;
  const eerste = SECTIES[0].id;
  const lijst = sectiesAlsLijst({ [laatste]: "Laatste.", [eerste]: "Eerste." });
  assert.deepEqual(lijst.map((s) => s.sectieId), [eerste, laatste]);
});

test("sectiesAlsLijst laat lege en onbekende stukjes weg", () => {
  const lijst = sectiesAlsLijst({
    [SECTIES[0].id]: "   ",
    "bestaat-niet": "Dit hoort er niet in.",
  });
  assert.deepEqual(lijst, []);
  assert.deepEqual(sectiesAlsLijst(), []);
});
