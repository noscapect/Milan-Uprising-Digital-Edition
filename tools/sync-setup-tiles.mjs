// Optional temporary recovery worker for a running adapter. The normal adapter
// performs the same recognition after its next ordinary launch.
import {readFile,unlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createPositiveObservations} from '../src/adapters/positive-observations.js';
import {readSetupLocationTiles,buildSetupTileActions} from '../src/games/milan-uprising/setup-location-tiles.js';
import {readComponentOutcomes} from '../integration/milan-uprising/component-outcomes.mjs';
import {readPhaseSummary} from '../integration/milan-uprising/phase-instructions.mjs';
import {independentControlUpdates} from '../src/games/milan-uprising/influence-observations.js';
import {buildVisibleControlArrangement} from '../src/games/milan-uprising/control-update.js';
const run=promisify(execFile);
const options=Object.fromEntries(process.argv.slice(2).map(arg=>arg.split('=')));
const runtime=resolve(options['--runtime']||fileURLToPath(new URL('../private/linked/',import.meta.url)));
const watch=Object.hasOwn(options,'--watch'),parent=Number(options['--adapter-pid']);
if(watch&&(!Number.isSafeInteger(parent)||parent<=0))throw Error('A running adapter PID is required.');
const {captureTablet}=await import(pathToFileURL(join(runtime,'capture-tablet.mjs')));
const settings=JSON.parse(await readFile(join(runtime,'machine.json')));
const profile=JSON.parse(await readFile(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
const componentProfile=JSON.parse(await readFile(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
const catalog=JSON.parse(await readFile(new URL('../data/games/milan-uprising/location-bonuses.json',import.meta.url)));
const track=createPositiveObservations({key:tile=>[tile.zoneId,tile.kind,tile.face,tile.value].join(':')});
const npcTrack=createPositiveObservations({key:move=>[move.componentId,move.operation,move.zoneId].join(':')});
const controlTrack=createPositiveObservations({key:item=>item.zoneId+':'+item.faction});
async function api(path,body){const r=await fetch('http://127.0.0.1:5180'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json',Origin:'http://127.0.0.1:5180'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});const result=await r.json();if(!r.ok)throw Error(result.error||'Local adapter unavailable.');return result;}
async function feedPass(){
 // Reuse the adapter's recorded frame. A timestamp can count only once, so
 // polling faster never turns one capture into two independent observations.
 const raw=JSON.parse(await readFile(join(runtime,'app-observation.json'))),capturedAt=Date.parse(raw.capturedAt);
 const context=JSON.parse(await readFile(join(runtime,'app-instance.json'))).appInstance;
 if(!context||!Number.isFinite(capturedAt)||Date.now()-capturedAt>15000){npcTrack.reset();controlTrack.reset();return;}
 const outcome=readComponentOutcomes(raw,componentProfile);
 const moves=(outcome?.instructions||[]).filter(move=>componentProfile.components.some(component=>component.id===move.componentId&&component.groupId==='npcs'));
 const confirmed=npcTrack.observe(moves,context,capturedAt);
 const summary=readPhaseSummary(raw,componentProfile.zones,componentProfile.components.filter(component=>component.groupId==='characters'),{allowCity:true});
 const controls=controlTrack.observe(independentControlUpdates(componentProfile,summary),context,capturedAt);
 if(!confirmed.length&&!controls.length)return;
 const latest=await api('/api/board-status');if(latest.source!=='android'||latest.busy||latest.pendingMove)return;
 const state=latest.session.state,instructions=confirmed.filter(move=>state.placements[move.componentId]!== (move.operation==='remove'?null:move.zoneId));
 if(controls.length){
  const arrangement=buildVisibleControlArrangement(componentProfile,state,controls),placements=Object.fromEntries(arrangement.placements.map(item=>[item.componentId,item.zoneId])),faces=Object.fromEntries(arrangement.faces.map(item=>[item.componentId,item.faceId]));
  for(const component of componentProfile.components.filter(component=>component.groupId==='control')){
   const id=component.id,zoneId=placements[id]||null;
   if((state.placements[id]||null)!==zoneId||state.faces[id]!==faces[id])instructions.push({componentId:id,operation:zoneId?'place':'remove',...(zoneId?{zoneId}:{}),faceId:faces[id]});
  }
 }
 if(instructions.length){await api('/api/board-move',{operation:'component-record',instructions,expectedRevision:state.revision});console.log(JSON.stringify({confirmedFeedCorrections:instructions}));}
}
async function pass(){
 const status=await api('/api/board-status');
 // Compatibility for an adapter already running the previous reset behavior.
 // A manual clear is deliberately excluded. Revision equality ties this repair
 // to the exact automatic reset and prevents overwriting a later tile edit.
 if(status.source==='android'){
  const {locationTiles:current}=await api('/api/board-tiles');
  if(Object.keys(current.tiles).length===0){
   let backup;try{backup=JSON.parse(await readFile(join(runtime,'before-table-clear.json')));}catch{}
   if(backup?.reason==='scenario-component-setup'&&backup.locationTiles?.revision+1===current.revision){
    let locationTiles=current;
    const tiles=Object.entries(backup.locationTiles.tiles||{}).flatMap(([zoneId,kinds])=>Object.entries(kinds).map(([kind,tile])=>({zoneId,kind,...tile})));
    const rooms=Object.entries(backup.locationTiles.havenRooms||{}).map(([zoneId,room])=>({zoneId,kind:'haven-room',room}));
    for(const tile of [...tiles,...rooms])({locationTiles}=await api('/api/board-tiles',{...tile,expectedRevision:locationTiles.revision}));
    if(tiles.length||rooms.length)console.log(JSON.stringify({restoredAfterComponentSetup:true,tiles:tiles.length,rooms:rooms.length}));
   }
  }
 }
 const setup=status.source==='android'&&status.observation?.screen==='board-tiles-setup';
 const npcFeed=status.source==='android'&&['city-map','day-summary','night-summary','sunset-summary'].includes(status.observation?.screen)&&!status.busy&&!status.pendingMove;
 if(!setup)track.reset();if(!npcFeed){npcTrack.reset();controlTrack.reset();}if(!setup&&!npcFeed)return;
 if(npcFeed){await feedPass();return;}
 const capture=await captureTablet();if(!capture.available){track.reset();return;}
 try{
  const {stdout}=await run(join(runtime,'app-observer/build/AppObserver.exe'),['--image',capture.imagePath],{windowsHide:true,timeout:15000,maxBuffer:500000});
  const raw=JSON.parse(stdout);
  const {stdout:vision}=await run(settings.visionPython,[join(runtime,'read-setup-tiles.py'),capture.imagePath],{windowsHide:true,timeout:15000,maxBuffer:200000});
  raw.setupLocationTiles=JSON.parse(vision);const observed=readSetupLocationTiles(raw,profile.zones,catalog);
  if(!observed){track.reset();return;}
  const confirmed=track.observe(observed.tiles,capture.appInstance,Date.now());if(!confirmed.length)return;
  const latest=await api('/api/board-status');if(latest.observation?.screen!=='board-tiles-setup'){track.reset();return;}
  let {locationTiles}=await api('/api/board-tiles');let applied=0;
  for(const tile of buildSetupTileActions(locationTiles,confirmed)){
   const current=locationTiles.tiles[tile.zoneId]?.[tile.kind];if(current?.face===tile.face&&current?.value===tile.value)continue;
   ({locationTiles}=await api('/api/board-tiles',{...tile,expectedRevision:locationTiles.revision}));applied++;
  }
  if(applied)console.log(JSON.stringify({applied,unconfirmed:observed.unconfirmed,scope:observed.scope}));
 }finally{await unlink(capture.imagePath).catch(()=>{});}
}
let passes=0;
do{
 if(watch){try{process.kill(parent,0);}catch{break;}}
 try{await pass();}catch(error){track.reset();npcTrack.reset();controlTrack.reset();console.error(error.message);if(!watch)process.exitCode=1;}
 if(!watch&&++passes>=2)break;
 await new Promise(resolve=>setTimeout(resolve,watch?2000:500));
}while(true);
