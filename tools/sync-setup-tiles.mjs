// Optional temporary recovery worker for a running adapter. The normal adapter
// performs the same recognition after its next ordinary launch.
import {readFile,unlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createPositiveObservations} from '../src/adapters/positive-observations.js';
import {readSetupLocationTiles,buildSetupTileActions} from '../src/games/milan-uprising/setup-location-tiles.js';
const run=promisify(execFile);
const options=Object.fromEntries(process.argv.slice(2).map(arg=>arg.split('=')));
const runtime=resolve(options['--runtime']||fileURLToPath(new URL('../private/linked/',import.meta.url)));
const watch=Object.hasOwn(options,'--watch'),parent=Number(options['--adapter-pid']);
if(watch&&(!Number.isSafeInteger(parent)||parent<=0))throw Error('A running adapter PID is required.');
const {captureTablet}=await import(pathToFileURL(join(runtime,'capture-tablet.mjs')));
const settings=JSON.parse(await readFile(join(runtime,'machine.json')));
const profile=JSON.parse(await readFile(new URL('../data/games/milan-uprising/city.json',import.meta.url)));
const catalog=JSON.parse(await readFile(new URL('../data/games/milan-uprising/location-bonuses.json',import.meta.url)));
const track=createPositiveObservations({key:tile=>[tile.zoneId,tile.kind,tile.face,tile.value].join(':')});
async function api(path,body){const r=await fetch('http://127.0.0.1:5180'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json',Origin:'http://127.0.0.1:5180'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});const result=await r.json();if(!r.ok)throw Error(result.error||'Local adapter unavailable.');return result;}
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
 if(status.source!=='android'||status.observation?.screen!=='board-tiles-setup'){track.reset();return;}
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
 try{await pass();}catch(error){track.reset();console.error(error.message);if(!watch)process.exitCode=1;}
 if(!watch&&++passes>=2)break;
 await new Promise(resolve=>setTimeout(resolve,watch?2000:500));
}while(true);
