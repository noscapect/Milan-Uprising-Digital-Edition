import test from 'node:test';import assert from 'node:assert/strict';import {createPositiveObservations} from '../src/adapters/positive-observations.js';import {withPendingPlacement} from '../src/presentation/artwork.js';
test('stabiele positieve onderdelen wachten niet op andere veranderende onderdelen',()=>{
 const reads=createPositiveObservations({key:x=>x.componentId+':'+x.zoneId}),a={componentId:'rosa',zoneId:'portello'},b={componentId:'aristide',zoneId:'qt8'};
 assert.deepEqual(reads.observe([a,b],1,100),[]);assert.deepEqual(reads.observe([a,{...b,zoneId:'city-life'}],1,200),[{...a,pairSince:100}]);assert.deepEqual(reads.observe([a],1,200),[]);assert.deepEqual(reads.observe([a],2,300),[]);assert.deepEqual(reads.observe([a],2,30000),[]);assert.deepEqual(reads.observe([],2,30100),[]);assert.deepEqual(reads.observe([a],2,30200),[]);
});
test('wachtende presentatie verandert geen bevestigde positie of invoerprojectie',()=>{
 const component={id:'rosa',kind:'piece'},view={revision:4,components:[component],zones:[{id:'qt8',occupants:[component]},{id:'portello',occupants:[]}]},before=structuredClone(view);
 const pending=withPendingPlacement(view,{componentId:'rosa',zoneId:'portello'});assert.equal(pending.zones[0].occupants.length,0);assert.equal(pending.zones[1].occupants[0].pendingPlacement,true);assert.deepEqual(view,before);assert.equal(pending.revision,4);assert.equal(withPendingPlacement(view,null),view);assert.equal(withPendingPlacement(view,{componentId:'unknown',zoneId:'portello'}),view);
});
