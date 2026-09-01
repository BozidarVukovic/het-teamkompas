// Tests voor de vraag: hoort deze persoon het welkomscherm te zien?
//
// Dit ging mis in de praktijk. Wie opnieuw inlogde kwam uit bij "Bij een ander
// team aansluiten" in plaats van op Start — een scherm dat eruitziet alsof er
// iets fout is gegaan, terwijl er niets aan de hand was.

import test from "node:test";
import assert from "node:assert/strict";

import { welkombestemming } from "../src/lib/app/welkom.js";

const TEAM = { orgId: "org1", teamId: "teamA", teamNaam: "Directie" };

test("zonder team is het welkomscherm de enige weg vooruit", () => {
  assert.equal(welkombestemming({ lidmaatschappen: [] }), null);
});

test("wie al een team heeft, hoort op Start uit te komen", () => {
  assert.equal(welkombestemming({ lidmaatschappen: [TEAM] }), "/app");
});

test("wie er zelf om vroeg, mag erbij", () => {
  assert.equal(welkombestemming({ lidmaatschappen: [TEAM], extra: true }), null);
});

test("een openstaande uitnodiging wil je kunnen aannemen", () => {
  assert.equal(welkombestemming({ lidmaatschappen: [TEAM], uitnodigingscode: "ABCD-1234" }), null);
});

test("zonder gegevens gaat er niets kapot", () => {
  assert.equal(welkombestemming(), null);
  assert.equal(welkombestemming({}), null);
  assert.equal(welkombestemming({ lidmaatschappen: null }), null);
});
