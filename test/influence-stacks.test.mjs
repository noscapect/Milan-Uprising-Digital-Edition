import test from'node:test';import assert from'node:assert/strict';import{groupInfluenceCubes}from'../src/presentation/2d/influence-stacks.js';
const cube=(faction,i)=>({id:'influence-'+faction+'-'+i,kind:'cube',groupId:faction+'-cubes',color:faction});
test('invloed toont per factie één blokje met de juiste telling zonder de onderdelen te wijzigen',()=>{
 for(const count of [1,2,3]){
  const cubes=Array.from({length:count},(_,i)=>cube('anarchs',i)),input=[{id:'character-gangrel',kind:'piece'},...cubes,{id:'investigation-1',kind:'token'}],before=structuredClone(input);
  const result=groupInfluenceCubes(input);assert.equal(result.length,3);assert.equal(result[1].influenceCount,count);assert.deepEqual(result[1].stackMembers,cubes.map(c=>c.id));assert.deepEqual(input,before);
 }
 const mixed=groupInfluenceCubes([cube('anarchs',1),cube('anarchs',2),cube('camarilla',1),cube('camarilla',2),cube('camarilla',3)]);
 assert.deepEqual(mixed.map(c=>c.influenceCount),[2,3]);assert.deepEqual(mixed.map(c=>c.groupId),['anarchs-cubes','camarilla-cubes']);
});
test('een ongeldige sandboxtelling wordt niet afgekapt en neutrale demoblokken blijven afzonderlijk',()=>{
 const four=Array.from({length:4},(_,i)=>cube('anarchs',i));assert.deepEqual(groupInfluenceCubes(four),four);
 const neutral=[{id:'cube-1',kind:'cube',groupId:'demo'},{id:'cube-2',kind:'cube',groupId:'demo'}];assert.deepEqual(groupInfluenceCubes(neutral),neutral);
});
