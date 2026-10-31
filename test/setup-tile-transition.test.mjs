import test from 'node:test';
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

test('real adapter transition from Board tiles to Components setup preserves tiles and room upgrades; explicit clear still clears them',async t=>{
 const root=await mkdtemp(join(tmpdir(),'tce-setup-transition-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const source=fileURLToPath(new URL('../',import.meta.url)),runtime=join(root,'private','linked'),state=join(root,'state'),frame=join(root,'frame.json');
 const filter=path=>!path.split(/[\\/]/).some(part=>['bin','obj','build','__pycache__'].includes(part));
 await mkdir(runtime,{recursive:true});await mkdir(state);
 await Promise.all(['src','data'].map(name=>cp(join(source,name),join(root,name),{recursive:true,filter})));
 await cp(join(source,'integration','runtime'),runtime,{recursive:true,filter});
 await cp(join(source,'integration','milan-uprising'),runtime,{recursive:true,filter});
 await writeFile(join(runtime,'machine.json'),'{}');
 const mapping=JSON.parse(await readFile(join(runtime,'location-mapping.json'),'utf8')).locations;
 const tiles=[{zoneId:'qt8',kind:'special',face:'visible',value:'haven'},{zoneId:'portello',kind:'bonus',face:'visible',value:'underground'}];
 const tileFrame={available:true,width:2560,height:1600,lines:[{text:'Scenario setup BOARD TILES',x:1000,y:100},{text:'Flip Location Bonus and Special Location tiles as shown.',x:1650,y:1050}],setupLocationTiles:{ready:true,geometry:'android-board-tiles-v1',tiles}};
 const componentFrame={available:true,width:2560,height:1600,lines:[{text:'Scenario setup COMPONENTS SETUP',x:1000,y:100},...['Anarch players','Camarilla faction','St Ambrose faction'].flatMap((text,index)=>[{text,x:1400,y:400+index*300},{text:'0 x Control',x:1400,y:450+index*300},{text:'0 x Influence',x:1400,y:500+index*300}])],visuals:mapping.filter(zone=>zone.appSensor>=10).map(zone=>({appSensor:zone.appSensor,cubeCount:0,cubeFaction:null,controlFaction:null}))};
 await writeFile(frame,JSON.stringify(tileFrame));
 const moduleUrl=pathToFileURL(join(runtime,'app-feedback.mjs')).href,storeUrl=pathToFileURL(join(runtime,'location-tiles-store.mjs')).href;
 const script=`
 import assert from 'node:assert/strict';import {writeFile,readFile} from 'node:fs/promises';
 import {observe as readObservation,setFeedbackSource,clearBoard} from ${JSON.stringify(moduleUrl)};
 // Replayed captures must have distinct timestamps, like real tablet frames.
 const observe=async force=>{await new Promise(resolve=>setTimeout(resolve,2));return readObservation(force);};
 import {boardTiles,updateBoardTile} from ${JSON.stringify(storeUrl)};
 setFeedbackSource('android');updateBoardTile({zoneId:'haven-1l',kind:'haven-room',room:{type:'personal',level:'upgraded',bonus:'+2 Willpower'},expectedRevision:0});
 await observe(true);await observe(true);const before=boardTiles();assert.equal(before.tiles.qt8.special.value,'haven');assert.equal(before.tiles.portello.bonus.value,'underground');
 await writeFile(process.env.MILAN_FEEDBACK_REPLAY_OBSERVATION,${JSON.stringify(JSON.stringify(componentFrame))});
 await observe(true);const components=await observe(true);assert.equal(components.setupMap.applied,true);
 assert.deepEqual(boardTiles(),before);
 const backup=JSON.parse(await readFile(${JSON.stringify(join(state,'before-table-clear.json'))},'utf8'));assert.equal(backup.reason,'scenario-component-setup');
 await observe(true);await observe(true);assert.deepEqual(boardTiles(),before);
 await clearBoard(async()=>({connected:false}));assert.deepEqual(boardTiles().tiles,{});assert.equal(boardTiles().havenRooms,undefined);
 console.log('transition preserved; explicit clear verified');`;
 const {stdout}=await promisify(execFile)(process.execPath,['--input-type=module','-e',script],{windowsHide:true,timeout:30000,env:{...process.env,MILAN_FEEDBACK_STATE_DIR:state,MILAN_FEEDBACK_REPLAY_OBSERVATION:frame,MILAN_FEEDBACK_REPLAY_IMAGE:''}});
 assert.match(stdout,/transition preserved; explicit clear verified/);
});
