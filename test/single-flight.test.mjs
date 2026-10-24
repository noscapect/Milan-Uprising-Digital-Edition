import test from 'node:test';
import assert from 'node:assert/strict';
import {createSingleFlight} from '../src/adapters/single-flight.js';

test('langzame statusverzoeken overlappen niet en de volgende ronde leest opnieuw', async () => {
  let calls = 0, release;
  const read = createSingleFlight(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  const first = read();
  assert.equal(read(), first);
  await Promise.resolve();
  assert.equal(calls, 1);
  release({revision: 1});
  assert.deepEqual(await first, {revision: 1});
  const next = read();
  assert.notEqual(next, first);
  await Promise.resolve();
  assert.equal(calls, 2);
  release({revision: 2});
  assert.deepEqual(await next, {revision: 2});
});

test('een mislukt statusverzoek blokkeert latere verversingen niet', async () => {
  let calls = 0;
  const read = createSingleFlight(() => { if (++calls === 1) throw Error('offline'); return 'reconnected'; });
  const failed = read();
  assert.equal(read(), failed);
  await assert.rejects(failed, /offline/);
  assert.equal(await read(), 'reconnected');
});
