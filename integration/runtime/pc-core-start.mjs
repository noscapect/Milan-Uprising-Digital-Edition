import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {windowsCore} from './core-target.mjs';
import {createCoreLifecycle} from '../../server/core-lifecycle.mjs';
const run=promisify(execFile);
export function createCoreStarter({core=windowsCore,prepare=()=>run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./Start-PC-Core.ps1',import.meta.url))],{windowsHide:true,timeout:120000,maxBuffer:100000}),rollback=async()=>{}}={}){
let pending=null;
function start(){
  if(pending)return pending;
  pending=(async()=>{
    let status=null;
    try{status=await core('/status');}catch{}
    try{if(!status?.running)await prepare();return await core('/start',{});}
    catch(error){try{await rollback();}catch(cleanup){throw Error(error.message+' Bluetooth recovery is needed: '+cleanup.message);}throw error;}
  })().finally(()=>pending=null);
  return pending;
}
return {start,starting:()=>!!pending};
}
const starter=createCoreStarter({rollback:()=>releasePcCore()});
export const startPcCore=()=>starter.start();
export const coreStarting=()=>starter.starting();
const stopService=async()=>{
  try{await windowsCore('/shutdown',{});}catch(error){if(error.code==='ENOENT'||error.cause?.code==='ECONNREFUSED')return;throw error;}
};
const detach=recover=>run('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./Stop-PC-Core.ps1',import.meta.url)),...(recover?['-Recover']:process.env.MILAN_SESSION_ID?['-SessionId',process.env.MILAN_SESSION_ID]:[])],{windowsHide:true,timeout:30000,maxBuffer:100000});
const lifecycle=createCoreLifecycle({stop:stopService,detach:()=>detach(false)});
const recovery=createCoreLifecycle({stop:stopService,detach:()=>detach(true)});
export const releasePcCore=({recover=false}={})=>(recover?recovery:lifecycle).release();
