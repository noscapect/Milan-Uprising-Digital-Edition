import{visionPython,visionArguments}from'./machine-config.mjs';
import{execFile}from'node:child_process';import{promisify}from'node:util';import{copyFileSync,unlinkSync}from'node:fs';import{fileURLToPath}from'node:url';import{randomUUID}from'node:crypto';
import{createPositiveObservations}from'../../src/adapters/positive-observations.js';
const run=promisify(execFile),root=fileURLToPath(new URL('./',import.meta.url));
const linux=path=>'/mnt/'+path[0].toLowerCase()+path.slice(2).replaceAll('\\','/');
const jobs=Object.fromEntries(Object.entries({portraits:5000,investigation:1000,target:250}).map(([kind,interval])=>[kind,{pending:false,lastRead:0,last:null,interval,track:createPositiveObservations({key:item=>typeof item==='string'?item:item.componentId+':'+item.zoneId})}]));
function schedule(kind,path,generation,focus=null){
 const job=jobs[kind];if(job.pending||Date.now()-job.lastRead<job.interval)return;
 job.pending=true;job.lastRead=Date.now();const capturedAt=job.lastRead,copy=root+'map-piece-'+randomUUID()+(path.endsWith('.rgba')?'.rgba':'.png');
 try{copyFileSync(path,copy);}catch{job.pending=false;return;}
 const args=visionArguments('read-map-pieces.py',copy);
 if(kind==='investigation')args.push('--investigation-only');
 if(kind==='target'){args.push('--character-only='+focus.componentId);if(focus.overlay)args.push('--movement-overlay');}
 void run(visionPython,args,{windowsHide:true,timeout:15000,maxBuffer:200000}).then(({stdout})=>{
  const value=JSON.parse(stdout);
  if(!value.ready){job.last={...value,generation,receivedAt:Date.now()};job.track.reset();return;}
  const items=kind==='investigation'?[...value.investigationLocations.map(zoneId=>({componentId:'investigation',zoneId})),...(value.removedInvestigationLocations||[]).map(zoneId=>({componentId:'investigation-remove',zoneId}))]:[...value.characterMoves,...(value.companionMoves||[])];
  const confirmed=job.track.observe(items,generation,capturedAt);
  job.last={...value,generation,stable:confirmed.length>0,confirmedCharacterMoves:confirmed.filter(m=>m.componentId.startsWith('character-')),confirmedCompanionMoves:confirmed.filter(m=>!m.componentId.startsWith('character-')&&!m.componentId.startsWith('investigation')),confirmedRemovedInvestigationLocations:confirmed.filter(m=>m.componentId==='investigation-remove').map(m=>m.zoneId),confirmedInvestigationLocations:confirmed.filter(m=>m.componentId==='investigation').map(m=>m.zoneId),stableSince:confirmed.length?Math.min(...confirmed.map(m=>m.pairSince)):capturedAt,capturedAt,receivedAt:Date.now(),durationMs:Date.now()-capturedAt,focusComponentId:focus?.componentId};
 }).catch(()=>{job.last={ready:false,reason:'Visual piece recovery unavailable',generation,receivedAt:Date.now()};job.track.reset();}).finally(()=>{job.pending=false;try{unlinkSync(copy);}catch{}});
}
export function scheduleMapPieces(path,generation){schedule('investigation',path,generation);schedule('portraits',path,generation);}
export function scheduleTargetCharacter(path,generation,focus){schedule('target',path,generation,focus);}
export function mapPieces(generation){
 const fresh=kind=>{const value=jobs[kind].last;return value?.ready&&value.generation===generation&&Date.now()-value.receivedAt<20000?value:null;};
 const portraits=fresh('portraits'),investigation=fresh('investigation'),target=fresh('target');if(!portraits&&!investigation&&!target)return null;
 const general=portraits?.confirmedCharacterMoves||[],focused=target?.confirmedCharacterMoves||[];
 const newest=new Map();for(const move of [...general,...focused])if(!newest.has(move.componentId)||move.pairSince>newest.get(move.componentId).pairSince)newest.set(move.componentId,move);
 const confirmedCharacterMoves=[...newest.values()];
 return {...(portraits||{}),ready:true,generation,characterMoves:confirmedCharacterMoves.length?confirmedCharacterMoves:portraits?.characterMoves||[],confirmedCharacterMoves,companionMoves:portraits?.confirmedCompanionMoves||[],stable:confirmedCharacterMoves.length>0||!!portraits?.confirmedCompanionMoves?.length,stableSince:confirmedCharacterMoves.length?Math.min(...confirmedCharacterMoves.map(m=>m.pairSince)):portraits?.stableSince,investigationLocations:investigation?.confirmedInvestigationLocations||[],investigationStable:!!investigation?.confirmedInvestigationLocations?.length,removedInvestigationLocations:investigation?.confirmedRemovedInvestigationLocations||[],investigationRemovalStable:!!investigation?.confirmedRemovedInvestigationLocations?.length,investigationCapturedAt:investigation?.capturedAt,investigationReceivedAt:investigation?.receivedAt,focused:target?{componentId:target.focusComponentId,durationMs:target.durationMs,confirmed:focused.length>0}:null,receivedAt:Math.max(portraits?.receivedAt||0,investigation?.receivedAt||0,target?.receivedAt||0)};
}
