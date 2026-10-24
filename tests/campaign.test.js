import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTabletop } from '../src/application/tabletop.js';
import { validateProfile } from '../src/engine/profile.js';
import { milanModule } from '../src/games/milan-uprising/module.js';
import { buildCampaignArrangement, reconcileDistrictMap } from '../src/games/milan-uprising/campaign-setup.js';
const profile = JSON.parse(await readFile(new URL('../data/games/milan-uprising/campaign.json', import.meta.url), 'utf8'));
const setup = () => createTabletop({ profile, module: milanModule, random: () => 4 });
const input = () => ({
  characters: ['brujah', 'gangrel', 'malkavian', 'nosferatu'].map((clan, i) => ({ componentId: `character-${clan}`, zoneId: ['haven-1l', 'haven-1r', 'haven-2l', 'haven-2r'][i] })),
  locations: profile.zones.filter(z => z.area === 'city').map(z => ({ zoneId: z.id, influence: { anarchs: 0, camarilla: 0, ambrose: 0 }, control: 'none', restricted: false })),
  otherPieces: [], masqueradeZoneId: ''
});

test('volledige districtsynchronisatie verwijdert oude invloed en controle, behoudt andere categorieën en werkt zonder vier spelers', () => {
  const table = setup(), locations = input().locations;
  table.place('character-brujah', 'haven-3l');
  table.place('investigation-1', 'sempione');
  table.place('influence-ambrose-1', 'sempione');
  table.place('influence-ambrose-2', 'solari');
  table.place(profile.components.find(c => c.groupId === 'control').id, 'duomo');
  const before = table.snapshot();
  locations.find(l => l.zoneId === 'solari').influence.ambrose = 1;
  locations.find(l => l.zoneId === 'qt8').control = 'anarchs';
  const arrangement = reconcileDistrictMap(profile, before, locations);
  assert.equal(arrangement.changed, true); table.arrange(arrangement);
  const after = table.snapshot();
  assert.equal(after.placements['character-brujah'], 'haven-3l');
  assert.equal(after.placements['investigation-1'], 'sempione');
  assert.equal(profile.components.filter(c => c.groupId === 'ambrose-cubes' && after.placements[c.id]).length, 1);
  assert.equal(profile.components.filter(c => c.groupId === 'control' && after.placements[c.id] === 'qt8').length, 1);
  assert.equal(profile.components.filter(c => c.groupId === 'control' && after.placements[c.id] === 'duomo').length, 0);
  assert.equal(reconcileDistrictMap(profile, after, locations).changed, false);
  for (const invalid of [locations.slice(1), [...locations.slice(1), locations[1]], locations.map((l,i) => i ? l : {...l,influence:{anarchs:-1,camarilla:0,ambrose:0}})]) {
    assert.throws(() => reconcileDistrictMap(profile, after, invalid));
    assert.deepEqual(table.snapshot(), after);
  }
});

test('stadskaart bevat alle dertig districtnamen en tien expliciet benoemde Havenvelden', () => {
  validateProfile(profile);
  assert.equal(profile.zones.length, 40);
  assert.equal(profile.zones.filter(z => z.area === 'haven').length, 10);
  assert.deepEqual(profile.zones.filter(z => z.area === 'city').map(z => z.id), [
    'qt8', 'sempione', 'monumentale', 'isola', 'centrale', 'nolo',
    'san-siro', 'city-life', 'chinatown', 'garibaldi', 'buenos-aires', 'citta-studi',
    'bande-nere', 'washington', 'cadorna', 'duomo', 'cinque-giornate', 'corsica',
    'giambellino', 'solari', 'navigli', 'bocconi', 'porta-romana', 'calvairate',
    'ronchetto', 'barona', 'sant-ambrogio', 'ripamonti', 'vigentino', 'corvetto'
  ]);
  assert.equal(new Set(profile.presentation.zoneOrder).size, 40);
  assert.ok(profile.zones.every(z => profile.presentation.zoneOrder.includes(z.id)));
  assert.equal(profile.campaignSetup.officialInitialPositionsVerified, false);
  assert.equal(profile.boardEvidence.adjacencyVerified, false);
  assert.equal(profile.boardEvidence.sensorMappingVerified, false);
  assert.ok(Object.values(setup().snapshot().placements).every(zone => zone === null));
});

