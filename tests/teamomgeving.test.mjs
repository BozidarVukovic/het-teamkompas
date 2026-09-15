import test from 'node:test';
import assert from 'node:assert/strict';
import { valideerOmgeving, splitsBestand, controleerPdf, normaliseerTekst } from '../src/lib/app/teamomgeving.js';
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
