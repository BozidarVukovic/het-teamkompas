// Hoe kwartaalgegevens op het scherm komen te staan.
//
// Vooral: dat er nergens een getal verschijnt dat er niet is, en dat een
// concept op de kaart te onderscheiden blijft van iets dat gedeeld is.

import test from "node:test";
import assert from "node:assert/strict";

import {
  datumVanWeek,
  duurLabel,
  kaartregels,
  kwartaalLabel,
  kwartaalOpties,
  periodeLabel,
  sorteerDoelen,
  urenLabel,
  volgendeStap,
  weekVanDatum,
  zichtbaarVoor,
} from "../src/lib/app/kwartaal/weergave.js";

/* ------------------------------------------------------------ kwartalen */

test("een kwartaal heet naar zijn maanden, niet naar een cijfer", () => {
  assert.equal(kwartaalLabel("2027-K1"), "januari–maart 2027");
  assert.equal(kwartaalLabel("2027-K4"), "oktober–december 2027");
  assert.equal(kwartaalLabel("onzin"), "");
});

test("de keuzelijst loopt van één terug tot twee vooruit", () => {
  const opties = kwartaalOpties("2027-K1");
  assert.deepEqual(opties.map((o) => o.sleutel), ["2026-K4", "2027-K1", "2027-K2", "2027-K3"]);
  assert.equal(opties.filter((o) => o.nu).length, 1);
  assert.equal(opties[0].voorbij, true);
});

/* ---------------------------------------------------- datums en perioden */

test("een week heen en weer blijft dezelfde week", () => {
  assert.equal(datumVanWeek("2027-W05"), "2027-02-01");
  assert.equal(weekVanDatum("2027-02-01"), "2027-W05");
  assert.equal(weekVanDatum("2027-02-07"), "2027-W05", "de zondag hoort nog bij dezelfde week");
  assert.equal(weekVanDatum(""), "");
  assert.equal(datumVanWeek("geen week"), "");
});

test("een periode leest als weken, met het jaar erbij waar dat nodig is", () => {
  assert.equal(periodeLabel({ van: "2027-W02", tot: "2027-W09" }), "week 2 t/m 9 van 2027");
  assert.equal(periodeLabel({ van: "2027-W05", tot: "2027-W05" }), "week 5 van 2027");
  assert.equal(periodeLabel({ van: "2026-W52", tot: "2027-W02" }), "week 52 2026 t/m week 2 2027");
  // Omgedraaid is een invoerfout, geen periode -- net als in de rekenkern.
  assert.equal(periodeLabel({ van: "2027-W09", tot: "2027-W02" }), "");
  assert.equal(periodeLabel(null), "");
});

test("de duur telt begin en eind mee", () => {
  assert.equal(duurLabel({ van: "2027-W02", tot: "2027-W09" }), "8 weken");
  assert.equal(duurLabel({ van: "2027-W02", tot: "2027-W02" }), "1 week");
  assert.equal(duurLabel({ van: "2027-W09", tot: "2027-W02" }), "", "een omgedraaide periode heeft geen duur");
});

/* ------------------------------------------------------------------ uren */

test("uren lezen als uren, met een komma", () => {
  assert.equal(urenLabel(3), "3 uur per week");
  assert.equal(urenLabel(2.5), "2,5 uur per week");
  assert.equal(urenLabel(0), "0 uur per week");
});

test("onbekende uren zeggen dat ze onbekend zijn", () => {
  // Niet "0 uur per week": dat is een toezegging die niemand heeft gedaan.
  assert.equal(urenLabel(null), "niet ingevuld");
  assert.equal(urenLabel(undefined), "niet ingevuld");
  assert.equal(urenLabel("3"), "niet ingevuld");
});

/* ------------------------------------------------------- de kaart zelf */

const DOEL = {
  id: "d1",
  titel: "Een bruikbare werkwijze voor instroom",
  succes: "Als de proef is uitgevoerd.",
  status: "concept",
  gewenstVan: "2027-W02",
  gewenstTot: "2027-W09",
};

