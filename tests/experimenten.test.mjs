// Tests voor experimenten.
//
// Een experiment is het enige in deze app dat over tijd loopt. Daar gaat het
// mis op twee plekken: bij het rekenen met dagen (dag 1 is de startdag, niet
// dag 0) en bij de vraag wat er precies wordt bijgehouden. Het tweede is het
// belangrijkst: er mag nergens uit af te leiden zijn hoe vaak iemand iets
// gedaan heeft, want dan is het een score geworden.

import test from "node:test";
import assert from "node:assert/strict";

import {
  LOOPTIJD_DAGEN,
  MAX_TERUGBLIK,
  UITKOMSTEN,
  dagenBezig,
  isTerugblikKlaar,
  isUitkomst,
  loopt,
  schoneTerugblik,
  sorteerExperimenten,
  standInEenZin,
  watNuSpeelt,
} from "../src/lib/app/experimenten.js";

const NU = new Date("2026-06-01T12:00:00Z");
const dagenGeleden = (n) => new Date(NU.getTime() - n * 24 * 60 * 60 * 1000);

const exp = (dagen, extra = {}) => ({
  id: `e${dagen}`,
  actie: "Vraag eerst wat de ander al geprobeerd heeft.",
  gestartOp: dagenGeleden(dagen),
  terugblikOp: null,
  ...extra,
});

/* --------------------------------------------------------------- dagen */

test("de dag dat je begint is dag 1, niet dag 0", () => {
  assert.equal(dagenBezig(exp(0), NU), 1);
});

test("een dag later ben je op dag 2", () => {
  assert.equal(dagenBezig(exp(1), NU), 2);
});

test("zonder startdatum tellen we vanaf dag 1", () => {
  assert.equal(dagenBezig({ actie: "iets" }, NU), 1);
  assert.equal(dagenBezig(null, NU), 1);
});

test("een Firestore-timestamp telt net zo goed mee als een datum", () => {
  const stempel = { toMillis: () => dagenGeleden(9).getTime() };
  assert.equal(dagenBezig({ gestartOp: stempel }, NU), 10);
});

test("een datum als tekst telt ook mee", () => {
  assert.equal(dagenBezig({ gestartOp: dagenGeleden(4).toISOString() }, NU), 5);
});

/* ---------------------------------------------------------- de looptijd */

test("binnen de dertig dagen loopt een experiment nog", () => {
  assert.equal(loopt(exp(10), NU), true);
  assert.equal(isTerugblikKlaar(exp(10), NU), false);
});

test("op de laatste dag is de terugblik nog niet aan de beurt", () => {
  assert.equal(dagenBezig(exp(LOOPTIJD_DAGEN - 1), NU), LOOPTIJD_DAGEN);
  assert.equal(isTerugblikKlaar(exp(LOOPTIJD_DAGEN - 1), NU), false);
});

test("daarna vraagt hij om een terugblik en loopt hij niet meer", () => {
  const oud = exp(LOOPTIJD_DAGEN);
  assert.equal(isTerugblikKlaar(oud, NU), true);
  assert.equal(loopt(oud, NU), false);
});

test("wie al heeft teruggekeken, wordt er niet nog eens om gevraagd", () => {
  const af = exp(60, { terugblikOp: dagenGeleden(20), uitkomst: "hou-ik-vast" });
  assert.equal(isTerugblikKlaar(af, NU), false);
  assert.equal(loopt(af, NU), false);
});

/* ------------------------------------------------------------ de zin */

test("de stand noemt de dag, en verder niets", () => {
  assert.equal(standInEenZin(exp(6), NU), `Dag 7 van ${LOOPTIJD_DAGEN}.`);
});

test("er staat nergens hoe vaak je het gedaan hebt", () => {
  // Dit is de kern: de app weet dat niet, en hoort er ook niet naar te raden.
  const zin = standInEenZin(exp(6), NU);
  for (const woord of ["keer", "%", "procent", "gehaald", "volgehouden", "streak", "score"]) {
    assert.equal(zin.includes(woord), false, `de stand zegt iets over ${woord}`);
  }
});

