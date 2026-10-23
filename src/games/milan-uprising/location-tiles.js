export const bonusTypes={unknown:'Nog niet vastgesteld',haven:'Schuilplaats (Haven)',herd:'Voedingsbron (Herd)',income:'Inkomsten (Income)',media:'Mediakantoor (Media Office)',possibleHaven:'Mogelijke schuilplaats (Possible Haven)',secretBar:'Geheime bar (Secret Bar)',underground:'Metro (Underground)'};
export const specialTypes={unknown:'Nog niet vastgesteld',haven:'Schuilplaats (Haven)','haven-11':'Schuilplaats (Haven)','haven-12':'Schuilplaats (Haven)'};
export const blankTile=()=>({face:'unconfirmed',value:'unknown'});
export function emptyLocationTiles(){return {format:'milan-location-tiles',schemaVersion:1,revision:0,tiles:{}};}
export function setLocationTile(state,zones,{zoneId,kind,face,value,expectedRevision}){
  if(expectedRevision!==state.revision)throw Error('De tegels zijn op een ander scherm gewijzigd. Probeer opnieuw.');
  if(!zones.some(z=>z.id===zoneId&&z.area==='city')||!['bonus','special'].includes(kind)||!['hidden','visible','unconfirmed'].includes(face)||!Object.hasOwn(kind==='bonus'?bonusTypes:specialTypes,value))throw Error('Ongeldige locatietegel.');
  const old=state.tiles[zoneId]?.[kind]||blankTile();
  if(old.face===face&&old.value===value)return structuredClone(state);
  const next=structuredClone(state);next.tiles[zoneId]??={};next.tiles[zoneId][kind]={face,value};next.revision++;return next;
}
export function validateLocationTiles(state,zones){
  if(state?.format!=='milan-location-tiles'||state.schemaVersion!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!state.tiles||Array.isArray(state.tiles))throw Error('Ongeldige tegelopslag.');
  for(const [zoneId,kinds]of Object.entries(state.tiles)){
    if(!kinds||!Object.keys(kinds).length)throw Error('Ongeldige tegelopslag.');
    for(const [kind,tile]of Object.entries(kinds))setLocationTile(emptyLocationTiles(),zones,{zoneId,kind,...tile,expectedRevision:0});
  }
  return structuredClone(state);
}
export function decorateLocationTiles(view,state){
  return {...view,zones:view.zones.map(z=>({...z,locationTiles:state.tiles[z.id]?structuredClone(state.tiles[z.id]):null}))};
}
export function locationTileLabel(kind,tile){return tile.face==='visible'?(kind==='bonus'?bonusTypes:specialTypes)[tile.value]:tile.face==='hidden'?'Verborgen':'Nog niet ingesteld';}
