import test from "node:test";
import assert from "node:assert/strict";

import { bepaalThema, leesStand, STANDEN } from "../src/lib/app/thema.js";

test("een eigen keuze wint van het apparaat", () => {
  assert.equal(bepaalThema("donker", false), "donker");
  assert.equal(bepaalThema("licht", true), "licht");
});

test("systeem volgt het apparaat", () => {
  assert.equal(bepaalThema("systeem", true), "donker");
  assert.equal(bepaalThema("systeem", false), "licht");
});

test("onzin valt terug op systeem, en daarmee op licht", () => {
  assert.equal(bepaalThema("paars", false), "licht");
  assert.equal(bepaalThema(null, false), "licht");
  assert.equal(bepaalThema(undefined, true), "donker");
  assert.equal(leesStand("paars"), "systeem");
});

test("er komt nooit iets anders uit dan licht of donker", () => {
  for (const stand of [...STANDEN.map((s) => s.id), "", "SYSTEEM", 7]) {
    for (const apparaat of [true, false]) {
      assert.ok(["licht", "donker"].includes(bepaalThema(stand, apparaat)));
    }
  }
});
