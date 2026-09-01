// Tests voor de initialen en voornamen die overal in de app opduiken.

import test from "node:test";
import assert from "node:assert/strict";

import { initialen, voornaam } from "../src/lib/app/naam.js";

test("twee naamdelen geven twee letters", () => {
  assert.equal(initialen("Bozidar Vukovic"), "BV");
});

test("één naamdeel geeft één letter", () => {
  assert.equal(initialen("Nikki"), "N");
});

test("meer dan twee delen blijven bij de eerste twee", () => {
  assert.equal(initialen("Anne Marie de Vries"), "AM");
});

test("zonder naam staat er een vraagteken en geen lege bol", () => {
  assert.equal(initialen(""), "?");
  assert.equal(initialen(null), "?");
  assert.equal(initialen("   "), "?");
});

test("wat tussen haakjes achter een naam staat, telt niet mee", () => {
  // "Bozidar (jij)" leverde eerst een bol op met "B(" erin.
  assert.equal(initialen("Bozidar (jij)"), "B");
  assert.equal(initialen("Nikki (extern)"), "N");
  assert.equal(initialen("Anne Marie (jij)"), "AM");
});

test("een naam met leestekens ervoor valt terug op het vraagteken", () => {
  assert.equal(initialen("(jij)"), "?");
  assert.equal(initialen("- -"), "?");
});

test("accenten en niet-latijnse letters tellen gewoon mee", () => {
  assert.equal(initialen("Émile Ødegaard"), "\u00c9\u00d8");
});

test("de voornaam is het eerste deel", () => {
  assert.equal(voornaam("Bozidar Vukovic"), "Bozidar");
  assert.equal(voornaam("Nikki"), "Nikki");
});

test("zonder naam valt de voornaam terug op wat je meegeeft", () => {
  assert.equal(voornaam("", "deze collega"), "deze collega");
  assert.equal(voornaam(null, "daar"), "daar");
  assert.equal(voornaam("  "), "");
});
