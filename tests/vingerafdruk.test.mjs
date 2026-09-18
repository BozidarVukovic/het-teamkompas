import test from 'node:test';
import assert from 'node:assert/strict';
import { maakVingerafdruk, kleurenOmTeDelen, bolletjes, omschrijf } from '../src/lib/app/vingerafdruk.js';
import { stelGedeeldeKopieSamen } from '../src/lib/app/gedeeldeKopie.js';

const gemeten = { voorkeurskleur: 'rood', tweedeKleur: 'groen', energieen: { blauw: 1.2, groen: 4.4, geel: 1.6, rood: 4.7 } };
const geraden = { voorkeurskleur: 'blauw', tweedeKleur: 'geel' };

// --------------------------------------------------- de afdruk zelf

test('met gemeten waarden komt er een balk op volgorde van groot naar klein', () => {
  const uit = maakVingerafdruk(gemeten);
  assert.equal(uit.nauwkeurig, true);
  assert.deepEqual(uit.volgorde, ['rood', 'groen', 'geel', 'blauw']);
  assert.equal(uit.balk.length, 4);
  assert.deepEqual(uit.balk.map((b) => b.id), ['rood', 'groen', 'geel', 'blauw']);
  // De delen tellen op tot één.
  assert.ok(Math.abs(uit.balk.reduce((t, b) => t + b.deel, 0) - 1) < 1e-9);
  // En rood is het grootste deel.
  assert.ok(uit.balk[0].deel > uit.balk[1].deel);
  assert.ok(uit.balk.every((b) => b.kleur.startsWith('#')));
});

test('zonder gemeten waarden komt er geen balk, wel een volgorde', () => {
  const uit = maakVingerafdruk(geraden);
  assert.equal(uit.nauwkeurig, false);
  assert.deepEqual(uit.balk, []);
  assert.equal(uit.volgorde[0], 'blauw');
  assert.equal(uit.volgorde[1], 'geel');
  assert.equal(uit.volgorde.length, 4, 'alle vier de kleuren staan er, de rest achteraan');
});

test('een verhouding verzinnen uit een volgorde doen we niet', () => {
  // Dit is de kern: wie alleen weet dat blauw voor geel gaat, weet niet
  // hoeveel blauw. Een balk zou een precisie suggereren die er niet is.
  assert.equal(maakVingerafdruk(geraden).balk.length, 0);
});

test('halve of kapotte gegevens leveren geen afdruk op', () => {
  assert.equal(maakVingerafdruk(null), null);
  assert.equal(maakVingerafdruk({}), null);
  assert.equal(maakVingerafdruk({ voorkeurskleur: 'paars' }), null);
  assert.equal(maakVingerafdruk('rood'), null);
});

test('onvolledige energieen vallen terug op de volgorde', () => {
  const uit = maakVingerafdruk({ voorkeurskleur: 'groen', energieen: { groen: 4, rood: 2 } });
  assert.equal(uit.nauwkeurig, false);
  assert.deepEqual(uit.balk, []);
});

test('alles op nul levert geen balk op in plaats van een deling door nul', () => {
  const uit = maakVingerafdruk({ voorkeurskleur: 'geel', energieen: { blauw: 0, groen: 0, geel: 0, rood: 0 } });
  assert.equal(uit.nauwkeurig, false);
  assert.deepEqual(uit.balk, []);
});

test('bij gelijke waarden is de uitkomst altijd dezelfde', () => {
  const gelijk = { voorkeurskleur: 'blauw', energieen: { blauw: 3, groen: 3, geel: 3, rood: 3 } };
  assert.deepEqual(maakVingerafdruk(gelijk).volgorde, maakVingerafdruk(gelijk).volgorde);
});

test('elke kleur krijgt één bolletje, op volgorde', () => {
  const bollen = bolletjes(maakVingerafdruk(gemeten));
  assert.deepEqual(bollen.map((b) => b.id), ['rood', 'groen', 'geel', 'blauw']);
  assert.ok(bollen.every((b) => b.kleur.startsWith('#')));
  assert.deepEqual(bolletjes(null), []);
});

test('een schermlezer hoort de volgorde in woorden', () => {
  const tekst = omschrijf(maakVingerafdruk(gemeten), 'Marleen');
  assert.match(tekst, /^Marleen: /);
  assert.match(tekst, /vurig rood/);
  assert.match(tekst, /sterkst naar zwakst/);
  const zonder = omschrijf(maakVingerafdruk(geraden));
  assert.match(zonder, /eerste twee kleuren/);
  assert.equal(omschrijf(null), '');
});

// ------------------------------------------------ wat er gedeeld wordt

test('alleen de vier getallen en de eerste twee kleuren gaan mee', () => {
  const uit = kleurenOmTeDelen({
    ...gemeten,
    wiel: { positie: 12, typenaam: 'Ondersteunende Coordinator' },
    zekerheid: 'hoog',
    bronregel: 'regel 42',
  });
  assert.deepEqual(Object.keys(uit).sort(), ['energieen', 'tweedeKleur', 'voorkeurskleur']);
  assert.equal(uit.wiel, undefined);
  assert.equal(uit.bronregel, undefined);
  assert.equal(uit.zekerheid, undefined);
});

test('een tweede kleur die gelijk is aan de eerste gaat er niet in', () => {
  const uit = kleurenOmTeDelen({ voorkeurskleur: 'rood', tweedeKleur: 'rood' });
  assert.equal(uit.tweedeKleur, undefined);
});

test('zonder profiel valt er niets te delen', () => {
  assert.equal(kleurenOmTeDelen(null), null);
  assert.equal(kleurenOmTeDelen({}), null);
  assert.equal(kleurenOmTeDelen({ voorkeurskleur: 'onzin' }), null);
});

// ------------------------------------------- de kopie naar het team

const sleutel = 'org/team';

test('de kleuren staan in de gedeelde kopie', () => {
  const kopie = stelGedeeldeKopieSamen({ naam: 'Marleen', sleutel, insights: gemeten });
  assert.equal(kopie.kleuren.voorkeurskleur, 'rood');
  assert.equal(kopie.naam, 'Marleen');
});

test('wie ze uitzet, deelt ze niet', () => {
  const kopie = stelGedeeldeKopieSamen({ naam: 'Marleen', sleutel, insights: gemeten, kleurenDelen: false });
  assert.equal(kopie, null, 'zonder kenmerken en zonder kleuren is er niets te delen');
});

test('uitzetten haalt alleen de kleuren weg, niet de rest', () => {
  const kenmerken = [{ kenmerkId: 'tempo', waarde: 'snel', gedeeldMet: [sleutel], bevestigd: 'ja' }];
  const met = stelGedeeldeKopieSamen({ naam: 'Marleen', sleutel, kenmerken, insights: gemeten });
  const zonder = stelGedeeldeKopieSamen({ naam: 'Marleen', sleutel, kenmerken, insights: gemeten, kleurenDelen: false });
  assert.ok(met.kleuren);
  assert.equal(zonder.kleuren, undefined);
  assert.deepEqual(zonder.kenmerken, met.kenmerken);
});

test('zonder profiel blijft de kopie werken zoals hij deed', () => {
  const kenmerken = [{ kenmerkId: 'tempo', waarde: 'snel', gedeeldMet: [sleutel], bevestigd: 'ja' }];
  const kopie = stelGedeeldeKopieSamen({ naam: 'Marleen', sleutel, kenmerken });
  assert.equal(kopie.kleuren, undefined);
  assert.equal(kopie.kenmerken.length, 1);
});
