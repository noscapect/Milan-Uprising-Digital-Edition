import {renderCoreStartup} from '/src/games/milan-uprising/ui/core-startup.js';
const $=id=>document.getElementById(id);
let busy=false,disposed=false,reading=false,latest=null;
let helpersReady=null,helpersPreparing=false,tabletReady=false;
let gameActive=false;
let setupRunning=false;
document.addEventListener('tce:setup-running',event=>{setupRunning=event.detail.running;if(setupRunning)$('start-core').disabled=true;});
document.addEventListener('tce:game-active',event=>{gameActive=event.detail.enabled.includes('milan-uprising');$('linked-tabletop').hidden=!gameActive;if(!gameActive)$('start-core').disabled=true;});
document.addEventListener('milan:helpers-ready',event=>{helpersReady=event.detail.ready;helpersPreparing=event.detail.preparing;tabletReady=event.detail.tabletReady;if(!helpersReady||helpersPreparing||!tabletReady)$('start-core').disabled=true;});
async function api(path,body){
  const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const value=await response.json();if(!response.ok)throw Error(value.error||'The local control service did not respond.');return value;
}
async function refresh(){
  if(disposed||reading)return;reading=true;
  try{
    latest=await api('/api/control-center');const core=latest.core;
    $('core-status').textContent=busy||latest.starting?'Starting Core…':core.connected?'Connected to Milan':core.running?'Waiting for Milan':core.available?'Core stopped':'Core service stopped';
    $('core-detail').textContent=core.connected?'Milan is connected. You can open the tabletop.':core.running?'Open Milan on the tablet and connect using Single Device.':'Start Core prepares the local service and Bluetooth connection.';
    renderCoreStartup(document,latest);
    if(!core.running&&!latest.starting&&!busy)$('core-detail').textContent=setupRunning?'PC setup is still running.':!gameActive?'Add Milan in the game library first.':helpersPreparing?'Connection tools are being prepared.':helpersReady===false?'Finish PC setup first.':!tabletReady?'Connect your tablet and confirm English and landscape above.':'Ready to start Core.';
    $('start-core').disabled=busy||setupRunning||latest.starting||core.running||helpersReady===false||helpersPreparing||!tabletReady||!gameActive;
    $('stop-core').disabled=busy||latest.starting||!core.running;
    const firmware=core.firmware;
    $('firmware-status').textContent=!firmware?'Start the updated PC Core service to read its simulated versions.':`Core ${firmware.core.reportedVersion} → ${firmware.core.targetVersion} · Dice ${firmware.dice.map(d=>d.reportedVersion).join(', ')} → ${firmware.dice[0]?.targetVersion} · LED ring ${firmware.ring?.reportedVersion||'unavailable'} → ${firmware.ring?.targetVersion||'unavailable'} · ${firmware.phase==='completed'?(firmware.updateRequired?'New simulation available':'Simulation completed'):firmware.phase==='interrupted'?'Previous simulation interrupted; retry available':firmware.phase==='updating'?'Updating simulation…':'Not updated'}`;
    $('simulate-firmware').disabled=busy||!firmware||firmware.phase==='updating'||!firmware.updateRequired;
    const share=latest.share;
    $('remote-details').hidden=!share?.available;$('remote-unavailable').hidden=!!share?.available;
    if(share?.available){$('remote-address').textContent=share.url;$('remote-address').href=share.url;$('remote-code').textContent=share.pin;}
    else $('remote-unavailable').textContent=share?.error||'Remote tabletop is not available. Check that this PC is connected to your local network.';
  }catch(error){$('core-status').textContent='Control service unavailable';$('message').textContent=error.message;$('start-core').disabled=$('stop-core').disabled=true;}
  finally{reading=false;}
}
async function act(path,label){
  if(busy)return;busy=true;$('start-core').disabled=$('stop-core').disabled=true;$('message').textContent=label;if(path.endsWith('/start'))renderCoreStartup(document,{core:{},starting:true,startup:{phase:'running',stage:'checking',startedAt:Date.now(),stageStartedAt:Date.now()}});
  try{await api(path,path.endsWith('/start')?{displayConfirmed:document.getElementById('confirm-display')?.checked===true}:{});$('message').textContent=path.endsWith('/start')?'Core started successfully.':'Core stopped and its Bluetooth adapter returned to Windows.';}
  catch(error){$('message').textContent=error.message;}
  finally{busy=false;await refresh();}
}
$('start-core').onclick=()=>act('/api/windows-core/start','Preparing Bluetooth and starting Core…');
$('stop-core').onclick=()=>act('/api/windows-core/stop','Stopping Core…');
$('simulate-firmware').onclick=async()=>{
  if(busy)return;busy=true;$('simulate-firmware').disabled=true;$('firmware-message').textContent='Updating simulated versions… Keep this window open; this may take a moment.';
  try{await api('/api/windows-core/firmware-simulate',{confirmSimulation:true});$('firmware-message').textContent='Simulated update saved. Disconnect and reconnect Milan to refresh its cached versions. No official firmware was installed.';}
  catch(error){$('firmware-message').textContent='Update could not be confirmed: '+error.message+'. Check the versions above; if updating is still shown, wait for completion.';}
  finally{busy=false;await refresh();}
};
$('recover-board').onclick=async()=>{
  const button=$('recover-board');button.disabled=true;
  try{await api('/api/board-recover',{});$('message').textContent='Temporary input and registrations reset. Follow Milan; confirmed board positions and campaign saves are kept.';}
  catch(error){$('message').textContent=error.message;}
  finally{button.disabled=false;await refresh();}
};
for(const [id,key]of [['copy-address','url'],['copy-code','pin']])$(id).onclick=async()=>{
  try{if(!latest?.share?.available)return;await navigator.clipboard.writeText(latest.share[key]);$('message').textContent=key==='pin'?'Access code copied.':'Tabletop address copied.';}
  catch{$('message').textContent='Select and copy the displayed '+(key==='pin'?'access code.':'address.');}
};
const timer=setInterval(refresh,2000);window.addEventListener('pagehide',()=>{disposed=true;clearInterval(timer);},{once:true});
await refresh();
