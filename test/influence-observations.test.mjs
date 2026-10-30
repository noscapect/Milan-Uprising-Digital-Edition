import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {independentInfluenceUpdates,independentControlUpdates} from '../src/games/milan-uprising/influence-observations.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url))),update={zoneId:'san-siro',faction:'anarchs',count:3};
test('een onleesbaar district blokkeert geen afzonderlijke invloedseindstand',()=>{assert.deepEqual(independentInfluenceUpdates(profile,{updates:[update],unsupported:['Cadorna has now Anarch Influence']}),[update]);assert.deepEqual(independentInfluenceUpdates(profile,{updates:[update],unsupported:['Unknown has now 2 Anarch Influence']}),[update]);});
test('een onleesbare of dubbele melding over hetzelfde district blokkeert de oudere waarde',()=>{assert.deepEqual(independentInfluenceUpdates(profile,{updates:[update],unsupported:['San Siro has now Anarch Influence']}),[]);assert.deepEqual(independentInfluenceUpdates(profile,{updates:[update],unsupported:['San Siro has now 2 Anarch Influence']}),[]);});

test('an unreadable Influence card cannot block a positive Control change in the same district',()=>{
 const control={kind:'control',zoneId:'city-life',faction:'anarchs'};
 assert.deepEqual(independentControlUpdates(profile,{announcements:[control],unsupported:['CityLife has now Z 1 Anarch Influence']}),[{zoneId:'city-life',faction:'anarchs'}]);
 assert.deepEqual(independentControlUpdates(profile,{announcements:[control],unsupported:['Unknown is now controlling CityLife']}),[]);
});
test('the latest recognized Control change wins and unrelated malformed Control cards do not block it',()=>{
 assert.deepEqual(independentControlUpdates(profile,{announcements:[{kind:'control',zoneId:'city-life',faction:'camarilla'},{kind:'control',zoneId:'city-life',faction:'anarchs'}],unsupported:['Unknown is now controlling San Siro']}),[{zoneId:'city-life',faction:'anarchs'}]);
});
