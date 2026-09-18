import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OMGEVING_VERSIE, isVerborgen, zichtbareOnderdelen, maakOnderdelenlijst,
  pasWijzigingToe, valideerOmgeving, maakBronPakket,
} from '../src/lib/app/teamomgeving.js';
import { maakZoekindex } from '../src/lib/app/teamomgevingZoek.js';

const inhoud = () => ({
  titel: 'Samen verder in het werk',
  onderdelen: [
    { id: 'afspraken', titel: 'Onze afspraken', tekst: 'Vier acties.', groep: 'Samenwerken' },
    { id: 'experimenten', titel: 'Experimenten', tekst: 'Kleine veranderingen.', groep: 'Samenwerken', verborgen: true },
    { id: 'leren', titel: 'Samen leren', tekst: 'Wat we leren.', groep: 'Samenwerken' },
  ],
});

test('een onderdeel zonder vlag is gewoon zichtbaar', () => {
  assert.equal(isVerborgen({ id: 'a' }), false);
  assert.equal(isVerborgen({ id: 'a', verborgen: false }), false);
  assert.equal(isVerborgen({ id: 'a', verborgen: true }), true);
  assert.equal(isVerborgen(null), false);
});

test('een teamlid krijgt het verborgen onderdeel niet te zien', () => {
  const uit = zichtbareOnderdelen(inhoud(), false).map((d) => d.id);
  assert.deepEqual(uit, ['afspraken', 'leren']);
});

test('een begeleider ziet het wel', () => {
  const uit = zichtbareOnderdelen(inhoud(), true).map((d) => d.id);
  assert.deepEqual(uit, ['afspraken', 'experimenten', 'leren']);
});

test('de zijbalk laat het weg, en markeert het voor de begeleider', () => {
  const lid = maakOnderdelenlijst(inhoud(), false);
  const titels = lid.flatMap((g) => g.items.map((i) => i.id));
  assert.ok(!titels.includes('experimenten'));

  const beheer = maakOnderdelenlijst(inhoud(), true);
  const item = beheer.flatMap((g) => g.items).find((i) => i.id === 'experimenten');
  assert.equal(item.verborgen, true);
  const ander = beheer.flatMap((g) => g.items).find((i) => i.id === 'afspraken');
  assert.equal(ander.verborgen, undefined);
});

test('het zoeken vindt een verborgen onderdeel niet voor een teamlid', () => {
  const lid = maakZoekindex(inhoud(), false).map((r) => r.onderdeelId);
  assert.ok(!lid.includes('experimenten'));
  const beheer = maakZoekindex(inhoud(), true).map((r) => r.onderdeelId);
  assert.ok(beheer.includes('experimenten'));
});

test('verbergen zet de vlag en laat de tekst staan', () => {
  const uit = pasWijzigingToe(inhoud(), { zichtbaarheid: { id: 'afspraken', verborgen: true } });
  const deel = uit.onderdelen.find((d) => d.id === 'afspraken');
  assert.equal(deel.verborgen, true);
  assert.equal(deel.tekst, 'Vier acties.');
  assert.equal(deel.groep, 'Samenwerken');
});

test('weer tonen haalt de vlag helemaal weg', () => {
  const uit = pasWijzigingToe(inhoud(), { zichtbaarheid: { id: 'experimenten', verborgen: false } });
  const deel = uit.onderdelen.find((d) => d.id === 'experimenten');
  assert.equal('verborgen' in deel, false);
  assert.equal(deel.tekst, 'Kleine veranderingen.');
});

test('een onderdeel dat er niet meer is, kun je niet verbergen', () => {
  assert.throws(
    () => pasWijzigingToe(inhoud(), { zichtbaarheid: { id: 'weg', verborgen: true } }),
    /staat niet meer in deze teamomgeving/,
  );
});

test('een tekstwijziging raakt de zichtbaarheid niet aan', () => {
  const uit = pasWijzigingToe(inhoud(), { onderdeel: { id: 'experimenten', tekst: 'Nieuwe tekst.' } });
  const deel = uit.onderdelen.find((d) => d.id === 'experimenten');
  assert.equal(deel.verborgen, true);
  assert.equal(deel.tekst, 'Nieuwe tekst.');
});

const pakket = (inh) => ({ versie: OMGEVING_VERSIE, inhoud: inh, beheer: { tekst: '' }, bestanden: [] });

test('een omgeving met een verborgen onderdeel is geldig', () => {
  assert.doesNotThrow(() => valideerOmgeving(pakket(inhoud())));
});

test('alles verbergen mag niet', () => {
  const inh = inhoud();
  inh.onderdelen = inh.onderdelen.map((d) => ({ ...d, verborgen: true }));
  assert.throws(() => valideerOmgeving(pakket(inh)), /ten minste een onderdeel zichtbaar/);
});

test('verborgen moet een ja of nee zijn', () => {
  const inh = inhoud();
  inh.onderdelen[0].verborgen = 'ja';
  assert.throws(() => valideerOmgeving(pakket(inh)), /ongeldig of dubbel/);
});

test('de brontekst houdt vast wat verborgen was', () => {
  const bron = maakBronPakket({ inhoud: inhoud(), beheer: { tekst: '' } });
  const deel = bron.inhoud.onderdelen.find((d) => d.id === 'experimenten');
  assert.equal(deel.verborgen, true);
  const ander = bron.inhoud.onderdelen.find((d) => d.id === 'afspraken');
  assert.equal('verborgen' in ander, false);
});
