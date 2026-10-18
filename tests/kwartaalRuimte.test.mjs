// Beschikbare ruimte en belasting.
//
// De meeste tests hier gaan over wat er níét mag gebeuren: onbekend dat nul
// wordt, een concept dat meetelt in een teamtotaal, uren die dubbel geteld
// worden, of een teamtotaal dat zegt dat het past terwijl één persoon het
// allemaal moet doen.

import test from "node:test";
import assert from "node:assert/strict";

import {
  bekendeUren,
  belastingInWeek,
  grootsteTekort,
  maakBeeld,
  overbelasting,
  ruimteInWeek,
  STATUSSEN,
  telsoortVan,
} from "../src/lib/app/kwartaal/ruimte.js";

const KWARTAAL = { van: "2027-W01", tot: "2027-W04" };

const persoon = (uid, naam, uren, periode = KWARTAAL) => ({
  uid,
  naam,
  ruimte: uren === null ? [] : [{ ...periode, urenPerWeek: uren }],
  bijgewerktOp: "2026-12-20",
});

const bijdrage = (id, uid, uren, status = "afgesproken", periode = KWARTAAL) => ({
  id,
  doelId: `doel-${id}`,
  uid,
  urenPerWeek: uren,
  status,
  ...periode,
});

/* -------------------------------------------------------------- statussen */

test("elke status zegt expliciet of hij meetelt", () => {
  STATUSSEN.forEach((s) => {
    const soort = telsoortVan(s);
    assert.ok(soort === null || soort === "afgesproken" || soort === "voorgesteld", `${s}: onduidelijk`);
  });
  assert.equal(telsoortVan("afgesproken"), "afgesproken");
  assert.equal(telsoortVan("ter-afstemming"), "voorgesteld");
  assert.equal(telsoortVan("concept"), null, "een concept is privé en bestaat voor het team niet");
  assert.equal(telsoortVan("verzonnen-status"), null, "wat de app niet kent, telt niet mee");
});

test("voorgesteld en afgesproken worden niet op één hoop gegooid", () => {
  const b = belastingInWeek([bijdrage("a", "u1", 3), bijdrage("b", "u1", 2, "ter-afstemming")], "2027-W02");
  assert.equal(b.afgesproken, 3);
  assert.equal(b.voorgesteld, 2);
});

/* ----------------------------------------------------- onbekend is niet nul */

test("een urenaantal is bekend of het is het niet", () => {
  assert.ok(bekendeUren(0));
  assert.ok(bekendeUren(2.5));
  [null, undefined, "", "3", NaN, Infinity, -1].forEach((w) => {
    assert.equal(bekendeUren(w), false, `${JSON.stringify(w)} hoort onbekend te zijn`);
  });
});

test("wie geen ruimte heeft ingevuld heeft geen nul ruimte", () => {
  const beeld = maakBeeld({ personen: [persoon("u1", "Ada", null)], bijdragen: [bijdrage("a", "u1", 3)] });
  const week = beeld.perPersoon[0].weken[0];
  assert.equal(week.ruimte, null);
  assert.equal(week.vrij, null, "zonder ruimte is er geen vrij");
  assert.equal(week.tekort, null, "en ook geen tekort");
  assert.ok(beeld.aannames.some((a) => a.includes("Ada")), "en het hoort in de aannames te staan");
});

test("een bijdrage zonder urenschatting telt niet mee en blijft zichtbaar", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 8)],
    bijdragen: [bijdrage("a", "u1", 3), bijdrage("b", "u1", null)],
  });
  const week = beeld.perPersoon[0].weken[0];
  assert.equal(week.afgesproken, 3, "de onbekende telt niet als nul en ook niet als iets");
  assert.deepEqual(week.onbekend, ["b"]);
  assert.ok(beeld.aannames.some((a) => a.toLowerCase().includes("urenschatting")));
});

/* ------------------------------------------------- per persoon en per week */

test("alleen overlappende weken tellen bij elkaar op", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 4, { van: "2027-W01", tot: "2027-W08" })],
    bijdragen: [
      bijdrage("vroeg", "u1", 3, "afgesproken", { van: "2027-W01", tot: "2027-W04" }),
      bijdrage("laat", "u1", 3, "afgesproken", { van: "2027-W05", tot: "2027-W08" }),
    ],
  });
  // Twee keer drie uur, maar nooit in dezelfde week: dus nergens een tekort.
  assert.deepEqual(overbelasting(beeld), []);
  assert.equal(beeld.perPersoon[0].weken[0].afgesproken, 3);
  assert.equal(beeld.perPersoon[0].weken[4].afgesproken, 3);
});

test("overbelasting wordt per persoon en per week gemeld", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 4, { van: "2027-W01", tot: "2027-W04" })],
    bijdragen: [
      bijdrage("a", "u1", 3),
      bijdrage("b", "u1", 3, "afgesproken", { van: "2027-W03", tot: "2027-W04" }),
    ],
  });
  const uit = overbelasting(beeld);
  assert.equal(uit.length, 1);
  assert.deepEqual(uit[0].weken, [
    { week: "2027-W03", tekort: 2 },
    { week: "2027-W04", tekort: 2 },
  ]);
});

test("een teamtotaal dat uitkomt verbergt niet dat één persoon overloopt", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 2), persoon("u2", "Bram", 8)],
    bijdragen: [bijdrage("a", "u1", 6)],
  });
  assert.equal(beeld.team[0].tekort, 0, "op teamniveau is er ruimte zat");
  assert.equal(overbelasting(beeld).length, 1, "maar Ada loopt vier uur over");
  assert.equal(overbelasting(beeld)[0].naam, "Ada");
});

