import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {waitingMiniatures} from '../src/games/milan-uprising/scan-options.js';
const {components}=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
const ids=components.filter(c=>c.groupId==='characters').map(c=>c.id);
const oldGroup=ids.slice(0,4).map(componentId=>({componentId,stage:'registered'}));
test('een nieuw spel krijgt alle zeven basispersonages ondanks een oude opgeslagen groep',()=>{
  assert.deepEqual(waitingMiniatures(components,{screen:'character-scan',roster:{ready:false,characters:oldGroup}}),ids);
  assert.deepEqual(waitingMiniatures(components,{screen:'character-scan'}),ids);
  assert.deepEqual(waitingMiniatures(components,{screen:'character-scan',currentId:ids[0]}),ids.slice(1));
});
test('een bevestigde savegroep en een bondgenootverzoek behouden hun eigen scanaanwijzingen',()=>{
  const roster={ready:true,characters:oldGroup.map((c,i)=>({...c,stage:i===1?'pending':'registered'}))};
  assert.deepEqual(waitingMiniatures(components,{screen:'character-scan',roster}),[oldGroup[1].componentId]);
  assert.deepEqual(waitingMiniatures(components,{screen:'companion-scan',roster}),components.filter(c=>['allies','ghouls'].includes(c.groupId)).map(c=>c.id));
});