test("op de kaart staat wie het kan zien", () => {
  assert.equal(zichtbaarVoor(DOEL), "Alleen jij ziet dit");
  assert.equal(zichtbaarVoor({ ...DOEL, status: "ter-afstemming" }), "Je team kan dit zien");
  assert.equal(zichtbaarVoor({ ...DOEL, status: "afgesproken" }), "Je team kan dit zien");
});

test("delen en afspreken zijn twee aparte stappen", () => {
  assert.equal(volgendeStap(DOEL).naar, "ter-afstemming");
  assert.match(volgendeStap(DOEL).label, /Delen/);
  const gedeeld = volgendeStap({ ...DOEL, status: "ter-afstemming" });
  assert.equal(gedeeld.naar, "afgesproken");
  assert.match(gedeeld.uitleg, /erover heeft gesproken/);
});

test("een afgerond of gestopt doel heeft geen volgende stap", () => {
  assert.equal(volgendeStap({ ...DOEL, status: "afgerond" }), null);
  assert.equal(volgendeStap({ ...DOEL, status: "gestopt" }), null);
  assert.equal(volgendeStap(null), null);
});

test("alleen regels waar iets in staat komen op de kaart", () => {
  const kaal = kaartregels({ id: "d2", titel: "x", succes: "y", status: "concept" }, []);
  assert.deepEqual(kaal, [], "een lege regel vertelt niets en maakt de kaart alleen langer");
});

test("de inzet op de kaart komt uit de bijdragen", () => {
  const regels = kaartregels(DOEL, [
    { id: "b1", doelId: "d1", urenPerWeek: 3, van: "2027-W02", tot: "2027-W09" },
    { id: "b2", doelId: "anders", urenPerWeek: 9, van: "2027-W02", tot: "2027-W09" },
  ]);
  const inzet = regels.find((r) => r.wat === "Mijn inzet");
  assert.match(inzet.tekst, /3 uur per week/);
  assert.doesNotMatch(inzet.tekst, /9 uur/, "een bijdrage aan een ander doel hoort hier niet");
});

test("een bijdrage zonder urenschatting wordt niet als nul getoond", () => {
  const regels = kaartregels(DOEL, [{ id: "b1", doelId: "d1", urenPerWeek: null, van: "2027-W02", tot: "2027-W09" }]);
  const inzet = regels.find((r) => r.wat === "Mijn inzet");
  assert.equal(inzet.tekst, "nog geen urenschatting");
});

/* --------------------------------------------------------- de volgorde */

test("wat loopt staat boven wat nog van jou alleen is", () => {
  const uit = sorteerDoelen([
    { id: "1", titel: "C", status: "concept" },
    { id: "2", titel: "A", status: "afgerond" },
    { id: "3", titel: "B", status: "afgesproken" },
    { id: "4", titel: "D", status: "ter-afstemming" },
  ]);
  assert.deepEqual(uit.map((d) => d.status), ["afgesproken", "ter-afstemming", "concept", "afgerond"]);
});

test("twee keer sorteren geeft dezelfde volgorde", () => {
  const doelen = [
    { id: "1", titel: "Zebra", status: "afgesproken" },
    { id: "2", titel: "Appel", status: "afgesproken" },
  ];
  assert.deepEqual(sorteerDoelen(doelen).map((d) => d.titel), ["Appel", "Zebra"]);
  assert.deepEqual(sorteerDoelen(doelen), sorteerDoelen([...doelen].reverse()));
});

test("sorteren laat de oorspronkelijke lijst met rust", () => {
  const doelen = [{ id: "1", titel: "B", status: "concept" }, { id: "2", titel: "A", status: "afgesproken" }];
  const kopie = JSON.parse(JSON.stringify(doelen));
  sorteerDoelen(doelen);
  assert.deepEqual(doelen, kopie);
});
