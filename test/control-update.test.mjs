import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{createTabletop}from'../src/application/tabletop.js';import{milanModule}from'../src/games/milan-uprising/module.js';import{buildVisibleControlArrangement}from'../src/games/milan-uprising/control-update.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
test('zichtbare controlefiches worden hersteld zonder andere onderdelen te wissen',()=>{
 const table=createTabletop({profile,module:milanModule});table.place('investigation-1','washington');table.place('character-nosferatu','qt8');table.place('influence-anarchs-1','qt8');
 table.arrange(buildVisibleControlArrangement(profile,table.snapshot(),[{zoneId:'duomo',faction:'camarilla'},{zoneId:'solari',faction:'ambrose'}]));
 const before=table.snapshot();for(const id of ['investigation-1','character-nosferatu','influence-anarchs-1'])assert.ok(before.placements[id]);
 assert.equal(buildVisibleControlArrangement(profile,before,[]).changed,false,'An unread icon must not mean empty');
 assert.equal(buildVisibleControlArrangement(profile,before,[{zoneId:'duomo',faction:'camarilla'}]).changed,false);
 table.arrange(buildVisibleControlArrangement(profile,before,[{zoneId:'duomo',faction:'anarchs'}]));
 assert.ok(profile.components.some(c=>c.groupId==='control'&&table.snapshot().placements[c.id]==='duomo'&&table.snapshot().faces[c.id]==='anarchs'));
 assert.equal(buildVisibleControlArrangement(profile,table.snapshot(),[{zoneId:'duomo',faction:'anarchs'}]).changed,false);
 assert.equal(table.snapshot().placements['influence-anarchs-1'],'qt8');
});
test('dubbele, onbekende en onmogelijke controlewaarnemingen zijn atomair ongeldig',()=>{
 const table=createTabletop({profile,module:milanModule}),before=table.snapshot();
 for(const updates of [[{zoneId:'missing',faction:'camarilla'}],[{zoneId:'qt8',faction:'unknown'}],[{zoneId:'qt8',faction:'anarchs'},{zoneId:'qt8',faction:'camarilla'}]])assert.throws(()=>buildVisibleControlArrangement(profile,before,updates));
 assert.deepEqual(table.snapshot(),before);
});
