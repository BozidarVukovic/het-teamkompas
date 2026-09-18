import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STELLINGEN, SCHAAL, RONDES, DREMPEL, OPEN_VRAAG,
  leesRonde, leesStelling, isCompleet, valideerAntwoord,
  gemiddelde, verdeling, spreiding, magTonen, respons,
  sterkste, meestVerdeeld, maakEigenDownload,
} from '../src/lib/app/teamcheck.js';

const antwoord = (scores, extra = {}) => ({ scores, open: '', ...extra });
const alle = (waarde) => Object.fromEntries(STELLINGEN.map((s) => [s.id, waarde]));

test('de vragenlijst is wat we hebben afgesproken', () => {
  assert.equal(STELLINGEN.length, 5);
  assert.deepEqual(STELLINGEN.map((s) => s.id),
    ['duidelijkheid', 'toepassing', 'eigenaarschap', 'bespreekbaarheid', 'opbrengst']);
  assert.equal(SCHAAL.length, 5);
  assert.deepEqual(RONDES.map((r) => r.dagen), [30, 60, 90]);
  assert.match(OPEN_VRAAG, /wat moeten we aanpassen/);
});

test('een ronde en een stelling zijn op te zoeken', () => {
  assert.equal(leesRonde('d60').naam, 'Samen bijsturen');
  assert.equal(leesRonde('d45'), null);
  assert.equal(leesStelling('opbrengst').thema, 'Opbrengst');
  assert.equal(leesStelling('onzin'), null);
});

// ------------------------------------------------ niet beoordelen is geen 3

test('"kan ik nog niet beoordelen" telt niet mee in het gemiddelde', () => {
  const lijst = [
    antwoord({ duidelijkheid: 5 }),
    antwoord({ duidelijkheid: 5 }),
    antwoord({ duidelijkheid: null }),
  ];
  const uit = gemiddelde(lijst, 'duidelijkheid');
  assert.equal(uit.gemiddelde, 5);
  assert.equal(uit.n, 2, 'de derde telt niet mee');
});

test('wie niet kon oordelen wordt wel geteld, apart', () => {
  const lijst = [antwoord({ toepassing: 4 }), antwoord({ toepassing: null }), antwoord({ toepassing: null })];
  const uit = verdeling(lijst, 'toepassing');
  assert.equal(uit.nietTeBeoordelen, 2);
  assert.equal(uit.n, 1);
  assert.equal(uit.tellingen[4], 1);
});

test('een stelling die niemand kon beoordelen heeft geen gemiddelde', () => {
  assert.deepEqual(gemiddelde([antwoord({ opbrengst: null })], 'opbrengst'), { gemiddelde: null, n: 0 });
});

// ------------------------------------------------------------- de verdeling

test('de verdeling laat zien wat een gemiddelde verzwijgt', () => {
  const eensgezind = [3, 3, 3, 3].map((w) => antwoord({ bespreekbaarheid: w }));
  const verdeeld = [1, 1, 5, 5].map((w) => antwoord({ bespreekbaarheid: w }));
  assert.equal(gemiddelde(eensgezind, 'bespreekbaarheid').gemiddelde, 3);
  assert.equal(gemiddelde(verdeeld, 'bespreekbaarheid').gemiddelde, 3);
  assert.equal(verdeling(eensgezind, 'bespreekbaarheid').tellingen[3], 4);
  assert.equal(verdeling(verdeeld, 'bespreekbaarheid').tellingen[3], 0);
  assert.ok(spreiding(verdeeld, 'bespreekbaarheid') > spreiding(eensgezind, 'bespreekbaarheid'));
});

test('spreiding heeft minstens twee antwoorden nodig', () => {
  assert.equal(spreiding([antwoord({ opbrengst: 4 })], 'opbrengst'), null);
  assert.equal(spreiding([], 'opbrengst'), null);
});

// ------------------------------------------------------------- de ondergrens

test('onder de vier antwoorden zeggen we niets over het team', () => {
  assert.equal(DREMPEL, 4);
  assert.equal(magTonen(3), false);
  assert.equal(magTonen(4), true);
  assert.equal(magTonen(0), false);
});

test('sterkste en meestVerdeeld zwijgen onder de drempel', () => {
  const drie = [5, 4, 3].map((w) => antwoord(alle(w)));
  assert.equal(sterkste(drie), null);
  assert.equal(meestVerdeeld(drie), null);
});

test('boven de drempel komt het sterkste thema eruit', () => {
  const lijst = [
    antwoord({ ...alle(3), duidelijkheid: 5 }),
    antwoord({ ...alle(3), duidelijkheid: 5 }),
    antwoord({ ...alle(3), duidelijkheid: 5 }),
    antwoord({ ...alle(3), duidelijkheid: 5 }),
  ];
  assert.equal(sterkste(lijst).id, 'duidelijkheid');
  assert.equal(sterkste(lijst).gemiddelde, 5);
});

