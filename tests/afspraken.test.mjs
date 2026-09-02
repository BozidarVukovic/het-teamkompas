// Tests voor de teamafspraken.
//
// Dit is het enige onderdeel dat van het team samen is. Twee dingen moeten
// kloppen: er komt niets in de database wat er niet in hoort, en de volgorde
// zegt niets over belangrijkheid. Zodra afspraken gerangschikt raken, doet de
// onderste er minder toe — en dan is het geen afspraak meer maar een lijstje.

import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_TEKST,
  MAX_TOELICHTING,
  herkomstVan,
  schoneAfspraak,
  sorteerAfspraken,
  uitgelichteAfspraak,
} from "../src/lib/app/afspraken.js";

/* ----------------------------------------------------------- opschonen */

test("een afspraak zonder zin bestaat niet", () => {
  assert.equal(schoneAfspraak({ tekst: "" }), null);
  assert.equal(schoneAfspraak({ tekst: "   " }), null);
  assert.equal(schoneAfspraak(), null);
  assert.equal(schoneAfspraak({ toelichting: "Wel uitleg, geen afspraak." }), null);
});

test("witruimte om de zin heen gaat eraf", () => {
  assert.deepEqual(schoneAfspraak({ tekst: "  We maken afspraken concreet.  " }), {
    tekst: "We maken afspraken concreet.",
  });
});

test("een lege toelichting komt er niet als leeg veld in", () => {
  const uit = schoneAfspraak({ tekst: "We spreken elkaar aan.", toelichting: "   " });
  assert.deepEqual(Object.keys(uit), ["tekst"]);
});

test("te lange tekst wordt afgekapt", () => {
  const uit = schoneAfspraak({
    tekst: "a".repeat(MAX_TEKST + 100),
    toelichting: "b".repeat(MAX_TOELICHTING + 100),
  });
  assert.equal(uit.tekst.length, MAX_TEKST);
  assert.equal(uit.toelichting.length, MAX_TOELICHTING);
});

/* ------------------------------------------------------------ volgorde */

const afspraak = (id, ms, tekst = `Afspraak ${id}`) => ({
  id,
  tekst,
  aangemaaktOp: ms === null ? null : new Date(ms),
});

test("afspraken staan in de volgorde waarin ze zijn gemaakt", () => {
  const lijst = sorteerAfspraken([afspraak("c", 300), afspraak("a", 100), afspraak("b", 200)]);
  assert.deepEqual(lijst.map((a) => a.id), ["a", "b", "c"]);
});

test("een afspraak zonder tijdstempel staat achteraan, niet vooraan", () => {
  // Vlak na het opslaan heeft de server nog geen tijd gezet. Zonder deze regel
  // zou zo'n verse afspraak bovenaan springen alsof hij de oudste was.
  const lijst = sorteerAfspraken([afspraak("nieuw", null), afspraak("oud", 100)]);
  assert.deepEqual(lijst.map((a) => a.id), ["oud", "nieuw"]);
});

test("een afspraak zonder zin valt weg", () => {
  const lijst = sorteerAfspraken([afspraak("a", 100), { id: "leeg", tekst: "" }, null]);
  assert.deepEqual(lijst.map((a) => a.id), ["a"]);
});

test("een tijdstempel van Firestore wordt net zo goed gelezen", () => {
  const alsFirestore = (ms) => ({ toMillis: () => ms });
  const lijst = sorteerAfspraken([
    { id: "b", tekst: "b", aangemaaktOp: alsFirestore(200) },
    { id: "a", tekst: "a", aangemaaktOp: alsFirestore(100) },
  ]);
  assert.deepEqual(lijst.map((a) => a.id), ["a", "b"]);
});

/* ------------------------------------------------------- uitgelicht */

test("zonder afspraken valt er niets uit te lichten", () => {
  assert.equal(uitgelichteAfspraak([]), null);
  assert.equal(uitgelichteAfspraak(), null);
});

test("dezelfde dag geeft dezelfde afspraak, een dag later een andere", () => {
  const lijst = [afspraak("a", 100), afspraak("b", 200), afspraak("c", 300)];
  const dag1 = new Date("2026-09-02T09:00:00Z");
  const dag1later = new Date("2026-09-02T21:00:00Z");
  const dag2 = new Date("2026-09-03T09:00:00Z");

  assert.equal(uitgelichteAfspraak(lijst, dag1).id, uitgelichteAfspraak(lijst, dag1later).id);
  assert.notEqual(uitgelichteAfspraak(lijst, dag1).id, uitgelichteAfspraak(lijst, dag2).id);
});

test("over een reeks dagen komt elke afspraak aan de beurt", () => {
  const lijst = [afspraak("a", 100), afspraak("b", 200), afspraak("c", 300)];
  const gezien = new Set();
  for (let i = 0; i < 9; i += 1) {
    const dag = new Date(Date.UTC(2026, 8, 2 + i, 9));
    gezien.add(uitgelichteAfspraak(lijst, dag).id);
  }
  assert.deepEqual([...gezien].sort(), ["a", "b", "c"]);
});

test("met één afspraak blijft het die ene", () => {
  const lijst = [afspraak("a", 100)];
  assert.equal(uitgelichteAfspraak(lijst, new Date("2026-09-02")).id, "a");
  assert.equal(uitgelichteAfspraak(lijst, new Date("2027-04-18")).id, "a");
});

/* --------------------------------------------------------- herkomst */

test("de herkomst noemt wie hem opschreef", () => {
  assert.equal(herkomstVan({ doorNaam: "Nikki" }), "Opgeschreven door Nikki");
});

test("is hij door een ander bijgesteld, dan staat dat erbij", () => {
  assert.equal(
    herkomstVan({ doorNaam: "Nikki", bijgewerktDoorNaam: "Eva" }),
    "Opgeschreven door Nikki · bijgesteld door Eva"
  );
});

test("wie zijn eigen afspraak bijstelt, wordt niet twee keer genoemd", () => {
  assert.equal(
    herkomstVan({ doorNaam: "Nikki", bijgewerktDoorNaam: "Nikki" }),
    "Opgeschreven door Nikki"
  );
});

test("zonder naam blijft de regel leesbaar", () => {
  assert.equal(herkomstVan({}), "Opgeschreven door iemand uit het team");
  assert.equal(herkomstVan(null), "");
});
