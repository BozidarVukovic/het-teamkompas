import test from 'node:test';
import assert from 'node:assert/strict';
import { inlogAdres } from '../functions/inloglinkAdres.js';

const VAN_FIREBASE = 'https://mijn-teamkompas-6de84.firebaseapp.com/__/auth/action?mode=signIn&oobCode=ABC123&apiKey=SLEUTEL&continueUrl=https%3A%2F%2Fwww.mijnteamkompas.nl%2Fapp%2Finloggen&lang=nl';
const TERUG = 'https://www.mijnteamkompas.nl/app/inloggen';

test('de link wijst naar ons eigen domein en houdt de eenmalige code', () => {
  const adres = new URL(inlogAdres(VAN_FIREBASE, TERUG, ''));
  assert.equal(adres.origin, 'https://www.mijnteamkompas.nl');
  assert.equal(adres.pathname, '/app/inloggen');
  assert.equal(adres.searchParams.get('mode'), 'signIn');
  assert.equal(adres.searchParams.get('oobCode'), 'ABC123');
  assert.equal(adres.searchParams.get('apiKey'), 'SLEUTEL');
});

test('de teamcode reist mee, zodat hij een browserwissel overleeft', () => {
  const adres = new URL(inlogAdres(VAN_FIREBASE, TERUG, 'HRBB-2026'));
  assert.equal(adres.searchParams.get('code'), 'HRBB-2026');
  // En de inloggegevens blijven er gewoon naast staan.
  assert.equal(adres.searchParams.get('oobCode'), 'ABC123');
});

test('zonder code komt er geen lege code in het adres', () => {
  assert.equal(new URL(inlogAdres(VAN_FIREBASE, TERUG, '')).searchParams.has('code'), false);
  assert.equal(new URL(inlogAdres(VAN_FIREBASE, TERUG)).searchParams.has('code'), false);
});

test('een andere toegestane bestemming werkt net zo', () => {
  const adres = new URL(inlogAdres(VAN_FIREBASE, 'http://localhost:5173/app/inloggen', 'TEST-0001'));
  assert.equal(adres.origin, 'http://localhost:5173');
  assert.equal(adres.searchParams.get('code'), 'TEST-0001');
  assert.equal(adres.searchParams.get('oobCode'), 'ABC123');
});
