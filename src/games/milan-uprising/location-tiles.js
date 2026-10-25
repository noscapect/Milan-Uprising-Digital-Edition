import {validateHavenRoom} from './haven-rooms.js';
export const bonusTypes={unknown:'Not identified yet',haven:'Haven',herd:'Herd',income:'Income',media:'Media Office',possibleHaven:'Possible Haven',secretBar:'Secret Bar',underground:'Underground'};
export const specialTypes={unknown:'Not identified yet',haven:'Haven','haven-11':'Haven','haven-12':'Haven'};
export const blankTile=()=>({face:'unconfirmed',value:'unknown'});
export function emptyLocationTiles(){return {format:'milan-location-tiles',schemaVersion:1,revision:0,tiles:{}};}
export function clearLocationTiles(state){return {...emptyLocationTiles(),revision:state.revision+1};}
export function setLocationTile(state,zones,{zoneId,kind,face,value,room,expectedRevision}){
  if(expectedRevision!==state.revision)throw Error('The tiles changed on another screen. Please try again.');
  if(kind==='haven-room'){
    if(!zones.some(z=>z.id===zoneId&&z.area==='haven'))throw Error('Choose a Haven room.');
    const checked=validateHavenRoom(room),next=structuredClone(state);
    if(JSON.stringify(next.havenRooms?.[zoneId])===JSON.stringify(checked))return next;
    next.havenRooms??={};next.havenRooms[zoneId]=checked;next.revision++;return next;
  }
  if(!zones.some(z=>z.id===zoneId&&z.area==='city')||!['bonus','special'].includes(kind)||!['hidden','visible','unconfirmed'].includes(face)||!Object.hasOwn(kind==='bonus'?bonusTypes:specialTypes,value))throw Error('Invalid location tile.');
  const old=state.tiles[zoneId]?.[kind]||blankTile();
  if(old.face===face&&old.value===value)return structuredClone(state);
  const next=structuredClone(state);next.tiles[zoneId]??={};next.tiles[zoneId][kind]={face,value};next.revision++;return next;
}
export function validateLocationTiles(state,zones){
  if(state?.format!=='milan-location-tiles'||state.schemaVersion!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!state.tiles||Array.isArray(state.tiles))throw Error('Invalid tile save data.');
  for(const [zoneId,kinds]of Object.entries(state.tiles)){
    if(!kinds||!Object.keys(kinds).length)throw Error('Invalid tile save data.');
    for(const [kind,tile]of Object.entries(kinds))setLocationTile(emptyLocationTiles(),zones,{zoneId,kind,...tile,expectedRevision:0});
  }
  if(state.havenRooms!==undefined){
    if(!state.havenRooms||typeof state.havenRooms!=='object'||Array.isArray(state.havenRooms))throw Error('Invalid Haven rooms.');
    for(const [zoneId,room]of Object.entries(state.havenRooms))setLocationTile(emptyLocationTiles(),zones,{zoneId,kind:'haven-room',room,expectedRevision:0});
  }
  return structuredClone(state);
}
export function decorateLocationTiles(view,state){
  return {...view,zones:view.zones.map(z=>({...z,locationTiles:state.tiles[z.id]?structuredClone(state.tiles[z.id]):null,...(z.area==='haven'?{havenRoom:state.havenRooms?.[z.id]?structuredClone(state.havenRooms[z.id]):null}:{})}))};
}
export function locationTileLabel(kind,tile){return tile.face==='visible'?(kind==='bonus'?bonusTypes:specialTypes)[tile.value]:tile.face==='hidden'?'Back side':'Not configured yet';}
