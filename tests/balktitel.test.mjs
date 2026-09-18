import test from 'node:test';
import assert from 'node:assert/strict';
import { titelTekst, kortTitel, chroomHoogte } from '../src/lib/app/balktitel.js';

test('de tekst van een kop wordt een regel', () => {
  assert.equal(titelTekst({ textContent: '  Samen verder\n   in het werk  ' }), 'Samen verder in het werk');
});

test('geen kop levert geen titel op', () => {
  assert.equal(titelTekst(null), '');
  assert.equal(titelTekst({}), '');
});

test('een titel die past blijft heel', () => {
  assert.equal(kortTitel('Mijn handleiding'), 'Mijn handleiding');
});

test('een lange titel wordt op een woordgrens afgekapt', () => {
  const uit = kortTitel('Hoe wil je je profiel invullen en wat gebeurt er daarna precies', 30);
  assert.ok(uit.endsWith('…'));
  assert.ok(uit.length <= 31);
  // Niet middenin een woord: wat ervoor staat is een heel woord.
  assert.ok('Hoe wil je je profiel invullen en wat gebeurt er daarna precies'.startsWith(uit.slice(0, -1)));
  assert.ok(uit.slice(0, -1).split(' ').length > 1);
});

test('een titel van een lang woord wordt op de maat zelf afgekapt', () => {
  assert.equal(kortTitel('Arbeidsomstandighedenbesluitwijziging', 12), 'Arbeidsomsta…');
});

test('leestekens blijven niet voor de puntjes staan', () => {
  assert.equal(kortTitel('Samen verder, in het werk en verder', 14), 'Samen verder…');
});

test('de hoogte van het chroom is de onderkant van de laagste balk', () => {
  const balk = { offsetParent: {}, getBoundingClientRect: () => ({ bottom: 72 }) };
  const menu = { offsetParent: {}, getBoundingClientRect: () => ({ bottom: 119 }) };
  assert.equal(chroomHoogte(balk, menu), 119);
});

test('een menu dat er niet staat, telt niet mee', () => {
  const balk = { offsetParent: {}, getBoundingClientRect: () => ({ bottom: 72 }) };
  const menu = { offsetParent: null, getBoundingClientRect: () => ({ bottom: 119 }) };
  assert.equal(chroomHoogte(balk, menu), 72);
});

test('zonder balken is het chroom nul', () => {
  assert.equal(chroomHoogte(null, null), 0);
});
