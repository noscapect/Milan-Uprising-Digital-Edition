import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {withExpansions,extendTableSession} from '../src/games/milan-uprising/expansions.js';
import {createTabletop} from '../src/application/tabletop.js';
import {milanModule} from '../src/games/milan-uprising/module.js';
import {buildCampaignArrangement} from '../src/games/milan-uprising/campaign-setup.js';
const read=name=>JSON.parse(readFileSync(new URL('../data/games/milan-uprising/'+name+'.json',import.meta.url)));
const base=read('city'),catalog=read('expansions');
const table=profile=>createTabletop({profile,module:milanModule,random:()=>6});
test('zes afzonderlijke uitbreidingen vormen 101 extra onderdelen zonder basisprofiel te wijzigen',()=>{
  const before=structuredClone(base),p=withExpansions(base,catalog);
  assert.deepEqual(base,before);assert.deepEqual(catalog.packs.map(p=>p.components.length),[50,6,4,10,13,18]);
  assert.equal(p.components.length,233);assert.equal(p.components.filter(c=>c.groupId==='characters').length,11);
  assert.equal(p.components.filter(c=>c.groupId==='allies').length,8);assert.equal(p.components.filter(c=>c.groupId==='ghouls').length,7);
  assert.deepEqual(p,read('city-expansions'));assert.equal(new Set(p.components.map(c=>c.id)).size,233);
  for(const pack of catalog.packs){const one=withExpansions(base,catalog,[pack.id]);assert.equal(one.components.length,132+pack.components.length);assert.equal(table(one).project().components.length,one.components.length);}
  assert.deepEqual(withExpansions(base,catalog,[]),base);
  assert.throws(()=>withExpansions(base,catalog,['missing']));assert.throws(()=>withExpansions(base,catalog,['mystical-milan','mystical-milan']));
});
test('uitbreidingsonderdelen delen bordzones en blijven behouden in undo en replay',()=>{
  const p=withExpansions(base,catalog),t=table(p);
  for(const pack of catalog.packs)for(const c of pack.components)t.place(c.id,'qt8');
  t.roll(10);const saved=t.exportSession();const restored=table(p);restored.restoreSession(saved);assert.deepEqual(restored.snapshot(),t.snapshot());
  t.undo();assert.equal(t.snapshot().revision,101);t.redo();assert.deepEqual(t.exportSession(),saved);
  assert.throws(()=>table(base).restoreSession(saved),/another table/);
  const partial=withExpansions(base,catalog,['playable-characters']);assert.throws(()=>table(partial).restoreSession(saved),/another table/);
});
test('expliciet uitbreiden van eigen basissave behoudt posities, ficheszijden, events en worpen',()=>{
  const t=table(base);t.place('character-brujah','qt8');const token=base.components.find(c=>c.faces);t.flip(token.id);t.roll(10);
  const saved=t.exportSession(),before=structuredClone(saved),p=withExpansions(base,catalog),next=extendTableSession(saved,base,p);
  assert.deepEqual(saved,before);assert.deepEqual(next.state.events,saved.state.events);assert.equal(next.state.placements['character-brujah'],'qt8');
  assert.equal(next.state.faces[token.id],saved.state.faces[token.id]);assert.equal(next.state.placements['character-hecata'],null);
  assert.equal(next.state.revision,saved.state.revision);table(p).restoreSession(next);
  const damaged=structuredClone(saved);damaged.state.placements['character-brujah']='portello';assert.throws(()=>extendTableSession(damaged,base,p),/activity log/);
});
test('campagneopstelling accepteert vier uitbreidingspersonages zonder eigen regels',()=>{
  const p=withExpansions(base,catalog),t=table(p);
  const characters=catalog.packs.find(p=>p.id==='playable-characters').components.map(c=>({componentId:c.id,zoneId:'qt8'}));
  t.arrange(buildCampaignArrangement(p,{characters,locations:[],otherPieces:[]}));
  assert.equal(t.project().zones.find(z=>z.id==='qt8').occupants.length,4);
});
