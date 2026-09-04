// Tests voor de lijst met mensen over wie je advies kunt vragen.
//
// Deze lijst staat op twee schermen. Liep hij uiteen, dan zag je op het
// startscherm iemand staan die bij "Samenwerken met..." ontbrak.

import test from "node:test";
import assert from "node:assert/strict";

import { collegasVan, collegaInEenZin, onderscheidendeZinnen } from "../src/lib/app/collegas.js";

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

/* ----------------------------------------------------------- begeleiders */

// Wie een team begeleidt, hoort niet bij de mensen waarmee je samenwerkt. Dit
// is de reden dat de rol bestaat: een facilitator die een team opzet, kwam er
// zelf tussen te staan — en de app vroeg hem zijn profiel met zijn klant te
// delen.
test("wie het team begeleidt staat niet in de lijst met collega's", () => {
  const lijst = collegasVan({
    leden: [
      { uid: "bo", naam: "Bo", rol: "begeleider" },
      { uid: "nikki", naam: "Nikki", rol: "lid" },
      { uid: "eva", naam: "Eva", rol: "beheerder" },
    ],
    gedeeld: {},
    eigenUid: "nikki",
  });

  assert.deepEqual(lijst.map((c) => c.uid), ["eva"]);
});

test("een beheerder staat er wel gewoon bij — die doet mee", () => {
  const lijst = collegasVan({
    leden: [
      { uid: "bo", naam: "Bo", rol: "beheerder" },
      { uid: "nikki", naam: "Nikki", rol: "lid" },
    ],
    gedeeld: {},
    eigenUid: "nikki",
  });

  assert.deepEqual(lijst.map((c) => c.uid), ["bo"]);
});

test("een begeleider ziet de mensen van het team wel", () => {
  const lijst = collegasVan({
    leden: [
      { uid: "bo", naam: "Bo", rol: "begeleider" },
      { uid: "nikki", naam: "Nikki", rol: "lid" },
      { uid: "eva", naam: "Eva", rol: "lid" },
    ],
    gedeeld: {},
    eigenUid: "bo",
  });

  assert.deepEqual(lijst.map((c) => c.uid), ["eva", "nikki"]);
});

// ------------------------------------------------- onderscheidendeZinnen
//
// Op het adviesscherm stond onder alle negen collega's dezelfde regel: "12
// punten · toegevoegd door Bozidar". Je kiest daar wie het betreft, en een
// kenmerk dat iedereen heeft, onderscheidt niemand.

const TOEGEVOEGD = (naam, punten = 12) => ({
  naam,
  punten,
  doorBeheerder: true,
  toegevoegdDoorNaam: "Bozidar",
});

test("staat er onder iedereen hetzelfde, dan staat er onder niemand iets", () => {
  const zinnen = onderscheidendeZinnen([
    TOEGEVOEGD("Anouk"),
    TOEGEVOEGD("Dennis"),
    TOEGEVOEGD("Irene"),
  ]);
  assert.deepEqual(zinnen, ["", "", ""]);
});

test("doet er een echt teamlid mee, dan komen de regels terug", () => {
  const zinnen = onderscheidendeZinnen([
    TOEGEVOEGD("Anouk"),
    { naam: "Nikki", punten: 9, doorBeheerder: false },
  ]);
  assert.deepEqual(zinnen, ["12 punten · toegevoegd door Bozidar", "9 punten gedeeld"]);
});

test("een verschil in aantal punten is ook een verschil", () => {
  const zinnen = onderscheidendeZinnen([TOEGEVOEGD("Anouk", 12), TOEGEVOEGD("Dennis", 8)]);
  assert.equal(zinnen[0], "12 punten · toegevoegd door Bozidar");
  assert.equal(zinnen[1], "8 punten · toegevoegd door Bozidar");
});

test('"Heeft nog niets gedeeld" blijft staan, ook als het voor iedereen geldt', () => {
  const zinnen = onderscheidendeZinnen([
    { naam: "Anouk", punten: 0 },
    { naam: "Dennis", punten: 0 },
  ]);
  assert.deepEqual(zinnen, ["Heeft nog niets gedeeld", "Heeft nog niets gedeeld"]);
});

test("deelt er een niets, dan blijven ook de regels van de anderen staan", () => {
  const zinnen = onderscheidendeZinnen([TOEGEVOEGD("Anouk"), { naam: "Dennis", punten: 0 }]);
  assert.equal(zinnen[0], "12 punten · toegevoegd door Bozidar");
  assert.equal(zinnen[1], "Heeft nog niets gedeeld");
});

test("een functie maakt de regel al onderscheidend", () => {
  const zinnen = onderscheidendeZinnen([
    { ...TOEGEVOEGD("Anouk"), functie: "teamleider" },
    TOEGEVOEGD("Dennis"),
  ]);
  assert.equal(zinnen[0], "teamleider · 12 punten · toegevoegd door Bozidar");
  assert.equal(zinnen[1], "12 punten · toegevoegd door Bozidar");
});

test("een lijst van een blijft leeg; er is niets om van te verschillen", () => {
  assert.deepEqual(onderscheidendeZinnen([TOEGEVOEGD("Anouk")]), [""]);
});

test("een lege lijst geeft een lege lijst", () => {
  assert.deepEqual(onderscheidendeZinnen(), []);
  assert.deepEqual(onderscheidendeZinnen([]), []);
});
