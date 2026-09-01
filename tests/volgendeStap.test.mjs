// Tests voor de volgorde van stappen in de samenwerkomgeving.
//
// Deze logica bepaalt op elk scherm wat er nu aan de beurt is. Gaat hier iets
// mis, dan wijst de app de gebruiker de verkeerde kant op — of erger, naar een
// scherm waar niets te halen valt.

import test from "node:test";
import assert from "node:assert/strict";

import { AANTAL_STAPPEN, bepaalVolgendeStap } from "../src/lib/app/volgendeStap.js";
import { kenmerk as kenmerkUitData } from "../src/data/app/kenmerken.js";

const TEAM = { orgId: "org1", teamId: "teamA", teamNaam: "Thuis" };
const SLEUTEL = "org1/teamA";

// Het eerste geldige antwoord bij dit kenmerk. "snel" bestaat alleen bij tempo,
// en een antwoord dat niet bij het kenmerk hoort telt nergens mee.
const kenmerk = (id, gedeeld = false, bevestigd = null) => ({
  kenmerkId: id,
  waarde: kenmerkUitData(id).opties[0].id,
  bevestigd,
  gedeeldMet: gedeeld ? [SLEUTEL] : [],
});

const ik = { uid: "ik", naam: "Ik" };
const ander = { uid: "ander", naam: "Ander" };

test("zonder ingevulde kenmerken begin je bij je profiel", () => {
  const stap = bepaalVolgendeStap({ kenmerken: [], actiefTeam: TEAM, eigenUid: "ik" });
  assert.equal(stap.id, "profiel");
  assert.equal(stap.nummer, 1);
  assert.equal(stap.naar, "/app/profiel");
  assert.equal(stap.klaar, false);
});

test("een weggestreept kenmerk telt niet als ingevuld", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", false, "nee")],
    actiefTeam: TEAM,
    eigenUid: "ik",
  });
  assert.equal(stap.id, "profiel");
});

test("ingevuld maar niets gedeeld: delen is de volgende stap", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo"), kenmerk("contact")],
    actiefTeam: TEAM,
    leden: [ik, ander],
    eigenUid: "ik",
  });
  assert.equal(stap.id, "delen");
  assert.equal(stap.nummer, 2);
  assert.equal(stap.actie, "deelAlles");
  assert.equal(stap.naar, undefined, "delen mag geen link zijn maar een handeling");
  assert.match(stap.knop, /Thuis/);
});

test("gedeeld maar alleen in het team: nodig je team uit, met de code erbij", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik],
    eigenUid: "ik",
    teamcode: "ABCD-1234",
  });
  assert.equal(stap.id, "uitnodigen");
  assert.equal(stap.nummer, 3);
  assert.equal(stap.code, "ABCD-1234");
});

test("teamgenoten die nog niets deelden geven een eigen stap", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik, ander],
    gedeeldPerUid: {},
    eigenUid: "ik",
  });
  assert.equal(stap.id, "wachten");
  assert.equal(stap.nummer, 3);
});

test("wat je zelf deelt maakt je niet tot een teamgenoot die deelt", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik, ander],
    gedeeldPerUid: { ik: { uid: "ik" } },
    eigenUid: "ik",
  });
  assert.equal(stap.id, "wachten", "de eigen gedeelde kopie telt mee als die van een ander");
});

test("zodra een ander deelt, is advies vragen aan de beurt", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik, ander],
    gedeeldPerUid: { ander: { uid: "ander" } },
    eigenUid: "ik",
  });
  assert.equal(stap.id, "klaar");
  assert.equal(stap.klaar, true);
  assert.equal(stap.naar, "/app/samenwerken");
  assert.ok(stap.nummer > AANTAL_STAPPEN, "de laatste stap hoort buiten de teller te vallen");
});

test("delen met een ander team telt niet mee voor dit team", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [{ kenmerkId: "tempo", waarde: "snel", gedeeldMet: ["org1/teamB"] }],
    actiefTeam: TEAM,
    leden: [ik, ander],
    eigenUid: "ik",
  });
  assert.equal(stap.id, "delen");
});

test("elke stap heeft een korte en een lange tekst en een knop", () => {
  const situaties = [
    { kenmerken: [], leden: [] },
    { kenmerken: [kenmerk("tempo")], leden: [ik, ander] },
    { kenmerken: [kenmerk("tempo", true)], leden: [ik] },
    { kenmerken: [kenmerk("tempo", true)], leden: [ik, ander], gedeeldPerUid: {} },
    { kenmerken: [kenmerk("tempo", true)], leden: [ik, ander], gedeeldPerUid: { ander: {} } },
  ];
  situaties.forEach((s) => {
    const stap = bepaalVolgendeStap({ ...s, actiefTeam: TEAM, eigenUid: "ik" });
    assert.ok(stap.kop && stap.kop.length > 4, `${stap.id} mist een kop`);
    assert.ok(stap.uitleg && stap.uitleg.length > 30, `${stap.id} mist uitleg`);
    assert.ok(stap.kort && stap.kort.length > 20, `${stap.id} mist een korte tekst`);
    assert.ok(stap.knop && stap.knop.length > 3, `${stap.id} mist een knop`);
    assert.ok(stap.naar || stap.actie, `${stap.id} doet niets`);
  });
});

test("zonder team valt het terug op de eerste stap zonder te breken", () => {
  const stap = bepaalVolgendeStap({});
  assert.equal(stap.id, "profiel");
});

test("de uitkomst is deterministisch", () => {
  const invoer = {
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik, ander],
    gedeeldPerUid: { ander: {} },
    eigenUid: "ik",
  };
  assert.deepEqual(bepaalVolgendeStap(invoer), bepaalVolgendeStap(invoer));
});

/* ------------------------------ profielen die een beheerder heeft toegevoegd */

test("een door de beheerder toegevoegd profiel telt als teamgenoot die deelt", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik],
    eigenUid: "ik",
    extraProfielen: 1,
  });
  assert.equal(stap.id, "klaar", "met een toegevoegd profiel valt er advies te vragen");
});

test("zonder toegevoegde profielen blijft het uitnodigen", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik],
    eigenUid: "ik",
    extraProfielen: 0,
  });
  assert.equal(stap.id, "uitnodigen");
});

test("toegevoegde profielen tellen mee in het aantal teamgenoten", () => {
  const stap = bepaalVolgendeStap({
    kenmerken: [kenmerk("tempo", true)],
    actiefTeam: TEAM,
    leden: [ik, ander],
    gedeeldPerUid: {},
    eigenUid: "ik",
    extraProfielen: 2,
  });
  assert.equal(stap.id, "klaar");
});
