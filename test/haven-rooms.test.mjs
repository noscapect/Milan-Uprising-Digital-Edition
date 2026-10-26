import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{createTabletop}from'../src/application/tabletop.js';import{milanModule}from'../src/games/milan-uprising/module.js';
import{withLocationTiles}from'../src/games/milan-uprising/tile-tabletop.js';import{emptyLocationTiles,setLocationTile,validateLocationTiles,clearLocationTiles,applyObservedHavenRooms}from'../src/games/milan-uprising/location-tiles.js';import{havenRoomLabel,referenceHavenRoom,havenRoomTypes,validateHavenRoom,fixedHavenRoom,fixedHavenRooms}from'../src/games/milan-uprising/haven-rooms.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url))),room={type:'personal',level:'standard',bonus:'+1 Willpower'};
test('alle tien kamers en beide bonussen staan vast en zijn zonder appwaarneming beschikbaar',async()=>{
 const t=withLocationTiles(createTabletop({profile,module:milanModule}),profile);
 const zones=t.project().zones.filter(z=>z.area==='haven');assert.equal(zones.length,10);
 for(const z of zones){assert.equal(z.havenRoom.type,fixedHavenRooms[z.id]);assert.deepEqual(z.havenRoom,fixedHavenRoom(z.id));assert.ok(referenceHavenRoom(z.havenRoom.type,'upgraded').bonus);}
 assert.equal(zones.find(z=>z.id==='haven-3l').havenRoom.type,'living');assert.equal(zones.find(z=>z.id==='haven-3r').havenRoom.type,'meditation');
 await t.setHavenRoom('haven-4r',{type:'personal',level:'upgraded',bonus:'wrong copied text'});
 assert.deepEqual(t.project().zones.find(z=>z.id==='haven-4r').havenRoom,referenceHavenRoom('gym','upgraded'));
 const saved=t.exportSession(),other=withLocationTiles(createTabletop({profile,module:milanModule}),profile);other.restoreSession(saved);assert.deepEqual(other.exportSession(),saved);
 assert.equal(other.project().zones.find(z=>z.id==='haven-4r').havenRoom.level,'upgraded');
 const legacy={...emptyLocationTiles(),havenRooms:{'haven-5l':{type:'personal',level:'upgraded',bonus:'outdated'}}};
 assert.deepEqual(validateLocationTiles(legacy,profile.zones).havenRooms['haven-5l'],referenceHavenRoom('library','upgraded'));
});
test('referentiekamers leveren beide zijden zonder onbekende campagnestand in te vullen',async()=>{
 for(const type of Object.keys(havenRoomTypes).filter(t=>t!=='unknown'))for(const level of ['standard','upgraded']){
  const value=referenceHavenRoom(type,level);assert.deepEqual(validateHavenRoom(value),value);
 }
 assert.throws(()=>referenceHavenRoom('unknown','standard'));assert.throws(()=>referenceHavenRoom('personal','unknown'));
 const t=withLocationTiles(createTabletop({profile,module:milanModule}),profile),before=t.snapshot();
 assert.deepEqual(t.project().zones.find(z=>z.id==='haven-1l').havenRoom,room);
 await t.setHavenRoom('haven-1l',referenceHavenRoom('personal','standard'));await t.setHavenRoom('haven-1l',referenceHavenRoom('personal','upgraded'));
 assert.deepEqual(t.snapshot(),before);assert.equal(t.project().zones.find(z=>z.id==='haven-1l').havenRoom.bonus,'+2 Willpower');
 referenceHavenRoom('personal','standard').bonus='changed';assert.equal(referenceHavenRoom('personal','standard').bonus,'+1 Willpower');
 assert.match(referenceHavenRoom('meditation','standard').bonus,/2 Willpower/);assert.match(referenceHavenRoom('meditation','upgraded').bonus,/1 Willpower/);
 for(const type of ['office','gym','library','gallery'])assert.equal(referenceHavenRoom(type,'standard').bonus,'Room not purchased');
});
test('Havenbonus blijft eigen moduledata en wordt bewaard zonder pionnen of spelregels te wijzigen',async()=>{
 const t=withLocationTiles(createTabletop({profile,module:milanModule}),profile);t.place('character-brujah','haven-1l');const before=t.snapshot();
 await t.setHavenRoom('haven-1l',room);assert.deepEqual(t.snapshot(),before);assert.deepEqual(t.project().zones.find(z=>z.id==='haven-1l').havenRoom,room);
 const exported=t.exportSession(),other=withLocationTiles(createTabletop({profile,module:milanModule}),profile);other.restoreSession(exported);assert.deepEqual(other.exportSession(),exported);
 other.project().zones.find(z=>z.id==='haven-1l').havenRoom.bonus='wrong';assert.deepEqual(other.exportSession(),exported);
 await t.setHavenRoom('haven-1l',{...room,level:'upgraded',bonus:'+2 Willpower'});assert.equal(t.exportSession().locationTiles.revision,2);assert.match(havenRoomLabel(t.project().zones.find(z=>z.id==='haven-1l').havenRoom).title,/upgraded/);
});
test('Havenkamer invoer bewaakt revisies, kamer-ID en bonus zonder onbekende waarden te verzinnen',()=>{
 const start=emptyLocationTiles(),action={zoneId:'haven-1l',kind:'haven-room',room,expectedRevision:0};const next=setLocationTile(start,profile.zones,action);
 assert.equal(start.havenRooms,undefined);assert.throws(()=>setLocationTile(next,profile.zones,action),/another screen/);
 for(const patch of [{zoneId:'qt8'},{room:{...room,type:'invented'}},{room:{...room,level:'max'}},{room:{...room,bonus:'x'.repeat(161)}}])assert.throws(()=>setLocationTile(start,profile.zones,{...action,...patch}));
 assert.deepEqual(validateLocationTiles(next,profile.zones),next);assert.equal(clearLocationTiles(next).havenRooms,undefined);assert.match(havenRoomLabel(null).bonus,/Choose a room side/);
 assert.throws(()=>validateLocationTiles({...next,havenRooms:[]},profile.zones));assert.throws(()=>validateLocationTiles({...next,havenRooms:{qt8:room}},profile.zones));
});

