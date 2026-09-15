import test from 'node:test';
import assert from 'node:assert/strict';
import { valideerOmgeving, splitsBestand, controleerPdf, normaliseerTekst, deelTekst } from '../src/lib/app/teamomgeving.js';
import { createHash } from 'node:crypto';
const geldig = () => ({ versie:1, inhoud:{titel:'Testteam',onderdelen:[{id:'overzicht',titel:'Overzicht',tekst:'Alleen teamleden'}]},beheer:{tekst:'Apart'},bestanden:[] });
test('geldige teamomgeving wordt geaccepteerd', () => assert.equal(valideerOmgeving(geldig()).versie,1));
test('beheer kan niet als gewoon teamonderdeel worden geïmporteerd', () => {
  const data = geldig(); data.inhoud.onderdelen[0].id='beheer'; assert.throws(() => valideerOmgeving(data));
});
test('gereserveerde en dubbele onderdelen worden geweigerd', () => {
  const data = geldig(); data.inhoud.onderdelen.push(data.inhoud.onderdelen[0]); assert.throws(() => valideerOmgeving(data));
  data.inhoud.onderdelen=[{id:'documenten',titel:'Pdf',tekst:'x'}]; assert.throws(() => valideerOmgeving(data));
});
test('oversized data wordt geweigerd', () => {
  const data = geldig(); data.inhoud.onderdelen[0].tekst='x'.repeat(60001); assert.throws(() => valideerOmgeving(data));
});
test('pdfdelen worden zonder gegevensverlies opgesplitst', () => {
  const tekst='x'.repeat(1300001); const delen=splitsBestand(tekst);
  assert.equal(delen.length,3); assert.equal(delen.join(''),tekst); assert.ok(delen.every((d)=>d.length<=600000));
});
test('pdfintegriteit wordt gecontroleerd voor downloaden', async () => {
  const bytes=Buffer.from('%PDF-1.4\nTest');
  const bestand={base64:bytes.toString('base64'),sha256:createHash('sha256').update(bytes).digest('hex')};
  assert.deepEqual(Buffer.from(await controleerPdf(bestand)),bytes);
  await assert.rejects(controleerPdf({...bestand,base64:Buffer.from('%PDF-beschadigd').toString('base64')}));
});

// De brontekst schrijft een volgnummer soms in een eigen alinea. Dat is dezelfde
// lijst, alleen anders opgeschreven -- en het scherm moet hem als lijst tonen.
const LOSSE_NUMMERS = [
  'Onze aandacht',
  '',
  '1',
  '',
  'Verwachtingen van de leidinggevende',
  '',
  'Stand van zaken nog te bespreken',
  '',
  '2',
  '',
  'De B verfijnen en verdiepen',
  '',
  'Stand van zaken nog te bespreken',
].join('\n');

test('een volgnummer in een eigen alinea wordt een echt lijstitem', () => {
  const uit = normaliseerTekst(LOSSE_NUMMERS);
  assert.match(uit, /^1\. Verwachtingen van de leidinggevende$/m);
  assert.match(uit, /^2\. De B verfijnen en verdiepen$/m);
  assert.match(uit, /^ {3}Stand van zaken nog te bespreken$/m);
  assert.ok(uit.startsWith('Onze aandacht\n\n'));
});

test('normaliseren verandert geen woorden', () => {
  const woorden = (s) => s.split(/[^A-Za-zÀ-ÿ0-9]+/).filter(Boolean).join(' ');
  assert.equal(woorden(normaliseerTekst(LOSSE_NUMMERS)), woorden(LOSSE_NUMMERS));
});

test('een bestaande genummerde lijst blijft ongemoeid', () => {
  const al = '# Kop\n\n1. Eerste\n2. Tweede\n\nSlot.';
  assert.equal(normaliseerTekst(al), al);
});

test('een los nummer zonder inhoud erna blijft staan zoals het staat', () => {
  assert.equal(normaliseerTekst('Tekst\n\n7'), 'Tekst\n\n7');
  assert.equal(normaliseerTekst('1\n\n## Kop'), '1\n\n## Kop');
});

test('een jaartal of bedrag wordt niet als volgnummer gelezen', () => {
  const jaar = '2026\n\nHet jaar waarin we dit doen.';
  assert.equal(normaliseerTekst(jaar), jaar);
});

test('bij een tweecijferig nummer springt het vervolg ver genoeg in', () => {
  const uit = normaliseerTekst('10\n\nTiende actie\n\nNog te bespreken');
  assert.match(uit, /^ {4}Nog te bespreken$/m);
});

test('lege of ontbrekende tekst geeft een lege string', () => {
  assert.equal(normaliseerTekst(''), '');
  assert.equal(normaliseerTekst(undefined), '');
  assert.equal(normaliseerTekst(null), '');
});

// Een programma dat als losse regels met een punt ertussen is opgeschreven.
const PROGRAMMA = [
  'Overgenomen uit het opdrachtgeversvoorstel.',
  '',
  'Tijd \u00b7 Onderdeel \u00b7 Inhoud \u00b7',
  '',
  '08.45\u201309.15 \u00b7 Opening en terugblik \u00b7 Waar staan de vier opdrachten? \u00b7',
  '',
  '12.00\u201312.30 \u00b7 Lunch \u00b7 Pauze \u00b7',
  '',
  'Drie routes voor knelpunten',
].join('\n');

test('een tabel die als tekst is getypt wordt weer een tabel', () => {
  const delen = deelTekst(PROGRAMMA);
  assert.deepEqual(delen.map((d) => d.soort), ['tekst', 'tabel', 'tekst']);
  assert.deepEqual(delen[1].kop, ['Tijd', 'Onderdeel', 'Inhoud']);
  assert.equal(delen[1].rijen.length, 2);
  assert.deepEqual(delen[1].rijen[1], ['12.00\u201312.30', 'Lunch', 'Pauze']);
});

test('elke rij heeft evenveel cellen als de kop', () => {
  const { kop, rijen } = deelTekst(PROGRAMMA)[1];
  assert.ok(rijen.every((r) => r.length === kop.length));
});

test('een losse zin met een punt erin blijft gewone tekst', () => {
  const delen = deelTekst('Volgende teamdag \u00b7 8 oktober 2026\n\nWat belemmert ons?');
  assert.deepEqual(delen.map((d) => d.soort), ['tekst']);
});

test('een enkele regel is nog geen tabel', () => {
  const los = 'A \u00b7 B \u00b7 C\n\nGewone alinea.';
  assert.deepEqual(deelTekst(los).map((d) => d.soort), ['tekst']);
});

test('een opsomming met punten erin wordt niet als tabel gelezen', () => {
  const lijst = '- A \u00b7 B \u00b7 C\n- D \u00b7 E \u00b7 F';
  assert.deepEqual(deelTekst(lijst).map((d) => d.soort), ['tekst']);
});

test('een weggelaten regeleinde plakt geen woorden aan elkaar', () => {
  assert.equal(normaliseerTekst('Eerste teamdag<br>Afgerond'), 'Eerste teamdag  \nAfgerond');
  assert.equal(normaliseerTekst('Tweede teamdag<br />Voorstel'), 'Tweede teamdag  \nVoorstel');
});

test('een ander weggelaten label laat een spatie achter', () => {
  assert.equal(normaliseerTekst('<td>Eerste teamdag</td><td>Afgerond</td>').trim(), 'Eerste teamdag Afgerond');
});

test('een codeblok blijft ongemoeid', () => {
  const code = '```\n<br>\n```';
  assert.equal(normaliseerTekst(code), code);
});
