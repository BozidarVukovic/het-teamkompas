// Tests voor het label dat zegt wie een punt kan zien.
//
// Dit label is een belofte. Zegt het "Privé" terwijl het gedeeld is, dan
// vertelt de app iemand iets over zijn eigen gegevens dat niet waar is.

import test from "node:test";
import assert from "node:assert/strict";

import { zichtbaarheidVan } from "../src/lib/app/zichtbaarheid.js";

const THUIS = { orgId: "org1", teamId: "teamA", teamNaam: "Directie" };
const WERK = { orgId: "org1", teamId: "teamB", teamNaam: "Projectteam" };

test("niets gedeeld heet privé", () => {
  const z = zichtbaarheidVan({ gedeeldMet: [] }, [THUIS]);
  assert.equal(z.gedeeld, false);
  assert.equal(z.label, "Privé");
});

test("een punt zonder gedeeldMet is ook privé", () => {
  assert.equal(zichtbaarheidVan({}, [THUIS]).label, "Privé");
  assert.equal(zichtbaarheidVan(null, [THUIS]).label, "Privé");
});

test("gedeeld met één team noemt dat team bij naam", () => {
  const z = zichtbaarheidVan({ gedeeldMet: ["org1/teamA"] }, [THUIS, WERK]);
  assert.equal(z.gedeeld, true);
  assert.equal(z.label, "Gedeeld met Directie");
});

test("gedeeld met meer teams telt ze", () => {
  const z = zichtbaarheidVan({ gedeeldMet: ["org1/teamA", "org1/teamB"] }, [THUIS, WERK]);
  assert.equal(z.aantal, 2);
  assert.equal(z.label, "Gedeeld met 2 teams");
});

test("delen met een team dat je hebt verlaten telt niet meer mee", () => {
  const z = zichtbaarheidVan({ gedeeldMet: ["org1/teamB"] }, [THUIS]);
  assert.equal(z.gedeeld, false);
  assert.equal(z.label, "Privé");
});

test("zonder teams is alles privé", () => {
  assert.equal(zichtbaarheidVan({ gedeeldMet: ["org1/teamA"] }, []).label, "Privé");
  assert.equal(zichtbaarheidVan({ gedeeldMet: ["org1/teamA"] }).label, "Privé");
});

test("een team zonder naam krijgt een leesbaar label", () => {
  const z = zichtbaarheidVan({ gedeeldMet: ["org1/teamA"] }, [{ orgId: "org1", teamId: "teamA" }]);
  assert.equal(z.label, "Gedeeld met je team");
});
