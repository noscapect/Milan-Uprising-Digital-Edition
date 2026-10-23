import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateProfile } from '../src/engine/profile.js';
import { createTabletop } from '../src/application/tabletop.js';
import { milanModule } from '../src/games/milan-uprising/module.js';

const profile = JSON.parse(await readFile(new URL('../data/games/milan-uprising/retail.json', import.meta.url), 'utf8'));
const setup = () => createTabletop({ profile, module: milanModule, random: () => 7 });

test('retailpakket volgt de officiële fysieke aantallen en bevat echte personages en NPC’s', () => {
  validateProfile(profile);
  assert.equal(profile.components.length, 132);
  assert.equal(new Set(profile.components.map(c => c.id)).size, 132);
  const counts = Object.fromEntries(profile.componentGroups.map(group => [group.id, profile.components.filter(c => c.groupId === group.id).length]));
  assert.deepEqual(counts, { characters: 7, allies: 2, ghouls: 2, 'anarch-cubes': 30, 'camarilla-cubes': 20, 'ambrose-cubes': 15, control: 29, investigation: 18, masquerade: 1, npcs: 8 });
  const controls = profile.components.filter(c => c.groupId === 'control');
  assert.equal(controls.filter(c => c.faces.map(f => f.id).join('/') === 'anarchs/camarilla').length, 19);
  assert.equal(controls.filter(c => c.faces.map(f => f.id).join('/') === 'anarchs/ambrose').length, 9);
  assert.equal(controls.filter(c => c.faces.map(f => f.id).join('/') === 'camarilla/ambrose').length, 1);
  assert.match(profile.components.find(c => c.id === 'character-brujah').label, /Simona Ferrari/);
  assert.equal(profile.components.find(c => c.id === 'npc-agnese-della-luna').label, 'Agnese Della Luna');
  assert.deepEqual(profile.dice, [10]);
});

test('fiche omkeren bewaart zijn zone en draait mee met undo, redo en leegmaken', () => {
  const table = setup(), id = 'control-anarchs-camarilla-1';
  table.place(id, 'A1'); table.flip(id);
  assert.equal(table.snapshot().faces[id], 'camarilla');
  assert.equal(table.snapshot().placements[id], 'A1');
  assert.equal(table.project().zones[0].occupants[0].faceLabel, 'Camarilla');
  table.undo(); assert.equal(table.snapshot().faces[id], 'anarchs');
  table.redo(); assert.equal(table.snapshot().faces[id], 'camarilla');
  table.remove(id); assert.equal(table.snapshot().faces[id], 'camarilla');
  table.place(id, 'B2'); assert.equal(table.snapshot().faces[id], 'camarilla');
  table.reset(); assert.equal(table.snapshot().faces[id], 'anarchs');
  table.undo(); assert.equal(table.snapshot().placements[id], 'B2');
});

test('retailcomponenten delen zones; onderzoeksfiche en controlefiche blijven afzonderlijk', () => {
  const table = setup();
  const ids = ['character-brujah', 'character-tremere', 'influence-anarchs-1', 'influence-camarilla-1', 'investigation-1', 'masquerade', 'npc-agnese-della-luna'];
  for (const id of ids) table.place(id, 'C3');
  table.flip('investigation-1');
  assert.equal(table.snapshot().faces['investigation-1'], 'restricted');
  assert.equal(table.project().zones.find(z => z.id === 'C3').occupants.length, ids.length);
  assert.equal(table.snapshot().faces['control-anarchs-camarilla-1'], 'anarchs');
  const before = table.snapshot();
  for (const id of ['character-brujah', 'influence-anarchs-1', 'masquerade', 'unknown']) {
    assert.throws(() => table.flip(id)); assert.deepEqual(table.snapshot(), before);
  }
});

test('retailsessie herstelt via replay ook ficheszijden en weigert onjuiste eindtoestand', () => {
  const first = setup(); first.place('character-nosferatu', 'H5'); first.flip('investigation-18'); first.roll(10);
  const saved = JSON.parse(JSON.stringify(first.exportSession()));
  const second = setup(); second.restoreSession(saved);
  assert.deepEqual(second.snapshot(), first.snapshot());
  assert.equal(second.exportSession().package.releaseId, 'retail-core');
  const tampered = structuredClone(saved); tampered.state.faces['investigation-18'] = 'investigation';
  const before = second.snapshot();
  assert.throws(() => second.restoreSession(tampered), /does not match/);
  assert.deepEqual(second.snapshot(), before);
  assert.equal(JSON.stringify(second.snapshot()).includes('color'), false);
});

test('schema 2 weigert onvolledige brongegevens, groepen en ongeldige zijden', () => {
  for (const mutate of [
    p => p.sources = [],
    p => p.sources[0].url = 'javascript:alert(1)',
    p => p.sources.push(p.sources[0]),
    p => p.components[0].sourceId = 'unknown',
    p => p.components[0].groupId = 'unknown',
    p => p.componentGroups.push(p.componentGroups[0]),
    p => p.components[0].color = 'url(example)',
    p => p.components.find(c => c.faces).faces = [],
    p => { const component = p.components.find(c => c.faces); component.faces[1].id = component.faces[0].id; },
    p => p.components.find(c => c.faces).faces[0].color = 'invalid',
    p => p.schemaVersion = 99
  ]) { const invalid = structuredClone(profile); mutate(invalid); assert.throws(() => validateProfile(invalid)); }
});
