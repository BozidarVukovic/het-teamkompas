import test from "node:test";
import assert from "node:assert/strict";
import { KANSEN, WISSELTIJD, verschuif } from "../src/content/kansen.js";

test("er zijn vier kansen, elk met een eigen id", () => {
  assert.equal(KANSEN.length, 4);
  assert.equal(new Set(KANSEN.map((k) => k.id)).size, 4);
});

test("elke kans heeft een titel, een tekst en een bestemming", () => {
  for (const k of KANSEN) {
    assert.ok(k.titel && k.titel.length > 4, `titel ontbreekt bij ${k.id}`);
    assert.ok(k.tekst && k.tekst.length > 40, `tekst ontbreekt bij ${k.id}`);
    assert.match(k.href, /^\/[a-z0-9/-]+$/, `vreemde bestemming bij ${k.id}`);
  }
});

test("elke kans wijst naar een andere pagina", () => {
  assert.equal(new Set(KANSEN.map((k) => k.href)).size, 4);
});

test("de wisseltijd is zeven seconden", () => {
  assert.equal(WISSELTIJD, 7000);
});

test("verschuif loopt vooruit rond", () => {
  assert.equal(verschuif(0, 1, 4), 1);
  assert.equal(verschuif(3, 1, 4), 0);
});

test("verschuif loopt achteruit rond", () => {
  assert.equal(verschuif(0, -1, 4), 3);
  assert.equal(verschuif(2, -1, 4), 1);
});

test("verschuif houdt stand bij onzin", () => {
  assert.equal(verschuif(0, 1, 0), 0);
  assert.equal(verschuif(undefined, 1, 4), 1);
  assert.equal(verschuif(1, undefined, 4), 1);
});
