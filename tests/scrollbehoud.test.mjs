import test from 'node:test';
import assert from 'node:assert/strict';
import { houdOpZijnPlek } from '../src/lib/app/scrollbehoud.js';

// Een nagebouwde pagina: de kop zakt elke frame 10 pixels omhoog doordat er
// boven hem iets dichtklapt, en het scrollen corrigeert dat weer.
function pagina() {
  const staat = { top: 300, verschoven: 0, tijd: 0 };
  const wacht = [];
  return {
    staat,
    meet: () => staat.top,
    nu: () => staat.tijd,
    verschuif: (dy) => { staat.verschoven += dy; staat.top -= dy; },
    plan: (fn) => wacht.push(fn),
    frame: (zak) => {
      staat.tijd += 16;
      staat.top -= zak;
      const nu = wacht.splice(0, wacht.length);
      nu.forEach((fn) => fn());
    },
    open: () => wacht.length,
  };
}

test('de kop blijft staan terwijl de pagina onder hem inzakt', () => {
  const p = pagina();
  houdOpZijnPlek(p.meet, 300, { nu: p.nu, plan: p.plan, verschuif: p.verschuif, duur: 100 });
  for (let i = 0; i < 4; i += 1) p.frame(10);
  assert.equal(p.staat.top, 300);
  assert.equal(p.staat.verschoven, -40);
});

test('zonder beweging wordt er niet gescrold', () => {
  const p = pagina();
  houdOpZijnPlek(p.meet, 300, { nu: p.nu, plan: p.plan, verschuif: p.verschuif, duur: 100 });
  for (let i = 0; i < 4; i += 1) p.frame(0);
  assert.equal(p.staat.verschoven, 0);
});

test('na de duur stopt het corrigeren', () => {
  const p = pagina();
  houdOpZijnPlek(p.meet, 300, { nu: p.nu, plan: p.plan, verschuif: p.verschuif, duur: 50 });
  p.frame(0);
  p.frame(0);
  p.frame(0);
  p.frame(0);
  assert.equal(p.open(), 0);
});
