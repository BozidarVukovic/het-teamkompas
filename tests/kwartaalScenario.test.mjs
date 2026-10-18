// Afhankelijkheden en scenario's.
//
// Het hart hiervan is het rekenvoorbeeld uit de opdracht: negen uur ruimte,
// drie lopende bijdragen, nieuw werk van vier uur. De vijf verwachte uitkomsten
// staan onderaan als vijf aparte tests. Fictieve namen, fictieve doelen --
// er staat hier niets van een echte klant in.

import test from "node:test";
import assert from "node:assert/strict";

import {
  cirkels,
  geraaktDoor,
  gevolgenVan,
  magToevoegen,
  wachtendOp,
} from "../src/lib/app/kwartaal/afhankelijkheden.js";
import { OPTIES, maakBesluitvoorstel, verkenScenario } from "../src/lib/app/kwartaal/scenario.js";
import { grootsteTekort, overbelasting } from "../src/lib/app/kwartaal/ruimte.js";

/* ═════════════════════════════════════════════════════ afhankelijkheden */

const KETEN = [
  { doelId: "gids", wachtOp: "werkwijze", mijlpaal: "eerste versie", bevestigd: true },
  { doelId: "training", wachtOp: "gids", mijlpaal: "concept af", bevestigd: true },
  { doelId: "evaluatie", wachtOp: "werkwijze", mijlpaal: "", bevestigd: false },
];

test("wie rechtstreeks wacht, wacht op een mijlpaal en niet op een heel project", () => {
  const uit = wachtendOp(KETEN, "werkwijze");
  assert.equal(uit.length, 2);
  assert.equal(uit.find((u) => u.doelId === "gids").mijlpaal, "eerste versie");
});

test("een vermoeden is iets anders dan een bevestigde afhankelijkheid", () => {
  assert.equal(wachtendOp(KETEN, "werkwijze", { alleenBevestigd: true }).length, 1);
  assert.equal(wachtendOp(KETEN, "werkwijze").find((u) => u.doelId === "evaluatie").bevestigd, false);
});

test("indirect geraakt is ook geraakt, met het pad erbij", () => {
  const uit = geraaktDoor(KETEN, "werkwijze");
  const training = uit.find((u) => u.doelId === "training");
  assert.equal(training.afstand, 2);
  assert.deepEqual(training.via, ["werkwijze", "gids"]);
});

test("een keten die via een vermoeden loopt is zelf ook een vermoeden", () => {
  const uit = geraaktDoor(
    [
      { doelId: "b", wachtOp: "a", bevestigd: false },
      { doelId: "c", wachtOp: "b", bevestigd: true },
    ],
    "a"
  );
  assert.equal(uit.find((u) => u.doelId === "c").bevestigd, false);
});

test("cirkels worden gevonden en één keer gemeld", () => {
  const ring = [
    { doelId: "b", wachtOp: "a" },
    { doelId: "c", wachtOp: "b" },
    { doelId: "a", wachtOp: "c" },
  ];
  const uit = cirkels(ring);
  assert.equal(uit.length, 1);
  assert.deepEqual([...uit[0]].sort(), ["a", "b", "c"]);
});

test("een rechte keten is geen cirkel", () => {
  assert.deepEqual(cirkels(KETEN), []);
});

test("een afhankelijkheid die een kring zou maken, komt er niet in", () => {
  const uit = magToevoegen(KETEN, { doelId: "werkwijze", wachtOp: "training" });
  assert.equal(uit.mag, false);
  assert.match(uit.reden, /kring/);
});

test("een doel kan niet op zichzelf wachten en niet twee keer op hetzelfde", () => {
  assert.equal(magToevoegen(KETEN, { doelId: "gids", wachtOp: "gids" }).mag, false);
  assert.equal(magToevoegen(KETEN, { doelId: "gids", wachtOp: "werkwijze" }).mag, false);
  assert.equal(magToevoegen(KETEN, { doelId: "nieuw", wachtOp: "gids" }).mag, true);
});

