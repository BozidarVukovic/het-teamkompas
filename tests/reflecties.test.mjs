// Tests voor reflecties.
//
// Twee dingen moeten kloppen. Ten eerste het moment: te vroeg vragen levert een
// antwoord op over een gesprek dat nog niet is geweest, te laat vragen levert
// een verzonnen herinnering op. Ten tweede de inhoud: er mag niets in staan
// over de ander, want in deze app staat over een collega niets wat die collega
// niet zelf heeft opgeschreven.

import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_TEKST,
  TERUGBLIKKEN,
  VERVALT_NA_DAGEN,
  WACHT_UREN,
  dagenGeleden,
  isTerugblik,
  openstaandeSessie,
  schoneReflectie,
  sorteerReflecties,
  terugblikLabel,
  waaroverInEenZin,
} from "../src/lib/app/reflecties.js";

const NU = new Date("2026-06-01T12:00:00Z");
const urenGeleden = (n) => new Date(NU.getTime() - n * 60 * 60 * 1000);
const dagen = (n) => urenGeleden(n * 24);

const sessie = (id, urenOud, extra = {}) => ({
  id,
  situatieId: "feedback-geven",
  opgevraagdOp: urenGeleden(urenOud),
  ...extra,
});

/* ------------------------------------------------------------- het moment */

test("vlak na het advies wordt er niets gevraagd", () => {
  // Je hebt het advies net gelezen; er is nog geen gesprek geweest.
  assert.equal(openstaandeSessie({ sessies: [sessie("s1", 2)], nu: NU }), null);
  assert.equal(openstaandeSessie({ sessies: [sessie("s2", WACHT_UREN - 1)], nu: NU }), null);
});

test("de volgende dag staat de vraag klaar", () => {
  const open = openstaandeSessie({ sessies: [sessie("s3", WACHT_UREN)], nu: NU });
  assert.equal(open.id, "s3");
});

test("na twee weken vervalt de vraag vanzelf", () => {
  const net = openstaandeSessie({ sessies: [sessie("s4", VERVALT_NA_DAGEN * 24)], nu: NU });
  assert.equal(net.id, "s4");
  assert.equal(openstaandeSessie({ sessies: [sessie("s5", VERVALT_NA_DAGEN * 24 + 1)], nu: NU }), null);
});

test("er staat er nooit meer dan één tegelijk, en dat is de nieuwste", () => {
  const open = openstaandeSessie({
    sessies: [sessie("oud", 100), sessie("nieuw", 30), sessie("oudst", 200)],
    nu: NU,
  });
  assert.equal(open.id, "nieuw");
});

test("waar je al op terugkeek, wordt niet opnieuw gevraagd", () => {
  const open = openstaandeSessie({
    sessies: [sessie("a", 30), sessie("b", 60)],
    reflecties: [{ sessieId: "a", terugblik: "beter" }],
    nu: NU,
  });
  assert.equal(open.id, "b");
});

test('"ik heb het gesprek niet gevoerd" telt ook als teruggekeken', () => {
  // Anders komt dezelfde vraag morgen weer terug, en dat is zeuren.
  const open = openstaandeSessie({
    sessies: [sessie("a", 30)],
    reflecties: [{ sessieId: "a", terugblik: "niet-gevoerd" }],
    nu: NU,
  });
  assert.equal(open, null);
});

test("een sessie zonder situatie of zonder datum doet niet mee", () => {
  assert.equal(openstaandeSessie({ sessies: [sessie("a", 30, { situatieId: null })], nu: NU }), null);
  assert.equal(openstaandeSessie({ sessies: [sessie("b", 30, { opgevraagdOp: null })], nu: NU }), null);
  assert.equal(openstaandeSessie({ sessies: [{ situatieId: "x", opgevraagdOp: dagen(2) }], nu: NU }), null);
});

test("zonder sessies is er niets te vragen", () => {
  assert.equal(openstaandeSessie({ nu: NU }), null);
  assert.equal(openstaandeSessie(), null);
});

test("een Firestore-timestamp telt net zo goed mee als een datum", () => {
  const stempel = { toMillis: () => urenGeleden(30).getTime() };
  const open = openstaandeSessie({ sessies: [sessie("s", 0, { opgevraagdOp: stempel })], nu: NU });
  assert.equal(open.id, "s");
});

/* ---------------------------------------------------------------- de zin */

