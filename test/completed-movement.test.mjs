import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCompletedMovement} from '../src/games/milan-uprising/completed-movement.js';
import {readComponentOutcomes} from '../integration/milan-uprising/component-outcomes.mjs';
import {readCharacterRelocations} from '../integration/milan-uprising/character-relocations.mjs';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
const raw=lines=>({available:true,width:2560,height:1600,mapGeometry:'android-city-v1',lines});
const card=(text,y=500)=>({text,x:1510,y});
test('completed moves match full origin names including Washington and preserve the old moved-to form',()=>{
 assert.deepEqual(readCompletedMovement('Agnese Della Luna moved from Washington to Duomo',profile.zones),{name:'agnesedellaluna',zoneId:'duomo',originZoneId:'washington'});
 assert.equal(readCompletedMovement('Agnese Della Luna moved to Cadorna',profile.zones).zoneId,'cadorna');
 assert.equal(readCompletedMovement('Move Agnese Della Luna to any other location',profile.zones),null);
 assert.equal(readCompletedMovement('Agnese Della Luna moved from Unknown to Duomo',profile.zones).zoneId,null);
});
test('a wrapped NPC movement card updates its destination and an unreadable newer card suppresses an older move',()=>{
 const lines=['Agnese Della Luna','moved from','Washington to','Duomo'].map((text,index)=>card(text,1120+index*52));
 const expected={componentId:'npc-agnese-della-luna',operation:'place',zoneId:'duomo'};
 assert.deepEqual(readComponentOutcomes(raw(lines),profile).instructions,[expected]);
 assert.equal(readCharacterRelocations(raw(lines),profile.zones,profile.components.filter(component=>component.groupId==='characters'),profile.components),null);
 const newer=readComponentOutcomes(raw([...lines,card('Agnese Della Luna moved from Duomo to Unknown',1360)]),profile);
 assert.deepEqual(newer.instructions,[]);assert.equal(newer.unsupported.length,1);
 assert.equal(readComponentOutcomes({...raw(lines),mapGeometry:null},profile),null);
});
test('player characters use their own relocation path for both completed-move forms',()=>{
 const character=profile.components.find(component=>component.groupId==='characters'),name=character.label.split('·')[0].trim();
 for(const text of [name+' moved from Washington to Duomo',name+' moved to Duomo']){
  const frame=raw([card(text)]);
  assert.deepEqual(readComponentOutcomes(frame,profile)?.instructions||[],[]);
  assert.deepEqual(readCharacterRelocations(frame,profile.zones,[character]).characterMoves,[{componentId:character.id,zoneId:'duomo'}]);
 }
});
