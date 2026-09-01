// Tests voor de opschoning van een profielvoorstel.
//
// Een facilitator leest het Insights-profiel van iemand anders in en zet dat
// klaar. Wat hier doorheen komt, komt in de database te staan op naam van die
// persoon — op een plek waar een beheerder bij kan tot diegene het overneemt of
// weggooit. Er stond geen enkele test op.

import test from "node:test";
import assert from "node:assert/strict";

import { schoonVoorstel } from "../src/lib/app/voorstelOpschonen.js";
import { SECTIE_IDS } from "../src/data/app/handleiding.js";
import { KLEUR_IDS } from "../src/lib/app/insights.js";

const SECTIE = SECTIE_IDS[0];

test("bekende secties blijven staan", () => {
  const uit = schoonVoorstel({ teksten: { [SECTIE]: "Ik werk graag vlot." } });
  assert.equal(uit.teksten[SECTIE], "Ik werk graag vlot.");
});

test("een sectie die we niet kennen, komt de database niet in", () => {
  const uit = schoonVoorstel({ teksten: { verzonnen: "Van alles", [SECTIE]: "Iets" } });
  assert.deepEqual(Object.keys(uit.teksten), [SECTIE]);
});

test("een onbekende kleur wordt niet overgenomen", () => {
  const uit = schoonVoorstel({ voorkeurskleur: "paars", tweedeKleur: KLEUR_IDS[0] });
  assert.equal(uit.voorkeurskleur, null);
  assert.equal(uit.tweedeKleur, KLEUR_IDS[0]);
});

test("lange tekst wordt afgekapt", () => {
  const uit = schoonVoorstel({ teksten: { [SECTIE]: "a".repeat(5000) } });
  assert.equal(uit.teksten[SECTIE].length, 1000);
});

test("witruimte telt niet als tekst", () => {
  const uit = schoonVoorstel({ teksten: { [SECTIE]: "   \n  " } });
  assert.deepEqual(uit.teksten, {});
});

test("er komen geen andere velden doorheen dan deze vier", () => {
  const uit = schoonVoorstel({
    voorkeurskleur: KLEUR_IDS[0],
    teksten: {},
    // Alles hieronder hoort te verdwijnen.
    uid: "iemand-anders",
    rol: "beheerder",
    ruweTekst: "de hele pdf",
  });
  assert.deepEqual(Object.keys(uit).sort(), ["teksten", "tweedeKleur", "type", "voorkeurskleur"]);
});

test("zonder gegevens komt er een leeg voorstel in plaats van een fout", () => {
  const uit = schoonVoorstel({});
  assert.equal(uit.voorkeurskleur, null);
  assert.deepEqual(uit.teksten, {});
});