/* ------------------------------------------------------- geen dubbeltelling */

test("een project telt alleen via de bijdragen van de mensen die eraan werken", () => {
  // Er is bewust geen urenveld op een doel. Drie mensen aan één project zijn
  // drie bijdragen; een projecttotaal ernaast zou hetzelfde werk twee keer
  // tellen zodra iemand een van de twee bijwerkt.
  const samen = { van: "2027-W01", tot: "2027-W04" };
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 8), persoon("u2", "Bram", 8), persoon("u3", "Cato", 8)],
    bijdragen: [
      { id: "b1", doelId: "project", uid: "u1", urenPerWeek: 3, status: "afgesproken", ...samen },
      { id: "b2", doelId: "project", uid: "u2", urenPerWeek: 2, status: "afgesproken", ...samen },
      { id: "b3", doelId: "project", uid: "u3", urenPerWeek: 2, status: "afgesproken", ...samen },
    ],
  });
  assert.equal(beeld.team[0].afgesproken, 7, "drie bijdragen aan één project zijn zeven uur, niet veertien");
});

test("dezelfde bijdrage twee keer aanleveren verandert het niet", () => {
  const b = bijdrage("a", "u1", 3);
  const een = maakBeeld({ personen: [persoon("u1", "Ada", 8)], bijdragen: [b] });
  const twee = maakBeeld({ personen: [persoon("u1", "Ada", 8)], bijdragen: [b, { ...b }] });
  assert.equal(een.team[0].afgesproken, 3);
  assert.equal(twee.team[0].afgesproken, 6, "twee losse regels zijn twee bijdragen — ontdubbelen hoort bij de opslag");
});

/* --------------------------------------------------- concepten blijven privé */

test("een concept telt niet mee in het teamtotaal", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 8)],
    bijdragen: [bijdrage("a", "u1", 3), bijdrage("geheim", "u1", 5, "concept")],
  });
  assert.equal(beeld.team[0].afgesproken, 3);
  assert.equal(beeld.perPersoon[0].weken[0].vrij, 5, "het concept neemt geen ruimte in beslag");
});

test("gepauzeerd, afgerond en gestopt vragen geen uren meer", () => {
  ["gepauzeerd", "afgerond", "gestopt"].forEach((status) => {
    const beeld = maakBeeld({ personen: [persoon("u1", "Ada", 8)], bijdragen: [bijdrage("a", "u1", 3, status)] });
    assert.equal(beeld.team[0].afgesproken, 0, `${status} hoort niet mee te tellen`);
  });
});

/* ------------------------------------------------------- ruimte van iemand */

test("de laatst ingevulde regel wint, en de botsing wordt gemeld", () => {
  const p = {
    uid: "u1",
    naam: "Ada",
    ruimte: [
      { van: "2027-W01", tot: "2027-W04", urenPerWeek: 8 },
      { van: "2027-W03", tot: "2027-W04", urenPerWeek: 2 },
    ],
  };
  assert.equal(ruimteInWeek(p.ruimte, "2027-W01").uren, 8);
  assert.equal(ruimteInWeek(p.ruimte, "2027-W03").uren, 2, "de vakantieweek hoort niet weer vol te lopen");
  const beeld = maakBeeld({ personen: [p], bijdragen: [] });
  assert.ok(beeld.aannames.some((a) => a.includes("overlapt")));
});

/* ----------------------------------------------- wat er bij het beeld hoort */

test("het beeld zegt wanneer de gegevens voor het laatst zijn ingevuld", () => {
  const beeld = maakBeeld({
    personen: [
      { ...persoon("u1", "Ada", 8), bijgewerktOp: "2026-12-01" },
      { ...persoon("u2", "Bram", 8), bijgewerktOp: "2027-01-05" },
    ],
    bijdragen: [],
  });
  assert.equal(beeld.oudsteInvoer, "2026-12-01");
  assert.equal(beeld.nieuwsteInvoer, "2027-01-05");
});

test("een onvolledig teamtotaal zegt dat het onvolledig is", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 8), persoon("u2", "Bram", null)],
    bijdragen: [bijdrage("a", "u1", 3)],
  });
  assert.equal(beeld.team[0].ruimteVolledig, false, "Bram heeft niets ingevuld");
  assert.equal(beeld.team[0].ruimte, 8, "en zijn ontbrekende ruimte wordt niet als nul meegeteld");
});

test("een bijdrage van iemand buiten het overzicht wordt gemeld", () => {
  const beeld = maakBeeld({ personen: [persoon("u1", "Ada", 8)], bijdragen: [bijdrage("a", "weg", 3)] });
  assert.ok(beeld.aannames.some((a) => a.includes("niet in dit overzicht")));
});

test("het grootste tekort wijst naar een week", () => {
  const beeld = maakBeeld({
    personen: [persoon("u1", "Ada", 4, { van: "2027-W01", tot: "2027-W04" })],
    bijdragen: [
      bijdrage("a", "u1", 5),
      bijdrage("b", "u1", 4, "afgesproken", { van: "2027-W02", tot: "2027-W02" }),
    ],
  });
  const piek = grootsteTekort(beeld);
  assert.equal(piek.week, "2027-W02");
  assert.equal(piek.tekort, 5);
});

test("zonder tekort is er geen tekort", () => {
  const beeld = maakBeeld({ personen: [persoon("u1", "Ada", 8)], bijdragen: [bijdrage("a", "u1", 3)] });
  assert.equal(grootsteTekort(beeld), null);
  assert.deepEqual(overbelasting(beeld), []);
});
