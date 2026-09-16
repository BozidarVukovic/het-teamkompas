import test from 'node:test';
import assert from 'node:assert/strict';
import { vlak, sleutelbaar, maakZoekindex, zoek } from '../src/lib/app/teamomgevingZoek.js';

const inhoud = {
  onderdelen: [
    {
      id: 'overzicht',
      titel: 'Overzicht',
      inklapbaar: true,
      tekst: 'Waar we staan in juni.\n\n### Vier acties uit juni\n\nDe acties komen uit de teamdag.\n\n### Ons traject\n\n[tijdlijn]\n\nHet traject loopt door tot december.',
    },
    {
      id: 'afspraken',
      titel: 'Onze afspraken',
      tekst: '### Verwachtingen van de leidinggevende\n\nActieteam: **Stéphanie**. Stand van zaken: nog te bespreken.',
    },
  ],
};

test('markdown wordt lopende tekst in een fragment', () => {
  assert.equal(vlak('### Kop\n\n- punt een\n- punt twee'), 'Kop \u2014 punt een punt twee');
  assert.equal(vlak('Actieteam: Anouk\n\nStand van zaken: nog te bespreken.'), 'Actieteam: Anouk \u2014 Stand van zaken: nog te bespreken.');
  assert.equal(vlak('Actieteam: **Stéphanie**'), 'Actieteam: Stéphanie');
  assert.equal(vlak('[tijdlijn]'), '');
});

test('accenten en hoofdletters tellen niet mee', () => {
  assert.equal(sleutelbaar('Stéphanie'), 'stephanie');
  assert.equal(sleutelbaar('ACTIE'), 'actie');
});

test('de index bevat elke sectie met een eigen adres', () => {
  const index = maakZoekindex(inhoud);
  const adressen = index.map((r) => r.onderdeelId + '#' + r.slak);
  assert.ok(adressen.includes('overzicht#'), 'de inleiding staat erin');
  assert.ok(adressen.includes('overzicht#vier-acties-uit-juni'));
  assert.ok(adressen.includes('overzicht#ons-traject'));
  assert.ok(adressen.includes('afspraken#verwachtingen-van-de-leidinggevende'));
});

test('zoeken vindt een sectie op haar kop en zet die bovenaan', () => {
  const raak = zoek(maakZoekindex(inhoud), 'traject');
  assert.ok(raak.length >= 1);
  assert.equal(raak[0].onderdeelId, 'overzicht');
  assert.equal(raak[0].slak, 'ons-traject');
});

test('zoeken vindt een naam met accent zonder dat je hem zo typt', () => {
  const raak = zoek(maakZoekindex(inhoud), 'stephanie');
  assert.equal(raak.length, 1);
  assert.equal(raak[0].onderdeelId, 'afspraken');
  assert.equal(raak[0].fragment.raak, 'Stéphanie');
});

test('alle woorden moeten voorkomen', () => {
  const index = maakZoekindex(inhoud);
  assert.equal(zoek(index, 'acties juni').length >= 1, true);
  assert.equal(zoek(index, 'acties zeeland').length, 0);
});

test('een te korte of lege vraag levert niets op', () => {
  const index = maakZoekindex(inhoud);
  assert.deepEqual(zoek(index, ''), []);
  assert.deepEqual(zoek(index, ' a '), []);
  assert.deepEqual(zoek(undefined, 'actie'), []);
});

test('het fragment staat rond de treffer, niet aan het begin', () => {
  const index = [{ onderdeelId: 'x', onderdeelTitel: 'X', slak: '', kop: '', tekst: 'a'.repeat(200) + ' naald ' + 'b'.repeat(200) }];
  const raak = zoek(index, 'naald');
  assert.equal(raak[0].fragment.raak, 'naald');
  assert.ok(raak[0].fragment.voor.startsWith('… '));
  assert.ok(raak[0].fragment.na.endsWith(' …'));
});
