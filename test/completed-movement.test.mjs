import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCompletedMovement} from '../src/games/milan-uprising/completed-movement.js';
import {readComponentOutcomes} from '../integration/milan-uprising/component-outcomes.mjs';
import {readCharacterRelocations} from '../integration/milan-uprising/character-relocations.mjs';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
const raw=lines=>({available:true,width:2560,height:1600,mapGeometry:'android-city-v1',lines});
const card=(text,y=500)=>({text,x:1510,y});

test('Il Dottore accepts the observed II OCR spelling for completed outcomes only',()=>{
 const frame={...raw([card('II Dottore placed in Centrale')]),mapGeometry:null};frame.lines.unshift({text:'MASQUERADE',x:1257,y:77});
 assert.deepEqual(readComponentOutcomes(frame,profile).instructions,[{componentId:'npc-il-dottore',operation:'place',zoneId:'centrale'}]);
 for(const text of ['Il Dottore placed in Centrale','II Dottore moved to Centrale','II Dottore moved from Garibaldi to Centrale']){
  frame.lines=[{text:'MASQUERADE',x:1257,y:77},card(text)];
  assert.equal(readComponentOutcomes(frame,profile).instructions[0].componentId,'npc-il-dottore');
  assert.deepEqual(readCharacterRelocations(frame,profile.zones,profile.components.filter(c=>c.groupId==='characters'),profile.components)?.unsupported||[],[]);
 }
 frame.lines=[{text:'MASQUERADE',x:1257,y:77},card('II Dottore removed from map')];
 assert.deepEqual(readComponentOutcomes(frame,profile).instructions,[{componentId:'npc-il-dottore',operation:'remove'}]);
 assert.equal(readCompletedMovement('II Dottore removed from map',profile.zones),null);
 assert.deepEqual(readCharacterRelocations(frame,profile.zones,[],profile.components)?.unsupported||[],[]);
 frame.lines=[{text:'MASQUERADE',x:1257,y:77},card('II Dottore Junior placed in Centrale')];
 assert.equal(readComponentOutcomes(frame,profile).instructions.length,0);
 frame.lines=[{text:'MASQUERADE',x:1257,y:77},card('II Dottore placed in Centrale')];
 assert.equal(readComponentOutcomes(frame,{...profile,components:[...profile.components,{id:'ambiguous',label:'II Dottore'}]}).instructions.length,0);
});
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

test('Masquerade outcomes move all four named characters without requiring city-map geometry',()=>{
 const characters=profile.components.filter(c=>c.groupId==='characters');
 const names=['Orlando Bianchi','Rosa De Lorenzo','Aristide Demiana','Arianna Zanni'];
 const lines=[{text:'MASQUERADE',x:1257,y:77},{text:'Confirm',x:2131,y:1444},...names.flatMap((name,i)=>[card(name,i*163+735),card('moved to Corvetto',i*163+787)])];
 const frame={...raw(lines),mapGeometry:null};
 const result=readCharacterRelocations(frame,profile.zones,characters);
 assert.equal(result.characterMoves.length,4);assert(result.characterMoves.every(m=>m.zoneId==='corvetto'));
 assert.equal(readCharacterRelocations({...frame,lines:lines.filter(l=>l.text!=='MASQUERADE')},profile.zones,characters),null);
 assert.equal(readCharacterRelocations({...frame,lines:lines.filter(l=>l.text!=='Confirm')},profile.zones,characters).characterMoves.length,4);
 assert.equal(readCharacterRelocations({...frame,width:1920},profile.zones,characters),null);
 assert.equal(readCharacterRelocations({...frame,lines:[...lines,card('An error occurred')]},profile.zones,characters),null);
 const requests={...frame,lines:lines.map(l=>l.text==='moved to Corvetto'?{...l,text:'Move to Corvetto'}:l)};
 assert.equal(readCharacterRelocations(requests,profile.zones,characters),null);
});

test('Helena placement ignores a separate map counter but preserves unknown destination text',()=>{
 const lines=[card('Helena Varga placed in',1225),{text:'4',x:1408,y:1261},card('Isola',1277)];
 assert.deepEqual(readComponentOutcomes(raw(lines),profile).instructions,[{componentId:'npc-helena-varga',operation:'place',zoneId:'isola'}]);
 const inline=readComponentOutcomes(raw([card('Helena Varga placed in 4 Isola',1225)]),profile);
 assert.deepEqual(inline.instructions,[]);assert.equal(inline.unsupported.length,1);
 const inside=readComponentOutcomes(raw(lines.map(l=>l.text==='4'?{...l,x:1511}:l)),profile);
 assert.deepEqual(inside.instructions,[]);
 const event={...raw([{text:'MASQUERADE',x:1257,y:77},...lines]),mapGeometry:null};
 assert.equal(readComponentOutcomes(event,profile).instructions[0].zoneId,'isola');
});
