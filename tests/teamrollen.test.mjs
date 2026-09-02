// Tests voor de rollen in een team.
//
// Er zijn drie manieren waarop dit stuk fout kan gaan, en alle drie zijn ze
// vervelend: een team zonder beheerder (niemand kan er nog iets mee), een lid
// dat zichzelf beheerder maakt (een securitygat), en een begeleider die toch
// als teamgenoot meetelt (dan staat de facilitator tussen de mensen van de
// klant). Het tweede wordt door firestore.rules tegengehouden — daar staan
// aparte tests voor — maar het scherm hoort de knop ook niet te tonen.

import test from "node:test";
import assert from "node:assert/strict";

import {
  BEGELEIDER,
  BEHEERDER,
  LID,
  aantalBeheerders,
  begeleiders,
  begeleidingstekst,
  deelnemers,
  doetMee,
  isBegeleider,
  lidUit,
  magBeheren,
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
  assert.equal(magBeheren([{ uid: "x" }], "x"), false);
  assert.equal(magBeheren([{ uid: "x", rol: "" }], "x"), false);
  assert.equal(magBeheren([{ uid: "x", rol: "Beheerder" }], "x"), false);
  assert.equal(magBeheren(TEAM, "bo"), true);
});

test("een begeleider mag het team beheren", () => {
  const met = [lid("bo", BEGELEIDER), lid("nikki")];
  assert.equal(magBeheren(met, "bo"), true);
  assert.equal(isBegeleider(met, "bo"), true);
  assert.equal(isBegeleider(TEAM, "bo"), false);
});

test("aantalBeheerders telt beheerders en begeleiders", () => {
  assert.equal(aantalBeheerders(TEAM), 1);
  assert.equal(aantalBeheerders([]), 0);
  assert.equal(aantalBeheerders([lid("a", BEHEERDER), lid("b", BEGELEIDER)]), 2);
  assert.equal(aantalBeheerders([lid("a"), lid("b")]), 0);
});

/* -------------------------------------------------- wie hoort erbij */

test("een begeleider doet niet mee als teamgenoot", () => {
  assert.equal(doetMee(lid("bo", BEGELEIDER)), false);
  assert.equal(doetMee(lid("bo", BEHEERDER)), true);
  assert.equal(doetMee(lid("bo")), true);
  assert.equal(doetMee({ uid: "x" }), true);
});

test("deelnemers en begeleiders splitsen het team", () => {
  const met = [lid("bo", BEGELEIDER, "Bo"), lid("nikki"), lid("eva", BEHEERDER)];
  assert.deepEqual(deelnemers(met).map((l) => l.uid), ["nikki", "eva"]);
  assert.deepEqual(begeleiders(met).map((l) => l.uid), ["bo"]);
  assert.deepEqual(deelnemers([]), []);
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

test("een begeleider mag dat ook — hij beheert het team", () => {
  const met = [lid("bo", BEGELEIDER), lid("nikki")];
  assert.equal(
    magRolWijzigen({ leden: met, doorUid: "bo", doelUid: "nikki", nieuweRol: BEHEERDER }).mag,
    true
  );
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

test("een gewoon lid kan zichzelf ook geen begeleider maken", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "nikki",
    doelUid: "nikki",
    nieuweRol: BEGELEIDER,
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

/* ------------------------------------------------------------ begeleiden */

test("een beheerder kan zichzelf op begeleiden zetten", () => {
  const twee = [lid("bo", BEHEERDER), lid("nikki", BEHEERDER), lid("eva")];
  assert.equal(
    magRolWijzigen({ leden: twee, doorUid: "bo", doelUid: "bo", nieuweRol: BEGELEIDER }).mag,
    true
  );
});

test("begeleiden kost het team geen beheer, dus de enige beheerder mag het ook", () => {
  // Van beheerder naar begeleider verandert niets aan wie het team kan
  // beheren; alleen aan of je meedoet. Dat mag dus ook als je de enige bent —
  // en dat is precies het geval van de facilitator die net een team opzette.
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "bo",
    nieuweRol: BEGELEIDER,
  });
  assert.equal(uitkomst.mag, true);
});

test("je kunt een ander niet tot begeleider bestempelen", () => {
  const uitkomst = magRolWijzigen({
    leden: TEAM,
    doorUid: "bo",
    doelUid: "nikki",
    nieuweRol: BEGELEIDER,
  });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /geeft zelf aan/);
});

test("een begeleider bepaalt zelf wanneer hij weer meedoet", () => {
  const met = [lid("bo", BEGELEIDER), lid("nikki", BEHEERDER)];
  assert.equal(
    magRolWijzigen({ leden: met, doorUid: "nikki", doelUid: "bo", nieuweRol: BEHEERDER }).mag,
    false
  );
  // Zichzelf terugzetten kan wel.
  assert.equal(
    magRolWijzigen({ leden: met, doorUid: "bo", doelUid: "bo", nieuweRol: BEHEERDER }).mag,
    true
  );
});

test("een begeleider kan wel uit het beheer worden gezet", () => {
  const met = [lid("bo", BEGELEIDER), lid("nikki", BEHEERDER)];
  assert.equal(
    magRolWijzigen({ leden: met, doorUid: "nikki", doelUid: "bo", nieuweRol: LID }).mag,
    true
  );
});

test("de enige begeleider kan zichzelf niet tot gewoon lid maken", () => {
  const met = [lid("bo", BEGELEIDER), lid("nikki")];
  const uitkomst = magRolWijzigen({ leden: met, doorUid: "bo", doelUid: "bo", nieuweRol: LID });
  assert.equal(uitkomst.mag, false);
  assert.match(uitkomst.reden, /Maak eerst iemand anders beheerder/);
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
  assert.equal(
    magRolWijzigen({ leden: een, doorUid: "bo", doelUid: "bo", nieuweRol: LID }).mag,
    false
  );
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

test("de enige begeleider mag ook niet vertrekken", () => {
  const met = [lid("bo", BEGELEIDER), lid("nikki"), lid("eva")];
  assert.equal(magVertrekken({ leden: met, uid: "bo" }).mag, false);
});

test("de beheerder die als enige over is mag wel weg — dat is opruimen", () => {
  assert.equal(magVertrekken({ leden: [lid("bo", BEHEERDER)], uid: "bo" }).mag, true);
  assert.equal(magVertrekken({ leden: [lid("bo", BEGELEIDER)], uid: "bo" }).mag, true);
});

test("met twee beheerders mag er eentje vertrekken", () => {
  const twee = [lid("bo", BEGELEIDER), lid("nikki", BEHEERDER), lid("eva")];
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

test("de begeleidingstekst waarschuwt over wat je deelt", () => {
  const tekst = begeleidingstekst(true, "HR Beleid", 12);
  assert.match(tekst, /HR Beleid/);
  assert.match(tekst, /12 punten/);
  assert.match(tekst, /wordt verwijderd/);
  assert.match(tekst, /niet aan mee/);
});

test("deelt er niets, dan staat er ook niets over verwijderen", () => {
  const tekst = begeleidingstekst(true, "HR Beleid", 0);
  assert.doesNotMatch(tekst, /verwijderd/);
  assert.match(tekst, /altijd weer omzetten/);
});

test("terug naar meedoen zegt wat er dan verandert", () => {
  const tekst = begeleidingstekst(false, "HR Beleid");
  assert.match(tekst, /doet daarna gewoon mee/);
  assert.match(tekst, /blijft het team beheren/);
});
