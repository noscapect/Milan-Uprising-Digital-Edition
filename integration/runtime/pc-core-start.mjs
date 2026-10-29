import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {windowsCore} from './core-target.mjs';
const run=promisify(execFile);
export function createCoreStarter({core=windowsCore,prepare=()=>run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./Start-PC-Core.ps1',import.meta.url))],{windowsHide:true,timeout:120000,maxBuffer:100000})}={}){
let pending=null;
function start(){
  if(pending)return pending;
  pending=(async()=>{
    let status=null;
    try{status=await core('/status');}catch{}
    if(!status?.running)await prepare();
    return core('/start',{});
  })().finally(()=>pending=null);
  return pending;
}
return {start,starting:()=>!!pending};
}
const starter=createCoreStarter();
export const startPcCore=()=>starter.start();
export const coreStarting=()=>starter.starting();
