import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{createTabletop}from'../src/application/tabletop.js';import{milanModule}from'../src/games/milan-uprising/module.js';
import{withLocationTiles}from'../src/games/milan-uprising/tile-tabletop.js';import{emptyLocationTiles,setLocationTile,validateLocationTiles,clearLocationTiles}from'../src/games/milan-uprising/location-tiles.js';import{havenRoomLabel}from'../src/games/milan-uprising/haven-rooms.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url))),room={type:'personal',level:'standard',bonus:'+1 Willpower'};
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
 assert.deepEqual(validateLocationTiles(next,profile.zones),next);assert.equal(clearLocationTiles(next).havenRooms,undefined);assert.match(havenRoomLabel(null).bonus,/not copied/);
 assert.throws(()=>validateLocationTiles({...next,havenRooms:[]},profile.zones));assert.throws(()=>validateLocationTiles({...next,havenRooms:{qt8:room}},profile.zones));
});
