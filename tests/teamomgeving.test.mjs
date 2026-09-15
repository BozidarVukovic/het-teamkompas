import test from 'node:test';
import assert from 'node:assert/strict';
import { valideerOmgeving, splitsBestand, controleerPdf } from '../src/lib/app/teamomgeving.js';
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
