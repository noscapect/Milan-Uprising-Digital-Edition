import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readSetupLocationTiles,buildSetupTileActions} from '../src/games/milan-uprising/setup-location-tiles.js';
import {emptyLocationTiles,setLocationTile} from '../src/games/milan-uprising/location-tiles.js';
import {createPositiveObservations} from '../src/adapters/positive-observations.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city.json',import.meta.url))),catalog=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/location-bonuses.json',import.meta.url)));
const house={zoneId:'qt8',kind:'special',face:'visible',value:'haven'},metro={zoneId:'portello',kind:'bonus',face:'visible',value:'underground'};
const raw=tiles=>({available:true,width:2560,height:1600,lines:[{text:'Scenario setup BOARD TILES',x:1000,y:100},{text:'Flip Location Bonus and',x:1650,y:980},{text:'Special Location tiles as shown.',x:1650,y:1050}],setupLocationTiles:{ready:true,geometry:'android-board-tiles-v1',tiles,unconfirmed:['washington']}});
test('setup catalog covers all city districts and recognized sides require two observations',()=>{
 assert.deepEqual(Object.keys(catalog.bonuses).sort(),profile.zones.filter(z=>z.area==='city').map(z=>z.id).sort());
 const observed=readSetupLocationTiles(raw([house,metro]),profile.zones,catalog);assert.deepEqual(observed.tiles,[house,metro]);
 const track=createPositiveObservations({key:t=>[t.zoneId,t.kind,t.face,t.value].join(':')});
 assert.deepEqual(track.observe(observed.tiles,1,100),[]);assert.equal(track.observe(observed.tiles,1,101).length,2);assert.deepEqual(track.observe(observed.tiles,2,102),[]);
});
test('ordinary maps, unsupported geometry, duplicate tiles and absent-icon guesses do not become setup commands',()=>{
 for(const change of [r=>r.lines=[],r=>r.width=1920,r=>r.setupLocationTiles.geometry='other',r=>r.setupLocationTiles.tiles=[house,house],r=>r.setupLocationTiles.tiles=[{...metro,face:'hidden'}],r=>r.setupLocationTiles.tiles=[{...metro,value:'income'}]]){
  const frame=raw([house,metro]);change(frame);assert.equal(readSetupLocationTiles(frame,profile.zones,catalog),null);
 }
 assert(readSetupLocationTiles(raw([{...metro,face:'hidden',evidence:'matching-map-texture'}]),profile.zones,catalog));
});
test('setup corrections preserve room upgrades and unobserved sides; an old Haven needs positive back-side evidence',()=>{
 let state=emptyLocationTiles();for(const tile of [{zoneId:'barona',kind:'special',face:'visible',value:'haven'},house])state=setLocationTile(state,profile.zones,{...tile,expectedRevision:state.revision});
 state=setLocationTile(state,profile.zones,{zoneId:'haven-1l',kind:'haven-room',room:{type:'personal',level:'upgraded',bonus:'+2 Willpower'},expectedRevision:state.revision});
 const before=structuredClone(state);assert.deepEqual(buildSetupTileActions(state,[house]),[]);
 const hidden={zoneId:'barona',kind:'bonus',face:'hidden',value:'possibleHaven'};
 const actions=buildSetupTileActions(state,[house,metro,hidden]);assert(actions.some(tile=>tile.zoneId==='barona'&&tile.kind==='special'&&tile.face==='hidden'));
 for(const tile of actions)state=setLocationTile(state,profile.zones,{...tile,expectedRevision:state.revision});
 assert.deepEqual(state.havenRooms,before.havenRooms);assert.deepEqual(buildSetupTileActions(state,[house,metro,hidden]),[]);assert.equal(before.tiles.barona.special.face,'visible');
});
