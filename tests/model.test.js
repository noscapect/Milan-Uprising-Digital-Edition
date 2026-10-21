import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, place, remove } from '../src/model.js';
test('plaatsen, verplaatsen, verwijderen en opeenvolgende events', () => {
  const s = createBoard(); place(s,'p1',0,0); place(s,'p1',7,4); remove(s,'p1');
  assert.equal(s.positions.p1,null); assert.deepEqual(s.events.map(e=>e.sequence),[1,2,3]);
});
test('ongeldige coördinaten en ID muteren niets', () => {
  const s = createBoard();
  for(const [x,y] of [[-1,0],[8,0],[0,5],[0,-1],[0.5,0],[NaN,0]]) assert.throws(()=>place(s,'p1',x,y));
  assert.throws(()=>place(s,'other',0,0)); assert.throws(()=>remove(s,'other'));
  assert.equal(s.events.length,0);
});
test('bezetting blokkeert een tweede pion zonder stateverlies', () => {
  const s = createBoard(); place(s,'p1',0,0); place(s,'p2',1,0);
  assert.throws(()=>place(s,'p2',0,0)); assert.deepEqual(s.positions.p2,{x:1,y:0});
  assert.equal(s.events.length,2); remove(s,'p1'); place(s,'p2',0,0);
});
