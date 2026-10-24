import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTabletop} from '../src/application/tabletop.js';
import {milanModule} from '../src/games/milan-uprising/module.js';
import {prepareComponentSetup,reconcileDistrictMap} from '../src/games/milan-uprising/campaign-setup.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
const locations=profile.zones.filter(z=>z.area==='city').map(z=>({zoneId:z.id,control:'none',influence:{anarchs:0,camarilla:0,ambrose:0},restricted:false}));

test('componentenopstelling ruimt oud onderzoek op, ook als invloed en controle al overeenkomen',()=>{
  const table=createTabletop({profile,module:milanModule});
  table.place('investigation-1','sempione');table.place('investigation-2','solari');table.flip('investigation-2');table.place('character-brujah','haven-1l');
  const before=table.snapshot();assert.equal(reconcileDistrictMap(profile,before,locations).changed,false);
  const setup=prepareComponentSetup(profile,before,locations);
  assert.deepEqual(setup.clearedResearch,[{componentId:'investigation-1',zoneId:'sempione'}]);table.arrange(setup);
  const after=table.snapshot();assert.equal(after.placements['investigation-1'],null);
  assert.equal(after.placements['investigation-2'],'solari');assert.equal(after.placements['character-brujah'],'haven-1l');
  assert.deepEqual(after.faces,before.faces);assert.equal(after.revision,before.revision+1);
  assert.equal(prepareComponentSetup(profile,after,locations).changed,false);
  table.undo();assert.deepEqual(table.snapshot(),before);
});

test('een onvolledige componentenkaart verwijdert geen onderzoeksfiches',()=>{
  const table=createTabletop({profile,module:milanModule});table.place('investigation-1','sempione');const before=table.snapshot();
  assert.throws(()=>prepareComponentSetup(profile,before,locations.slice(1)));assert.deepEqual(table.snapshot(),before);
});
