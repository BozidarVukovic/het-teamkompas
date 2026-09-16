import test from 'node:test';
import assert from 'node:assert/strict';
import { leesBijgewerkt, schrijfDatum } from '../src/lib/app/teamomgeving.js';

test('een Firestore-tijdstempel wordt een datum', () => {
  const stempel = { seconds: 1757980800, nanoseconds: 0, toDate() { return new Date(this.seconds * 1000); } };
  const datum = leesBijgewerkt({ bijgewerktOp: stempel });
  assert.ok(datum instanceof Date);
  assert.equal(datum.getTime(), 1757980800000);
});

test('een tijdstempel zonder toDate werkt ook', () => {
  const datum = leesBijgewerkt({ bijgewerktOp: { seconds: 1757980800, nanoseconds: 0 } });
  assert.equal(datum.getTime(), 1757980800000);
});

test('is er niet bijgewerkt, dan telt de datum van inrichten', () => {
  const datum = leesBijgewerkt({ aangemaaktOp: new Date('2026-06-04T10:00:00Z') });
  assert.equal(datum.toISOString(), '2026-06-04T10:00:00.000Z');
});

test('bijgewerkt wint van aangemaakt', () => {
  const datum = leesBijgewerkt({ bijgewerktOp: new Date('2026-09-16T08:00:00Z'), aangemaaktOp: new Date('2026-06-04T10:00:00Z') });
  assert.equal(datum.getUTCMonth(), 8);
});

test('wat geen datum is, levert niets op in plaats van Invalid Date', () => {
  assert.equal(leesBijgewerkt(null), null);
  assert.equal(leesBijgewerkt({}), null);
  assert.equal(leesBijgewerkt({ bijgewerktOp: 'geen datum' }), null);
  assert.equal(leesBijgewerkt({ bijgewerktOp: {} }), null);
  assert.equal(leesBijgewerkt({ bijgewerktOp: { toDate() { throw new Error('stuk'); } } }), null);
});

test('de datum wordt in het Nederlands uitgeschreven', () => {
  assert.equal(schrijfDatum(new Date('2026-09-16T12:00:00Z')), '16 september 2026');
  assert.equal(schrijfDatum(null), '');
  assert.equal(schrijfDatum(new Date('kapot')), '');
});