test("gevolgen zijn een lijst om over te praten, geen nieuwe datum", () => {
  const uit = gevolgenVan(KETEN, ["werkwijze"]);
  assert.equal(uit.nieuweDatum, null);
  assert.equal(uit.datumStatus, "af te stemmen");
  assert.equal(uit.bevestigd.length, 2, "gids rechtstreeks, training erachter");
  assert.equal(uit.vermoed.length, 1);
});

/* ═══════════════════════════════════════════ het rekenvoorbeeld uit §12 */

const WEKEN = { van: "2027-W02", tot: "2027-W09" };

// Samen 9 uur per week ruimte voor kwartaaldoelen, na aftrek van regulier werk.
const PERSONEN = [
  { uid: "a", naam: "Collega A", ruimte: [{ ...WEKEN, urenPerWeek: 3 }], bijgewerktOp: "2026-12-15" },
  { uid: "b", naam: "Collega B", ruimte: [{ ...WEKEN, urenPerWeek: 3 }], bijgewerktOp: "2026-12-15" },
  { uid: "c", naam: "Collega C", ruimte: [{ ...WEKEN, urenPerWeek: 3 }], bijgewerktOp: "2026-12-15" },
];

const LOPEND = [
  { id: "bij-a", doelId: "werkwijze", uid: "a", urenPerWeek: 3, status: "afgesproken", ...WEKEN },
  { id: "bij-b", doelId: "gids", uid: "b", urenPerWeek: 2, status: "afgesproken", ...WEKEN },
  { id: "bij-c", doelId: "evaluatie", uid: "c", urenPerWeek: 2, status: "afgesproken", ...WEKEN },
];

const AFHANKELIJK = [{ doelId: "gids", wachtOp: "werkwijze", mijlpaal: "eerste versie", bevestigd: true }];

// Nieuw werk vraagt in diezelfde weken 4 uur per week.
const VERZOEK = {
  id: "verzoek-1",
  titel: "Een nieuw verzoek",
  aanvrager: "Een andere afdeling",
  ...WEKEN,
  bijdragen: [{ uid: "a", urenPerWeek: 2 }, { uid: "c", urenPerWeek: 2 }],
  gevolgenNietDoen: "De aanvrager zoekt het elders.",
};

const scenario = (optie, instelling = {}) =>
  verkenScenario({ personen: PERSONEN, bijdragen: LOPEND, afhankelijkheden: AFHANKELIJK, verzoek: VERZOEK, optie, instelling });

test("de uitgangssituatie is zeven uur afgesproken en twee uur vrij", () => {
  const s = scenario("niet-aannemen");
  assert.equal(s.voor.team[0].ruimte, 9);
  assert.equal(s.voor.team[0].afgesproken, 7);
  assert.equal(s.voor.team[0].vrij, 2);
  assert.deepEqual(overbelasting(s.voor), [], "zoals het nu staat loopt niemand over");
});

test("1. zonder wijziging ontstaat op teamniveau een tekort van twee uur per week", () => {
  const s = scenario("aannemen");
  assert.equal(s.na.team[0].tekort, 2);
  assert.equal(grootsteTekort(s.na).tekort, 2);
});

test("1b. en dat tekort zit bij een persoon, niet alleen in het totaal", () => {
  // Negen uur ruimte en elf uur werk is rekenkundig twee uur te veel. Maar
  // collega A krijgt er twee uur bij op drie uur ruimte: dat is zijn probleem,
  // niet dat van het team gemiddeld.
  const s = scenario("aannemen");
  const over = overbelasting(s.na);
  assert.deepEqual(over.map((o) => o.naam).sort(), ["Collega A", "Collega C"]);
  assert.equal(over.find((o) => o.naam === "Collega A").weken[0].tekort, 2);
});

