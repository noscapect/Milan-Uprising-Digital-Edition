import test from 'node:test';
import assert from 'node:assert/strict';
import {movementSuperseded,matchesPendingRejection,movementStillAtOrigin} from '../integration/milan-uprising/board-input.mjs';
const before={receivedAt:100},action={componentId:'arianna',zoneId:'monumentale'};
const next={available:true,stable:true,screen:'location',componentId:'aristide',receivedAt:200};
test('another freshly confirmed active character cannot be blocked by an old move',()=>{
 assert.equal(movementSuperseded(before,action,next),true);
 for(const change of [{available:false},{stable:false},{screen:'error'},{screen:'city-map'},{componentId:null},{componentId:'arianna'},{receivedAt:100},{receivedAt:undefined}])assert.equal(movementSuperseded(before,action,{...next,...change}),false);
 assert.equal(movementSuperseded({},action,next),false);
});
test('rejecting an attempt requires its exact identity and never accepts a character move',()=>{
 const pending={action,sentAt:'first'};
 assert(matchesPendingRejection(pending,{...action,sentAt:'first',confirmation:'rejected'}));
 for(const change of [{sentAt:'old'},{componentId:'aristide'},{zoneId:'qt8'},{confirmation:'accepted'}])assert.equal(matchesPendingRejection(pending,{...action,sentAt:'first',confirmation:'rejected',...change}),false);
 assert.equal(matchesPendingRejection(null,{...action,sentAt:'first',confirmation:'rejected'}),false);
});

test('a rejected location move releases the pending attempt after fresh stable origin feedback',()=>{
 const request={receivedAt:100,originZoneId:'city-life'};
 const origin={available:true,stable:true,screen:'location',componentId:'arianna',zoneId:'city-life',receivedAt:8100};
 assert.equal(movementStillAtOrigin(request,action,origin),'city-life');
 for(const change of [{receivedAt:8000},{stable:false},{zoneId:'monumentale'},{componentId:'aristide'},{screen:'error'}])assert.equal(movementStillAtOrigin(request,action,{...origin,...change}),null);
});
