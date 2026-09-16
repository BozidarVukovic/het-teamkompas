import test from 'node:test';
import assert from 'node:assert/strict';
import { maakPaginaLader } from '../src/lib/paginaLaden.js';

function nepOpslag() {
  const inhoud = new Map();
  return { getItem: (k) => (inhoud.has(k) ? inhoud.get(k) : null), setItem: (k, v) => inhoud.set(k, v), removeItem: (k) => inhoud.delete(k) };
}

test('een scherm dat gewoon laadt, komt gewoon terug', async () => {
  const laad = maakPaginaLader({ opslag: nepOpslag(), herlaad: () => assert.fail('had niet mogen verversen') });
  assert.deepEqual(await laad(() => Promise.resolve({ standaard: 'scherm' })), { standaard: 'scherm' });
});

test('een mislukte import ververst eenmalig', async () => {
  let ververst = 0;
  const laad = maakPaginaLader({ opslag: nepOpslag(), herlaad: () => { ververst += 1; } });
  const belofte = laad(() => Promise.reject(new Error('chunk weg')));
  await Promise.race([belofte, new Promise((r) => setTimeout(r, 20))]);
  assert.equal(ververst, 1);
});

test('na het verversen wordt er niet nog eens ververst', async () => {
  const opslag = nepOpslag();
  let ververst = 0;
  const laad = maakPaginaLader({ opslag, herlaad: () => { ververst += 1; } });
  await Promise.race([laad(() => Promise.reject(new Error('weg'))), new Promise((r) => setTimeout(r, 20))]);
  await assert.rejects(laad(() => Promise.reject(new Error('weg nog steeds'))));
  assert.equal(ververst, 1);
});

test('een geslaagde lading wist het merkteken, zodat een latere versie weer mag', async () => {
  const opslag = nepOpslag();
  let ververst = 0;
  const laad = maakPaginaLader({ opslag, herlaad: () => { ververst += 1; } });
  await Promise.race([laad(() => Promise.reject(new Error('weg'))), new Promise((r) => setTimeout(r, 20))]);
  await laad(() => Promise.resolve({ standaard: 'ok' }));
  await Promise.race([laad(() => Promise.reject(new Error('weer weg'))), new Promise((r) => setTimeout(r, 20))]);
  assert.equal(ververst, 2);
});

test('opslag die gooit, maakt niets kapot', async () => {
  const stuk = { getItem: () => { throw new Error('privevenster'); }, setItem: () => { throw new Error('privevenster'); }, removeItem: () => { throw new Error('privevenster'); } };
  let ververst = 0;
  const laad = maakPaginaLader({ opslag: stuk, herlaad: () => { ververst += 1; } });
  assert.deepEqual(await laad(() => Promise.resolve({ standaard: 'ok' })), { standaard: 'ok' });
  await Promise.race([laad(() => Promise.reject(new Error('weg'))), new Promise((r) => setTimeout(r, 20))]);
  assert.equal(ververst, 1);
});
