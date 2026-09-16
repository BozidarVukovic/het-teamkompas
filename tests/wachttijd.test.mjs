import test from 'node:test';
import assert from 'node:assert/strict';
import { wachtOpAanmelding } from '../src/lib/app/wachttijd.js';

// Een nagebouwde klok, zodat de test niet acht seconden hoeft te duren.
function klok() {
  const taken = new Map();
  let volgende = 1;
  return {
    plan: (fn, ms) => { const id = volgende++; taken.set(id, { fn, ms }); return id; },
    stopPlan: (id) => taken.delete(id),
    laatLopen: (ms) => { for (const [id, t] of [...taken]) if (t.ms <= ms) { taken.delete(id); t.fn(); } },
    open: () => taken.size,
  };
}

test('een antwoord van Firebase wint en zet de rem uit', () => {
  const k = klok();
  const ontvangen = [];
  wachtOpAanmelding((ontvang) => { ontvang({ uid: 'bo' }); return () => {}; }, (u, hoe) => ontvangen.push([u, hoe]), { plan: k.plan, stopPlan: k.stopPlan });
  assert.deepEqual(ontvangen, [[{ uid: 'bo' }, { viaNoodrem: false }]]);
  assert.equal(k.open(), 0);
});

test('blijft het antwoord uit, dan gaan we verder alsof er niemand is', () => {
  const k = klok();
  const ontvangen = [];
  wachtOpAanmelding(() => () => {}, (u, hoe) => ontvangen.push([u, hoe]), { wachttijd: 100, plan: k.plan, stopPlan: k.stopPlan });
  assert.deepEqual(ontvangen, []);
  k.laatLopen(100);
  assert.deepEqual(ontvangen, [[null, { viaNoodrem: true }]]);
});

test('een laat antwoord na de rem wordt alsnog doorgegeven', () => {
  const k = klok();
  const ontvangen = [];
  let laat;
  wachtOpAanmelding((ontvang) => { laat = ontvang; return () => {}; }, (u) => ontvangen.push(u), { wachttijd: 100, plan: k.plan, stopPlan: k.stopPlan });
  k.laatLopen(100);
  laat({ uid: 'bo' });
  assert.deepEqual(ontvangen, [null, { uid: 'bo' }]);
});

test('de rem gaat niet alsnog af na een antwoord', () => {
  const k = klok();
  const ontvangen = [];
  wachtOpAanmelding((ontvang) => { ontvang(null); return () => {}; }, (u) => ontvangen.push(u), { wachttijd: 100, plan: k.plan, stopPlan: k.stopPlan });
  k.laatLopen(100);
  assert.equal(ontvangen.length, 1);
});

test('opruimen stopt zowel de luisteraar als de rem', () => {
  const k = klok();
  let gestopt = false;
  const opruimen = wachtOpAanmelding(() => () => { gestopt = true; }, () => {}, { wachttijd: 100, plan: k.plan, stopPlan: k.stopPlan });
  opruimen();
  assert.equal(gestopt, true);
  assert.equal(k.open(), 0);
});
