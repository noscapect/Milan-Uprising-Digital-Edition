import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile} from 'node:fs/promises';
const exec=promisify(execFile);
const script=fileURLToPath(new URL('../tools/windows-prerequisites.ps1',import.meta.url));
const actions=new Map([
  ['install-wsl','InstallWsl'],['install-usbipd','InstallUsbipd'],
  ['install-linux','InstallLinux'],['open-linux','OpenLinux'],['prepare-adapter','BindAdapter'],['select-adapter',null]
]);

export function createWindowsSetup({platform=process.platform,probe,execute,configure=()=>{},save=()=>{},initialJob=null,initialBusId=null,now=Date.now}={}) {
  let report=null,checkedAt=0,checking=null;
  let selectedBusId=typeof initialBusId==='string'&&/^\d+-\d+$/.test(initialBusId)?initialBusId:null;
  let job=initialJob?{...initialJob,...(initialJob.phase==='running'?{phase:'interrupted',message:'Setup was interrupted. Check again before retrying.'}:{})}:null;
  const inspect=probe||(()=>runWindowsSetup('Check'));
  const perform=execute||((action,adapter)=>runWindowsSetup(actions.get(action),adapter));
  function snapshot(){return structuredClone({supported:platform==='win32',report,job,selectedBusId,checking:!!checking});}
  async function check(force=false){
    if(platform!=='win32'){report={error:'Automatic preparation is available on Windows only.'};return snapshot();}
    if(checking)return checking;
    if(!force&&report&&now()-checkedAt<15000)return snapshot();
    checking=(async()=>{
      try{report=await Promise.resolve().then(inspect);checkedAt=now();}
      catch(error){report={error:error.message};checkedAt=now();}
      finally{checking=null;}
      return snapshot();
    })();return checking;
  }
  function start(request){
    if(platform!=='win32')throw Error('Automatic preparation is available on Windows only.');
    if(!request||request.confirm!==true||!actions.has(request.action))throw Error('Choose a listed setup action and confirm it.');
    if(job?.phase==='running')throw Error('A setup step is already running.');
    const action=request.action;
    if(!report||report.error)throw Error('Check this PC before starting setup.');
    if(action==='install-wsl'&&report.wslReady)throw Error('WSL is already installed.');
    if(action==='install-usbipd'&&report.usbipdInstalled)throw Error('usbipd is already installed.');
    if(action==='install-usbipd'&&!report.wingetAvailable)throw Error('Install Microsoft App Installer first, then check again.');
    if(['install-linux','open-linux','prepare-adapter','select-adapter'].includes(action)&&!report.wslReady)throw Error('Install WSL and restart Windows if requested, then check again.');
    if(action==='install-linux'&&report.debianVersion)throw Error('Debian is already installed.');
    if(action==='open-linux'&&report.debianVersion!==2)throw Error('A Debian WSL2 installation is required.');
    let adapter;
    if(['prepare-adapter','select-adapter'].includes(action)){
      if(report.debianVersion!==2||!report.usbipdInstalled)throw Error('Install Debian on WSL2 and usbipd first.');
      if(typeof request.busId!=='string'||!/^\d+-\d+$/.test(request.busId))throw Error('Choose a Bluetooth adapter from the list.');
      adapter=report.adapters?.find(item=>item.busId===request.busId);
      if(!adapter||(action==='prepare-adapter'?adapter.state!=='Not shared':!['Shared','Attached'].includes(adapter.state)))throw Error('Check again and choose an available Bluetooth adapter.');
      adapter=structuredClone(adapter);
    }
    job={id:randomUUID(),action,phase:'running',startedAt:new Date(now()).toISOString(),message:'A Windows setup window may appear. Complete its prompts, then return here.'};save(structuredClone(job));
    void (async()=>{
      try{
        const result=action==='select-adapter'?{ok:true,message:'The selected adapter is saved for this PC. It has not been attached or started.'}:await perform(action,adapter);
        if(result.ok&&adapter){await configure(adapter);selectedBusId=adapter.busId;}
        job={...job,phase:result.cancelled?'cancelled':result.ok?'completed':'failed',message:result.message||'Check again to verify this step.',restartRequired:!!result.restartRequired};
      }catch(error){job={...job,phase:'failed',message:error.message};}
      job.finishedAt=new Date(now()).toISOString();save(structuredClone(job));
      await check(true);
    })();
    return snapshot();
  }
  return {check,start,snapshot};
}

export async function runWindowsSetup(action,adapter){
  if(action==='Check'){
    const {stdout}=await exec('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Action','Check'],{windowsHide:true,timeout:30000,maxBuffer:1024*1024,encoding:'utf8'});
    return JSON.parse(stdout.replace(/^\uFEFF/,'').trim());
  }
  if(![...actions.values()].includes(action))throw Error('Unsupported setup action.');
  const directory=new URL('../private/linked/setup-results/',import.meta.url);await mkdir(directory,{recursive:true});
  const resultFile=new URL(`${randomUUID()}.json`,directory);
  const args=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Action',action,'-ResultPath',fileURLToPath(resultFile)];
  if(adapter)args.push('-BusId',adapter.busId,'-ExpectedVidPid',adapter.vidPid);
  // The helper opens an interactive Windows/UAC window only after a setup button is clicked.
  await exec('powershell.exe',args,{windowsHide:true,timeout:30*60*1000,maxBuffer:1024*1024});
  return JSON.parse(await readFile(resultFile,'utf8'));
}
