import test from 'node:test';
import assert from 'node:assert/strict';
import {milanDieFace} from '../src/games/milan-uprising/dice-faces.js';

test('tien fysieke vlakken blijven vier verschillende Milan-symbolen met hun oorspronkelijke verdeling',()=>{
  const counts={};
  for(let value=1;value<=10;value++){const face=milanDieFace(value);counts[face.id]=(counts[face.id]||0)+1;}
  assert.deepEqual(counts,{skull:1,blank:4,success:4,'double-success':1});
  assert.equal(milanDieFace(1).id,'skull');assert.equal(milanDieFace(6).id,'success');assert.equal(milanDieFace(10).id,'double-success');
  for(const value of [null,0,11,1.5,'6'])assert.equal(milanDieFace(value),null);
});

test('optionele originele dobbelsteenbeelden blijven lokaal en de symbolen werken ook zonder artwork',()=>{
  const catalog={faces:{'dice-skull':'original-skull'},assets:{'original-skull':'/local-artwork/dice-skull.png'}};
  assert.equal(milanDieFace(1,catalog).image,'/local-artwork/dice-skull.png');
  catalog.assets['original-skull']='https://example.com/asset.png';assert.equal(milanDieFace(1,catalog).image,null);
  assert.equal(milanDieFace(1).glyph,'☠');
});