test("dagen worden hele dagen, en nooit negatief", () => {
  assert.equal(dagenGeleden(dagen(3), NU), 3);
  assert.equal(dagenGeleden(urenGeleden(30), NU), 1);
  assert.equal(dagenGeleden(new Date(NU.getTime() + 5000), NU), 0);
  assert.equal(dagenGeleden(null, NU), 0);
});

test("de regel zegt wanneer en waarover, en verder niets", () => {
  const zin = waaroverInEenZin(sessie("s", 72), "Ik wil feedback geven", NU);
  assert.equal(zin, "Je vroeg hier 3 dagen geleden advies over: “Ik wil feedback geven”.");
});

test("een dag oud heet gisteren", () => {
  assert.match(waaroverInEenZin(sessie("s", 30), "Ik wil feedback geven", NU), /gisteren/);
});

test("zonder label blijft de regel gewoon een zin", () => {
  assert.equal(waaroverInEenZin(sessie("s", 72), "", NU), "Je vroeg hier 3 dagen geleden advies over.");
  assert.equal(waaroverInEenZin(null, "x", NU), "");
});

/* ----------------------------------------------------------- de terugblik */

test("er zijn vier terugblikken en geen daarvan is goed of fout", () => {
  assert.equal(TERUGBLIKKEN.length, 4);
  for (const t of TERUGBLIKKEN) {
    for (const woord of ["gelukt", "mislukt", "goed gedaan", "fout", "gefaald"]) {
      assert.equal(t.label.toLowerCase().includes(woord), false, `${t.id} oordeelt`);
    }
  }
});

test("niet gevoerd hebben is een gewoon antwoord", () => {
  assert.equal(isTerugblik("niet-gevoerd"), true);
  assert.equal(terugblikLabel("niet-gevoerd"), "Ik heb dit gesprek niet gevoerd");
});

test("een reflectie zonder terugblik bestaat niet", () => {
  assert.equal(schoneReflectie(), null);
  assert.equal(schoneReflectie({ tekst: "Wel woorden, geen antwoord." }), null);
  assert.equal(schoneReflectie({ terugblik: "prima" }), null);
  assert.equal(terugblikLabel("prima"), "");
});

test("de tekst is een paar zinnen, geen verslag", () => {
  const lang = schoneReflectie({ terugblik: "anders", tekst: "a".repeat(MAX_TEKST + 200) });
  assert.equal(lang.tekst.length, MAX_TEKST);
});

test("er komt niets anders in dan de terugblik en je eigen woorden", () => {
  // Als hier ooit een naam of een uid bij komt, staat er in de app iets over
  // een collega dat die collega niet zelf heeft opgeschreven.
  const schoon = schoneReflectie({
    terugblik: "beter",
    tekst: "  Het hielp om eerst te vragen of het uitkwam.  ",
    naam: "Nikki",
    over: "bram",
    oordeel: "zij luisterde slecht",
  });
  assert.deepEqual(Object.keys(schoon).sort(), ["tekst", "terugblik"]);
  assert.equal(schoon.tekst, "Het hielp om eerst te vragen of het uitkwam.");
});

test("een reflectie zonder woorden mag ook", () => {
  assert.deepEqual(schoneReflectie({ terugblik: "zoals-verwacht" }), {
    terugblik: "zoals-verwacht",
    tekst: "",
  });
});

/* ------------------------------------------------------------ de volgorde */

test("de nieuwste staat bovenaan", () => {
  const rij = sorteerReflecties([
    { id: "a", terugblik: "beter", gemaaktOp: dagen(9) },
    { id: "b", terugblik: "anders", gemaaktOp: dagen(1) },
    { id: "c", terugblik: "niet-gevoerd", gemaaktOp: dagen(4) },
  ]);
  assert.deepEqual(rij.map((r) => r.id), ["b", "c", "a"]);
});

test("een reflectie zonder geldige terugblik telt niet mee", () => {
  const rij = sorteerReflecties([{ id: "x" }, null, { id: "y", terugblik: "beter", gemaaktOp: dagen(1) }]);
  assert.deepEqual(rij.map((r) => r.id), ["y"]);
  assert.deepEqual(sorteerReflecties(), []);
});

test("de oorspronkelijke lijst blijft ongemoeid", () => {
  const lijst = [
    { id: "a", terugblik: "beter", gemaaktOp: dagen(1) },
    { id: "b", terugblik: "anders", gemaaktOp: dagen(9) },
  ];
  sorteerReflecties(lijst);
  assert.deepEqual(lijst.map((r) => r.id), ["a", "b"]);
});
