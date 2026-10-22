import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTabletop } from '../src/application/tabletop.js';
import { createSession, applyCommand } from '../src/engine/session.js';
import { validateProfile } from '../src/engine/profile.js';
import { milanModule } from '../src/games/milan-uprising/module.js';

const profile = JSON.parse(await readFile(new URL('../data/games/milan-uprising/table.json', import.meta.url), 'utf8'));
const setup = (data = profile) => createTabletop({ profile: data, module: milanModule, random: () => 8 });

test('pionnen, kubussen en fiches delen een zone en verplaatsen afzonderlijk', () => {
  const table = setup();
  for (const id of ['p1', 'p2', 'cube-1', 'cube-2', 'token-1']) table.place(id, 'A1');
  assert.equal(table.project().zones.find(z => z.id === 'A1').occupants.length, 5);
  table.place('cube-1', 'H5');
  table.remove('token-1');
  assert.equal(table.snapshot().placements['cube-1'], 'H5');
  assert.equal(table.snapshot().placements['token-1'], null);
  assert.equal(table.snapshot().placements.p1, 'A1');
  assert.equal(table.snapshot().placements['cube-2'], 'A1');
  assert.equal(table.project().zones.find(z => z.id === 'A1').occupants.length, 3);
});

test('gemengde zonecapaciteit blijft atomair en vreemde componenttypen worden geweigerd', () => {
  const limited = structuredClone(profile); limited.zones[0].capacity = 2;
  const table = setup(limited);
  table.place('p1', 'A1'); table.place('token-1', 'A1'); table.place('cube-1', 'B1');
  const before = table.snapshot();
  assert.throws(() => table.place('cube-1', 'A1'), /bezet/);
  assert.deepEqual(table.snapshot(), before);
  table.place('p1', 'A1'); // Herplaatsen telt het onderdeel zelf niet dubbel.
  const invalid = structuredClone(profile); invalid.components[0].kind = 'script';
  assert.throws(() => validateProfile(invalid), /componenttype/);
});

test('volledige werkvoorraad, d10 en export blijven headless reproduceerbaar', () => {
  const table = setup();
  for (const component of profile.components) table.place(component.id, 'C3');
  table.roll(10); table.remove('cube-1');
  const exported = JSON.parse(JSON.stringify(table.exportSession()));
  let replay = createSession(profile, milanModule);
  for (const event of exported.state.events) replay = applyCommand(replay, {
    type: event.type, payload: event.payload, actorId: event.actorId, expectedRevision: replay.revision
  }, profile, milanModule);
  assert.deepEqual(replay, table.snapshot());
  assert.equal(exported.package.releaseId, 'virtual-table');
  assert.equal(table.project().zones.find(z => z.id === 'C3').occupants.length, profile.components.length - 1);
  table.reset();
  assert.ok(Object.values(table.snapshot().placements).every(value => value === null));
});

test('sessie hervatten controleert alle events en hergebruikt worpen zonder nieuwe willekeur', () => {
  const first = setup(); first.place('p1', 'A1'); first.place('cube-1', 'A1'); first.roll(10);
  const saved = JSON.parse(JSON.stringify(first.exportSession()));
  const second = createTabletop({ profile, module: milanModule, random: () => { throw Error('Geen nieuwe worp tijdens hervatten'); } });
  second.place('token-1', 'B2'); second.restoreSession(saved);
  assert.deepEqual(second.snapshot(), first.snapshot());
  second.place('token-2', 'A1'); assert.equal(second.snapshot().revision, 4);
  saved.state.placements.p1 = 'H5'; assert.equal(second.snapshot().placements.p1, 'A1');
});

test('beschadigde, vreemde en simulatorbestanden vervangen nooit de huidige tafel', () => {
  const source = setup(); source.place('cube-1', 'A1'); source.roll(10);
  const table = setup(); table.place('p2', 'H5');
  const before = table.snapshot();
  for (const mutate of [
    save => save.format = 'legacy',
    save => save.package.releaseId = 'other',
    save => save.module.version = 'other',
    save => save.state.mode = 'rules',
    save => save.state.placements['cube-1'] = 'B2',
    save => save.state.events[0].sequence = 2,
    save => save.state.events[0].schemaVersion = 2,
    save => save.state.events[0].payload.zoneId = 'unknown',
    save => save.state.events[1].payload.value = 11,
    save => save.state.events.push(save.state.events[0]),
    save => save.inputSimulation = { active: 'p1' }
  ]) {
    const damaged = structuredClone(source.exportSession()); mutate(damaged);
    assert.throws(() => table.restoreSession(damaged));
    assert.deepEqual(table.snapshot(), before);
  }
  assert.throws(() => table.restoreSession(null));
  assert.deepEqual(table.snapshot(), before);
});

test('ongedaan maken en opnieuw uitvoeren herstellen plaatsing, verwijderen en leegmaken', () => {
  const table = setup();
  assert.throws(() => table.undo()); assert.throws(() => table.redo());
  table.place('p1', 'A1'); table.place('cube-1', 'A1'); table.remove('p1');
  const removed = table.snapshot();
  table.undo(); assert.equal(table.snapshot().placements.p1, 'A1');
  table.redo(); assert.deepEqual(table.snapshot(), removed);
  table.reset(); assert.equal(table.snapshot().revision, 0);
  table.undo(); assert.deepEqual(table.snapshot(), removed);
  table.redo(); assert.equal(table.snapshot().revision, 0);
});

test('worp opnieuw uitvoeren gebruikt dezelfde waarde en een nieuwe handeling vervangt de toekomst', () => {
  let randomCalls = 0;
  const table = createTabletop({ profile, module: milanModule, random: () => ++randomCalls });
  table.place('p1', 'A1'); table.roll(10);
  const rolled = table.snapshot();
  table.undo(); table.redo();
  assert.deepEqual(table.snapshot(), rolled); assert.equal(randomCalls, 1);
  table.undo();
  assert.throws(() => table.place('missing', 'A1'));
  assert.equal(table.project().canRedo, true);
  table.place('token-1', 'B2');
  assert.equal(table.project().canRedo, false); assert.throws(() => table.redo());
  const restored = setup(); restored.restoreSession(table.exportSession());
  assert.deepEqual(restored.snapshot(), table.snapshot());
  assert.equal(restored.project().canUndo, false); assert.equal(restored.project().canRedo, false);
});

test('geschiedenis bewaart maximaal honderd handelingen en ongeldige import behoudt herstelmogelijkheden', () => {
  const table = setup();
  for (let i = 0; i < 105; i++) table.place('p1', i % 2 ? 'A1' : 'B1');
  assert.throws(() => table.restoreSession({ format: 'legacy' }));
  for (let i = 0; i < 100; i++) table.undo();
  assert.equal(table.snapshot().revision, 5);
  assert.equal(table.project().canUndo, false); assert.throws(() => table.undo());
  for (let i = 0; i < 100; i++) table.redo();
  assert.equal(table.snapshot().revision, 105);
  assert.equal(table.project().canRedo, false);
});
