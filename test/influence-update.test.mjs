import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTabletop } from '../src/application/tabletop.js';
import { milanModule } from '../src/games/milan-uprising/module.js';
import { buildInfluenceArrangement } from '../src/games/milan-uprising/influence-update.js';
const profile = JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json', import.meta.url)));
const make = () => createTabletop({ profile, module: milanModule });
const count = (state, zone, faction) => profile.components.filter(c => c.groupId === `${faction}-cubes` && state.placements[c.id] === zone).length;

test('absolute appinvloed wordt atomair overgenomen en behoudt andere onderdelen en fichezijden', () => {
  const table = make();
  table.place('character-toreador', 'haven-3l');
  table.place('influence-anarchs-1', 'sempione');
  table.place('investigation-1', 'sempione');
  table.place('control-anarchs-ambrose-1', 'solari');
  table.flip('control-anarchs-ambrose-1');
  const before = table.snapshot();
  const updates = [{ zoneId: 'sant-ambrogio', faction: 'ambrose', count: 3 }, { zoneId: 'solari', faction: 'ambrose', count: 3 }, { zoneId: 'sempione', faction: 'ambrose', count: 1 }];
  table.arrange(buildInfluenceArrangement(profile, before, updates));
  const state = table.snapshot();
  assert.equal(state.revision, before.revision + 1);
  for (const update of updates) assert.equal(count(state, update.zoneId, update.faction), update.count);
  for (const id of ['character-toreador', 'influence-anarchs-1', 'investigation-1', 'control-anarchs-ambrose-1']) assert.equal(state.placements[id], before.placements[id]);
  assert.deepEqual(state.faces, before.faces);
  assert.equal(buildInfluenceArrangement(profile, state, updates).changed, false);
  table.undo(); assert.deepEqual(table.snapshot(), before);
});

test('invloedsafname maakt voorraad vrij vóór toename, zonder afhankelijkheid van invoervolgorde', () => {
  const table = make(), pool = profile.components.filter(c => c.groupId === 'ambrose-cubes');
  const zones = ['qt8', 'portello', 'solari', 'sempione', 'sant-ambrogio'];
  pool.forEach((c, i) => table.place(c.id, zones[Math.floor(i / 3)]));
  const updates = [{ zoneId: 'duomo', faction: 'ambrose', count: 3 }, { zoneId: 'qt8', faction: 'ambrose', count: 0 }];
  const state = table.snapshot();
  assert.deepEqual(buildInfluenceArrangement(profile, state, updates), buildInfluenceArrangement(profile, state, updates.toReversed()));
  table.arrange(buildInfluenceArrangement(profile, state, updates));
  assert.equal(count(table.snapshot(), 'duomo', 'ambrose'), 3);
  assert.equal(count(table.snapshot(), 'qt8', 'ambrose'), 0);
});

test('ongeldige eindstanden of voorraadtekort wijzigen de tafel niet', () => {
  const table = make(), state = table.snapshot();
  for (const updates of [[{ zoneId: 'haven-1l', faction: 'ambrose', count: 1 }], [{ zoneId: 'qt8', faction: 'ambrose', count: 4 }], [{ zoneId: 'qt8', faction: 'unknown', count: 1 }], [{ zoneId: 'qt8', faction: 'ambrose', count: 1 }, { zoneId: 'qt8', faction: 'ambrose', count: 2 }], profile.zones.filter(z => z.area === 'city').slice(0, 6).map(z => ({ zoneId: z.id, faction: 'ambrose', count: 3 }))]) {
    assert.throws(() => buildInfluenceArrangement(profile, state, updates));
    assert.deepEqual(table.snapshot(), state);
  }
});
