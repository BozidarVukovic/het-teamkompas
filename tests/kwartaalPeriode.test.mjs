// Rekenen met ISO-weken.
//
// Dit is de laag waar alle optellingen op rusten. Klopt een jaargrens of een
// week 53 niet, dan klopt er nergens iets, en dan is het antwoord "dit past
// erbij" niet verkeerd maar onzin.

import test from "node:test";
import assert from "node:assert/strict";

import {
  aantalWeken,
  gedeeldeWeken,
  geldigeWeek,
  inPeriode,
  omspannendePeriode,
  totVoor,
  verschoven,
  weekAfstand,
  weekBegin,
  weekPlus,
  weekSleutel,
  wekenIn,
} from "../src/lib/app/kwartaal/periode.js";

/* ------------------------------------------------------ weken en datums */

test("de maandag van een week is de maandag van die week", () => {
  // 2027-W01 begint op maandag 4 januari 2027.
  assert.equal(weekBegin("2027-W01").toISOString().slice(0, 10), "2027-01-04");
  assert.equal(weekBegin("2026-W42").toISOString().slice(0, 10), "2026-10-12");
});

test("een datum valt in de week waar hij in valt", () => {
  assert.equal(weekSleutel(new Date("2027-01-04T00:00:00Z")), "2027-W01");
  assert.equal(weekSleutel(new Date("2027-01-10T00:00:00Z")), "2027-W01");
  assert.equal(weekSleutel(new Date("2027-01-11T00:00:00Z")), "2027-W02");
});

test("de jaarwisseling hoort bij de week, niet bij het jaar", () => {
  // 1 januari 2027 is een vrijdag en hoort nog bij de laatste week van 2026.
  assert.equal(weekSleutel(new Date("2027-01-01T00:00:00Z")), "2026-W53");
  // 31 december 2024 is een dinsdag en hoort al bij week 1 van 2025.
  assert.equal(weekSleutel(new Date("2024-12-31T00:00:00Z")), "2025-W01");
});

test("week 53 bestaat alleen in de jaren die hem hebben", () => {
  assert.ok(geldigeWeek("2026-W53"), "2026 heeft 53 weken");
  assert.equal(geldigeWeek("2027-W53"), false, "2027 heeft er 52");
  assert.equal(weekBegin("2027-W53"), null);
});

test("wat geen week is, is geen week", () => {
  ["", null, undefined, "2027", "2027-W", "2027-W00", "2027-W54", "week 3", "2027-w05"].forEach((s) => {
    assert.equal(geldigeWeek(s), false, `${JSON.stringify(s)} hoort ongeldig te zijn`);
  });
});

test("optellen en aftrekken loopt over de jaargrens door", () => {
  assert.equal(weekPlus("2026-W52", 1), "2026-W53");
  assert.equal(weekPlus("2026-W53", 1), "2027-W01");
  assert.equal(weekPlus("2027-W01", -1), "2026-W53");
  assert.equal(weekAfstand("2026-W52", "2027-W02"), 3);
  assert.equal(weekAfstand("2027-W02", "2026-W52"), -3);
});

/* ------------------------------------------------------------- perioden */

test("een periode telt zijn begin en zijn eind mee", () => {
  assert.deepEqual(wekenIn({ van: "2027-W01", tot: "2027-W03" }), ["2027-W01", "2027-W02", "2027-W03"]);
  assert.equal(aantalWeken({ van: "2027-W01", tot: "2027-W01" }), 1);
});

test("een omgedraaide periode wordt niet stilletjes rechtgezet", () => {
  // "Van week 10 tot week 2" is een invoerfout, geen periode van 41 weken.
  assert.deepEqual(wekenIn({ van: "2027-W10", tot: "2027-W02" }), []);
  assert.deepEqual(wekenIn({ van: "2027-W10" }), []);
  assert.deepEqual(wekenIn(null), []);
});

test("een belachelijk lange periode levert niets op in plaats van een lijst van duizenden", () => {
  assert.deepEqual(wekenIn({ van: "2020-W01", tot: "2030-W01" }), []);
});

test("in een periode zitten is iets anders dan ernaast liggen", () => {
  const p = { van: "2027-W05", tot: "2027-W08" };
  assert.ok(inPeriode(p, "2027-W05"));
  assert.ok(inPeriode(p, "2027-W08"));
  assert.equal(inPeriode(p, "2027-W04"), false);
  assert.equal(inPeriode(p, "2027-W09"), false);
});

/* ---------------------------------------------------------- overlappen */

test("alleen weken die beide perioden delen tellen mee", () => {
  const a = { van: "2027-W01", tot: "2027-W06" };
  const b = { van: "2027-W05", tot: "2027-W10" };
  assert.deepEqual(gedeeldeWeken(a, b), ["2027-W05", "2027-W06"]);
});

test("twee klussen die elkaar niet raken delen niets", () => {
  // Twee keer drie uur per week past prima náást elkaar in de tijd. Dat is
  // precies waarom er per week wordt vergeleken en niet per kwartaal.
  const a = { van: "2027-W01", tot: "2027-W04" };
  const b = { van: "2027-W05", tot: "2027-W08" };
  assert.deepEqual(gedeeldeWeken(a, b), []);
});

test("de omspannende periode omvat alles wat erin zit", () => {
  const p = omspannendePeriode([
    { van: "2027-W05", tot: "2027-W08" },
    { van: "2027-W02", tot: "2027-W03" },
    { van: "2027-W07", tot: "2027-W12" },
  ]);
  assert.deepEqual(p, { van: "2027-W02", tot: "2027-W12" });
  assert.equal(omspannendePeriode([]), null);
  assert.equal(omspannendePeriode([{ van: "fout", tot: "ook fout" }]), null);
});

/* ------------------------------------------------- pauzeren en verschuiven */

test("pauzeren laat staan wat al achter de rug is", () => {
  // Pauzeren gaat over de nog geplande inzet, niet over wat er al in zit.
  assert.deepEqual(totVoor({ van: "2027-W01", tot: "2027-W10" }, "2027-W06"), { van: "2027-W01", tot: "2027-W05" });
});

test("pauzeren vóór de start laat niets over", () => {
  assert.equal(totVoor({ van: "2027-W05", tot: "2027-W10" }, "2027-W05"), null);
  assert.equal(totVoor({ van: "2027-W05", tot: "2027-W10" }, "2027-W01"), null);
});

test("verschuiven verplaatst, het verlengt niet", () => {
  const p = { van: "2027-W05", tot: "2027-W08" };
  const later = verschoven(p, 4);
  assert.deepEqual(later, { van: "2027-W09", tot: "2027-W12" });
  assert.equal(aantalWeken(later), aantalWeken(p), "de duur blijft gelijk");
});

test("verschuiven loopt netjes over de jaargrens", () => {
  // 2027 heeft 52 weken, dus week 51 plus twee is week 1 van 2028.
  assert.deepEqual(verschoven({ van: "2027-W51", tot: "2027-W52" }, 2), { van: "2028-W01", tot: "2028-W02" });
});

test("verschuiven slaat een week 53 niet over", () => {
  // 2026 heeft er wél 53. Wie hier twee weken optelt en in 2027 uitkomt,
  // verliest een hele week uit de planning zonder dat iemand het ziet.
  assert.deepEqual(verschoven({ van: "2026-W51", tot: "2026-W52" }, 2), { van: "2026-W53", tot: "2027-W01" });
});
