import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSession, applyCommand } from '../src/engine/session.js';
import { validateProfile } from '../src/engine/profile.js';
import { createTabletop } from '../src/application/tabletop.js';
import { milanModule } from '../src/games/milan-uprising/module.js';
const profile = JSON.parse(await readFile(new URL('../data/games/milan-uprising/demo.json', import.meta.url), 'utf8'));
const command = (state, type, payload) => ({ type, actorId: 'local', expectedRevision: state.revision, payload });
test('headless referentiesessie: bewegen, bezetting, verwijderen en worp', () => {
  const table = createTabletop({ profile, module: milanModule, random: () => 4 });
  table.place('p1','A1'); table.place('p1','H5'); table.place('p2','A1');
  const before = table.snapshot();
  assert.throws(() => table.place('p1','A1'), /occupied/);
  assert.deepEqual(table.snapshot(), before);
  table.remove('p2'); table.roll(6);
  assert.equal(table.snapshot().revision, 5);
  assert.equal(table.snapshot().placements.p1, 'H5');
  assert.equal(table.snapshot().events.at(-1).payload.value, 4);
  assert.equal(table.exportSession().format, 'tabletop-session');
});
test('tweede spelprofiel met onregelmatige zones en meerdere pionnen per zone', () => {
  const other = { ...structuredClone(profile), gameId: 'synthetic', zones: [{ id:'haven',label:'Haven',capacity:3 }, { id:'tower',label:'Toren',capacity:1 }, { id:'forest',label:'Bos',capacity:2 }], dice: [20], presentation: { columns: 2, zoneOrder: ['haven','tower','forest'] } };
  const module = { ...milanModule, id:'synthetic' };
  const table = createTabletop({ profile: other, module, random: () => 20 });
  table.place('p1','haven'); table.place('p2','haven'); table.place('p3','haven');
  assert.throws(() => table.place('p4','haven'));
  table.place('p4','tower'); table.roll(20);
  assert.equal(table.project().zones[0].occupants.length,3);
  assert.equal(table.snapshot().events.at(-1).payload.value,20);
});
test('ongeldige opdrachten muteren niets; revisie en actor worden gecontroleerd', () => {
  const state = createSession(profile,milanModule), original = structuredClone(state);
  for (const cmd of [
    command(state,'component.place',{componentId:'missing',zoneId:'A1'}),
    command(state,'component.place',{componentId:'p1',zoneId:'missing'}),
    command(state,'dice.record',{sides:6,value:7}),
    command(state,'dice.record',{sides:20,value:1}),
    command(state,'dice.record',{sides:6,value:1.5}),
    command(state,'unknown',{}),
    {...command(state,'component.remove',{componentId:'p1'}),expectedRevision:9},
    {...command(state,'component.remove',{componentId:'p1'}),actorId:'stranger'}
  ]) { assert.throws(() => applyCommand(state,cmd,profile,milanModule)); assert.deepEqual(state,original); }
});
test('profielvalidatie weigert dubbele IDs, capaciteit, schema en niet ondersteunde inhoud', () => {
  for (const mutate of [p => p.schemaVersion = 2, p => p.zones.push(p.zones[0]), p => p.zones[0].capacity = 0, p => p.components.push(p.components[0]), p => p.cards.push({id:'card'}), p => p.dice = [0]]) {
    const invalid = structuredClone(profile); mutate(invalid); assert.throws(() => validateProfile(invalid));
  }
  assert.throws(() => createSession(profile,milanModule,'rules'));
});
test('projectie, export en modulevalidatie kunnen interne toestand niet muteren', () => {
  const table = createTabletop({ profile, module:milanModule, random: () => 1 });
  const projection = table.project(); projection.components[0].label = 'veranderd';
  const snapshot = table.snapshot(); snapshot.placements.p1 = 'A1';
  const exported = table.exportSession(); exported.state.revision = 99;
  assert.equal(table.snapshot().revision,0); assert.equal(table.snapshot().placements.p1,null);
  assert.notEqual(table.project().components[0].label,'veranderd');
  const state = createSession(profile,milanModule);
  const rejecting = { ...milanModule, validate(s) { s.placements.p1 = 'H5'; throw Error('Module weigert'); } };
  assert.throws(() => applyCommand(state,command(state,'component.place',{componentId:'p1',zoneId:'A1'}),profile,rejecting));
  assert.equal(state.placements.p1,null);
});
test('replay gebruikt vastgelegde worpen en blijft onafhankelijk van projecties', () => {
  const first = createTabletop({profile,module:milanModule,random:()=>3});
  first.place('p1','A1'); first.project(); first.roll(6); first.place('p1','H5');
  let replay = createSession(profile,milanModule);
  for (const event of first.snapshot().events) replay = applyCommand(replay, command(replay,event.type,event.payload),profile,milanModule);
  assert.deepEqual(replay,first.snapshot());
  first.reset(); assert.equal(first.snapshot().revision,0);
});
