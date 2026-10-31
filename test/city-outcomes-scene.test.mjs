import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readPhaseSummary} from '../integration/milan-uprising/phase-instructions.mjs';
import {readLocationBonusOutcomes} from '../integration/milan-uprising/location-bonus-outcomes.mjs';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
const raw={available:true,width:2560,height:1600,mapGeometry:null,lines:[{text:'NIGHT 5 HOUR 2',x:396,y:77},{text:'MASQUERADE',x:1257,y:77},...[
 ['Anarch is now',1398,666],['controlling Cadorna',1348,718],['Cadorna has now O',1348,841],['Anarch Influence',1346,892],['Media Office Location',1512,1008],['Bonus revealed in',1512,1060],['Cadorna',1512,1112]
].map(([text,x,y])=>({text,x,y}))]};
test('explicit Cadorna outcomes survive unavailable full-map geometry on the calibrated Masquerade feed',()=>{
 const summary=readPhaseSummary(raw,profile.zones,[],{allowCity:true});
 assert.equal(summary.phase,'city');assert.deepEqual(summary.updates,[{zoneId:'cadorna',faction:'anarchs',count:0}]);
 assert.deepEqual(summary.announcements,[{kind:'control',zoneId:'cadorna',faction:'anarchs'}]);
 assert.deepEqual(readLocationBonusOutcomes(raw,profile.zones).tiles,[{zoneId:'cadorna',kind:'bonus',face:'visible',value:'media'}]);
 for(const frame of [{...raw,width:1920},{...raw,lines:raw.lines.filter(l=>l.text!=='MASQUERADE')},{...raw,available:false},{...raw,lines:[...raw.lines,{text:'Lost network connection',x:900,y:400}]}]){
  assert.equal(readPhaseSummary(frame,profile.zones,[],{allowCity:true}),null);
  assert.equal(readLocationBonusOutcomes(frame,profile.zones),null);
 }
 assert.equal(readPhaseSummary(raw,profile.zones),null);
});
