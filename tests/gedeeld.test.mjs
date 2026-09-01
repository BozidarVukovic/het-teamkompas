// Tests voor wat je van een teamgenoot te zien krijgt.
//
// De twaalf punten en de handleiding overlappen: de handleiding wordt als
// concept uit het profiel opgebouwd. Op het teamscherm stond dezelfde zin
// daardoor twee keer, één keer los en één keer onder een kopje.

import test from "node:test";
import assert from "node:assert/strict";

import { gedeeldSamengevat } from "../src/lib/app/gedeeld.js";

const ZIN_SPANNING = "Als de spanning oploopt word ik directer. Dat is bij mij geen boosheid.";
const ZIN_ENERGIE = "Ik krijg energie van iets echt afronden.";
const ZIN_TEMPO = "Ik werk graag vlot naar een besluit toe.";

const GEDEELD = {
  kenmerken: [
    { kenmerkId: "spanning", zin: ZIN_SPANNING },
    { kenmerkId: "energie", zin: ZIN_ENERGIE },
    { kenmerkId: "tempo", zin: ZIN_TEMPO },
  ],
  handleiding: [
    // Precies dezelfde zin als bij de punten: voegt niets toe.
    { sectieId: "spanning", titel: "Wat er bij mij gebeurt onder spanning", tekst: ZIN_SPANNING },
    // Bevat een bekende zin plus iets eigens: blijft helemaal staan.
    {
      sectieId: "werk",
      titel: "Hoe ik het liefst werk",
      tekst: `${ZIN_TEMPO} Een korte aanleiding is voor mij meestal genoeg om te beginnen.`,
    },
    // Helemaal eigen tekst.
    { sectieId: "bereikt", titel: "Hoe je mij het beste bereikt", tekst: "Bel me gerust, ook ongepland." },
  ],
};

test("alle punten blijven staan", () => {
  const { zinnen } = gedeeldSamengevat(GEDEELD);
  assert.deepEqual(zinnen, [ZIN_SPANNING, ZIN_ENERGIE, ZIN_TEMPO]);
});

test("een stukje handleiding dat alleen bekende zinnen bevat, valt weg", () => {
  const { secties } = gedeeldSamengevat(GEDEELD);
  assert.equal(secties.find((s) => s.sectieId === "spanning"), undefined);
});

test("blijft er één eigen zin over, dan blijft het hele stukje staan", () => {
  const { secties } = gedeeldSamengevat(GEDEELD);
  const werk = secties.find((s) => s.sectieId === "werk");
  assert.ok(werk, "het stukje met een eigen zin hoort te blijven");
  assert.match(werk.tekst, /korte aanleiding/);
  // Iemands eigen woorden knippen we niet bij.
  assert.match(werk.tekst, /vlot naar een besluit/);
});

test("eigen tekst blijft gewoon staan", () => {
  const { secties } = gedeeldSamengevat(GEDEELD);
  assert.ok(secties.find((s) => s.sectieId === "bereikt"));
});

test("verschil in hoofdletters, spaties of leestekens telt niet als verschil", () => {
  const { secties } = gedeeldSamengevat({
    kenmerken: [{ zin: "Ik denk het beste hardop." }],
    handleiding: [{ sectieId: "a", titel: "A", tekst: "  ik DENK het beste hardop  " }],
  });
  assert.deepEqual(secties, []);
});

test("een leeg stukje handleiding komt niet in beeld", () => {
  const { secties } = gedeeldSamengevat({
    kenmerken: [],
    handleiding: [{ sectieId: "a", titel: "A", tekst: "" }, { sectieId: "b", titel: "B" }],
  });
  assert.deepEqual(secties, []);
});

test("zonder gegevens komt er niets terug in plaats van een fout", () => {
  assert.deepEqual(gedeeldSamengevat(null), { zinnen: [], secties: [] });
  assert.deepEqual(gedeeldSamengevat({}), { zinnen: [], secties: [] });
});