test("2. pauzeren van de evaluatie maakt twee uur vrij, waarmee het rekenkundig past", () => {
  const s = scenario("pauzeren", { pauzeer: ["bij-c"], vanafWeek: WEKEN.van });
  assert.equal(s.na.team[0].tekort, 0, "negen uur ruimte, negen uur werk");
  assert.equal(s.na.team[0].vrij, 0);
});

test("2b. maar controle per persoon blijft nodig", () => {
  // Collega C staat na het pauzeren op twee uur nieuw werk binnen drie uur
  // ruimte, en A op vijf uur binnen drie. Het teamtotaal klopt; A niet.
  const s = scenario("pauzeren", { pauzeer: ["bij-c"], vanafWeek: WEKEN.van });
  const over = overbelasting(s.na);
  assert.equal(over.length, 1);
  assert.equal(over[0].naam, "Collega A");
  assert.equal(over[0].weken[0].tekort, 2);
});

test("3. pauzeren van de werkwijze maakt drie uur vrij, maar raakt de gids", () => {
  const s = scenario("pauzeren", { pauzeer: ["bij-a"], vanafWeek: WEKEN.van });
  assert.equal(s.voor.team[0].afgesproken - s.na.team[0].afgesproken, 3, "drie uur weg bij A");
  const geraakt = s.afhankelijkheden.geraakt.map((g) => g.doelId);
  assert.deepEqual(geraakt, ["gids"]);
  assert.equal(s.afhankelijkheden.datumStatus, "af te stemmen");
  assert.equal(s.afhankelijkheden.nieuweDatum, null, "geen verzonnen nieuwe datum");
});

test("4. die afhankelijkheid maakt de uren van collega B niet vrij", () => {
  // Dit is de fout die een capaciteitstool het makkelijkst maakt: de gids
  // loopt vertraging op, dus "dan heeft B toch tijd over". Nee -- B staat nog
  // steeds voor twee uur per week ingepland.
  const s = scenario("pauzeren", { pauzeer: ["bij-a"], vanafWeek: WEKEN.van });
  const b = s.na.perPersoon.find((p) => p.uid === "b");
  assert.equal(b.weken[0].afgesproken, 2, "de uren van B staan er nog");
  assert.equal(b.weken[0].vrij, 1);
  assert.ok(
    s.onzekerheden.some((o) => o.includes("maakt geen uren vrij")),
    "en het scherm hoort dat te zeggen"
  );
});

test("5. later starten verandert de huidige planning niet", () => {
  const s = scenario("later-starten", { weken: 8 });
  assert.deepEqual(s.na.team[0], s.voor.team[0], "in de huidige weken verandert er niets");
  assert.ok(s.onzekerheden.some((o) => o.includes("opnieuw worden beoordeeld")));
});

/* ═════════════════════════════════════════════════ de regels eromheen */

test("een scenario laat de echte planning met rust", () => {
  const kopie = JSON.parse(JSON.stringify(LOPEND));
  scenario("pauzeren", { pauzeer: ["bij-a", "bij-c"], vanafWeek: "2027-W05" });
  scenario("verschuiven", { verschuif: [{ bijdrageId: "bij-a", weken: 4 }] });
  scenario("herverdelen", { herverdeel: [{ bijdrageId: "bij-a", naar: "b" }] });
  assert.deepEqual(LOPEND, kopie, "de invoer hoort onaangeroerd te blijven");
});

test("een scenario is geen besluit", () => {
  OPTIES.forEach((optie) => {
    assert.equal(scenario(optie).toegepast, false, `${optie}: een scenario past niets toe`);
  });
});

test("pauzeren halverwege laat de weken ervoor staan", () => {
  const s = scenario("pauzeren", { pauzeer: ["bij-c"], vanafWeek: "2027-W06" });
  // Week W02 tot en met W05 blijven zoals ze waren; vanaf W06 is het weg.
  assert.equal(s.na.perPersoon.find((p) => p.uid === "c").weken[0].afgesproken, 2);
  const index = s.na.weken.indexOf("2027-W06");
  assert.equal(s.na.perPersoon.find((p) => p.uid === "c").weken[index].afgesproken, 0);
});

