import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTabletop } from '../src/application/tabletop.js';
import { milanModule } from '../src/games/milan-uprising/module.js';
import { createVirtualCore } from '../src/adapters/virtual-core.js';
const profile = JSON.parse(await readFile(new URL('../data/games/milan-uprising/interaction.json',import.meta.url),'utf8'));
function setup() {
  const table = createTabletop({profile,module:milanModule,random:()=>7});
  const core = createVirtualCore(table,{demoSensorA:'A1',demoSensorB:'B1'});
  return {table,core};
}
test('identiteit, tijdelijk sensorcontact en blijvende spelpositie zijn gescheiden',()=>{
  const {table,core} = setup();
  assert.throws(()=>core.touch('demoSensorA'),/Register/);
  core.register('p1'); core.touch('demoSensorA');
  assert.equal(table.snapshot().placements.p1,'A1');
  core.release();
  assert.equal(core.snapshot().contact,null);
  assert.equal(table.snapshot().placements.p1,'A1');
  assert.equal(table.snapshot().revision,1);
  core.register('p2'); core.touch('demoSensorA'); core.release();
  assert.equal(table.project().zones.find(zone=>zone.id==='A1').occupants.length,2);
});
test('herhaalde interactie verplaatst niet; geen spelregel of appbericht wordt uitgevoerd',()=>{
  const {table,core} = setup();
  core.register('p1'); core.touch('demoSensorA'); core.release();
  core.touch('demoSensorA');
  assert.equal(table.snapshot().events.at(-1).type,'component.interact');
  assert.equal(table.snapshot().placements.p1,'A1');
  assert.equal(core.capabilities.officialAppConnected,false);
  assert.equal(core.capabilities.ble,false);
});
test('bezet contact en ongeldige mapping/identiteit veranderen niets',()=>{
  const {table,core} = setup();
  core.register('p1'); core.touch('demoSensorA');
  const before = table.snapshot(), input = core.snapshot();
  assert.throws(()=>core.register('p2')); assert.throws(()=>core.touch('demoSensorB'));
  assert.deepEqual(core.snapshot(),input); assert.deepEqual(table.snapshot(),before);
  core.release();
  assert.throws(()=>core.register('unknown')); assert.throws(()=>core.touch('unknown'));
  assert.throws(()=>createVirtualCore(table,{bad:'unknown-zone'}));
  assert.deepEqual(table.snapshot(),before);
});
test('verplaatsen na vrijgeven en expliciet verwijderen zijn aparte handelingen',()=>{
  const {table,core} = setup();
  core.register('p1'); core.touch('demoSensorA'); core.release(); core.touch('demoSensorB'); core.release();
  assert.equal(table.snapshot().placements.p1,'B1');
  table.remove('p1'); assert.equal(table.snapshot().placements.p1,null);
  assert.throws(()=>table.interact('p1','B1'));
  table.roll(10); assert.equal(table.snapshot().events.at(-1).payload.value,7);
  core.reset(); table.reset(); assert.equal(core.snapshot().active,null); assert.equal(table.snapshot().revision,0);
});
