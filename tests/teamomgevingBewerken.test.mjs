import test from 'node:test';
import assert from 'node:assert/strict';
import { pasWijzigingToe, valideerOmgeving, OMGEVING_VERSIE } from '../src/lib/app/teamomgeving.js';

const inhoud = () => ({
  titel: 'Samen verder in het werk',
  intro: 'Evides · HR Business & Beleid',
  documentContext: 'Bij de teamdag van 4 juni.',
  onderdelen: [
    { id: 'overzicht', titel: 'Overzicht', tekst: 'Oud.', inklapbaar: true, eersteOpen: true, tijdlijn: [{ wanneer: '4 juni' }] },
    { id: 'afspraken', titel: 'Onze afspraken', tekst: 'Ook oud.', groep: 'Samenwerken' },
  ],
  documenten: [{ id: 'terugkoppeling', titel: 'Terugkoppeling', naam: 'a.pdf' }],
  aangemaaktOp: 'een tijdstempel',
});

test('een onderdeel krijgt nieuwe tekst en de rest blijft staan', () => {
  const uit = pasWijzigingToe(inhoud(), { onderdeel: { id: 'afspraken', tekst: 'Nieuw.' } });
  assert.equal(uit.onderdelen[1].tekst, 'Nieuw.');
  assert.equal(uit.onderdelen[0].tekst, 'Oud.');
  assert.equal(uit.titel, 'Samen verder in het werk');
});

test('velden die het bewerken niet kent, blijven letterlijk staan', () => {
  const uit = pasWijzigingToe(inhoud(), { onderdeel: { id: 'overzicht', tekst: 'Nieuw.' } });
  assert.equal(uit.onderdelen[0].inklapbaar, true);
  assert.equal(uit.onderdelen[0].eersteOpen, true);
  assert.deepEqual(uit.onderdelen[0].tijdlijn, [{ wanneer: '4 juni' }]);
  assert.equal(uit.onderdelen[1].groep, 'Samenwerken');
  assert.equal(uit.documentContext, 'Bij de teamdag van 4 juni.');
  assert.deepEqual(uit.documenten, [{ id: 'terugkoppeling', titel: 'Terugkoppeling', naam: 'a.pdf' }]);
  assert.equal(uit.aangemaaktOp, 'een tijdstempel');
});

test('titel en intro zijn los bij te werken', () => {
  const uit = pasWijzigingToe(inhoud(), { titel: '  Nieuwe titel  ', intro: '  Nieuwe intro  ' });
  assert.equal(uit.titel, 'Nieuwe titel');
  assert.equal(uit.intro, 'Nieuwe intro');
  assert.equal(uit.onderdelen[0].tekst, 'Oud.');
});

test('regeleindes van Windows worden gewone regeleindes', () => {
  const uit = pasWijzigingToe(inhoud(), { onderdeel: { id: 'overzicht', tekst: 'Een\r\nTwee\rDrie' } });
  assert.equal(uit.onderdelen[0].tekst, 'Een\nTwee\nDrie');
});

test('een onderdeel dat er niet meer is, wordt niet stilletjes toegevoegd', () => {
  assert.throws(
    () => pasWijzigingToe(inhoud(), { onderdeel: { id: 'weggehaald', tekst: 'Hallo' } }),
    /niet meer in deze teamomgeving/
  );
});

test('een lege wijziging verandert niets', () => {
  assert.deepEqual(pasWijzigingToe(inhoud(), {}), inhoud());
  assert.deepEqual(pasWijzigingToe(inhoud(), null), inhoud());
});

test('lege tekst mag: een onderdeel leegmaken is een geldige correctie', () => {
  const uit = pasWijzigingToe(inhoud(), { onderdeel: { id: 'afspraken', tekst: '' } });
  assert.equal(uit.onderdelen[1].tekst, '');
});

test('de uitkomst komt door dezelfde controle als een aangeleverd pakket', () => {
  const uit = pasWijzigingToe(inhoud(), { onderdeel: { id: 'afspraken', tekst: 'Nieuw.' } });
  const pakket = { versie: OMGEVING_VERSIE, inhoud: uit, beheer: { tekst: '' }, bestanden: [] };
  assert.equal(valideerOmgeving(pakket), pakket);
});

test('een titel die leeg wordt gemaakt, komt niet door de controle', () => {
  const uit = pasWijzigingToe(inhoud(), { titel: '   ' });
  assert.throws(
    () => valideerOmgeving({ versie: OMGEVING_VERSIE, inhoud: uit, beheer: { tekst: '' }, bestanden: [] }),
    /titel/
  );
});
