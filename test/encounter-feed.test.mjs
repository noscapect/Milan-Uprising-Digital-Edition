import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readEncounterMarkers} from '../integration/milan-uprising/encounter-markers.mjs';
const {zones}=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
const card=(destination,y)=>[{text:'Cittå Studi - Next',x:1348,y},{text:'Encounter in',x:1348,y:y+52},{text:destination+'.',x:1348,y:y+104}];
const frame={available:true,width:2560,height:1600,mapGeometry:null,lines:[{text:'MASQUERADE',x:1257,y:77},...card('Garibaldi',739),...card('Garibaldi',956),...card('Garibaldi',1173)]};
test('encounter destinations use the recognized feed when full-map calibration is unavailable',()=>{
 assert.deepEqual(readEncounterMarkers(frame,zones),{investigationLocations:['garibaldi'],removeInvestigation:[],scope:'visible-ordered-encounter-cards'});
 const ordered={...frame,lines:[frame.lines[0],...card('Garibaldi',450),...card('Portello',700)]};
 assert.deepEqual(readEncounterMarkers(ordered,zones).investigationLocations,['portello']);
 assert.deepEqual(readEncounterMarkers(ordered,zones).removeInvestigation,['garibaldi']);
 assert.equal(readEncounterMarkers({...ordered,lines:[...ordered.lines,...card('Unreadable district',1000)]},zones),null);
 for(const change of [{available:false},{width:1920},{lines:frame.lines.slice(1)},{lines:[...frame.lines,{text:'Lost network connection',x:900,y:400}]}])assert.equal(readEncounterMarkers({...frame,...change},zones),null);
});
