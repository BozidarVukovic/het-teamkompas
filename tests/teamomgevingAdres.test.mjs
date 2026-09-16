import test from 'node:test';
import assert from 'node:assert/strict';
import { maakSlak, sectieAdressen, leesHash, maakAdres } from '../src/lib/app/teamomgevingAdres.js';

test('een kop wordt een leesbaar adres', () => {
  assert.equal(maakSlak('Verwachtingen van de leidinggevende'), 'verwachtingen-van-de-leidinggevende');
  assert.equal(maakSlak('Wie hebben we waarvoor nodig?'), 'wie-hebben-we-waarvoor-nodig');
  assert.equal(maakSlak('Stéphanie & het actieteam'), 'stephanie-het-actieteam');
  assert.equal(maakSlak('  30–60–90  '), '30-60-90');
});

test('een slak begint en eindigt nooit op een streepje', () => {
  assert.equal(maakSlak('!!! hallo !!!'), 'hallo');
  assert.equal(maakSlak('?!'), '');
  assert.equal(maakSlak(undefined), '');
  const lang = maakSlak('a'.repeat(40) + ' ' + 'b'.repeat(40));
  assert.ok(lang.length <= 60);
  assert.ok(!lang.endsWith('-'));
});

test('twee secties met dezelfde kop krijgen toch een eigen adres', () => {
  const adressen = sectieAdressen([{ kop: 'Terugblik' }, { kop: 'Vooruit' }, { kop: 'Terugblik' }]);
  assert.deepEqual(adressen, ['terugblik', 'vooruit', 'terugblik-2']);
});

test('een sectie zonder bruikbare kop krijgt een volgnummer', () => {
  assert.deepEqual(sectieAdressen([{ kop: '???' }, { kop: 'Wel een kop' }]), ['sectie-1', 'wel-een-kop']);
  assert.deepEqual(sectieAdressen(undefined), []);
});

test('een hash wordt gelezen, ook als hij stuk is', () => {
  assert.equal(leesHash('#onze-afspraken'), 'onze-afspraken');
  assert.equal(leesHash('onze-afspraken'), 'onze-afspraken');
  assert.equal(leesHash('#met%20spatie'), 'met spatie');
  assert.equal(leesHash('#%E0%A4%A'), '%E0%A4%A');
  assert.equal(leesHash(undefined), '');
});

test('een adres wijst een onderdeel aan, met of zonder sectie', () => {
  assert.equal(maakAdres('afspraken'), '/app/teamomgeving/afspraken');
  assert.equal(maakAdres('afspraken', 'terugkoppeling'), '/app/teamomgeving/afspraken#terugkoppeling');
  assert.equal(maakAdres('afspraken', ''), '/app/teamomgeving/afspraken');
});
