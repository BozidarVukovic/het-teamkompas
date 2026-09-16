import test from 'node:test';
import assert from 'node:assert/strict';
import mail from '../functions/inloglinkMail.js';

const { mailtekst } = mail;
const LINK = 'https://www.mijnteamkompas.nl/app/inloggen?mode=signIn&oobCode=ABC123&code=HRBB-2026';

test('een uitnodiging noemt het team bij naam', () => {
  const { html, plat } = mailtekst({ link: LINK, teamNaam: 'HR Business & Beleid', code: 'HRBB-2026' });
  assert.match(plat, /uitgenodigd voor HR Business & Beleid/);
  assert.match(html, /uitgenodigd voor <strong>HR Business & Beleid<\/strong>/);
});

test('zonder team is het gewoon een aangevraagde inloglink', () => {
  const { html, plat } = mailtekst({ link: LINK, teamNaam: '', code: '' });
  assert.match(plat, /Je vroeg een inloglink aan/);
  assert.match(html, /Je vroeg een inloglink aan/);
  assert.doesNotMatch(plat, /teamcode/i);
});

test('de teamcode staat in de mail, voor als de knop het niet doet', () => {
  const { html, plat } = mailtekst({ link: LINK, teamNaam: 'HR Business & Beleid', code: 'HRBB-2026' });
  assert.match(plat, /teamcode in: HRBB-2026/);
  assert.match(html, /HRBB-2026/);
});

test('de inloglink staat er zowel als knop als om te plakken', () => {
  const { html, plat } = mailtekst({ link: LINK, teamNaam: '', code: '' });
  assert.ok(plat.includes(LINK));
  assert.ok((html.match(new RegExp(LINK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length >= 2);
});

test('de voetregel klopt bij een uitnodiging, en bij een eigen aanvraag', () => {
  const uit = mailtekst({ link: LINK, teamNaam: 'HR Business & Beleid', code: 'HRBB-2026' });
  assert.match(uit.html, /bent uitgenodigd voor HR Business & Beleid op mijnteamkompas\.nl/);
  const zelf = mailtekst({ link: LINK, teamNaam: '', code: '' });
  assert.match(zelf.html, /omdat er met dit adres is ingelogd/);
});
