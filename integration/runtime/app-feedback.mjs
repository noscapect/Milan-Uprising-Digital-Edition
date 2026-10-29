import {visionPython,visionArguments} from './machine-config.mjs';
import {readLocationBonusOutcomes} from './location-bonus-outcomes.mjs';
import {independentInfluenceUpdates} from '../../src/games/milan-uprising/influence-observations.js';
import {createPositiveObservations} from '../../src/adapters/positive-observations.js';
import {buildComponentInstructions} from '../../src/games/milan-uprising/component-instructions.js';
import {readComponentOutcomes} from './component-outcomes.mjs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,unlinkSync,existsSync} from 'node:fs';
import {extendTableSession} from '../../src/games/milan-uprising/expansions.js';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,sep} from 'node:path';
import {createTabletop} from '../../src/application/tabletop.js';
import {milanModule} from '../../src/games/milan-uprising/module.js';
import {buildCampaignArrangement,reconcileDistrictMap,prepareComponentSetup} from '../../src/games/milan-uprising/campaign-setup.js';
import {buildBoardInstructions} from '../../src/games/milan-uprising/board-instructions.js';
import {createSavedRoster} from './saved-roster.mjs';
import {boardTiles,resetBoardTiles,updateBoardTile} from './location-tiles-store.mjs';
import {readSetupMap} from './setup-map.mjs';
import {readGameplayInfluence} from './gameplay-influence.mjs';
import {buildInfluenceArrangement} from '../../src/games/milan-uprising/influence-update.js';
import {buildVisibleControlArrangement} from '../../src/games/milan-uprising/control-update.js';
import {readCompanionScreen} from './companion-screen.mjs';
import {readSunriseCleanup} from './sunrise-cleanup.mjs';
import {readCharacterRelocations} from './character-relocations.mjs';
import {readEncounterMarkers} from './encounter-markers.mjs';
import {validateCompanionPlacement} from '../../src/games/milan-uprising/companion-placement.js';
import {buildCompanionCleanup} from '../../src/games/milan-uprising/companion-cleanup.js';
import {scheduleMapPieces,scheduleTargetCharacter,mapPieces} from './map-piece-reader.mjs';
import {readPhaseSummary} from './phase-instructions.mjs';
import {captureTablet} from './capture-tablet.mjs';
import {validateSensorMapping,acceptsMovement,performBoardMove,movementConfirmation,movementStillAtOrigin} from './board-input.mjs';
const run=promisify(execFile);
const executable=fileURLToPath(new URL('./app-observer/build/AppObserver.exe',import.meta.url));
const focusedExecutable=fileURLToPath(new URL('./app-observer/build/AppObserver.exe',import.meta.url));
const relocationReads=createPositiveObservations({key:m=>m.componentId+':'+m.zoneId});
const componentReads=createPositiveObservations({key:i=>JSON.stringify(i)});
const influenceReads=createPositiveObservations({key:u=>u.zoneId+':'+u.faction+':'+u.count});
const bonusReads=createPositiveObservations({key:t=>t.zoneId+':'+t.value});
const baseProfile=JSON.parse(readFileSync(new URL('../../data/games/milan-uprising/city.json',import.meta.url),'utf8'));
const profile=JSON.parse(readFileSync(new URL('../../data/games/milan-uprising/city-expansions.json',import.meta.url),'utf8'));
// An isolated private state directory lets unattended acceptance tests avoid live campaign writes.
const stateRoot=process.env.MILAN_FEEDBACK_STATE_DIR?pathToFileURL(resolve(process.env.MILAN_FEEDBACK_STATE_DIR)+sep):new URL('./',import.meta.url);
const replayImage=process.env.MILAN_FEEDBACK_REPLAY_IMAGE;
const replayObservation=process.env.MILAN_FEEDBACK_REPLAY_OBSERVATION;
if((replayImage||replayObservation)&&!process.env.MILAN_FEEDBACK_STATE_DIR)throw Error('Replay vereist een afzonderlijke testmap.');
const stateFile=name=>new URL(name,stateRoot);
const savedRoster=createSavedRoster({root:stateRoot,...((replayImage||replayObservation)?{readSource:async()=>{throw Error('No save profile in this replay.');}}:{})});
export const assertSavedCharacterScan=id=>savedRoster.assertCanScan(id);
function expandedSessionFile(name){
  const target=stateFile(name.replace('.json','-expansions.json'));
  if(!existsSync(target)){
    let saved;
    try{saved=JSON.parse(readFileSync(stateFile(name),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;saved=createTabletop({profile:baseProfile,module:milanModule,random:()=>{throw Error('Roll in Milan');}}).exportSession();}
    const next=extendTableSession(saved,baseProfile,profile);
    writeFileSync(target,JSON.stringify(next,null,2));
  }
  return target;
}
let sessionFile=expandedSessionFile('current-chronicle-table.json');
const makeTable=()=>createTabletop({profile,module:milanModule,random:()=>{throw Error('Roll in official app');}});
let table=makeTable();
table.restoreSession(JSON.parse(readFileSync(sessionFile,'utf8')));
const mapping=JSON.parse(readFileSync(new URL('./location-mapping.json',import.meta.url),'utf8')).locations;
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const characters=profile.components.filter(c=>c.groupId==='characters');
const movable=profile.components.filter(c=>['characters','allies','ghouls'].includes(c.groupId));
validateSensorMapping(mapping,profile.zones);
let pending=null,last=null,previous=null,busy=false;
let setupCandidate=null,setupNeedsReset=true,setupClearedResearch=[];
let inputGeneration=0,appInstance=null,recovery=null;
try{recovery=JSON.parse(readFileSync(stateFile('last-input-recovery.json'),'utf8'));}catch{}
try{appInstance=JSON.parse(readFileSync(stateFile('app-instance.json'),'utf8')).appInstance;}catch{}
const moveFile=stateFile('pending-board-move.json');
let pendingMove=null;
try{pendingMove=JSON.parse(readFileSync(moveFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
function savePendingMove(){writeFileSync(moveFile,JSON.stringify(pendingMove,null,2));}
function abandonPending(reason){
  if(!pendingMove)return;
  writeFileSync(stateFile('last-abandoned-board-move.json'),JSON.stringify({...pendingMove,reason,abandonedAt:new Date().toISOString()},null,2));
  savedRoster.markUnconfirmed(pendingMove.action.componentId);pendingMove=null;savePendingMove();
}
function resetInputFlow(reason){
  inputGeneration++;abandonPending(reason);savedRoster.resetRegistrations(reason);
  previous=last=null;setupCandidate=null;
  try{unlinkSync(stateFile('last-character-scan.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
  recovery={reason,recoveredAt:new Date().toISOString(),positionsPreserved:true};
  writeFileSync(stateFile('last-input-recovery.json'),JSON.stringify(recovery,null,2));
}
export function trackAppInstance(instance){
  if(!instance)return;
  if(appInstance&&appInstance!==instance)resetInputFlow('official-app-process-restarted');
  appInstance=instance;writeFileSync(stateFile('app-instance.json'),JSON.stringify({appInstance}));
}
export function prepareReaderInput(){if(busy)throw Error('The current sensor contact is still being released.');abandonPending('new-reader-request');}
export async function recoverBoard(phone){
  resetInputFlow('user-recovery');let released=0;
  try{const s=await phone('/status');if(s.connected&&Array.isArray(s.sensors)&&s.sensors.length===40)for(let index=0;index<40;index++)if(s.sensors[index]){await phone('/sensor',{index,active:false});released++;}}catch{}
  return {recovered:true,contactsReleased:released,positionsPreserved:true};
}
function clearTable(reason){
  writeFileSync(stateFile('before-table-clear.json'),JSON.stringify({reason,clearedAt:new Date().toISOString(),session:table.exportSession(),locationTiles:boardTiles()},null,2));
  resetInputFlow(reason);
  table.reset();persist();resetBoardTiles();
  setupNeedsReset=true;setupClearedResearch=[];
  recovery={...recovery,positionsPreserved:false,resyncRequested:true};
  writeFileSync(stateFile('last-input-recovery.json'),JSON.stringify(recovery,null,2));
}
export async function clearBoard(phone){
  if(busy)throw Error('Wait until the current sensor input has finished.');
  clearTable('user-clear-and-resync');
  // Release existing contacts only; never move, scan or roll on the player's behalf.
  let released=0;
  try{const s=await phone('/status');if(s.connected&&Array.isArray(s.sensors)&&s.sensors.length===40)for(let index=0;index<40;index++)if(s.sensors[index]){await phone('/sensor',{index,active:false});released++;}}catch{}
  return {cleared:true,resyncRequested:true,contactsReleased:released,session:table.exportSession(),locationTiles:boardTiles(),complete:false};
}
function finishPendingMove(confirmation){
  if(!pendingMove)return;
  const {componentId,zoneId}=pendingMove.action;
  if(table.snapshot().placements[componentId]!==zoneId){table.place(componentId,zoneId);persist();}
  writeFileSync(stateFile('last-confirmed-board-move.json'),JSON.stringify({...pendingMove,confirmation,confirmedAt:new Date().toISOString()},null,2));
  if(['setup-placement','setup-placement-reading'].includes(pendingMove.before.screen))savedRoster.markRegistered(componentId,zoneId);
  if(['allies','ghouls'].includes(profile.components.find(c=>c.id===componentId)?.groupId)){
    try{unlinkSync(stateFile('last-character-scan.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
    previous=last=null;
  }
  pendingMove=null;savePendingMove();
}
let source='windows';
export function setFeedbackSource(value){
  if(!['windows','android'].includes(value))throw Error('Invalid screen source.');
  if(value!==source){
    if(busy)throw Error('Wait for the current move to finish.');
    persist();sessionFile=expandedSessionFile(value==='android'?'tablet-chronicle-table.json':'current-chronicle-table.json');
    table=makeTable();try{table.restoreSession(JSON.parse(readFileSync(sessionFile,'utf8')));}catch(error){if(error.code!=='ENOENT')throw error;persist();}
  }
  source=value;last=previous=null;setupCandidate=null;
}
export function noteCharacterScan(componentId){
  if(!movable.some(c=>c.id===componentId))throw Error('Unknown scannable miniature.');
  inputGeneration++;previous=last=null;setupCandidate=null;
  writeFileSync(stateFile('last-character-scan.json'),JSON.stringify({componentId,scannedAt:new Date().toISOString()}));
  savedRoster.markSent(componentId);
}
function scannedCharacter(){try{return JSON.parse(readFileSync(stateFile('last-character-scan.json'),'utf8'))?.componentId||null;}catch(error){if(error.code==='ENOENT')return null;throw error;}}
export const tableSession=()=>table.exportSession();
export function applyConfirmedAppSetup(input){
  if(source!=='android'||busy)throw Error('The Android table must be available.');
  if(!Array.isArray(input.locations)||input.locations.length!==30||input.locations.some(l=>l.restricted!==false))throw Error('Thirty confirmed districts are required; verify Restricted locations separately.');
  const generated=buildCampaignArrangement(profile,{characters:input.characters,locations:input.locations,otherPieces:[]});
  const state=table.snapshot();
  const replace=new Set(profile.components.filter(c=>['characters','control','anarch-cubes','camarilla-cubes','ambrose-cubes'].includes(c.groupId)).map(c=>c.id));
  const placements=[...Object.entries(state.placements).filter(([id,zone])=>zone&&!replace.has(id)).map(([componentId,zoneId])=>({componentId,zoneId})),...generated.placements];
  const faces=[...Object.entries(state.faces).filter(([id])=>!replace.has(id)).map(([componentId,faceId])=>({componentId,faceId})),...generated.faces];
  const nextPositions=Object.fromEntries(placements.map(p=>[p.componentId,p.zoneId])),nextFaces=Object.fromEntries(faces.map(f=>[f.componentId,f.faceId]));
  if(Object.entries(state.placements).some(([id,zone])=>(nextPositions[id]||null)!==zone)||Object.entries(state.faces).some(([id,face])=>(nextFaces[id]||profile.components.find(c=>c.id===id).faces[0].id)!==face)){
    table.arrange({placements,faces});persist();
  }
  return {confirmed:true,source:'explicit-app-setup',session:table.exportSession()};
}
// Explicitly confirmed app instructions, separate from incomplete screenshot automation.
export function applyConfirmedAppMarkers(action){
  if(source!=='android'||busy)throw Error('The Android table must be available.');
  const state=table.snapshot(),placements={...state.placements},faces={...state.faces};
  const validZone=id=>profile.zones.some(z=>z.id===id);
  if(action.character){
    const {componentId,zoneId}=action.character;
    if(!validZone(zoneId)||!characters.some(c=>c.id===componentId))throw Error('Invalid confirmed character position.');
    placements[componentId]=zoneId;
  }
  if(action.influence){
    const {zoneId,faction,count}=action.influence;
    const group={anarchs:'anarch-cubes',camarilla:'camarilla-cubes',ambrose:'ambrose-cubes'}[faction];
    if(!validZone(zoneId)||!group||!Number.isInteger(count)||count<0||count>3)throw Error('Invalid confirmed Influence.');
    const cubes=profile.components.filter(c=>c.groupId===group);
    const existing=cubes.filter(c=>placements[c.id]===zoneId),free=cubes.filter(c=>!placements[c.id]);
    if(existing.length+free.length<count)throw Error('Not enough free Influence cubes.');
    for(const c of existing)placements[c.id]=null;
    for(const c of [...existing,...free].slice(0,count))placements[c.id]=zoneId;
  }
  if(action.investigation){
    const {zoneId}=action.investigation;
    if(!validZone(zoneId))throw Error('Invalid Investigation location.');
    const tokens=profile.components.filter(c=>c.groupId==='investigation');
    const token=tokens.find(c=>placements[c.id]===zoneId)||tokens.find(c=>!placements[c.id]);
    if(!token)throw Error('No Investigation token available.');
    placements[token.id]=zoneId;faces[token.id]='investigation';
  }
  if(!action.influence&&!action.investigation&&!action.character)throw Error('No confirmed board instruction.');
  if(JSON.stringify(placements)!==JSON.stringify(state.placements)||JSON.stringify(faces)!==JSON.stringify(state.faces)){
    table.arrange({placements:Object.entries(placements).filter(([,zoneId])=>zoneId).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(faces).map(([componentId,faceId])=>({componentId,faceId}))});persist();
  }
  if(action.character&&pendingMove?.action.componentId===action.character.componentId){pendingMove=null;savePendingMove();}
  return {confirmed:true,source:'explicit-app-instruction',session:table.exportSession()};
}
export function recordComponentInstructions({instructions,expectedRevision}){
  if(source!=='android'||busy)throw Error('Wait until the linked table is available.');
  if(expectedRevision!==table.snapshot().revision)throw Error('The board changed. Check Milan and retry.');
  const arrangement=buildComponentInstructions(profile,table.snapshot(),instructions);
  if(arrangement.changed){table.arrange(arrangement);persist();}
  if(pendingMove&&instructions.some(i=>i.componentId===pendingMove.action.componentId))abandonPending('user-copied-confirmed-component-outcome');
  return {confirmed:true,scope:'table-only-confirmed-instructions',session:table.exportSession()};
}
export function parseObservation(raw){
  if(!raw.available)return {available:false,screen:'unavailable'};
  const text=raw.lines.map(l=>l.text).join(' '),compact=normalize(text);
  const error=compact.includes('indexwasoutofrange')||compact.includes('anerrorocc')||compact.includes('lostnetworkconnection')||compact.includes('unrecoverablenetworkerror');
  const character=characters.find(c=>raw.lines.some(line=>line.y>raw.height*.8&&normalize(line.text).includes(normalize(c.label.split('·')[0].trim()))));
  const headings=raw.lines.filter(l=>l.y>raw.height*.10&&l.y<raw.height*.31&&l.text.includes(':')).map(l=>normalize(l.text.split(':')[0]));
  const zone=mapping.find(z=>headings.some(h=>h===normalize(z.label)||h.endsWith(normalize(z.label))));
  const main=compact.includes('endturn')&&(compact.includes('investigate')||raw.focusRead===true&&compact.includes('main')&&compact.includes('sheet'));
  const mapScreen=compact.includes('suspicion')&&(compact.includes('masquerade')||compact.includes('masouerade'))&&compact.includes('night');
  const haven=compact.includes('sunbeginstorise')&&compact.includes('havenroom');
  const named=movable.find(c=>c.groupId!=='characters'&&compact.includes(normalize(c.label.split('·')[0].trim())));
  const namedPlacement=named&&raw.lines.some(l=>/(move|place|select.*location|choose.*location)/i.test(l.text)&&normalize(l.text).includes(normalize(named.label.split('·')[0].trim())));
  const freeMovement=raw.width===2560&&raw.height===1600&&raw.lines.some(l=>l.y>raw.height*.3&&l.y<raw.height*.45&&normalize(l.text)==='movement')&&compact.includes('moveyourcharactertoanyotherlocation')&&raw.movementPortrait?.ready&&characters.some(c=>c.id===raw.movementPortrait.componentId)?raw.movementPortrait.componentId:null;
  const sunriseCleanup=readSunriseCleanup(raw,profile.components);
  const daySummary=readPhaseSummary(raw,profile.zones,characters);
  const cityOutcomes=!daySummary?readPhaseSummary(raw,profile.zones,characters,{allowCity:true}):null;
  const setupMap=readSetupMap(raw,mapping);
  const tileSetup=compact.includes('scenariosetup')&&compact.includes('boardtiles')&&compact.includes('fliplocationbonus');
  const setupCharacter=compact.includes('charactersselection')&&compact.includes('placeyourcharacteronthemapasshown')?scannedCharacter():null;
  const setupZone=setupCharacter&&mapping.some(z=>z.zoneId===raw.setupTargetZone)?raw.setupTargetZone:null;
  const companionPrompt=compact.includes('scananallyghoulminiature');
  const lastCompanion=movable.find(c=>c.groupId!=='characters'&&c.id===scannedCharacter());
  const companionSelection=readCompanionScreen(raw,lastCompanion);
  const scannedCompanion=companionPrompt||companionSelection?lastCompanion:null;
  const screen=error?'error':sunriseCleanup?'sunrise-companion-removal':freeMovement?'free-character-movement':compact.includes('setupyourteburu')?'hardware-setup':compact.includes('scanyourcharacter')?'character-scan':companionPrompt?(scannedCompanion?'component-placement':'companion-scan'):setupCharacter?(setupZone?'setup-placement':'setup-placement-reading'):compact.includes('charactersselection')&&compact.includes('continue')?'setup-characters-complete':setupMap?'components-setup':tileSetup?'board-tiles-setup':daySummary?(daySummary.phase==='day'?'day-summary':daySummary.phase==='night'?'night-summary':'sunset-summary'):haven&&character?'haven-placement':namedPlacement?'component-placement':main&&character&&zone?'location':mapScreen?'city-map':'other';
  let map=null;
  if(source==='windows'&&mapScreen&&raw.visuals?.length===30&&raw.visuals.every(v=>Number.isInteger(v.cubeCount)&&v.cubeCount>=0&&v.cubeCount<=3)&&raw.visuals.filter(v=>v.controlFaction).length>=15){
    map=raw.visuals.map(v=>({zoneId:mapping.find(z=>z.appSensor===v.appSensor)?.zoneId,control:v.controlFaction||'none',influence:{anarchs:0,camarilla:0,ambrose:0,...(v.cubeFaction?{[v.cubeFaction]:v.cubeCount}:{})},restricted:false}));
    if(map.some(z=>!z.zoneId))map=null;
  }
  const influenceMap=source==='android'?readGameplayInfluence(raw,mapping,daySummary||cityOutcomes):null;
  return {influenceMap,available:true,capturedAt:raw.capturedAt,screen:!error&&companionSelection?companionSelection.screen:daySummary?screen:map?'map':screen,componentId:sunriseCleanup?.componentId||freeMovement||scannedCompanion?.id||setupCharacter|| (namedPlacement?named.id:character?.id||null),zoneId:setupZone||zone?.zoneId||null,map,daySummary,cityOutcomes,setupMap,setupCharacter};
}
function currentMap(){
  const state=table.snapshot();
  return mapping.filter(z=>z.appSensor>=10).map(z=>{
    const components=profile.components.filter(c=>state.placements[c.id]===z.zoneId);
    const control=components.find(c=>c.groupId==='control');
    return {zoneId:z.zoneId,control:control?state.faces[control.id]:'none',influence:Object.fromEntries(['anarchs','camarilla','ambrose'].map(f=>[f,components.filter(c=>c.groupId===({anarchs:'anarch-cubes',camarilla:'camarilla-cubes',ambrose:'ambrose-cubes'}[f])).length])),restricted:false};
  });
}
const mapSignature=map=>JSON.stringify([...map].sort((a,b)=>a.zoneId.localeCompare(b.zoneId)));
function updateMap(map,{resetResearch=false}={}){
  if(!resetResearch&&mapSignature(currentMap())===mapSignature(map))return [];
  const arrangement=resetResearch?prepareComponentSetup(profile,table.snapshot(),map):reconcileDistrictMap(profile,table.snapshot(),map);
  if(arrangement.clearedResearch?.length)writeFileSync(stateFile('before-component-setup-reset.json'),JSON.stringify(table.exportSession(),null,2));
  if(arrangement.changed){table.arrange(arrangement);persist();}
  return arrangement.clearedResearch||[];
}
export async function observe(force=false){
  if(!force&&last&&Date.now()-last.receivedAt<650)return last;
  if(pending)return pending;
  pending=(async()=>{
    const observingSource=source;
    let observingGeneration=inputGeneration;
    let raw;
    if(replayObservation){raw=JSON.parse(readFileSync(replayObservation,'utf8'));}
    else{
    let argumentsList=[],captureMs=null;
    if(observingSource==='android'){
      const captureStartedAt=Date.now();const capture=replayImage?{available:true,imagePath:replayImage}:await captureTablet({raw:true});
      captureMs=Date.now()-captureStartedAt;
      if(!capture.available){last={...capture,screen:'unavailable',stable:false,receivedAt:Date.now()};previous=null;return last;}
      if(observingGeneration!==inputGeneration)return {available:false,screen:'unavailable',stable:false,error:'Input recovery in progress.'};
      trackAppInstance(capture.appInstance);observingGeneration=inputGeneration;
      argumentsList=[capture.format==='rgba'?'--raw':'--image',capture.imagePath];
    }
    let stdout;
    try{const focus=!!pendingMove&&profile.components.some(c=>c.id===pendingMove.action.componentId&&c.groupId==='characters')&&observingSource==='android';const startedAt=Date.now();({stdout}=await run(focus?focusedExecutable:executable,focus?[...argumentsList,'--focus']:argumentsList,{timeout:10000,maxBuffer:500000,windowsHide:true}));const frame=JSON.parse(stdout);frame.readerDurationMs=Date.now()-startedAt;frame.captureDurationMs=captureMs;frame.readerMode=focus?'focused-with-fallback':'full';stdout=JSON.stringify(frame);if(focus&&!replayImage&&!replayObservation){const overlay=normalize(frame.lines.map(l=>l.text).join(' ')).includes('movementmoveyourcharactertoanyotherlocation');scheduleTargetCharacter(argumentsList[1],observingGeneration,{componentId:pendingMove.action.componentId,overlay});}if(!replayImage&&!replayObservation&&observingSource==='android'&&(JSON.parse(stdout).mapGeometry==='android-city-v1'||readSetupMap(JSON.parse(stdout),mapping)?.ready))scheduleMapPieces(argumentsList[1],observingGeneration);}
    finally{if(observingSource==='android'&&argumentsList[1]){
      try{
        if(stdout){
          const frame=JSON.parse(stdout),header=normalize(frame.lines.filter(l=>l.y<frame.height*.2).map(l=>l.text).join(' '));
          if(normalize(frame.lines.filter(l=>l.x>frame.width*.25&&l.x<frame.width*.7&&l.y>frame.height*.3&&l.y<frame.height*.65).map(l=>l.text).join(' ')).includes('movementmoveyourcharactertoanyotherlocation')){
            const linux=p=>'/mnt/'+p[0].toLowerCase()+p.slice(2).replaceAll('\\','/'),root=fileURLToPath(new URL('./',import.meta.url));
            const {stdout:portrait}=await run(visionPython,visionArguments('read-movement-portrait.py',argumentsList[1]),{timeout:10000,windowsHide:true,maxBuffer:200000});
            frame.movementPortrait=JSON.parse(portrait);stdout=JSON.stringify(frame);
          }
          if(header.includes('scenariosetup')&&/ghoulsplacement|alliesplacement|npcplacement/.test(header)){
            const linux=p=>'/mnt/'+p[0].toLowerCase()+p.slice(2).replaceAll('\\','/');
            const root=fileURLToPath(new URL('./',import.meta.url));
            const {stdout:pieces}=await run(visionPython,visionArguments('read-setup-companions.py',argumentsList[1]),{timeout:15000,windowsHide:true,maxBuffer:200000});
            frame.setupCompanions=JSON.parse(pieces);stdout=JSON.stringify(frame);
          }
        }
      }catch{/* An unreadable setup never supplies a position. */}
      if(!replayImage){try{unlinkSync(argumentsList[1]);}catch{}}
    }}
    if(source!==observingSource)return {available:false,screen:'unavailable',stable:false,error:'Screen source is changing.'};
    raw=JSON.parse(stdout);
    }
    if(observingGeneration!==inputGeneration)return {available:false,screen:'unavailable',stable:false,error:'Input recovery in progress.'};
    const value=parseObservation(raw);value.receivedAt=Date.now();value.readTiming={mode:raw.readerMode||'replay',readerMs:raw.readerDurationMs||null,captureMs:raw.captureDurationMs||null};
    const setupHeader=normalize(raw.lines.filter(l=>l.y<raw.height*.2).map(l=>l.text).join(' '));
    if(value.screen!=='error'&&setupHeader.includes('scenariosetup')&&/ghoulsplacement|alliesplacement|npcplacement/.test(setupHeader)&&raw.setupCompanions?.ready){
      const group=setupHeader.includes('npcplacement')?'npcs':setupHeader.includes('ghoulsplacement')?'ghouls':'allies';
      const moves=raw.setupCompanions.moves.filter(m=>profile.components.some(c=>c.id===m.componentId&&c.groupId===group)&&mapping.some(z=>z.zoneId===m.zoneId&&z.appSensor>=10));
      value.setupCompanions={moves,stable:previous?.screen==='companions-setup'&&JSON.stringify(previous.setupCompanions?.moves)===JSON.stringify(moves)};
      value.screen='companions-setup';
      if(value.setupCompanions.stable&&!busy&&!pendingMove){
        for(const move of moves)if(table.snapshot().placements[move.componentId]!==move.zoneId){table.place(move.componentId,move.zoneId);persist();}
        value.setupCompanions.applied=true;
      }
    }
    const phaseHeader=normalize(raw.lines?.filter(l=>l.y<raw.height*.15).map(l=>l.text).join(' ')||'').match(/night([0-9oi]+)day/);
    value.companionPhase=value.available&&value.screen!=='error'&&raw.mapGeometry==='android-city-v1'&&value.daySummary?.phase==='day'&&phaseHeader?{phase:'day',night:phaseHeader[1].replaceAll('i','1').replaceAll('o','0'),generation:inputGeneration}:null;
    if(value.companionPhase)value.companionPhase.stable=previous?.companionPhase?.phase==='day'&&previous.companionPhase.night===value.companionPhase.night&&previous.companionPhase.generation===inputGeneration;
    if(value.cityOutcomes)value.cityOutcomes.stable=!!previous?.cityOutcomes&&JSON.stringify([value.cityOutcomes.updates,value.cityOutcomes.announcements,value.cityOutcomes.unsupported])===JSON.stringify([previous.cityOutcomes.updates,previous.cityOutcomes.announcements,previous.cityOutcomes.unsupported]);
    const influenceSummary=value.daySummary||value.cityOutcomes;
    if(influenceSummary){const context=JSON.stringify([inputGeneration,influenceSummary.phase]);influenceSummary.confirmedUpdates=influenceReads.observe(independentInfluenceUpdates(profile,influenceSummary),context,value.receivedAt);}else influenceReads.reset();
    value.locationBonusOutcomes=readLocationBonusOutcomes(raw,profile.zones);
    if(value.locationBonusOutcomes)value.locationBonusOutcomes.confirmedTiles=bonusReads.observe(value.locationBonusOutcomes.tiles,inputGeneration,value.receivedAt);else bonusReads.reset();
    value.componentOutcomes=readComponentOutcomes(raw,profile);
    if(value.componentOutcomes){value.componentOutcomes.generation=inputGeneration;value.componentOutcomes.confirmedInstructions=componentReads.observe(value.componentOutcomes.instructions,inputGeneration,value.receivedAt);value.componentOutcomes.stable=value.componentOutcomes.confirmedInstructions.length>0;}else componentReads.observe([],inputGeneration,value.receivedAt);
    value.characterRelocations=readCharacterRelocations(raw,profile.zones,characters);
    if(value.characterRelocations)value.characterRelocations.stable=!!previous?.characterRelocations&&previous.characterRelocations.generation===inputGeneration&&JSON.stringify(value.characterRelocations.characterMoves)===JSON.stringify(previous.characterRelocations.characterMoves)&&JSON.stringify(value.characterRelocations.unsupported)===JSON.stringify(previous.characterRelocations.unsupported);
    if(value.characterRelocations)value.characterRelocations.generation=inputGeneration;
    if(value.characterRelocations){value.characterRelocations.confirmedMoves=relocationReads.observe(value.characterRelocations.characterMoves,inputGeneration,value.receivedAt);value.characterRelocations.stable=value.characterRelocations.confirmedMoves.length>0;}else relocationReads.observe([],inputGeneration,value.receivedAt);
    value.encounterMarkers=value.available&&value.screen!=='error'?readEncounterMarkers(raw,profile.zones):null;
    if(value.encounterMarkers)value.encounterMarkers.stable=!!previous?.encounterMarkers&&JSON.stringify([value.encounterMarkers.investigationLocations,value.encounterMarkers.removeInvestigation])===JSON.stringify([previous.encounterMarkers.investigationLocations,previous.encounterMarkers.removeInvestigation]);

    value.mapPieces=raw.mapPieces||((raw.mapGeometry==='android-city-v1'||value.setupMap?.ready||pendingMove)?mapPieces(inputGeneration):null);
    // The app animates the destination outline. Retain a twice-read destination
    // only inside the same character-placement scene; never across other scenes.
    if(!value.setupCharacter||value.screen==='error')setupCandidate=null;
    else{
      if(setupCandidate?.componentId!==value.setupCharacter)setupCandidate=null;
      if(value.zoneId){
        if(setupCandidate?.zoneId===value.zoneId)setupCandidate.reads++;
        else setupCandidate={componentId:value.setupCharacter,zoneId:value.zoneId,reads:1};
      }
      if(setupCandidate?.reads>=2){value.zoneId=setupCandidate.zoneId;value.screen='setup-placement';}
    }
    value.stable=['location','haven-placement','component-placement','companion-placement','setup-placement','setup-placement-reading','character-scan','city-map','setup-characters-complete','companion-scan','free-character-movement','sunrise-companion-removal'].includes(value.screen)&&previous?.screen===value.screen&&previous.componentId===value.componentId&&previous.zoneId===value.zoneId||value.screen==='map'&&previous?.screen==='map'&&mapSignature(value.map)===mapSignature(previous.map);
    if(['day-summary','sunset-summary','night-summary'].includes(value.screen))value.stable=previous?.screen===value.screen&&JSON.stringify([value.daySummary.updates,value.daySummary.removeControl,value.daySummary.announcements,value.daySummary.characterMoves,value.daySummary.unsupported,value.daySummary.investigationLocations])===JSON.stringify([previous.daySummary.updates,previous.daySummary.removeControl,previous.daySummary.announcements,previous.daySummary.characterMoves,previous.daySummary.unsupported,previous.daySummary.investigationLocations]);
    if(value.screen==='components-setup')value.stable=!!value.setupMap?.ready&&previous?.screen===value.screen&&previous.setupMap?.ready&&mapSignature(value.setupMap.locations)===mapSignature(previous.setupMap.locations);
    if(value.influenceMap?.ready)value.influenceMap.stable=!!previous?.influenceMap?.ready&&mapSignature(value.influenceMap.locations)===mapSignature(previous.influenceMap.locations)&&JSON.stringify(value.influenceMap.controls)===JSON.stringify(previous.influenceMap.controls);
    previous=value;last=value;
    if(value.influenceMap?.stable){
      try{const arrangement=buildVisibleControlArrangement(profile,table.snapshot(),value.influenceMap.controls||[]);if(arrangement.changed){table.arrange(arrangement);persist();}value.influenceMap.controlApplied=true;}catch(error){value.influenceMap.controlError=error.message;}
      const updates=value.influenceMap.locations.flatMap(l=>Object.entries(l.influence).map(([faction,count])=>({zoneId:l.zoneId,faction,count})));
      try{const arrangement=buildInfluenceArrangement(profile,table.snapshot(),updates);if(arrangement.changed){table.arrange(arrangement);persist();writeFileSync(stateFile('last-map-influence-update.json'),JSON.stringify({capturedAt:raw.capturedAt,revision:table.snapshot().revision,locations:value.influenceMap.locations,scope:'influence-only'},null,2));}value.influenceMap.applied=true;}catch(error){value.influenceMap.error=error.message;}
    }
    if(value.screen==='hardware-setup'||value.stable&&!['components-setup','error','unavailable','other'].includes(value.screen))setupNeedsReset=true;
    if(value.stable&&value.screen==='components-setup'){
      if(setupNeedsReset){
        if(busy||pendingMove)return value;
        clearTable('scenario-component-setup');
      }
      const cleared=updateMap(value.setupMap.locations,{resetResearch:setupNeedsReset});if(setupNeedsReset)setupClearedResearch=cleared;setupNeedsReset=false;
      value.setupMap.clearedResearch=setupClearedResearch;
      value.setupMap.applied=true;
      writeFileSync(stateFile('last-setup-sync.json'),JSON.stringify({capturedAt:raw.capturedAt,revision:table.snapshot().revision,totals:value.setupMap.totals,clearedResearch:setupClearedResearch,categories:['influence','control'],unverified:['characters','location tiles','story markers']},null,2));
    }
    if(value.available&&value.screen!=='error'&&value.mapPieces?.ready&&(value.mapPieces.stable||value.mapPieces.investigationStable||value.mapPieces.investigationRemovalStable)&&(replayObservation||value.mapPieces.generation===inputGeneration)){
      const characterMoves=value.mapPieces.stable&&(value.influenceMap?.stable||value.stable&&value.setupMap?.ready)&&!busy?value.mapPieces.characterMoves.filter(m=>m.componentId!==pendingMove?.action.componentId&&table.snapshot().placements[m.componentId]!==m.zoneId):[];
      const removeInvestigation=value.mapPieces.investigationRemovalStable?value.mapPieces.removedInvestigationLocations||[]:[];
      const investigationLocations=((value.mapPieces.investigationStable??value.mapPieces.stable)?value.mapPieces.investigationLocations:[]).filter(id=>!removeInvestigation.includes(id)&&(!value.encounterMarkers?.stable||!value.encounterMarkers.removeInvestigation.includes(id)));
      if(investigationLocations.length||characterMoves.length||removeInvestigation.length)try{
        const arrangement=buildBoardInstructions(profile,table.snapshot(),{investigationLocations,characterMoves,removeInvestigation});
        if(arrangement.changed){table.arrange(arrangement);persist();}
        for(const m of characterMoves)savedRoster.markRegistered(m.componentId,m.zoneId);
        value.mapPieces.applied=true;
      }catch(error){value.mapPieces.error=error.message;}
    }
    // Copy only stable positive companion observations; never deploy or charge in Milan.
    if(value.mapPieces?.ready&&value.mapPieces.stable&&value.influenceMap?.stable&&value.screen!=='error'&&value.daySummary?.phase!=='day'&&!busy&&!pendingMove&&(replayObservation||value.mapPieces.generation===inputGeneration)){
      try{
        const state=table.snapshot(),placements={...state.placements},seen=new Set();
        for(const move of value.mapPieces.companionMoves||[]){
          if(seen.has(move.componentId))throw Error('Duplicate observed companion.');
          seen.add(move.componentId);
          validateCompanionPlacement(profile,placements,move);
          placements[move.componentId]=move.zoneId;
        }
        if([...seen].some(id=>placements[id]!==state.placements[id])){
          table.arrange({placements:Object.entries(placements).filter(([,zoneId])=>zoneId).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(state.faces).map(([componentId,faceId])=>({componentId,faceId}))});persist();
        }
        value.mapPieces.companionsApplied=true;
      }catch(error){value.mapPieces.companionError=error.message;}
    }
    // A setup reset invalidates the previous cached observation; retain this fresh frame.
    previous=value;last=value;
    if(pendingMove?.source===source&&movementConfirmation(pendingMove.before,pendingMove.action,value))finishPendingMove('late-app-confirmation');
    if(pendingMove?.source===source&&!busy){
      const origin=movementStillAtOrigin(pendingMove.before,pendingMove.action,value);
      if(origin){const id=pendingMove.action.componentId;if(table.snapshot().placements[id]!==origin){table.place(id,origin);persist();}abandonPending('app-still-requests-movement-at-confirmed-origin');savedRoster.markRegistered(id,origin);value.inputRecovery={componentId:id,zoneId:origin,reason:'Milan still requests movement; previous attempt unconfirmed. No input replayed.'};}
    }
    if(value.stable&&value.screen==='location'&&table.snapshot().placements[value.componentId]!==value.zoneId){table.place(value.componentId,value.zoneId);persist();}
    if(value.companionPhase?.stable){
      try{
        const arrangement=buildCompanionCleanup(profile,table.snapshot(),value.companionPhase);
        if(arrangement.changed){table.arrange(arrangement);persist();writeFileSync(stateFile('last-automatic-companion-cleanup.json'),JSON.stringify({source:'confirmed-milan-day-phase',capturedAt:raw.capturedAt,night:value.companionPhase.night,removed:arrangement.removed,revision:table.snapshot().revision}));}
        if(pendingMove&&profile.components.some(c=>c.id===pendingMove.action.componentId&&['allies','ghouls'].includes(c.groupId)))abandonPending('companion-deployment-ended-in-milan-day-phase');
        value.companionPhase.applied=true;value.companionPhase.removed=arrangement.removed;
      }catch(error){value.companionPhase.error=error.message;}
    }
    if(value.characterRelocations?.stable&&!busy){
      try{
        const observed=value.mapPieces?.stable?value.mapPieces.characterMoves||[]:[];
        const moves=(value.characterRelocations.confirmedMoves||value.characterRelocations.characterMoves).filter(m=>m.componentId!==pendingMove?.action.componentId&&!observed.some(p=>p.componentId===m.componentId&&p.zoneId!==m.zoneId));
        const arrangement=buildBoardInstructions(profile,table.snapshot(),{characterMoves:moves});
        if(arrangement.changed){table.arrange(arrangement);persist();writeFileSync(stateFile('last-character-relocations.json'),JSON.stringify({capturedAt:raw.capturedAt,characterMoves:moves,revision:table.snapshot().revision}));}
        for(const move of moves)savedRoster.markRegistered(move.componentId,move.zoneId);
        value.characterRelocations.applied=true;
      }catch(error){value.characterRelocations.error=error.message;}
    }
    if(value.encounterMarkers?.stable){
      try{const arrangement=buildBoardInstructions(profile,table.snapshot(),{...value.encounterMarkers,investigationLocations:value.encounterMarkers.investigationLocations.filter(id=>!value.mapPieces?.removedInvestigationLocations?.includes(id))});if(arrangement.changed){table.arrange(arrangement);persist();}value.encounterMarkers.applied=true;}catch(error){value.encounterMarkers.error=error.message;}
    }
    if(value.stable&&value.screen==='map')updateMap(value.map);
    if(value.stable&&value.daySummary&&!value.daySummary.unsupported.length){
      const controls=value.daySummary.announcements.filter(a=>a.kind==='control').map(({zoneId,faction})=>({zoneId,faction}));
      if(controls.length)try{const arrangement=buildVisibleControlArrangement(profile,table.snapshot(),controls);if(arrangement.changed){table.arrange(arrangement);persist();}value.daySummary.controlApplied=true;}catch(error){value.daySummary.controlError=error.message;}
    }
    if(value.stable&&['day-summary','sunset-summary','night-summary'].includes(value.screen)&&(value.daySummary.updates.length||value.daySummary.removeControl.length||value.daySummary.characterMoves.length||value.daySummary.investigationLocations.length)&&!value.daySummary.unsupported.length){
      try{
        const arrangement=buildBoardInstructions(profile,table.snapshot(),{influence:value.daySummary.updates,removeControl:value.daySummary.removeControl,characterMoves:value.characterRelocations?[]:value.daySummary.characterMoves,investigationLocations:value.daySummary.investigationLocations.filter(id=>!value.mapPieces?.removedInvestigationLocations?.includes(id))});
        if(arrangement.changed){table.arrange(arrangement);persist();writeFileSync(stateFile(value.daySummary.phase==='night'?'last-night-board-update.json':'last-day-influence-update.json'),JSON.stringify({capturedAt:raw.capturedAt,...value.daySummary,revision:table.snapshot().revision},null,2));}
        for(const move of value.daySummary.characterMoves)savedRoster.markRegistered(move.componentId,move.zoneId);
        value.daySummary.applied=true;
      }catch(error){value.daySummary.error=error.message;}
    }
    if(value.cityOutcomes?.stable&&!value.cityOutcomes.unsupported.length){
      try{
        if(value.cityOutcomes.updates.length){const arrangement=buildInfluenceArrangement(profile,table.snapshot(),value.cityOutcomes.updates);if(arrangement.changed){table.arrange(arrangement);persist();}}
        const controls=value.cityOutcomes.announcements.filter(a=>a.kind==='control').map(({zoneId,faction})=>({zoneId,faction}));
        if(controls.length){const arrangement=buildVisibleControlArrangement(profile,table.snapshot(),controls);if(arrangement.changed){table.arrange(arrangement);persist();}}
        value.cityOutcomes.applied=true;
      }catch(error){value.cityOutcomes.error=error.message;}
    }
    const confirmedInfluence=(value.daySummary||value.cityOutcomes)?.confirmedUpdates||[];
    if(value.available&&value.screen!=='error'&&confirmedInfluence.length){
      try{const arrangement=buildInfluenceArrangement(profile,table.snapshot(),confirmedInfluence);if(arrangement.changed){table.arrange(arrangement);persist();}const summary=value.daySummary||value.cityOutcomes;summary.confirmedUpdatesApplied=true;}catch(error){(value.daySummary||value.cityOutcomes).confirmedUpdatesError=error.message;}
    }
    if(value.componentOutcomes?.stable&&!busy){
      const instructions=(value.componentOutcomes.confirmedInstructions||value.componentOutcomes.instructions).filter(i=>{
        const component=profile.components.find(c=>c.id===i.componentId);
        if(i.operation==='place'&&component.groupId==='investigation'&&(i.faceId||table.snapshot().faces[i.componentId])==='investigation'&&value.mapPieces?.removedInvestigationLocations?.includes(i.zoneId))return false;
        if(i.operation==='place'&&['allies','ghouls'].includes(component.groupId)&&(value.daySummary?.phase==='day'||value.screen==='sunrise-companion-removal'))return false;
        if(pendingMove?.action.componentId===i.componentId&&i.operation==='place'&&pendingMove.action.zoneId!==i.zoneId)return false;
        return true;
      });
      if(instructions.length)try{
        const arrangement=buildComponentInstructions(profile,table.snapshot(),instructions);
        if(arrangement.changed){table.arrange(arrangement);persist();}
        if(pendingMove&&instructions.some(i=>i.componentId===pendingMove.action.componentId&&(i.operation==='remove'||i.zoneId===pendingMove.action.zoneId)))abandonPending('explicit-component-outcome-observed');
        value.componentOutcomes.applied=true;
      }catch(error){value.componentOutcomes.error=error.message;}
    }
    if(value.locationBonusOutcomes?.confirmedTiles.length&&value.screen!=='error'){
      try{for(const tile of value.locationBonusOutcomes.confirmedTiles)updateBoardTile({...tile,expectedRevision:boardTiles().revision});value.locationBonusOutcomes.applied=true;}catch(error){value.locationBonusOutcomes.error=error.message;}
    }
    writeFileSync(stateFile('app-observation.json'),JSON.stringify(raw));
    return value;
  })().finally(()=>pending=null);return pending;
}
function persist(){writeFileSync(sessionFile,JSON.stringify(table.exportSession(),null,2));}
export async function boardStatus({refresh=true}={}){
  const observation=refresh?await observe(true):last&&Date.now()-last.receivedAt<5000?last:{...last,available:false,screen:'unavailable',stable:false,error:'Waiting for a fresh app observation.'};
  const roster=source==='android'?(refresh?await savedRoster.refresh(observation):savedRoster.result()):{ready:false,characters:[],error:'Saved roster reading requires Milan on the tablet.'};
  return {source,observation,roster,recovery,synchronization:{complete:false,issues:[...(observation.locationBonusOutcomes?.unsupported||[]),...(observation.componentOutcomes?.unsupported||[]),...(observation.daySummary?.unsupported||[]),...(observation.cityOutcomes?.unsupported||[]),...[observation.locationBonusOutcomes?.error,observation.componentOutcomes?.error,observation.mapPieces?.error,observation.mapPieces?.companionError].filter(Boolean)],scope:'Only observed categories are confirmed; a full campaign snapshot is not available from the app.',setup:observation.setupMap||null,influenceMap:observation.influenceMap||null,background:true},session:table.exportSession(),busy,pendingMove:pendingMove?{action:pendingMove.action,sentAt:pendingMove.sentAt}:null,movement:{sensorCount:40,mappedZones:40,movableComponents:movable.map(c=>c.id),allowedComponents:!pendingMove&&acceptsMovement(observation)?[observation.componentId]:[],phase:observation.screen}};
}
export function editExpansionPiece({componentId,zoneId,operation,expectedRevision}){
  if(busy||pendingMove)throw Error('Wait for the current app input to finish.');
  const component=profile.components.find(c=>c.id===componentId);
  if(!component?.expansionId||['characters','allies','ghouls'].includes(component.groupId))throw Error('Choose a manual expansion marker. Smart miniatures follow the official app.');
  if(expectedRevision!==table.snapshot().revision)throw Error('The board changed. Refresh and retry.');
  if(operation==='place')table.place(componentId,zoneId);
  else if(operation==='remove')table.remove(componentId);
  else throw Error('Unknown marker action');
  persist();return {session:table.exportSession(),scope:'manual-table-only'};
}
export async function moveFromBoard(action,phone){
  if(busy)throw Error('Wait for Milan to finish processing the previous move.');
  if(pendingMove){await observe(true);if(pendingMove)throw Error('The previous sensor input is awaiting app confirmation. Check Milan; do not send this move again.');}
  busy=true;
  const generation=inputGeneration;
  const checkGeneration=()=>{if(generation!==inputGeneration)throw Error('The app session changed. Previous input was abandoned without replay; follow Milan.');};
  try{return await performBoardMove(action,{mapping,movable,currentZone:id=>table.snapshot().placements[id],validateCompanion:action=>validateCompanionPlacement(profile,table.snapshot().placements,action),observe:async force=>{checkGeneration();const o=await observe(force);checkGeneration();return o;},phone:async(path,body)=>{if(!(path==='/sensor'&&body?.active===false))checkGeneration();return phone(path,body);},
    onSending:(before,action)=>{checkGeneration();pendingMove={source,before,action,saveKey:savedRoster.contextKey(),sentAt:new Date().toISOString()};savePendingMove();},
    commit:(id,zone)=>{checkGeneration();if(pendingMove)finishPendingMove('app-confirmation');else if(table.snapshot().placements[id]!==zone){table.place(id,zone);persist();}},
    report:async()=>({source,observation:last,session:table.exportSession(),busy:false})});}
  finally{busy=false;}
}
export async function resolveCompanionPlacement({componentId,zoneId,sentAt,confirmation}){
  if(busy)throw Error('Wait until the sensor contact has been released.');
  if(!['accepted','rejected'].includes(confirmation)||!pendingMove||pendingMove.source!==source||pendingMove.sentAt!==sentAt||pendingMove.action.componentId!==componentId||pendingMove.action.zoneId!==zoneId||!['companion-placement','component-placement'].includes(pendingMove.before.screen))throw Error('This pending placement has changed. Read Milan again.');
  validateCompanionPlacement(profile,table.snapshot().placements,{componentId,zoneId});
  if(confirmation==='accepted'){
    if(!last?.available||last.screen==='error')throw Error('Check Milan before confirming this placement.');
    finishPendingMove('user-verified-in-official-app');
  }else abandonPending('user-reports-companion-not-placed');
  return {confirmed:confirmation==='accepted',session:table.exportSession()};
}
export function removeConfirmedCompanion({componentId,expectedZoneId,expectedRevision}){
  if(busy)throw Error('Wait until the current sensor contact has finished.');
  if(!profile.components.some(c=>c.id===componentId&&['allies','ghouls'].includes(c.groupId)))throw Error('Choose an ally or ghoul.');
  if(pendingMove?.action.componentId===componentId)throw Error('Resolve this miniature placement before recording its removal.');
  const state=table.snapshot();if(state.revision!==expectedRevision||state.placements[componentId]!==expectedZoneId)throw Error('The board changed. Check Milan and the current miniature location again.');
  if(expectedZoneId!==null){table.remove(componentId);persist();writeFileSync(stateFile('last-confirmed-companion-removal.json'),JSON.stringify({componentId,previousZoneId:expectedZoneId,source:'user-verified-in-official-app',recordedAt:new Date().toISOString(),screen:last?.screen||null}));}
  return {confirmed:true,scope:'user-confirmed-companion-removal',session:table.exportSession()};
}
