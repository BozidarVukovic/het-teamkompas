// Tests voor de initialen en voornamen die overal in de app opduiken.

import test from "node:test";
import assert from "node:assert/strict";

import { initialen, korteNamen, voornaam } from "../src/lib/app/naam.js";

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

// --------------------------------------------------------------- korteNamen
//
// Twee mensen die allebei "Jacqueline" heten leverden op het startscherm twee
// identieke labels op. Wie dan de verkeerde bol aantikt, krijgt advies over de
// verkeerde collega.

test("een unieke voornaam blijft gewoon de voornaam", () => {
  assert.deepEqual(korteNamen(["Anouk Verlaan", "Dennis Kool"]), ["Anouk", "Dennis"]);
});

test("botsende voornamen krijgen de letter van het laatste naamdeel", () => {
  assert.deepEqual(
    korteNamen(["Jacqueline Otten", "Jacqueline Bergman"]),
    ["Jacqueline O.", "Jacqueline B."]
  );
});

test("het laatste naamdeel telt, niet het tweede", () => {
  assert.deepEqual(
    korteNamen(["Anne-Marie de Vries", "Anne-Marie Jansen"]),
    ["Anne-Marie V.", "Anne-Marie J."]
  );
});

test("wie geen achternaam heeft houdt de kale voornaam, en verschilt zo alsnog", () => {
  assert.deepEqual(korteNamen(["Jacqueline", "Jacqueline O."]), ["Jacqueline", "Jacqueline O."]);
});

test("alleen wie botst wordt langer; de rest blijft kort", () => {
  assert.deepEqual(
    korteNamen(["Jacqueline Otten", "Jacqueline Bergman", "Yvon Smit"]),
    ["Jacqueline O.", "Jacqueline B.", "Yvon"]
  );
});

test("exact dezelfde volledige naam blijft gelijk; daar helpt niets tegen", () => {
  assert.deepEqual(korteNamen(["Jan Jansen", "Jan Jansen"]), ["Jan J.", "Jan J."]);
});

test("zonder naam valt het label terug op wat je meegeeft", () => {
  assert.deepEqual(korteNamen(["", null], "Collega"), ["Collega", "Collega"]);
});

test("een lege lijst geeft een lege lijst", () => {
  assert.deepEqual(korteNamen(), []);
  assert.deepEqual(korteNamen([]), []);
});

test("de uitvoer is even lang als de invoer en houdt de volgorde", () => {
  const namen = ["Zoe Baas", "Aart Klaassen", "Zoe Vries"];
  const uit = korteNamen(namen);
  assert.equal(uit.length, namen.length);
  assert.deepEqual(uit, ["Zoe B.", "Aart", "Zoe V."]);
});
