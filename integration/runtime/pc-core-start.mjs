import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {windowsCore} from './core-target.mjs';
import {createCoreLifecycle} from '../../server/core-lifecycle.mjs';
const run=promisify(execFile);
async function runPreparation(onProgress){
  const task=run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./Start-PC-Core.ps1',import.meta.url))],{windowsHide:true,timeout:120000,maxBuffer:100000});
  let buffer='';
  task.child.stdout.on('data',chunk=>{
    buffer+=chunk.toString();const lines=buffer.split(/\r?\n/);buffer=lines.pop();
    for(const line of lines)if(line.startsWith('TCE_STAGE:'))onProgress(line.slice(10).trim());
  });
  return task;
}
export function createCoreStarter({core=windowsCore,prepare=runPreparation,rollback=async()=>{}}={}){
let pending=null,progress=null;
const stages=['checking','linux','bluetooth','service','activating'];
function update(stage){if(stages.includes(stage))progress={phase:'running',stage,startedAt:progress?.startedAt??Date.now(),stageStartedAt:Date.now()};}
function start(){
  if(pending)return pending;
  progress=null;update('checking');
  pending=(async()=>{
    let status=null;
    try{status=await core('/status');}catch{}
    try{if(!status?.running)await prepare(update);update('activating');const result=await core('/start',{});progress={...progress,phase:'completed'};return result;}
    catch(error){progress={...progress,phase:'recovering'};try{await rollback();}catch(cleanup){progress={...progress,phase:'failed',error:error.message+' Bluetooth recovery is needed: '+cleanup.message};throw Error(progress.error);}progress={...progress,phase:'failed',error:error.message};throw error;}
  })().finally(()=>pending=null);
  return pending;
}
return {start,starting:()=>!!pending,progress:()=>progress?{...progress}:null};
}
const starter=createCoreStarter({rollback:()=>releasePcCore()});
export const startPcCore=()=>starter.start();
export const coreStarting=()=>starter.starting();
export const coreStartupProgress=()=>starter.progress();
const stopService=async()=>{
  try{await windowsCore('/shutdown',{});}catch(error){if(error.code==='ENOENT'||error.cause?.code==='ECONNREFUSED')return;throw error;}
};
const detach=recover=>run('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./Stop-PC-Core.ps1',import.meta.url)),...(recover?['-Recover']:process.env.MILAN_SESSION_ID?['-SessionId',process.env.MILAN_SESSION_ID]:[])],{windowsHide:true,timeout:30000,maxBuffer:100000});
const lifecycle=createCoreLifecycle({stop:stopService,detach:()=>detach(false)});
const recovery=createCoreLifecycle({stop:stopService,detach:()=>detach(true)});
export const releasePcCore=({recover=false}={})=>(recover?recovery:lifecycle).release();
