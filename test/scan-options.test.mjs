import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {waitingMiniatures,unplacedMiniatures,isScanScene} from '../src/games/milan-uprising/scan-options.js';
const {components}=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
const ids=components.filter(c=>c.groupId==='characters').map(c=>c.id);
const oldGroup=ids.slice(0,4).map(componentId=>({componentId,stage:'registered'}));
test('oude scanvoortgang verbergt geen pionnen op de kaart tijdens Haven- of spelverplaatsingen',()=>{
  const roster={ready:false,characters:oldGroup.map(c=>({...c,stage:'pending'}))};
  for(const screen of ['haven-placement','location','day-summary','night-summary']){
    assert.equal(isScanScene(screen),false);
    assert.deepEqual(unplacedMiniatures(roster,screen),[]);
    assert.ok(!waitingMiniatures(components,{screen,roster,placements:{[ids[0]]:'qt8'}}).includes(ids[0]));
  }
  assert.deepEqual(unplacedMiniatures(roster,'character-scan'),oldGroup.map(c=>c.componentId));
  assert.ok(waitingMiniatures(components,{screen:'character-scan',roster,placements:{[ids[0]]:'qt8'}}).includes(ids[0]),'A new scan step still permits rescanning old positions');
});
test('bevestigd geplaatste miniaturen keren niet terug in de wachtrij zonder bevestigde savegroep',()=>{
  const roster={ready:false,characters:oldGroup,placedIds:[ids[0],ids[4]]};
  assert.deepEqual(waitingMiniatures(components,{screen:'character-scan',roster}),ids.filter(id=>!roster.placedIds.includes(id)));
  assert.deepEqual(waitingMiniatures(components,{screen:'character-scan',roster:{...roster,placedIds:[]}}),ids);
});
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
