import test from 'node:test';
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

test('setup portraits reach the real table after two observations, across NPC, ally and ghoul steps',async t=>{
 const root=await mkdtemp(join(tmpdir(),'tce-companion-setup-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const source=fileURLToPath(new URL('../',import.meta.url)),runtime=join(root,'private','linked'),state=join(root,'state'),frame=join(root,'frame.json');
 const filter=path=>!path.split(/[\\/]/).some(part=>['bin','obj','build','__pycache__'].includes(part));
 await mkdir(runtime,{recursive:true});await mkdir(state);
 await Promise.all(['src','data'].map(name=>cp(join(source,name),join(root,name),{recursive:true,filter})));
 await cp(join(source,'integration','runtime'),runtime,{recursive:true,filter});
 await cp(join(source,'integration','milan-uprising'),runtime,{recursive:true,filter});
 await writeFile(join(runtime,'machine.json'),'{}');
 const script=`
 import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
 import {observe,setFeedbackSource,tableSession,recordComponentInstructions} from ${JSON.stringify(pathToFileURL(join(runtime,'app-feedback.mjs')).href)};
 const steps=[['NPC PLACEMENT',[['npc-agnese-della-luna','duomo'],['npc-helena-varga','isola'],['npc-leandro-costa','calvairate'],['npc-ruslana','corvetto']]],['ALLIES PLACEMENT',[['ally-reporter','washington']]],['GHOULS PLACEMENT',[['ghoul-fixer','qt8']]]];
 setFeedbackSource('android');
 for(const [title,pieces] of steps){
  const raw={available:true,width:2560,height:1600,mapGeometry:null,lines:[{text:'Scenario setup',x:1258,y:63},{text:title,x:1060,y:185}],setupCompanions:{ready:true,moves:pieces.map(([componentId,zoneId])=>({componentId,zoneId}))}};
  await writeFile(process.env.MILAN_FEEDBACK_REPLAY_OBSERVATION,JSON.stringify(raw));
  await observe(true);for(const [id] of pieces)assert.equal(tableSession().state.placements[id],null);
  const confirmed=await observe(true);assert.equal(confirmed.setupCompanions.applied,true);
  for(const [id,zone] of pieces)assert.equal(tableSession().state.placements[id],zone);
  const revision=tableSession().state.revision;await observe(true);assert.equal(tableSession().state.revision,revision);
  raw.setupCompanions.moves=[];await writeFile(process.env.MILAN_FEEDBACK_REPLAY_OBSERVATION,JSON.stringify(raw));await observe(true);await observe(true);
  for(const [id,zone] of pieces)assert.equal(tableSession().state.placements[id],zone);
 }
 for(const [,pieces] of steps)for(const [id,zone] of pieces)assert.equal(tableSession().state.placements[id],zone);
 recordComponentInstructions({expectedRevision:tableSession().state.revision,instructions:[{componentId:'investigation-18',operation:'place',zoneId:'washington',faceId:'restricted'}]});
 const movement={available:true,width:2560,height:1600,mapGeometry:null,lines:[{text:'MOVEMENT',x:1106,y:605},{text:'Move your character to any other Location.',x:803,y:788}],mapPieces:{ready:true,stable:false,investigationStable:true,investigationLocations:['barona','corvetto','isola','monumentale','navigli','san-siro'],characterMoves:[]}};
 await writeFile(process.env.MILAN_FEEDBACK_REPLAY_OBSERVATION,JSON.stringify(movement));
 assert.equal((await observe(true)).mapPieces.applied,true);
 const state=tableSession().state;for(const zone of movement.mapPieces.investigationLocations)assert(Object.entries(state.placements).some(([id,z])=>id.startsWith('investigation-')&&z===zone&&state.faces[id]==='investigation'));
 assert.equal(state.placements['investigation-18'],'washington');assert.equal(state.faces['investigation-18'],'restricted');
 await observe(true);assert.equal(tableSession().state.revision,state.revision);
 for(const [,pieces] of steps)for(const [id,zone] of pieces)assert.equal(tableSession().state.placements[id],zone);
 console.log('setup placements verified');`;
 const {stdout}=await promisify(execFile)(process.execPath,['--input-type=module','-e',script],{windowsHide:true,timeout:30000,env:{...process.env,MILAN_FEEDBACK_STATE_DIR:state,MILAN_FEEDBACK_REPLAY_OBSERVATION:frame,MILAN_FEEDBACK_REPLAY_IMAGE:''}});
 assert.match(stdout,/setup placements verified/);
});
