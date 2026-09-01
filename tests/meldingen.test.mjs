// Tests voor wat er op het scherm komt als een actie mislukt.
//
// Negen knoppen in de app deden bij een fout helemaal niets zichtbaars. De zin
// die er nu komt moet twee dingen doen: zeggen wat er misging en wat je nu kunt
// doen. Een melding die geen van beide doet, is net zo nutteloos als geen
// melding.

import test from "node:test";
import assert from "node:assert/strict";

import { omschrijfFout } from "../src/lib/app/meldingen.js";

test("een bekende foutcode krijgt een eigen uitleg", () => {
  assert.match(omschrijfFout({ code: "unavailable" }), /geen verbinding/i);
  assert.match(omschrijfFout({ code: "permission-denied" }), /geen toegang/i);
  assert.match(omschrijfFout({ code: "unauthenticated" }), /uitgelogd/i);
});

test("een onbekende fout noemt wat je probeerde te doen", () => {
  assert.equal(
    omschrijfFout({ code: "iets-nieuws" }, "je naam bewaren"),
    "Je naam bewaren is niet gelukt. Probeer het zo nog eens."
  );
});

test("zonder actienaam blijft er nog steeds een bruikbare zin over", () => {
  assert.match(omschrijfFout({}), /niet gelukt/i);
  assert.match(omschrijfFout(null), /niet gelukt/i);
  assert.match(omschrijfFout(), /niet gelukt/i);
});

test("een netwerkfout zonder code wordt herkend", () => {
  const fout = new TypeError("Failed to fetch");
  assert.match(omschrijfFout(fout, "je profiel opslaan"), /geen verbinding/i);
});

test("elke melding zegt wat je nu kunt doen", () => {
  const gevallen = [
    omschrijfFout({ code: "unavailable" }),
    omschrijfFout({ code: "permission-denied" }),
    omschrijfFout({ code: "unauthenticated" }),
    omschrijfFout({ code: "not-found" }),
    omschrijfFout({ code: "resource-exhausted" }),
    omschrijfFout({}, "iets doen"),
  ];

  gevallen.forEach((zin) => {
    assert.match(
      zin,
      /probeer|ververs|log opnieuw|wacht|kijk/i,
      `"${zin}" zegt niet wat je nu kunt doen`
    );
  });
});

test("er staan geen excuses of foutcodes in", () => {
  const zinnen = Object.values({
    a: omschrijfFout({ code: "unavailable" }),
    b: omschrijfFout({ code: "permission-denied" }),
    c: omschrijfFout({ code: "aborted" }),
    d: omschrijfFout({}, "je naam bewaren"),
  });

  zinnen.forEach((zin) => {
    assert.doesNotMatch(zin, /sorry|excuus|onze excuses/i, `"${zin}" verontschuldigt zich`);
    assert.doesNotMatch(zin, /error|failed|exception|\bcode\b/i, `"${zin}" bevat techniek`);
    assert.doesNotMatch(zin, /er is iets misgegaan/i, `"${zin}" zegt niets`);
  });
});
