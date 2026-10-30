// PC preparation orchestration only. Never starts Core or transfers a radio to WSL.
export function createAutomaticSetup({windows,helpersReady,prepareHelpers,ocrReady=async()=>true,assertAvailable=async()=>{},save=()=>{},initialJob=null,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 let job=initialJob?{...initialJob,...(initialJob.phase==='running'?{phase:'interrupted',message:'Setup was interrupted. Choose Continue setup to finish.'}:{})}:null;
 const snapshot=()=>structuredClone({job});
 const update=(phase,message,extra={})=>{job={...job,phase,message,...extra};save(structuredClone(job));};
 async function step(action,message,busId){
  update('running',message);
  windows.start({action,confirm:true,unattended:true,acceptPackageTerms:true,...(busId?{busId}:{})});
  while(windows.snapshot().job?.phase==='running')await wait(200);
  const result=windows.snapshot().job;
  if(result?.phase!=='completed'){update(result?.phase==='cancelled'?'cancelled':'failed',result?.message||'Setup did not complete. Choose Retry setup.');return false;}
  if(result.restartRequired){update('restart','Save your work and restart Windows, then reopen TCE and choose Continue setup.');return false;}
  return true;
 }
 async function run(request){
  try{
   await assertAvailable();
   update('running','Checking what this PC needs…',{adapters:[],step:1});
   let view=await windows.check(true),report=view.report;
   if(!view.supported)throw Error('Automatic PC setup is available on Windows only.');
   if(report?.error)throw Error(report.error);
   if(report.restartRequired){update('restart','Windows has an unfinished update that requires a restart. Save your work, restart Windows, then reopen TCE and choose Continue setup.');return;}
   if(!report.wslReady){if(!await step('install-wsl','Installing Windows Bluetooth support…'))return;report=(await windows.check(true)).report;if(!report.wslReady){update('restart','Restart Windows, then reopen TCE and choose Continue setup.');return;}}
   if(report.debianVersion===1){update('blocked','The existing Debian installation uses WSL1. Back it up and convert it to WSL2 using the Advanced guide; TCE keeps your Linux data.');return;}
   if(!report.debianVersion){if(!await step('install-linux','Installing the Linux environment in the background…'))return;report=(await windows.check(true)).report;if(report.debianVersion!==2)throw Error('Linux could not be verified. Restart Windows and choose Continue setup.');}
   if(!report.usbipdInstalled){if(!report.wingetAvailable){update('blocked','Windows App Installer is missing. Install it using the link below, then choose Continue setup.',{help:'app-installer'});return;}if(!await step('install-usbipd','Installing USB Bluetooth support…'))return;report=(await windows.check(true)).report;if(!report.usbipdInstalled)throw Error('USB support could not be verified. Choose Retry setup.');}
   view=await windows.check(true);report=view.report;if(report?.error)throw Error(report.error);
   const available=(report.adapters||[]).filter(adapter=>['Not shared','Shared'].includes(adapter.state));
   let adapter;
   if(request.busId){adapter=available.find(item=>item.busId===request.busId);if(!adapter)throw Error('The selected Bluetooth adapter is no longer available. Reconnect it and choose Continue setup.');}
   else adapter=view.selectedBusId?available.find(item=>item.busId===view.selectedBusId):(available.length===1?available[0]:null);
   if(!adapter){update('choice',available.length?'Choose which Bluetooth adapter TCE should use, then choose Continue setup.':report.adapters?.some(item=>item.state==='Attached')?'Bluetooth is currently in use. Stop Core before continuing setup.':report.adapterError||'Connect a USB Bluetooth adapter, then choose Continue setup.',{adapters:available,step:3});return;}
   if(view.selectedBusId!==adapter.busId||adapter.state==='Not shared')if(!await step(adapter.state==='Not shared'?'prepare-adapter':'select-adapter','Preparing your Bluetooth adapter…',adapter.busId))return;
   update('running','Preparing the app connection tools…',{step:4,adapters:[]});
   if(!await helpersReady())await prepareHelpers(message=>update('running',message,{step:4}));
   if(!await helpersReady())throw Error('The connection tools could not be verified. Choose Retry setup.');
   const textRecognitionReady=await checkTextReader();
   update('completed',textRecognitionReady?'This PC is ready. Connect your Android tablet by USB and open the game.':'Connection tools are ready. Automatic board synchronization is unavailable: repair the included TCE text reader.',{step:4,adapters:[],textRecognitionReady});
  }catch(error){update('failed',error.message||'Setup failed. Check your connection and choose Retry setup.');}
 }
 function start(request={}){
  if(request.confirm!==true||request.acceptAndroidTerms!==true||request.acceptPackageTerms!==true)throw Error('Accept the setup and Android tools terms to continue.');
  if(request.busId!==undefined&&!/^\d+-\d+$/.test(request.busId))throw Error('Choose a listed Bluetooth adapter.');
  if(job?.phase==='running')return snapshot();
  if(windows.snapshot().job?.phase==='running')throw Error('Another setup operation is running. Wait for it to finish.');
  job={phase:'running',message:'Starting automatic setup…',consentVersion:1,startedAt:new Date().toISOString()};save(structuredClone(job));void run(request);return snapshot();
 }
 async function checkTextReader(){try{return await ocrReady()===true;}catch{return false;}}
 async function status(){const view=await windows.check(),report=view.report||{},configured=(report.adapters||[]).some(adapter=>adapter.busId===view.selectedBusId&&['Shared','Attached'].includes(adapter.state));const ready=!!(view.supported&&!report.error&&report.wslReady&&report.debianVersion===2&&report.usbipdInstalled&&configured&&await helpersReady());return {...snapshot(),ready,textRecognitionReady:ready?await checkTextReader():false,supported:view.supported};}
 return {start,status,snapshot};
}
