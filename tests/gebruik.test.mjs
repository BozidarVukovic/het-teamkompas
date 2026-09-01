// Tests voor het optellen van wat er met de app gebeurt.
//
// Dit getal stuurt productbeslissingen: welke situaties werken, welke adviezen
// mensen niet bruikbaar vinden. Klopt het niet, dan sturen we op ruis.
//
// Even belangrijk is wat er níet uit komt. Er staat een uid op elke sessie,
// maar die hoort nergens in de uitkomst terecht te komen behalve als aantal.

import test from "node:test";
import assert from "node:assert/strict";

import { vatGebruikSamen, maandVan, maandLabel, percentageBruikbaar } from "../src/lib/app/gebruik.js";

const LABELS = { "feedback-geven": "Ik wil feedback geven", irritatie: "Ik merk irritatie" };
const labelVan = (id) => LABELS[id] || id;

const SESSIES = [
  { uid: "u1", situatieId: "feedback-geven", bruikbaar: true, opgevraagdOp: new Date("2026-08-03") },
  { uid: "u1", situatieId: "feedback-geven", bruikbaar: false, toelichting: "Te algemeen.", opgevraagdOp: new Date("2026-08-14") },
  { uid: "u2", situatieId: "feedback-geven", bruikbaar: true, opgevraagdOp: new Date("2026-09-01") },
  { uid: "u2", situatieId: "irritatie", opgevraagdOp: new Date("2026-09-02") },
];

test("het totaal telt alle sessies, ook de niet beoordeelde", () => {
  const s = vatGebruikSamen(SESSIES, labelVan);
  assert.equal(s.totaal, 4);
  assert.equal(s.beoordeeld, 3);
});

test("het percentage gaat over wat beoordeeld is, niet over alles", () => {
  const s = vatGebruikSamen(SESSIES, labelVan);
  assert.equal(s.bruikbaar, 2);
  assert.equal(s.percentage, 67);
});

test("is er nog niets beoordeeld, dan is er geen percentage in plaats van nul procent", () => {
  const s = vatGebruikSamen([{ uid: "u1", situatieId: "irritatie" }], labelVan);
  assert.equal(s.percentage, null);
  assert.equal(percentageBruikbaar(0, 0), null);
});

test("de vaakst gekozen situatie staat bovenaan, met haar eigen percentage", () => {
  const s = vatGebruikSamen(SESSIES, labelVan);
  assert.equal(s.situaties[0].label, "Ik wil feedback geven");
  assert.equal(s.situaties[0].aantal, 3);
  assert.equal(s.situaties[0].percentage, 67);
  assert.equal(s.situaties[1].percentage, null, "een situatie zonder oordeel heeft geen percentage");
});

test("de volgorde wisselt niet tussen twee keer laden", () => {
  const a = vatGebruikSamen(SESSIES, labelVan).situaties.map((r) => r.situatieId);
  const b = vatGebruikSamen([...SESSIES].reverse(), labelVan).situaties.map((r) => r.situatieId);
  assert.deepEqual(a, b);
});

test("het verloop staat op maand, oud naar nieuw", () => {
  const s = vatGebruikSamen(SESSIES, labelVan);
  assert.deepEqual(s.maanden.map((m) => [m.maand, m.aantal]), [["2026-08", 2], ["2026-09", 2]]);
  assert.equal(s.maanden[0].label, "augustus 2026");
});

test("toelichtingen komen terug met de situatie erbij, nieuwste eerst", () => {
  const s = vatGebruikSamen(SESSIES, labelVan);
  assert.equal(s.toelichtingen.length, 1);
  assert.equal(s.toelichtingen[0].tekst, "Te algemeen.");
  assert.equal(s.toelichtingen[0].situatie, "Ik wil feedback geven");
});

test("een lege of alleen-spaties toelichting komt niet in beeld", () => {
  const s = vatGebruikSamen(
    [{ uid: "u1", situatieId: "irritatie", bruikbaar: false, toelichting: "   " }],
    labelVan
  );
  assert.deepEqual(s.toelichtingen, []);
});

test("mensen is een aantal, geen lijst — wie wat vroeg staat nergens in de uitkomst", () => {
  const s = vatGebruikSamen(SESSIES, labelVan);
  assert.equal(s.mensen, 2);
  assert.equal(typeof s.mensen, "number");

  const alles = JSON.stringify(s);
  assert.doesNotMatch(alles, /u1|u2/, "er mag geen uid in de samenvatting terechtkomen");
});

test("een Firestore-timestamp werkt net zo goed als een Date", () => {
  const stempel = { toDate: () => new Date("2026-08-20") };
  assert.equal(maandVan(stempel), "2026-08");
  const s = vatGebruikSamen([{ uid: "u1", situatieId: "irritatie", opgevraagdOp: stempel }], labelVan);
  assert.equal(s.maanden[0].maand, "2026-08");
});

test("een sessie zonder datum telt gewoon mee, maar niet in het verloop", () => {
  const s = vatGebruikSamen([{ uid: "u1", situatieId: "irritatie" }], labelVan);
  assert.equal(s.totaal, 1);
  assert.deepEqual(s.maanden, []);
});

test("zonder sessies komt er een lege samenvatting in plaats van een fout", () => {
  const s = vatGebruikSamen();
  assert.equal(s.totaal, 0);
  assert.equal(s.percentage, null);
  assert.deepEqual(s.situaties, []);
  assert.equal(maandLabel(null), "");
  assert.equal(maandVan("geen datum"), null);
});