test('Volledige Havenwaarneming vervangt alle kamers atomair en herhaling verandert geen revisie',()=>{
 const start=setLocationTile(emptyLocationTiles(),profile.zones,{zoneId:'qt8',kind:'bonus',face:'visible',value:'haven',expectedRevision:0});
 const rooms=profile.zones.filter(z=>z.area==='haven').map(z=>({zoneId:z.id,...fixedHavenRoom(z.id)}));
 const next=applyObservedHavenRooms(start,profile.zones,rooms);
 assert.equal(start.havenRooms,undefined);assert.deepEqual(next.tiles,start.tiles);assert.equal(Object.keys(next.havenRooms).length,10);
 assert.deepEqual(applyObservedHavenRooms(next,profile.zones,rooms),next);
 const changed=rooms.map((r,i)=>i===9?{...r,level:'upgraded',bonus:'+2 Willpower'}:r);
 const upgraded=applyObservedHavenRooms(next,profile.zones,changed);
 assert.equal(upgraded.revision,next.revision+1);assert.equal(next.havenRooms[changed[9].zoneId].bonus,fixedHavenRoom(changed[9].zoneId).bonus);
 for(const invalid of [rooms.slice(1),[...rooms.slice(0,9),rooms[0]],rooms.map((r,i)=>i===9?{...r,bonus:''}:r),rooms.map((r,i)=>i===9?{...r,type:'invented'}:r)]){
  assert.throws(()=>applyObservedHavenRooms(next,profile.zones,invalid));assert.deepEqual(applyObservedHavenRooms(next,profile.zones,rooms),next);
 }
});
