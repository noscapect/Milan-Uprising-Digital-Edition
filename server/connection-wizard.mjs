import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
export function parseAdbDevices(text){
 return text.split(/\r?\n/).flatMap(line=>{const match=line.trim().match(/^(\S+)\s+(device|unauthorized|offline)(?:\s|$)/);return match?[{serial:match[1],state:match[2]}]:[];});
}
export async function inspectTablet({adb,execute=run}={}){
 if(!adb)return {ready:false,stage:'helpers',message:'Prepare the app helpers first.'};
 try{
  const {stdout}=await execute(adb,['devices'],{windowsHide:true,timeout:10000,maxBuffer:100000});const devices=parseAdbDevices(stdout);
  if(!devices.length)return {ready:false,stage:'usb',message:'Connect your tablet with a data-capable USB cable and enable USB debugging.'};
  if(devices.length!==1)return {ready:false,stage:'usb',message:'Connect exactly one Android device, then check again.'};
  const device=devices[0];
  if(device.state==='unauthorized')return {ready:false,stage:'permission',message:'Unlock your tablet and allow USB debugging for this computer.'};
  if(device.state!=='device')return {ready:false,stage:'usb',message:'The tablet is offline. Reconnect its USB cable and check again.'};
  const options={windowsHide:true,timeout:10000,maxBuffer:2*1024*1024};
  const {stdout:window}=await execute(adb,['-s',device.serial,'shell','dumpsys','window'],options);
  if(!window.split(/\r?\n/).some(line=>line.includes('mCurrentFocus=')&&/\bcom\.xplored\.teburu\.vtm\//.test(line)))return {ready:false,stage:'milan',message:'Open Milan on the tablet and keep it in the foreground.'};
  const {stdout:size}=await execute(adb,['-s',device.serial,'shell','wm','size'],options);
  const dimensions=[...size.matchAll(/(\d+)x(\d+)/g)].at(-1);
  if(!dimensions||![[2560,1600],[1600,2560]].some(([w,h])=>Number(dimensions[1])===w&&Number(dimensions[2])===h))return {ready:false,stage:'display',message:'Automatic board reading currently supports a 2560 × 1600 tablet only. This display size has not been validated.'};
  return {ready:true,stage:'connect',message:'Tablet authorized and Milan open. Use landscape orientation and English in Milan, then start Core and connect inside Milan.',languageVerified:false,orientationVerified:false};
 }catch{return {ready:false,stage:'usb',message:'The tablet could not be read. Check its cable, USB permission and the app-helper installation.'};}
}

export function createPreparationJob({prepare,initialJob=null,save=()=>{}}){
 let job=initialJob?{...initialJob,...(initialJob.phase==='running'?{phase:'interrupted',message:'Preparation was interrupted. Check and retry when ready.'}:{})}:null;
 function start({confirm,acceptAndroidTerms}={}){
  if(confirm!==true||acceptAndroidTerms!==true)throw Error('Review and accept the Android tools terms and Linux package preparation first.');
  if(job?.phase==='running')throw Error('App preparation is already running.');
  job={phase:'running',message:'Preparing app helpers…'};save({...job});
  void (async()=>{
   try{await prepare({onProgress:message=>{job={...job,message};save({...job});}});job={phase:'completed',message:'Helpers ready. Check your tablet connection.'};}
   catch(error){job={phase:'failed',message:error.message};}
   save({...job});
  })();return structuredClone(job);
 }
 return {start,status:()=>structuredClone(job)};
}
