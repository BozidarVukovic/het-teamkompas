import test from 'node:test';
import assert from 'node:assert/strict';
import { leesPdf, schoneBestandsnaam, maakDocumentregel, verwijderUitLijst, splitsBestand, controleerPdf } from '../src/lib/app/teamomgeving.js';

const pdf = (extra = 0) => {
  const kop = new TextEncoder().encode('%PDF-1.7\n');
  const uit = new Uint8Array(kop.length + extra);
  uit.set(kop);
  for (let i = 0; i < extra; i += 1) uit[kop.length + i] = (i * 7) % 251;
  return uit;
};

test('een pdf levert een vingerafdruk en base64 op', async () => {
  const gelezen = await leesPdf(pdf(100), 'Terugkoppeling.pdf');
  assert.equal(gelezen.naam, 'Terugkoppeling.pdf');
  assert.match(gelezen.sha256, /^[a-f0-9]{64}$/);
  assert.match(gelezen.base64, /^JVBERi0/);
});

test('dezelfde bytes geven dezelfde vingerafdruk, andere bytes niet', async () => {
  const een = await leesPdf(pdf(64), 'a.pdf');
  const twee = await leesPdf(pdf(64), 'b.pdf');
  const anders = await leesPdf(pdf(65), 'c.pdf');
  assert.equal(een.sha256, twee.sha256);
  assert.notEqual(een.sha256, anders.sha256);
});

test('de vingerafdruk is precies wat het downloaden straks controleert', async () => {
  const gelezen = await leesPdf(pdf(2048), 'a.pdf');
  await assert.doesNotReject(() => controleerPdf(gelezen));
  await assert.rejects(() => controleerPdf({ ...gelezen, sha256: 'f'.repeat(64) }), /niet volledig of is gewijzigd/);
});

test('wat geen pdf is, komt er niet in', async () => {
  const nep = new TextEncoder().encode('Dit is gewoon tekst.');
  await assert.rejects(() => leesPdf(nep, 'nep.pdf'), /geen pdf-bestand/);
  await assert.rejects(() => leesPdf(new Uint8Array(2), 'leeg.pdf'), /geen pdf-bestand/);
});

test('een bestandsnaam wordt ontdaan van pad en krijgt altijd .pdf', () => {
  assert.equal(schoneBestandsnaam('/Users/bo/Desktop/Handleiding.PDF'), 'Handleiding.pdf');
  assert.equal(schoneBestandsnaam('C:\\Map\\stuk.pdf'), 'stuk.pdf');
  assert.equal(schoneBestandsnaam('zonder extensie'), 'zonder extensie.pdf');
  assert.equal(schoneBestandsnaam(''), '');
});

const goed = { titel: 'Hand-in-Handleiding', naam: 'hh.pdf', sha256: 'a'.repeat(64), delen: 2 };

test('het id komt uit de titel, niet uit de bestandsnaam', () => {
  const regel = maakDocumentregel([], { ...goed, naam: 'Hand-in-Handleiding team HR BB 07-juli-2026.pdf' });
  assert.equal(regel.id, 'hand-in-handleiding');
  assert.equal(regel.naam, 'Hand-in-Handleiding team HR BB 07-juli-2026.pdf');
});

test('een botsend id krijgt een volgnummer', () => {
  const bestaand = [{ id: 'hand-in-handleiding' }, { id: 'hand-in-handleiding-2' }];
  assert.equal(maakDocumentregel(bestaand, goed).id, 'hand-in-handleiding-3');
});

test('een titel zonder bruikbare letters levert toch een id op', () => {
  assert.equal(maakDocumentregel([], { ...goed, titel: '!!!' }).id, 'document');
});

test('een lege toelichting komt niet als leeg veld in de lijst', () => {
  assert.equal('beschrijving' in maakDocumentregel([], goed), false);
  assert.equal(maakDocumentregel([], { ...goed, beschrijving: '  Van 4 juni  ' }).beschrijving, 'Van 4 juni');
});

test('zonder titel, vingerafdruk of delen gaat er niets door', () => {
  assert.throws(() => maakDocumentregel([], { ...goed, titel: '   ' }), /titel/);
  assert.throws(() => maakDocumentregel([], { ...goed, sha256: 'kort' }), /vingerafdruk/);
  assert.throws(() => maakDocumentregel([], { ...goed, delen: 0 }), /te groot of leeg/);
  assert.throws(() => maakDocumentregel([], { ...goed, delen: 11 }), /te groot of leeg/);
  assert.throws(() => maakDocumentregel([], { ...goed, naam: '' }), /bestandsnaam/);
});

test('er passen er tien in, niet elf', () => {
  const vol = Array.from({ length: 10 }, (_, i) => ({ id: `d${i}` }));
  assert.throws(() => maakDocumentregel(vol, goed), /maximaal tien/);
});

test('het aantal delen klopt met wat splitsBestand ervan maakt', async () => {
  const gelezen = await leesPdf(pdf(1000), 'a.pdf');
  const delen = splitsBestand(gelezen.base64);
  assert.equal(delen.length, 1);
  assert.equal(delen.join(''), gelezen.base64);
  assert.equal(maakDocumentregel([], { ...goed, delen: delen.length }).delen, 1);
});

const drie = () => ([
  { id: 'terugkoppeling', titel: 'Terugkoppeling', naam: 'a.pdf', sha256: 'a'.repeat(64), delen: 1 },
  { id: 'handleiding', titel: 'Hand-in-Handleiding', naam: 'hh.pdf', sha256: 'b'.repeat(64), delen: 2 },
  { id: 'programma', titel: 'Programma', naam: 'p.pdf', sha256: 'c'.repeat(64), delen: 1 },
]);

test('weghalen laat de rest ongemoeid en in dezelfde volgorde', () => {
  const { over, weg } = verwijderUitLijst(drie(), 'handleiding');
  assert.equal(weg.titel, 'Hand-in-Handleiding');
  assert.equal(weg.delen, 2);
  assert.deepEqual(over.map((d) => d.id), ['terugkoppeling', 'programma']);
});

test('het laatste document mag ook weg', () => {
  const { over } = verwijderUitLijst([drie()[0]], 'terugkoppeling');
  assert.deepEqual(over, []);
});

test('een document dat er niet is, levert een fout op in plaats van een stille lege lijst', () => {
  assert.throws(() => verwijderUitLijst(drie(), 'bestaat-niet'), /niet meer in deze teamomgeving/);
  assert.throws(() => verwijderUitLijst(undefined, 'terugkoppeling'), /niet meer in deze teamomgeving/);
});

test('het aantal delen komt mee, want dat is wat er opgeruimd moet worden', () => {
  assert.equal(verwijderUitLijst(drie(), 'handleiding').weg.delen, 2);
  assert.equal(verwijderUitLijst(drie(), 'programma').weg.delen, 1);
});

test('na weghalen is de plek weer vrij voor hetzelfde id', () => {
  const { over } = verwijderUitLijst(drie(), 'handleiding');
  const regel = maakDocumentregel(over, { titel: 'Hand-in-Handleiding', naam: 'hh2.pdf', sha256: 'd'.repeat(64), delen: 1 });
  assert.equal(regel.id, 'hand-in-handleiding');
});
