import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTabletop} from '../src/application/tabletop.js';
import {milanModule} from '../src/games/milan-uprising/module.js';
import {buildBoardInstructions} from '../src/games/milan-uprising/board-instructions.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
test('expliciete encounterbestemming plaatst één onderzoeksfiche en herhalen verdubbelt niet',()=>{
 const table=createTabletop({profile,module:milanModule});table.place('investigation-1','portello');table.flip('investigation-1');table.place('character-brujah','qt8');
 const before=table.snapshot();table.arrange(buildBoardInstructions(profile,before,{investigationLocations:['washington']}));
 const after=table.snapshot();assert.equal(after.placements['investigation-1'],'portello');assert.equal(after.faces['investigation-1'],'restricted');
 const marker=profile.components.find(c=>c.groupId==='investigation'&&after.placements[c.id]==='washington');assert.ok(marker);assert.equal(after.faces[marker.id],'investigation');assert.equal(after.placements['character-brujah'],'qt8');
 assert.equal(buildBoardInstructions(profile,after,{investigationLocations:['washington']}).changed,false);
 table.reset();table.arrange(buildBoardInstructions(profile,table.snapshot(),{investigationLocations:['washington']}));assert.equal(Object.values(table.snapshot().placements).filter(z=>z==='washington').length,1);
});
test('ongeldige onderzoeksbestemmingen en een lege voorraad wijzigen geen andere instructies',()=>{
 const table=createTabletop({profile,module:milanModule});
 for(const investigationLocations of [['missing'],['haven-1l'],['washington','washington']])assert.throws(()=>buildBoardInstructions(profile,table.snapshot(),{investigationLocations,characterMoves:[{componentId:'character-brujah',zoneId:'qt8'}]}));
 for(const c of profile.components.filter(c=>c.groupId==='investigation'))table.place(c.id,'portello');const before=table.snapshot();
 assert.throws(()=>buildBoardInstructions(profile,before,{investigationLocations:['washington'],characterMoves:[{componentId:'character-brujah',zoneId:'qt8'}]}),/No Investigation/);assert.deepEqual(table.snapshot(),before);
});
test('controle verwijderen bewaart invloed, personages en fiches en is idempotent',()=>{
  const table=createTabletop({profile,module:milanModule});
  for(const id of ['character-brujah','influence-anarchs-1','investigation-1','control-anarchs-camarilla-1'])table.place(id,'qt8');
  table.place('control-anarchs-camarilla-2','portello');
  const before=table.snapshot();
  table.arrange(buildBoardInstructions(profile,before,{removeControl:['qt8']}));
  const after=table.snapshot();assert.equal(after.placements['control-anarchs-camarilla-1'],null);
  for(const [id,zone]of Object.entries(before.placements))if(id!=='control-anarchs-camarilla-1')assert.equal(after.placements[id],zone);
  assert.deepEqual(after.faces,before.faces);assert.equal(after.revision,before.revision+1);
  assert.equal(buildBoardInstructions(profile,after,{removeControl:['qt8']}).changed,false);
  table.undo();assert.deepEqual(table.snapshot(),before);
});
test('gemengde instructies worden vooraf geheel gevalideerd',()=>{
  const table=createTabletop({profile,module:milanModule}),before=table.snapshot();
  assert.throws(()=>buildBoardInstructions(profile,before,{influence:[{zoneId:'solari',faction:'ambrose',count:3}],removeControl:['unknown']}));
  assert.deepEqual(table.snapshot(),before);
  const result=buildBoardInstructions(profile,before,{influence:[{zoneId:'solari',faction:'ambrose',count:3}],removeControl:['qt8']});
  table.arrange(result);assert.equal(table.snapshot().revision,1);
});

test('expliciete personageverplaatsingen en controleverwijdering vormen één idempotente bordupdate',()=>{
  const table=createTabletop({profile,module:milanModule});
  const ids=['character-brujah','character-nosferatu','character-toreador','character-tremere'];
  for(const id of ids)table.place(id,'haven-1l');
  for(const id of ['control-anarchs-camarilla-1','influence-anarchs-1','investigation-1','ghoul-fixer'])table.place(id,'qt8');
  const before=table.snapshot(),input={characterMoves:ids.map(componentId=>({componentId,zoneId:'qt8'})),removeControl:['qt8']};
  table.arrange(buildBoardInstructions(profile,before,input));
  const after=table.snapshot();
  for(const id of ids)assert.equal(after.placements[id],'qt8');
  assert.equal(after.placements['control-anarchs-camarilla-1'],null);
  for(const [id,zone]of Object.entries(before.placements))if(!ids.includes(id)&&id!=='control-anarchs-camarilla-1')assert.equal(after.placements[id],zone);
  assert.deepEqual(after.faces,before.faces);assert.equal(after.revision,before.revision+1);
  assert.equal(buildBoardInstructions(profile,after,input).changed,false);
  table.undo();assert.deepEqual(table.snapshot(),before);
});

test('ongeldige of dubbele personagebestemmingen laten ook overige instructies onaangeroerd',()=>{
  const table=createTabletop({profile,module:milanModule}),before=table.snapshot();
  for(const characterMoves of [[null],[{componentId:'unknown',zoneId:'qt8'}],[{componentId:'ghoul-fixer',zoneId:'qt8'}],[{componentId:'character-brujah',zoneId:'unknown'}],[{componentId:'character-brujah',zoneId:'qt8'},{componentId:'character-brujah',zoneId:'portello'}]]){
    assert.throws(()=>buildBoardInstructions(profile,before,{characterMoves,removeControl:['qt8'],influence:[{zoneId:'solari',faction:'ambrose',count:3}]}));
    assert.deepEqual(table.snapshot(),before);
  }
});
