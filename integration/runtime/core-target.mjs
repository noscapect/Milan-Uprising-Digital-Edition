import {readFileSync,writeFileSync} from 'node:fs';
const config=new URL('./core-target.json',import.meta.url);
let target='windows';
try{const saved=JSON.parse(readFileSync(config));if(saved.target==='windows')target='windows';}catch{}
export const coreTarget=()=>target;
export function selectCoreTarget(value){if(!['android','windows'].includes(value))throw Error('Onbekende Core-route.');target=value;writeFileSync(config,JSON.stringify({target},null,2));}
export async function windowsCore(path,body){
  const control=JSON.parse(readFileSync(new URL('./windows-core/state/control.json',import.meta.url)));
  const response=await fetch('http://127.0.0.1:5181'+path,{method:body?'POST':'GET',headers:{'X-Core-Token':control.token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(path==='/firmware/simulate-update'?30000:5000)});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Windows Core: '+response.status);return result;
}
