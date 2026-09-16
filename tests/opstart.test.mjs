import test from 'node:test';
import assert from 'node:assert/strict';
import { isBeheerpad, scanUitAdres } from '../src/lib/opstart.js';

test('alleen het beheer wacht op de aanmeldstatus', () => {
  for (const pad of ['/beheer', '/beheer/', '/beheer/scans', '/admin', '/admin/gebruikers']) {
    assert.equal(isBeheerpad(pad), true, pad);
  }
  for (const pad of ['/', '/onze-aanpak', '/app', '/beheerder-worden', '/administratie', '']) {
    assert.equal(isBeheerpad(pad), false, pad);
  }
  assert.equal(isBeheerpad(undefined), false);
});

test('een scanlink wordt uit het adres gelezen, oud en nieuw', () => {
  assert.equal(scanUitAdres('/deelnemen/abc123', ''), 'abc123');
  assert.equal(scanUitAdres('/deelnemen/abc123/extra', ''), 'abc123');
  assert.equal(scanUitAdres('/', '?scan=xyz789'), 'xyz789');
  assert.equal(scanUitAdres('/deelnemen/uit%20pad', ''), 'uit pad');
});

test('zonder scanlink komt er niets uit', () => {
  assert.equal(scanUitAdres('/', ''), null);
  assert.equal(scanUitAdres('/onze-aanpak', '?bron=nieuwsbrief'), null);
  assert.equal(scanUitAdres(undefined, undefined), null);
  assert.equal(scanUitAdres('/deelnemen/', ''), null);
});
