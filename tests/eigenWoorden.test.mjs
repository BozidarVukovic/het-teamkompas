// Tests voor het citeren van wat een collega zelf schreef.
//
// De app belooft dat een hand-in-handleiding het advies persoonlijker maakt.
// Dat was niet waar: de bron "hand_in_handleiding" werd nergens weggeschreven,
// dus tien secties schrijven veranderde geen letter aan het advies. Nu komt de
// gedeelde sectie die over hetzelfde onderwerp gaat er letterlijk bij te staan.
//
// Letterlijk is hier het punt. Het zijn iemands eigen woorden; die vatten we
// niet samen, kappen we niet af en herschrijven we niet.

import test from "node:test";
import assert from "node:assert/strict";

import { eigenWoordenBij, steltAdviesSamen, MAX_EIGEN_WOORDEN } from "../src/lib/app/advies/regels.js";
import { SECTIES } from "../src/data/app/handleiding.js";

const TEKST_SPANNING = "Ik word stiller. Dat betekent niet dat ik afhaak; vraag mij gerust wat ik denk.";
const TEKST_FEEDBACK = "Zeg het gerust meteen, liefst met een voorbeeld erbij.";
const TEKST_WERK = "Ik werk het prettigst als ik weet waar we naartoe gaan.";

const HANDLEIDING = [
  { sectieId: "spanning", titel: "Wat er bij mij gebeurt onder spanning", tekst: TEKST_SPANNING },
  { sectieId: "feedback", titel: "Hoe ik feedback het liefst krijg", tekst: TEKST_FEEDBACK },
  { sectieId: "hoe-ik-werk", titel: "Hoe ik het liefst werk", tekst: TEKST_WERK },
];

test("de sectie die over hetzelfde onderwerp gaat, komt erbij", () => {
  const uit = eigenWoordenBij(["spanning"], HANDLEIDING);
  assert.equal(uit.length, 1);
  assert.equal(uit[0].tekst, TEKST_SPANNING);
});

test("de tekst wordt letterlijk overgenomen", () => {
  const uit = eigenWoordenBij(["feedback"], HANDLEIDING);
  assert.equal(uit[0].tekst, TEKST_FEEDBACK, "iemands eigen woorden vat je niet samen");
});

test("de volgorde volgt het advies, niet de handleiding", () => {
  const uit = eigenWoordenBij(["feedback", "spanning"], HANDLEIDING);
  assert.deepEqual(uit.map((w) => w.sectieId), ["feedback", "spanning"]);
});

test("één sectie komt niet twee keer terug", () => {
  // "Hoe ik het liefst werk" hoort bij tempo, structuur én context.
  const uit = eigenWoordenBij(["tempo", "structuur", "context"], HANDLEIDING);
  assert.deepEqual(uit.map((w) => w.sectieId), ["hoe-ik-werk"]);
});

test("er komen er hoogstens twee, want dit is geen bloemlezing", () => {
  const uit = eigenWoordenBij(["spanning", "feedback", "tempo"], HANDLEIDING);
  assert.equal(uit.length, MAX_EIGEN_WOORDEN);
});

test("gaat het advies over iets anders, dan komt er niets", () => {
  assert.deepEqual(eigenWoordenBij(["besluitvorming"], HANDLEIDING), []);
});

test("een lege sectie is geen citaat", () => {
  const uit = eigenWoordenBij(["spanning"], [{ sectieId: "spanning", titel: "X", tekst: "" }]);
  assert.deepEqual(uit, []);
});

test("zonder gedeelde handleiding gebeurt er niets in plaats van een fout", () => {
  assert.deepEqual(eigenWoordenBij(["spanning"]), []);
  assert.deepEqual(eigenWoordenBij(["spanning"], null), []);
  assert.deepEqual(eigenWoordenBij(), []);
});

test("een onbekende sectie-id komt de uitkomst niet in", () => {
  const uit = eigenWoordenBij(["spanning"], [{ sectieId: "verzonnen", titel: "X", tekst: "Y" }]);
  assert.deepEqual(uit, []);
});

test("elke sectie hoort bij minstens één kenmerk, anders kan hij nooit worden geciteerd", () => {
  SECTIES.forEach((s) => {
    assert.ok(
      Array.isArray(s.kenmerken) && s.kenmerken.length > 0,
      `${s.id} hoort bij geen enkel kenmerk en zou dus nooit in een advies verschijnen`
    );
  });
});

/* ------------------------------------------------------- in het hele advies */

const k = (kenmerkId, waarde) => ({ kenmerkId, waarde, bron: "user_confirmation" });

test("het advies bevat wat de collega er zelf over schreef", () => {
  const advies = steltAdviesSamen({
    mijnKenmerken: [k("spanning", "sneller")],
    hunKenmerken: [k("spanning", "stiller")],
    hunHandleiding: HANDLEIDING,
    situatieId: "irritatie",
    naamAnder: "Nikki",
  });

  assert.ok(advies.eigenWoorden.length > 0, "hier hoort een citaat te staan");
  assert.ok(advies.eigenWoorden.some((w) => w.tekst === TEKST_SPANNING));
});

test("zonder handleiding werkt het advies precies zoals het altijd deed", () => {
  const zonder = steltAdviesSamen({
    mijnKenmerken: [k("spanning", "sneller")],
    hunKenmerken: [k("spanning", "stiller")],
    situatieId: "irritatie",
    naamAnder: "Nikki",
  });
  const met = steltAdviesSamen({
    mijnKenmerken: [k("spanning", "sneller")],
    hunKenmerken: [k("spanning", "stiller")],
    hunHandleiding: HANDLEIDING,
    situatieId: "irritatie",
    naamAnder: "Nikki",
  });

  assert.deepEqual(zonder.eigenWoorden, []);
  // De handleiding komt erbij; hij verandert het advies zelf niet.
  assert.deepEqual(met.helpt, zonder.helpt);
  assert.deepEqual(met.letOp, zonder.letOp);
  assert.equal(met.actie, zonder.actie);
});

test("er wordt alleen geciteerd over onderwerpen die in het advies staan", () => {
  const advies = steltAdviesSamen({
    mijnKenmerken: [k("spanning", "sneller")],
    hunKenmerken: [k("spanning", "stiller")],
    hunHandleiding: HANDLEIDING,
    situatieId: "irritatie",
    naamAnder: "Nikki",
  });

  const onderwerpen = new Set(advies.blokken.map((b) => b.kenmerkId));
  advies.eigenWoorden.forEach((w) => {
    const hoort = SECTIES.find((s) => s.id === w.sectieId).kenmerken;
    assert.ok(
      hoort.some((kenmerkId) => onderwerpen.has(kenmerkId)),
      `${w.sectieId} gaat over iets waar dit advies niet over gaat`
    );
  });
});
