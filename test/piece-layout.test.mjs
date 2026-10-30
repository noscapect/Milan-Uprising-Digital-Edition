import test from'node:test';import assert from'node:assert/strict';
import{layoutPieces,fitsPiece}from'../src/presentation/2d/piece-layout.js';import{milanMap}from'../src/games/milan-uprising/presentation/milan-map.js';
test('drukke kaartgebieden behouden ieder onderdeel binnen hun eigen grens zonder overlap',()=>{
 for(const [id,geometry]of Object.entries(milanMap.zones))for(const count of [1,6,16,32]){
  const components=Array.from({length:count},(_,i)=>({id:'component-'+i,kind:i<3?'piece':i%2?'cube':'token',portrait:i<3?'/test.png':null})),before=structuredClone(components);
  const placed=layoutPieces(geometry,components);assert.equal(placed.length,count,id);assert.equal(new Set(placed.map(p=>p.id)).size,count,id);
  for(const [i,p]of placed.entries()){
   assert.ok(fitsPiece(p,geometry.polygon),id+' '+p.id);
   for(const other of placed.slice(i+1))assert.ok(Math.abs(p.x-other.x)>=(p.width+other.width)/2||Math.abs(p.y-other.y)>=(p.height+other.height)/2,id+' overlap');
  }
  assert.deepEqual(components,before);assert.deepEqual(layoutPieces(geometry,components),placed);
 }
 assert.deepEqual(layoutPieces(milanMap.zones.qt8,[]),[]);
});
test('een holle gebiedsgrens mag niet door een onderdeel heen lopen',()=>{
 const polygon=[[0,0],[100,0],[100,100],[60,100],[60,30],[40,30],[40,100],[0,100]];
 assert.equal(fitsPiece({x:50,y:50,width:90,height:90},polygon),false);
});
