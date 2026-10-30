const normalize=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
// Validate observation data before it becomes a tile command. This function
// knows no pixels, browser objects, hardware or app input.
export function readSetupLocationTiles(raw,zones,catalog){
 if(!raw?.available||raw.width!==2560||raw.height!==1600||!Array.isArray(raw.lines))return null;
 const text=normalize(raw.lines.map(line=>line.text).join(' '));
 const instructions=normalize(raw.lines.filter(line=>line.x>raw.width*.6&&line.y>raw.height*.55).sort((a,b)=>a.y-b.y).map(line=>line.text).join(' '));
 if(!text.includes('scenariosetup')||!text.includes('boardtiles')||!instructions.includes('fliplocationbonusandspeciallocationtilesasshown')||/anerrorocc|indexwasoutofrange|lostnetworkconnection/.test(text))return null;
 const seen=raw.setupLocationTiles;
 if(!seen?.ready||seen.geometry!=='android-board-tiles-v1'||!Array.isArray(seen.tiles)||seen.tiles.length>31)return null;
 const keys=new Set(),tiles=[];
 for(const tile of seen.tiles){
  const {zoneId,kind,face,value}=tile||{},key=zoneId+':'+kind;
  if(keys.has(key)||!zones.some(zone=>zone.id===zoneId&&zone.area==='city'))return null;
  if(kind==='bonus'){
   if(!['visible','hidden'].includes(face)||catalog.bonuses[zoneId]!==value)return null;
   if(face==='hidden'&&tile.evidence!=='matching-map-texture')return null;
  }else if(kind!=='special'||face!=='visible'||value!=='haven'||catalog.bonuses[zoneId]!=='possibleHaven')return null;
  keys.add(key);tiles.push({zoneId,kind,face,value});
 }
 if(tiles.filter(tile=>tile.kind==='special'&&tile.value==='haven').length>1)return null;
 return {tiles,unconfirmed:(seen.unconfirmed||[]).filter(id=>Object.hasOwn(catalog.bonuses,id)),scope:'registered-setup-tiles-only',specialCoverage:'visible-Haven-only'};
}
export function buildSetupTileActions(state,tiles){
 const actions=tiles.filter(tile=>{const current=state.tiles[tile.zoneId]?.[tile.kind];return current?.face!==tile.face||current?.value!==tile.value;}).map(tile=>({...tile}));
 const home=tiles.filter(tile=>tile.kind==='special'&&tile.face==='visible'&&tile.value==='haven');
 if(home.length===1)for(const [zoneId,kinds] of Object.entries(state.tiles)){
  const old=kinds.special;
  if(zoneId!==home[0].zoneId&&old?.face==='visible'&&['haven','haven-11','haven-12'].includes(old.value)&&tiles.some(tile=>tile.zoneId===zoneId&&tile.kind==='bonus'&&tile.face==='hidden'))actions.push({zoneId,kind:'special',face:'hidden',value:old.value});
 }
 return actions;
}