test('het meest verdeelde thema is niet hetzelfde als het laagste', () => {
  // opbrengst staat overal op 2 (laag maar eensgezind),
  // bespreekbaarheid springt van 1 naar 5 (gemiddeld 3, maar verdeeld).
  const lijst = [
    antwoord({ ...alle(3), opbrengst: 2, bespreekbaarheid: 1 }),
    antwoord({ ...alle(3), opbrengst: 2, bespreekbaarheid: 1 }),
    antwoord({ ...alle(3), opbrengst: 2, bespreekbaarheid: 5 }),
    antwoord({ ...alle(3), opbrengst: 2, bespreekbaarheid: 5 }),
  ];
  assert.equal(meestVerdeeld(lijst).id, 'bespreekbaarheid');
  assert.equal(gemiddelde(lijst, 'opbrengst').gemiddelde, 2, 'opbrengst is lager');
});

// ---------------------------------------------------------------- compleet

test('een antwoord is pas compleet als alle stellingen gezien zijn', () => {
  assert.equal(isCompleet(antwoord(alle(4))), true);
  assert.equal(isCompleet(antwoord({ ...alle(4), opbrengst: undefined, })), true,
    'een sleutel met undefined is gezien');
  const zonder = alle(4);
  delete zonder.opbrengst;
  assert.equal(isCompleet(antwoord(zonder)), false);
});

test('niet kunnen oordelen is een antwoord, geen gat', () => {
  assert.equal(isCompleet(antwoord(alle(null))), true);
});

test('respons telt alleen wie helemaal klaar is', () => {
  const half = alle(4);
  delete half.opbrengst;
  const uit = respons([antwoord(alle(4)), antwoord(half)], 9);
  assert.deepEqual(uit, { ingevuld: 1, totaal: 9 });
});

// ------------------------------------------------------------- de controle

test('een score buiten de schaal komt er niet in', () => {
  assert.throws(() => valideerAntwoord(antwoord({ duidelijkheid: 6 })), /buiten de schaal/);
  assert.throws(() => valideerAntwoord(antwoord({ duidelijkheid: 0 })), /buiten de schaal/);
  assert.throws(() => valideerAntwoord(antwoord({ duidelijkheid: 3.5 })), /buiten de schaal/);
});

test('een stelling die niet bestaat komt er niet in', () => {
  assert.throws(() => valideerAntwoord(antwoord({ verzonnen: 3 })), /hoort niet bij deze teamcheck/);
});

test('niet kunnen oordelen is toegestaan', () => {
  assert.doesNotThrow(() => valideerAntwoord(antwoord(alle(null))));
});

test('een te lang open antwoord wordt geweigerd', () => {
  assert.throws(() => valideerAntwoord(antwoord(alle(3), { open: 'x'.repeat(2001) })), /te lang/);
  assert.doesNotThrow(() => valideerAntwoord(antwoord(alle(3), { open: 'x'.repeat(2000) })));
});

test('een naam zonder toestemming wordt geweigerd', () => {
  assert.throws(
    () => valideerAntwoord(antwoord(alle(3), { naam: 'Marleen', naamErbij: false })),
    /naamloos hoort te zijn/,
  );
  assert.doesNotThrow(() => valideerAntwoord(antwoord(alle(3), { naam: 'Marleen', naamErbij: true })));
  assert.doesNotThrow(() => valideerAntwoord(antwoord(alle(3), { naamErbij: false })));
});

// --------------------------------------------------------------- download

test('je download bevat je eigen antwoorden en niets van een ander', () => {
  const tekst = maakEigenDownload(
    antwoord({ ...alle(4), bespreekbaarheid: null }, { open: 'Het weekoverleg helpt.' }),
    'd30',
    '18 oktober 2026',
  );
  assert.match(tekst, /Mijn teamcheck/);
  assert.match(tekst, /Na 30 dagen — Eerste stappen/);
  assert.match(tekst, /Ingevuld op 18 oktober 2026/);
  assert.match(tekst, /alleen jouw eigen antwoorden/);
  assert.match(tekst, /Jouw antwoord: 4 — Eens/);
  assert.match(tekst, /Jouw antwoord: Kan ik nog niet beoordelen/);
  assert.match(tekst, /Het weekoverleg helpt\./);
  // Elke stelling staat erin, met zijn eigen tekst.
  for (const stelling of STELLINGEN) assert.ok(tekst.includes(stelling.tekst), stelling.id);
});

test('een leeg open antwoord leest als niet ingevuld, niet als een lege regel', () => {
  const tekst = maakEigenDownload(antwoord(alle(3)), 'd90');
  assert.match(tekst, /\(niet ingevuld\)/);
  assert.match(tekst, /Na 90 dagen/);
});

test('een overgeslagen stelling is iets anders dan niet kunnen oordelen', () => {
  const zonder = alle(3);
  delete zonder.opbrengst;
  const tekst = maakEigenDownload(antwoord(zonder), 'd30');
  assert.match(tekst, /Jouw antwoord: Niet ingevuld/);
});
