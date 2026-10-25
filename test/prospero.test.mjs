import test from 'node:test';import assert from 'node:assert/strict';
import{prosperoAccessory,ringPresentation}from'../src/games/milan-uprising/prospero.js';
test('Prospero is een afzonderlijk accessoire met vier LEDs en geen speelbare identiteit',()=>{
 assert.equal(prosperoAccessory.id,'prospero');assert.equal(prosperoAccessory.ledCount,4);assert.equal(prosperoAccessory.componentId,undefined);
 assert.equal(ringPresentation(null).observed,false);
});
test('ringkleuren komen alleen uit vier volledige waargenomen RGB-waarden',()=>{
 const valid={observed:true,colors:[[255,0,0],[0,255,0],[0,0,255],[0,0,0]]};
 assert.deepEqual(ringPresentation(valid),{observed:true,colors:['#ff0000','#00ff00','#0000ff','#000000']});
 for(const state of [{...valid,observed:false},{observed:true,colors:[[255,0,0]]},{...valid,colors:[[256,0,0],...valid.colors.slice(1)]}]){
  assert.equal(ringPresentation(state).observed,false);assert.deepEqual(ringPresentation(state).colors,Array(4).fill('#343b3c'));
 }
});
