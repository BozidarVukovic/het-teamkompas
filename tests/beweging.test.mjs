import test from "node:test";
import assert from "node:assert/strict";

import { NA_ANTWOORD, wachttijd } from "../src/lib/beweging.js";

test("wie beweging wil, krijgt de pauze waarin hij zijn keuze ziet", () => {
  assert.equal(wachttijd(true), NA_ANTWOORD);
});

test("wie beweging uit heeft staan, gaat meteen door", () => {
  assert.equal(wachttijd(false), 0);
});

test("de pauze is kort genoeg om niet als wachten te voelen", () => {
  assert.ok(NA_ANTWOORD > 0 && NA_ANTWOORD <= 400);
});
