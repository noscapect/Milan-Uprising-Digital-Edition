// Adapter policy. Observations and device-specific state remain private.
export function validateSensorMapping(mapping,zones){
  if(mapping.length!==40||new Set(mapping.map(x=>x.zoneId)).size!==40||new Set(mapping.map(x=>x.rawIndex)).size!==40||new Set(mapping.map(x=>x.appSensor)).size!==40||mapping.some(x=>!zones.some(z=>z.id===x.zoneId)||!Number.isInteger(x.rawIndex)||x.rawIndex<0||x.rawIndex>=40||!Number.isInteger(x.appSensor)||x.appSensor<0||x.appSensor>=40))throw Error('The forty sensors are not mapped completely and uniquely.');
}
export function acceptsMovement(o){return o.available&&o.stable&&['location','haven-placement','component-placement','companion-placement','setup-placement','setup-placement-reading','free-character-movement'].includes(o.screen)&&Boolean(o.componentId);}
export function movementConfirmation(before,action,observed){
  if(!observed.available||observed.screen==='error')return null;
  const completed=observed.characterRelocations?.confirmedMoves;
  if(completed?.some(m=>m.componentId===action.componentId&&m.zoneId===action.zoneId&&m.pairSince>=before.receivedAt))return 'app-completed-movement-card';
  if(observed.mapPieces?.confirmedCharacterMoves?.some(m=>m.componentId===action.componentId&&m.zoneId===action.zoneId&&m.pairSince>=before.receivedAt))return 'app-map-position';
  if(!observed.stable)return null;
  if(['location','component-location'].includes(observed.screen)&&observed.componentId===action.componentId&&observed.zoneId===action.zoneId)return 'app-location';
  if(!completed&&observed.characterRelocations?.stable&&observed.receivedAt>before.receivedAt&&observed.characterRelocations.characterMoves.some(m=>m.componentId===action.componentId&&m.zoneId===action.zoneId))return 'app-completed-movement-card';
  if(observed.mapPieces?.ready&&observed.mapPieces.stable&&Number.isFinite(before.receivedAt)&&observed.mapPieces.stableSince>=before.receivedAt&&observed.mapPieces.characterMoves?.some(m=>m.componentId===action.componentId&&m.zoneId===action.zoneId))return 'app-map-position';
  if(before.screen==='haven-placement'&&action.zoneId.startsWith('haven-')&&observed.screen==='haven-placement'&&observed.componentId&&observed.componentId!==before.componentId)return 'haven-phase-advanced';
  if(['setup-placement','setup-placement-reading'].includes(before.screen)&&(!before.zoneId||action.zoneId===before.zoneId)&&observed.screen==='character-scan')return 'setup-placement-accepted';
  if(['setup-placement','setup-placement-reading'].includes(before.screen)&&(!before.zoneId||action.zoneId===before.zoneId)&&['location','haven-placement','day-summary','sunset-summary','city-map','setup-characters-complete'].includes(observed.screen))return 'setup-completed-to-game';
  if(before.screen==='haven-placement'&&action.zoneId.startsWith('haven-')&&observed.screen==='sunrise-companion-removal')return 'haven-completed-to-sunrise-cleanup';
  if(before.screen==='haven-placement'&&action.zoneId.startsWith('haven-')&&observed.screen==='day-summary')return 'haven-completed-to-day';
  return null;
}
// Two fresh positive origin observations plus the still-active request let us
// abandon an unconfirmed attempt, without declaring success or replaying input.
export function movementStillAtOrigin(before,action,observed){
  const origin=before.originZoneId||before.zoneId;
  if(!origin||origin===action.zoneId||!observed.available||!observed.stable||observed.screen!=='free-character-movement'||observed.componentId!==action.componentId)return null;
  return observed.mapPieces?.confirmedCharacterMoves?.some(m=>m.componentId===action.componentId&&m.zoneId===origin&&m.pairSince>=before.receivedAt+8000)?origin:null;
}
export async function performBoardMove(action,{mapping,movable,currentZone=()=>null,observe,phone,commit,report,validateCompanion,onSending=()=>{},sleep=ms=>new Promise(r=>setTimeout(r,ms)),now=Date.now,timeout=16000}){
  const target=mapping.find(z=>z.zoneId===action.zoneId),component=movable.find(c=>c.id===action.componentId);
  if(!target||!component)throw Error('Choose a controllable character and a valid board zone.');
  let before=await observe(true);
  if(!before.stable){await sleep(400);before=await observe(true);}
  if(!acceptsMovement(before))throw Error('Milan is not requesting a recognised move. Open its location screen or placement prompt.');
  if(before.componentId!==action.componentId)throw Error('Milan expects '+before.componentId+'; move the active character.');
  if(['allies','ghouls'].includes(component.groupId)){
    if(!['companion-placement','component-placement'].includes(before.screen))throw Error('Open the ally or ghoul placement step in Milan first.');
    if(!validateCompanion)throw Error('Companion placement validation is unavailable.');
    validateCompanion(action);
  }
  if(before.screen==='haven-placement'&&!target.zoneId.startsWith('haven-'))throw Error('Milan requests a Haven room. Choose a Haven zone.');
  if(before.screen==='setup-placement'&&target.zoneId!==before.zoneId)throw Error('Milan requests '+before.zoneId+'. Use the highlighted setup destination.');
  if(before.screen==='free-character-movement'&&(component.groupId!=='characters'||target.zoneId.startsWith('haven-')||target.zoneId===currentZone(action.componentId)))throw Error('Milan requests a different city district for this character.');
  const status=await phone('/status');
  if(!status.connected||!status.running)throw Error('The PC Core is not connected to Milan.');
  if(!Array.isArray(status.sensors)||status.sensors.length!==40||status.sensors.some(Boolean))throw Error('Sensor contacts are occupied. Release them first.');
  before={...before,originZoneId:currentZone(action.componentId)||before.zoneId};
  onSending(before,action);
  try{await phone('/sensor',{index:target.rawIndex,active:true});await sleep(450);}
  finally{await phone('/sensor',{index:target.rawIndex,active:false});}
  const deadline=now()+timeout;
  while(now()<deadline){
    await sleep(400);const observed=await observe(true);
    if(observed.screen==='error')throw Error('Milan is showing an error. The sensor contact was released; the board position remains unconfirmed.');
    const confirmation=movementConfirmation(before,action,observed);
    if(confirmation){commit(action.componentId,action.zoneId);return {confirmed:true,confirmation,...await report()};}
  }
  if(before.screen==='free-character-movement'||['allies','ghouls'].includes(component.groupId))return {confirmed:false,awaitingConfirmation:true,...await report()};
  throw Error('Sensor input sent, but Milan has not confirmed the move. Check the app; the board position was not advanced.');
}
