import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readSaveProfile} from './save-profile.mjs';
const run=promisify(execFile);
const definitionMapping=JSON.parse(readFileSync(new URL('./character-save-mapping.json',import.meta.url)));
const adb=process.env.MILAN_ADB || 'adb';
async function fromTablet(){
  const {stdout}=await run(adb,['devices'],{windowsHide:true,timeout:5000});
  const devices=stdout.split(/\r?\n/).filter(l=>/^\S+\s+device$/.test(l.trim())).map(l=>l.trim().split(/\s+/)[0]);
  if(devices.length!==1)throw Error('Connect exactly one authorised tablet.');
  const base='/sdcard/Android/data/com.xplored.teburu.vtm/files/SaveGames/Local/';
  const results=await Promise.allSettled(['Version.sr','profile_default.tsd'].map(name=>run(adb,['-s',devices[0],'exec-out','cat',base+name],{windowsHide:true,timeout:5000,encoding:'buffer',maxBuffer:2_000_000})));
  for(const result of results)if(result.status==='rejected')throw result.reason;
  if(results[0].value.stdout.toString()!=='0')throw Error('Unsupported Milan save format.');
  return readSaveProfile(results[1].value.stdout,definitionMapping);
}
export function createSavedRoster({root,readSource=fromTablet,now=Date.now}){
  const file=new URL('saved-roster-state.json',root);let state=null,lastRead=0,pending=null,ready=false,error=null;
  try{state=JSON.parse(readFileSync(file,'utf8'));if(state.schemaVersion!==1)state=null;}catch(e){if(e.code!=='ENOENT')throw e;}
  const placedFile=new URL('registered-miniatures.json',root);
  let placedIds=[];
  try{placedIds=JSON.parse(readFileSync(placedFile,'utf8'));}catch(e){
    if(e.code!=='ENOENT')throw e;
    try{
      const move=JSON.parse(readFileSync(new URL('last-confirmed-board-move.json',root),'utf8'));
      if(move.source==='android'&&['setup-placement','setup-placement-reading'].includes(move.before?.screen)&&Date.parse(move.confirmedAt)>Date.parse(state?.loadStartedAt))placedIds=[move.action.componentId];
    }catch{}
  }
  function savePlaced(){writeFileSync(placedFile,JSON.stringify(placedIds));}
  function clearPlaced(){placedIds=[];savePlaced();}
  let lastInputScene=state?.lastScene||null;
  function persist(){
    const tmp=new URL('saved-roster-state.tmp',root);writeFileSync(tmp,JSON.stringify(state,null,2));
    // Windows file scanners can briefly hold a just-read destination open.
    for(let attempt=0;;attempt++)try{renameSync(tmp,file);break;}catch(e){if(attempt>=8||!['EPERM','EBUSY','EACCES'].includes(e.code))throw e;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}
  }
  function mark(componentId,stage,zoneId=null){
    if(!state?.save.characterIds.includes(componentId))return;
    if(state.statuses[componentId]?.stage===stage&&state.statuses[componentId]?.zoneId===zoneId)return;
    state.statuses[componentId]={stage,zoneId,at:new Date(now()).toISOString()};persist();
  }
  function result(){return {ready,error,source:'official-save-profile',placedIds:[...new Set([...placedIds,...Object.entries(state?.statuses||{}).filter(([,s])=>s.stage==='registered').map(([id])=>id)])],slot:state?.save.slot||null,characters:state?.save.characterIds.map(componentId=>({componentId,...(state.statuses[componentId]||{stage:'pending',zoneId:null})}))||[]};}
  async function refresh(observation){
    if(['components-setup','hardware-setup'].includes(observation.screen)&&lastInputScene!==observation.screen)clearPlaced();
    if(!['error','unavailable','other'].includes(observation.screen))lastInputScene=observation.screen;
    if(!observation.available){ready=false;error='Keep Milan open and the authorised USB connection attached to read the saved roster.';return result();}
    if(!pending&&(!lastRead||now()-lastRead>=5000))pending=(async()=>{
      lastRead=now();
      try{
        const save=await readSource();const key=JSON.stringify([save.slot,save.campaignId,save.scenarioId,[...save.characterIds].sort()]);
        if(!state||state.saveKey!==key){
          clearPlaced();
          let loadStartedAt=new Date(now()).toISOString(),confirmed=null;
          try{const setup=JSON.parse(readFileSync(new URL('last-setup-sync.json',root)));loadStartedAt=setup.capturedAt;}catch{}
          try{confirmed=JSON.parse(readFileSync(new URL('last-confirmed-board-move.json',root)));}catch{}
          state={schemaVersion:1,saveKey:key,save,loadStartedAt,statuses:{},lastScene:null};
          if(confirmed?.saveKey===key&&confirmed.source==='android'&&confirmed.before?.screen==='setup-placement'&&Date.parse(confirmed.confirmedAt)>Date.parse(loadStartedAt)&&save.characterIds.includes(confirmed.action.componentId))state.statuses[confirmed.action.componentId]={stage:'registered',zoneId:confirmed.action.zoneId,at:confirmed.confirmedAt};
          persist();
        }
        ready=true;error=null;
      }catch(e){ready=false;error='Saved roster unavailable: '+e.message;}
    })().finally(()=>pending=null);
    if(pending)await pending;
    if(state){
      if(['components-setup','hardware-setup'].includes(observation.screen)&&state.lastScene!==observation.screen){
        clearPlaced();
        state.statuses={};state.loadStartedAt=new Date(now()).toISOString();persist();
      }
      if(!['error','unavailable','other'].includes(observation.screen)&&state.lastScene!==observation.screen){state.lastScene=observation.screen;persist();}
      if(observation.stable&&['setup-placement','setup-placement-reading'].includes(observation.screen))mark(observation.componentId,'scanned',observation.zoneId);
    }
    return result();
  }
  function assertCanScan(componentId){
    if(!definitionMapping.some(m=>m.componentId===componentId))throw Error('Unknown playable miniature.');
  }
  function resetRegistrations(reason='manual-recovery'){
    clearPlaced();
    lastInputScene=null;
    if(state){state.statuses={};state.lastScene=null;state.loadStartedAt=new Date(now()).toISOString();state.resetReason=reason;persist();}
    lastRead=0;
  }
  return {refresh,result,assertCanScan,resetRegistrations,contextKey:()=>state?.saveKey||null,markSent:id=>mark(id,'sent'),markUnconfirmed:id=>mark(id,'unconfirmed'),markRegistered:(id,zone)=>{assertCanScan(id);if(!placedIds.includes(id)){placedIds.push(id);savePlaced();}mark(id,'registered',zone);}};
}
