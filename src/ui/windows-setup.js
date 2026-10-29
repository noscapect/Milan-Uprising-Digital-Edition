const $=id=>document.getElementById(id);
let state=null,reading=false,disposed=false,pendingAction=null,loadError=null;
const descriptions={
  'install-wsl':'Install Windows Subsystem for Linux using Microsoft’s installer. Windows will ask for administrator permission and may require a restart. The installer opens in a separate window. No existing Linux distribution will be removed.',
  'install-usbipd':'Install usbipd-win using Windows Package Manager. Windows will ask for administrator permission. Review the installer and any agreements in its window. usbipd installs a service and its standard local-network firewall rule.',
  'install-linux':'Download and install Debian for your Windows account. Existing Linux distributions are kept. This does not start Bluetooth.',
  'open-linux':'Open Debian so you can complete any Linux username and password prompts. Close the Linux window when finished and choose Check again.',
  'prepare-adapter':'Allow the selected Bluetooth adapter to be shared with WSL and save the selection for this PC. Windows will ask for administrator permission. Only this adapter is prepared. Sharing persists after restart; the adapter is not attached to WSL until you choose Start Core.',
  'select-adapter':'Save this already shared Bluetooth adapter for Milan on this PC. This does not start Core, attach the radio, or change its current connection.'
};
async function api(path,body){
 const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 if(!response.ok){let value;try{value=await response.json();}catch{}throw Error(value?.error||'Could not check Windows setup. Restart the current app and try again.');}
 return response.json();
}
function render(){
 const report=state.report||{},running=state.job?.phase==='running';
 $('setup-steps').replaceChildren();
 const ready=!!(state.supported&&report.wslReady&&report.debianVersion===2&&report.usbipdInstalled);
 $('setup-status').textContent=loadError||(!state.supported?'The guided setup is available on Windows.':report.error||(!state.report?'Checking Windows components…':ready?'Windows components are installed. Prepare a Bluetooth adapter below, then continue with app setup.':'Complete the steps below. Already installed components will be kept.'));
 const steps=[
  {label:'Windows Subsystem for Linux',ok:report.wslReady,action:'install-wsl',button:'Install WSL'},
  {label:report.debianVersion===1?'Debian is using WSL1. Back up your Linux data and follow the installation guide to convert it to WSL2.':'Debian on WSL2',ok:report.debianVersion===2,action:report.debianVersion?'':'install-linux',button:'Install Debian',disabled:!report.wslReady},
  {label:'USB sharing support (usbipd)',ok:report.usbipdInstalled,action:'install-usbipd',button:'Install usbipd',disabled:!report.wingetAvailable}
 ];
 for(const step of steps){
  const li=document.createElement('li'),label=document.createElement('span');label.textContent=`${step.ok?'Ready: ':'Required: '}${step.label} `;li.append(label);
  if(!step.ok&&step.action){const button=document.createElement('button');button.className='secondary';button.textContent=step.button;button.disabled=running||!state.supported||!state.report||!!report.error||!!step.disabled;button.onclick=()=>confirm(step.action);li.append(button);}
  if(step.action==='install-usbipd'&&!report.wingetAvailable&&!step.ok){const link=document.createElement('a');link.href='https://apps.microsoft.com/detail/9nblggh4nns1';link.target='_blank';link.rel='noopener';link.textContent='Install Microsoft App Installer first';li.append(link);}
  if(report.debianVersion===1&&step===steps[1]){const link=document.createElement('a');link.href='https://learn.microsoft.com/en-us/windows/wsl/basic-commands#set-wsl-version-to-1-or-2';link.target='_blank';link.rel='noopener';link.textContent='WSL2 conversion instructions';li.append(link);}
  $('setup-steps').append(li);
 }
 const selected=$('setup-adapter').value||state.selectedBusId;
 $('setup-adapter').replaceChildren();
 const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose a Bluetooth adapter…';$('setup-adapter').append(placeholder);
 for(const adapter of report.adapters||[]){const option=document.createElement('option');option.value=adapter.busId;option.textContent=`${adapter.label} · ${adapter.state}`;$('setup-adapter').append(option);}
 if((report.adapters||[]).some(a=>a.busId===selected))$('setup-adapter').value=selected;
 $('setup-adapters').hidden=!ready;
 $('setup-adapter').disabled=running;
 const adapter=report.adapters?.find(a=>a.busId===$('setup-adapter').value);
 $('setup-prepare-adapter').disabled=running||!adapter;
 $('setup-prepare-adapter').textContent=adapter?.state==='Not shared'?'Prepare selected adapter':'Use selected adapter';
 if(!loadError&&ready&&!report.adapters?.length){$('setup-status').textContent=report.adapterError||'Windows components are installed. No available USB Bluetooth adapter was identified. Connect your adapter and choose Check again.';}
 $('setup-open-linux').hidden=report.debianVersion!==2;
 $('setup-open-linux').disabled=running;
 $('setup-check').disabled=running||reading;
 $('setup-job').textContent=state.job?`${state.job.phase==='running'?'In progress':state.job.phase==='completed'?'Completed':state.job.phase==='cancelled'?'Cancelled':state.job.phase==='interrupted'?'Interrupted':'Needs attention'}: ${state.job.message}`:'';
 $('setup-restart').hidden=!state.job?.restartRequired;
}
function confirm(action){
 if(state?.job?.phase==='running')return;
 pendingAction={action,confirm:true};
 if(['prepare-adapter','select-adapter'].includes(action))pendingAction.busId=$('setup-adapter').value;
 $('setup-confirm-text').textContent=descriptions[action];$('setup-confirm').showModal();
}
async function refresh(force=false){
 if(disposed||reading)return;reading=true;
 try{state=await api(force?'/api/windows-setup/check':'/api/windows-setup',force?{}:undefined);loadError=null;render();}
 catch(error){loadError=error.message;$('setup-status').textContent=error.message;}
 finally{reading=false;if(state)render();}
}
$('setup-confirm-no').onclick=()=>{pendingAction=null;$('setup-confirm').close();};
$('setup-confirm').addEventListener('cancel',()=>{pendingAction=null;});
$('setup-confirm-yes').onclick=async()=>{
 if(!pendingAction)return;
 const request=pendingAction;pendingAction=null;$('setup-confirm').close();
 try{state=await api('/api/windows-setup/action',request);render();}catch(error){$('setup-job').textContent=error.message;}
};
$('setup-adapter').onchange=()=>render();
$('setup-check').onclick=()=>refresh(true);
$('setup-open-linux').onclick=()=>confirm('open-linux');
 $('setup-prepare-adapter').onclick=()=>confirm(state?.report?.adapters?.find(a=>a.busId===$('setup-adapter').value)?.state==='Not shared'?'prepare-adapter':'select-adapter');
const timer=setInterval(()=>refresh(),3000);
window.addEventListener('pagehide',()=>{disposed=true;clearInterval(timer);},{once:true});
await refresh();
