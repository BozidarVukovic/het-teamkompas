// Tests voor de beheerdersrol.
//
// Er zijn twee manieren waarop dit stuk fout kan gaan, en allebei zijn ze
// vervelend: een team zonder beheerder (niemand kan er meer iets mee) en een
// lid dat zichzelf beheerder maakt (een securitygat). De tweede wordt door
// firestore.rules tegengehouden — daar staan aparte tests voor — maar het
// scherm hoort de knop ook niet te tonen.

import test from "node:test";
import assert from "node:assert/strict";

import {
  BEHEERDER,
  LID,
  aantalBeheerders,
  isBeheerder,
  lidUit,
  magRolWijzigen,
  magVertrekken,
  overdrachtstekst,
} from "../src/lib/app/teamrollen.js";

const lid = (uid, rol = LID, naam = uid) => ({ uid, rol, naam });

const TEAM = [lid("bo", BEHEERDER, "Bo"), lid("nikki"), lid("eva")];

/* --------------------------------------------------------------- basis */

test("lidUit vindt het juiste lid en anders null", () => {
  assert.equal(lidUit(TEAM, "eva").naam, "eva");
  assert.equal(lidUit(TEAM, "onbekend"), null);
  assert.equal(lidUit(TEAM, undefined), null);
  assert.equal(lidUit(undefined, "bo"), null);
});

test("een lid zonder rol geldt als gewoon lid, niet als beheerder", () => {
  assert.equal(isBeheerder([{ uid: "x" }], "x"), false);
  assert.equal(isBeheerder([{ uid: "x", rol: "" }], "x"), false);
  assert.equal(isBeheerder([{ uid: "x", rol: "Beheerder" }], "x"), false);
  assert.equal(isBeheerder(TEAM, "bo"), true);
});

test("aantalBeheerders telt alleen echte beheerders", () => {
  assert.equal(aantalBeheerders(TEAM), 1);
  assert.equal(aantalBeheerders([]), 0);
  assert.equal(aantalBeheerders([lid("a", BEHEERDER), lid("b", BEHEERDER)]), 2);
});

/* ------------------------------------------------------- rol toekennen */

test("een beheerder mag een teamgenoot beheerder maken", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "nikki",
    nieuweRol: BEHEERDER,
  });
  assert.equal(uitkomst.mag, true);
  assert.equal(uitkomst.reden, null);
});

test("een gewoon lid kan zichzelf niet beheerder maken", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "nikki",
    doelUid: "nikki",
    nieuweRol: BEHEERDER,
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /Alleen een beheerder/);
});

test("een gewoon lid kan ook een ander niet beheerder maken", () => {
  assert.equal(
    magRolWijzigen({ leden: TEAM, doorUid: "nikki", doelUid: "eva", nieuweRol: BEHEERDER }).mag,
    false
  );
});

test("iemand die niet in het team zit krijgt geen rol", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "vreemde",
    nieuweRol: BEHEERDER,
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /zit niet in dit team/);
});

test("een verzonnen rol wordt geweigerd", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "nikki",
    nieuweRol: "eigenaar",
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /bestaat niet/);
});

test("iemand die het al is, hoeft het niet nog een keer te worden", () => {
  const twee = [lid("bo", BEHEERDER), lid("nikki", BEHEERDER)];
  const uitkomst = magRolWijzigen({
    leden: twee,
    doorUid: "bo",
    doelUid: "nikki",
    nieuweRol: BEHEERDER,
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /is al beheerder/);
});

/* -------------------------------------------------------- rol teruggeven */

test("de enige beheerder kan de rol niet teruggeven", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "bo",
    nieuweRol: LID,
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /Maak eerst iemand anders beheerder/);
});

test("met twee beheerders kun je de rol wel teruggeven", () => {
  const twee = [lid("bo", BEHEERDER), lid("nikki", BEHEERDER), lid("eva")];
  assert.equal(
    magRolWijzigen({ leden: twee, doorUid: "bo", doelUid: "bo", nieuweRol: LID }).mag,
    true
  );
});

test("een beheerder mag een andere beheerder terugzetten, maar nooit de laatste", () => {
  const twee = [lid("bo", BEHEERDER), lid("nikki", BEHEERDER)];
  assert.equal(
    magRolWijzigen({ leden: twee, doorUid: "nikki", doelUid: "bo", nieuweRol: LID }).mag,
    true
  );

  const een = [lid("bo", BEHEERDER), lid("nikki")];
  const uitkomst = magRolWijzigen({ leden: een, doorUid: "bo", doelUid: "bo", nieuweRol: LID });
  assert.equal(uitkomst.mag, false);
});

test("een lid dat al lid is, wordt niet nog eens lid gemaakt", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "eva",
    nieuweRol: LID,
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /al gewoon lid/);
});

/* ------------------------------------------------------------ vertrekken */

test("een gewoon lid mag altijd vertrekken", () => {
  assert.equal(magVertrekken({ leden: TEAM, uid: "eva" }).mag, true);
});

test("de enige beheerder mag niet vertrekken zolang er anderen zijn", () => {
  const uitkomst = magVertrekken({ leden: TEAM, uid: "bo" });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /Maak eerst iemand anders beheerder/);
});

test("de beheerder die als enige over is mag wel weg — dat is opruimen", () => {
  assert.equal(magVertrekken({ leden: [lid("bo", BEHEERDER)], uid: "bo" }).mag, true);
});

test("met twee beheerders mag er eentje vertrekken", () => {
  const twee = [lid("bo", BEHEERDER), lid("nikki", BEHEERDER), lid("eva")];
  assert.equal(magVertrekken({ leden: twee, uid: "bo" }).mag, true);
});

/* --------------------------------------------------------------- tekst */

test("de overdrachtstekst noemt de grens van de rol", () => {
  const tekst = overdrachtstekst("Nikki");
  assert.match(tekst, /Nikki/);
  assert.match(tekst, /geen inzage in de profielen/);
  assert.match(tekst, /blijft zelf ook beheerder/);
});

test("de overdrachtstekst zegt het anders als je de rol zelf opgeeft", () => {
  const tekst = overdrachtstekst("Nikki", true);
  assert.match(tekst, /gewoon lid van dit team/);
  assert.doesNotMatch(tekst, /blijft zelf ook beheerder/);
});

test("zonder naam blijft de tekst leesbaar", () => {
  assert.match(overdrachtstekst(""), /deze collega kan dan/);
});
