import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyLocationTiles,clearLocationTiles,setLocationTile,validateLocationTiles} from '../src/games/milan-uprising/location-tiles.js';
import {withLocationTiles} from '../src/games/milan-uprising/tile-tabletop.js';
import {createTabletop} from '../src/application/tabletop.js';
import {milanModule} from '../src/games/milan-uprising/module.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
test('tafel legen wist alle tegelinstellingen en verhoogt de revisie voor andere schermen',()=>{
  const original=setLocationTile(emptyLocationTiles(),profile.zones,{zoneId:'qt8',kind:'special',face:'visible',value:'haven-11',expectedRevision:0});
  const cleared=clearLocationTiles(original);
  assert.deepEqual(cleared.tiles,{});assert.equal(cleared.revision,2);assert.ok(original.tiles.qt8);
  assert.throws(()=>setLocationTile(cleared,profile.zones,{zoneId:'qt8',kind:'special',face:'visible',value:'haven-11',expectedRevision:1}),/another screen/);
});
test('bonustegel en speciale tegel zijn afzonderlijk en onbekende zijden worden niet verzonnen',()=>{
  const start=emptyLocationTiles();assert.deepEqual(start.tiles,{});
  const action={zoneId:'qt8',kind:'special',face:'visible',value:'haven-11',expectedRevision:0};
  const next=setLocationTile(start,profile.zones,action);assert.deepEqual(start.tiles,{});assert.equal(next.revision,1);
  assert.deepEqual(next.tiles.qt8,{special:{face:'visible',value:'haven-11'}});
  const hidden=setLocationTile(next,profile.zones,{...action,face:'hidden',expectedRevision:1});assert.equal(hidden.tiles.qt8.special.value,'haven-11');
  assert.deepEqual(validateLocationTiles(hidden,profile.zones),hidden);
  assert.throws(()=>setLocationTile(next,profile.zones,action));
  for(const patch of [{zoneId:'haven-1l'},{kind:'cube'},{value:'invented'},{face:'wrong'}])assert.throws(()=>setLocationTile(start,profile.zones,{...action,...patch}));
});
test('tegelopslag herstelt met de tafel, bewaart pionnen en blijft buiten de engine',async()=>{
  const table=withLocationTiles(createTabletop({profile,module:milanModule}),profile);
  table.place('character-brujah','qt8');const before=table.snapshot();
  await table.setLocationTile('qt8','special',{face:'visible',value:'haven-11'});assert.deepEqual(table.snapshot(),before);
  const saved=table.exportSession();const other=withLocationTiles(createTabletop({profile,module:milanModule}),profile);other.restoreSession(saved);
  assert.deepEqual(other.exportSession(),saved);
  other.project().zones.find(z=>z.id==='qt8').locationTiles.special.value='unknown';assert.deepEqual(other.exportSession(),saved);
  assert.throws(()=>other.restoreSession({...saved,locationTiles:{format:'bad'}}));assert.deepEqual(other.exportSession(),saved);
  const legacy={...saved};delete legacy.locationTiles;other.restoreSession(legacy);assert.deepEqual(other.exportSession().locationTiles.tiles,{});
});