test('handmatige campagne-opstelling is één atomaire handeling, herstelbaar en exporteerbaar', () => {
  const table = setup(), manual = input();
  manual.locations[0].influence.anarchs = 2;
  manual.locations[0].control = 'anarchs'; manual.locations[0].restricted = true;
  manual.otherPieces.push({ componentId: 'npc-agnese-della-luna', zoneId: 'duomo' }); manual.masqueradeZoneId = 'navigli';
  table.place('character-tremere', 'corvetto'); const before = table.snapshot();
  table.arrange(buildCampaignArrangement(profile, manual));
  assert.equal(table.snapshot().revision, before.revision + 1);
  assert.equal(table.snapshot().events.at(-1).type, 'table.arrange');
  assert.equal(table.snapshot().placements['character-brujah'], 'haven-1l');
  assert.equal(table.snapshot().placements['character-tremere'], null);
  assert.equal(table.snapshot().placements['influence-anarchs-1'], 'qt8');
  assert.equal(table.snapshot().placements['npc-agnese-della-luna'], 'duomo');
  assert.equal(table.snapshot().placements.masquerade, 'navigli');
  assert.equal(table.snapshot().faces['investigation-1'], 'restricted');
  const applied = table.snapshot();
  table.undo(); assert.deepEqual(table.snapshot(), before);
  table.redo(); assert.deepEqual(table.snapshot(), applied);
  const restored = setup(); restored.restoreSession(JSON.parse(JSON.stringify(table.exportSession())));
  assert.deepEqual(restored.snapshot(), applied);
});

test('controlefiches worden via volledige matching verdeeld in plaats van gulzig verbruikt', () => {
  const manual = input();
  manual.locations.forEach((location, i) => { location.control = i < 21 ? 'anarchs' : i < 29 ? 'camarilla' : 'none'; });
  const result = buildCampaignArrangement(profile, manual);
  const controlFaces = result.faces.filter(face => face.componentId.startsWith('control-'));
  assert.equal(controlFaces.length, 29);
  assert.equal(controlFaces.filter(face => face.faceId === 'anarchs').length, 21);
  assert.equal(controlFaces.filter(face => face.faceId === 'camarilla').length, 8);
  setup().arrange(result);
});

test('campagne-invoer weigert ontbrekende spelers, dubbelgebruik en onvoldoende fysieke voorraad', () => {
  for (const mutate of [
    x => x.characters.pop(),
    x => x.characters[1].componentId = x.characters[0].componentId,
    x => x.characters[0].zoneId = 'unknown',
    x => x.locations.push(x.locations[0]),
    x => x.locations[0].influence.anarchs = 4,
    x => x.locations.forEach((z, i) => { if (i < 11) z.influence.anarchs = 3; }),
    x => x.locations.forEach((z, i) => { if (i < 21) z.control = 'camarilla'; }),
    x => x.locations.forEach((z, i) => { if (i < 19) z.restricted = true; }),
    x => x.otherPieces.push({ componentId: 'character-brujah', zoneId: 'duomo' }),
    x => x.masqueradeZoneId = 'haven-1l'
  ]) { const invalid = input(); mutate(invalid); assert.throws(() => buildCampaignArrangement(profile, invalid)); }
});

test('generieke tafelopstelling weigert slechte onderdelen en zijden zonder gedeeltelijke wijziging', () => {
  const table = setup(); table.place('character-brujah', 'duomo'); const before = table.snapshot();
  for (const result of [
    { placements: [{ componentId: 'unknown', zoneId: 'duomo' }], faces: [] },
    { placements: [{ componentId: 'character-brujah', zoneId: 'unknown' }], faces: [] },
    { placements: [{ componentId: 'character-brujah', zoneId: 'duomo' }, { componentId: 'character-brujah', zoneId: 'qt8' }], faces: [] },
    { placements: [], faces: [{ componentId: 'character-brujah', faceId: 'restricted' }] },
    { placements: [], faces: [{ componentId: 'investigation-1', faceId: 'unknown' }] },
    { placements: [], faces: [{ componentId: 'investigation-1', faceId: 'restricted' }, { componentId: 'investigation-1', faceId: 'investigation' }] }
  ]) { assert.throws(() => table.arrange(result)); assert.deepEqual(table.snapshot(), before); }
});

test('atomaire opstelling respecteert generieke zonecapaciteit buiten de campagnebouwer', () => {
  const limited = structuredClone(profile); limited.zones.find(z => z.id === 'duomo').capacity = 1;
  const table = createTabletop({ profile: limited, module: milanModule, random: () => 1 });
  table.place('character-tremere', 'qt8'); const before = table.snapshot();
  assert.throws(() => table.arrange({ placements: [
    { componentId: 'character-brujah', zoneId: 'duomo' }, { componentId: 'character-gangrel', zoneId: 'duomo' }
  ], faces: [] }), /capacity/);
  assert.deepEqual(table.snapshot(), before);
});