test("na dertig dagen is het een vraag, geen oordeel", () => {
  const zin = standInEenZin(exp(LOOPTIJD_DAGEN), NU);
  assert.equal(zin.includes("Hoe is het gegaan?"), true);
  assert.equal(zin.includes("niet gehaald"), false);
});

test("een afgerond experiment is gewoon afgerond", () => {
  assert.equal(standInEenZin(exp(60, { terugblikOp: dagenGeleden(20) }), NU), "Afgerond.");
  assert.equal(standInEenZin(null, NU), "");
});

/* --------------------------------------------------------- de volgorde */

test("wat om een terugblik vraagt staat bovenaan", () => {
  const lijst = [exp(2), exp(40), exp(90, { terugblikOp: dagenGeleden(50) })];
  const rij = sorteerExperimenten(lijst, NU);
  assert.deepEqual(rij.map((e) => e.id), ["e40", "e2", "e90"]);
});

test("binnen een groep staat het nieuwste vooraan", () => {
  const rij = sorteerExperimenten([exp(3), exp(20), exp(9)], NU);
  assert.deepEqual(rij.map((e) => e.id), ["e3", "e9", "e20"]);
});

test("een experiment zonder actie bestaat niet", () => {
  assert.deepEqual(sorteerExperimenten([{ id: "leeg" }, null, exp(1)], NU).map((e) => e.id), ["e1"]);
  assert.deepEqual(sorteerExperimenten(), []);
});

test("de oorspronkelijke lijst blijft ongemoeid", () => {
  const lijst = [exp(2), exp(40)];
  sorteerExperimenten(lijst, NU);
  assert.deepEqual(lijst.map((e) => e.id), ["e2", "e40"]);
});

/* ------------------------------------------------------- wat nu speelt */

test("wat nu speelt is het experiment dat aandacht vraagt", () => {
  assert.equal(watNuSpeelt([exp(2), exp(40)], NU).id, "e40");
});

test("loopt er niets meer, dan speelt er niets", () => {
  assert.equal(watNuSpeelt([exp(90, { terugblikOp: dagenGeleden(50) })], NU), null);
  assert.equal(watNuSpeelt([], NU), null);
  assert.equal(watNuSpeelt(undefined, NU), null);
});

/* --------------------------------------------------------- de terugblik */

test("er zijn drie uitkomsten en geen daarvan is goed of fout", () => {
  assert.equal(UITKOMSTEN.length, 3);
  for (const u of UITKOMSTEN) {
    for (const woord of ["gelukt", "mislukt", "goed", "fout", "gefaald"]) {
      assert.equal(u.label.toLowerCase().includes(woord), false, `${u.id} oordeelt`);
    }
  }
});

test("een onbekende uitkomst wordt niet overgenomen", () => {
  assert.equal(isUitkomst("hou-ik-vast"), true);
  assert.equal(isUitkomst("gelukt"), false);
  assert.equal(schoneTerugblik({ uitkomst: "gelukt" }).uitkomst, "weet-nog-niet");
  assert.equal(schoneTerugblik().uitkomst, "weet-nog-niet");
});

test("de terugblik is een paar zinnen, geen verslag", () => {
  const lang = schoneTerugblik({ uitkomst: "past-niet", tekst: "a".repeat(MAX_TERUGBLIK + 200) });
  assert.equal(lang.tekst.length, MAX_TERUGBLIK);
  assert.equal(lang.uitkomst, "past-niet");
});

test("witruimte om de terugblik heen gaat eraf", () => {
  assert.deepEqual(schoneTerugblik({ uitkomst: "hou-ik-vast", tekst: "  Het hielp.  " }), {
    uitkomst: "hou-ik-vast",
    tekst: "Het hielp.",
  });
});

test("een terugblik zonder woorden mag ook", () => {
  assert.deepEqual(schoneTerugblik({ uitkomst: "past-niet" }), { uitkomst: "past-niet", tekst: "" });
});