test("verschuiven maakt alleen ruimte vrij in de weken waar het werk weggaat", () => {
  const s = scenario("verschuiven", { verschuif: [{ bijdrageId: "bij-a", weken: 4 }] });
  const a = s.perPersoon.find((p) => p.uid === "a");
  const eerste = a.weken[0];
  const laatste = a.weken[a.weken.length - 1];
  assert.ok(eerste.geplandNa < eerste.geplandVoor, "in de eerste weken is het werk weg");
  assert.ok(laatste.geplandNa > laatste.geplandVoor, "en in de latere weken erbij gekomen");
});

test("herverdelen maakt geen capaciteit bij", () => {
  const s = scenario("herverdelen", { herverdeel: [{ bijdrageId: "bij-a", naar: "b" }] });
  const zonder = scenario("aannemen");
  assert.equal(
    s.na.team[0].afgesproken + s.na.team[0].voorgesteld,
    zonder.na.team[0].afgesproken + zonder.na.team[0].voorgesteld,
    "hetzelfde werk, alleen op een andere naam"
  );
  assert.ok(s.onzekerheden.some((o) => o.includes("geen capaciteit")));
});

test("een gevraagde bijdrage zonder naam is werk dat nog nergens op staat", () => {
  const s = verkenScenario({
    personen: PERSONEN,
    bijdragen: LOPEND,
    verzoek: { ...VERZOEK, bijdragen: [{ expertise: "arbeidsrecht", urenPerWeek: 4 }] },
    optie: "aannemen",
  });
  assert.ok(s.onzekerheden.some((o) => o.includes("nog geen collega")));
  assert.equal(s.na.team[0].voorgesteld, 0, "die uren staan bij niemand en tellen dus nergens mee");
});

test("ontbrekende schattingen worden niet stilzwijgend aangevuld", () => {
  const s = verkenScenario({
    personen: PERSONEN,
    bijdragen: LOPEND,
    verzoek: { ...VERZOEK, bijdragen: [{ uid: "a", urenPerWeek: null }] },
    optie: "aannemen",
  });
  assert.ok(s.aannames.some((a) => a.includes("urenschatting")));
  assert.equal(s.na.team[0].voorgesteld, 0);
});

test("faseren zonder beschreven deel rekent niets door", () => {
  const s = scenario("faseren");
  assert.ok(s.aannames.some((a) => a.includes("kleiner deel")));
  assert.deepEqual(s.na.team[0], s.voor.team[0]);
});

test("een onbekende optie is een fout, geen stille terugval", () => {
  assert.throws(() => scenario("doe-maar-iets"), /Onbekende optie/);
});

/* ══════════════════════════════════════════════════ het besluitvoorstel */

test("een voorstel draagt de wijzigingen mee die het zou doen", () => {
  const s = scenario("pauzeren", { pauzeer: ["bij-c"], vanafWeek: WEKEN.van });
  const voorstel = maakBesluitvoorstel(s, { afweging: "De evaluatie kan een kwartaal wachten.", beslisser: "de teamleider" });
  assert.equal(voorstel.status, "voorstel");
  assert.equal(voorstel.optie, "pauzeren");
  assert.ok(voorstel.wijzigingen.length > 0);
  assert.ok(voorstel.betrokkenEigenaren.includes("c"), "de eigenaar van het gepauzeerde werk hoort erbij");
});

test("de app wijst niemand aan als bevoegd", () => {
  const voorstel = maakBesluitvoorstel(scenario("aannemen"));
  assert.equal(voorstel.mandaatBevestigd, false);
  assert.equal(voorstel.beslisser, "", "wie beslist, bepaalt het team");
});
