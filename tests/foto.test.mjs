import test from "node:test";
import assert from "node:assert/strict";
import { MAX_BESTAND, MAX_OPSLAG, bestandsfout, isFoto, snijvlak } from "../src/lib/app/foto.js";

test("snijvlak neemt het midden van een liggende foto", () => {
  assert.deepEqual(snijvlak(400, 300), { x: 50, y: 0, zijde: 300 });
});

test("snijvlak neemt het midden van een staande foto", () => {
  assert.deepEqual(snijvlak(300, 400), { x: 0, y: 50, zijde: 300 });
});

test("snijvlak op een vierkant laat alles staan", () => {
  assert.deepEqual(snijvlak(200, 200), { x: 0, y: 0, zijde: 200 });
});

test("snijvlak zonder maten geeft zijde 0 in plaats van NaN", () => {
  assert.equal(snijvlak(0, 0).zijde, 0);
  assert.equal(snijvlak(undefined, undefined).zijde, 0);
});

test("bestandsfout laat een gewone jpg door", () => {
  assert.equal(bestandsfout({ type: "image/jpeg", size: 2000000 }), null);
});

test("bestandsfout weigert een pdf", () => {
  assert.match(bestandsfout({ type: "application/pdf", size: 10 }), /jpg, png of webp/);
});

test("bestandsfout weigert heic met uitleg", () => {
  assert.match(bestandsfout({ type: "image/heic", size: 10 }), /HEIC/);
});

test("bestandsfout weigert een bestand boven de grens", () => {
  assert.match(bestandsfout({ type: "image/jpeg", size: MAX_BESTAND + 1 }), /12 MB/);
});

test("isFoto accepteert wat de app zelf wegschrijft", () => {
  assert.equal(isFoto("data:image/jpeg;base64,/9j/4AAQSkZJRg=="), true);
});

test("isFoto weigert alles wat geen jpeg-gegevensadres is", () => {
  assert.equal(isFoto(""), false);
  assert.equal(isFoto(null), false);
  assert.equal(isFoto(42), false);
  assert.equal(isFoto("https://elders.example/foto.jpg"), false);
  assert.equal(isFoto("data:text/html;base64,PHNjcmlwdD4="), false);
  assert.equal(isFoto("data:image/svg+xml;base64,PHN2Zz4="), false);
  assert.equal(isFoto("javascript:alert(1)"), false);
});

test("isFoto weigert een waarde die boven de opslaggrens uitkomt", () => {
  const teGroot = "data:image/jpeg;base64," + "A".repeat(MAX_OPSLAG);
  assert.equal(isFoto(teGroot), false);
});

test("isFoto weigert base64 met tekens die er niet in horen", () => {
  assert.equal(isFoto('data:image/jpeg;base64,abc" onerror="alert(1)'), false);
});
