const $=id=>document.getElementById(id);
let busy=false,disposed=false,reading=false,latest=null;
let helpersReady=null,helpersPreparing=false,tabletReady=false;
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
    $('start-core').disabled=busy||latest.starting||core.running||helpersReady===false||helpersPreparing||!tabletReady;
    $('stop-core').disabled=busy||latest.starting||!core.running;
    const firmware=core.firmware;
    $('firmware-status').textContent=!firmware?'Start the updated PC Core service to read its simulated versions.':`Core ${firmware.core.reportedVersion} → ${firmware.core.targetVersion} · Dice ${firmware.dice.map(d=>d.reportedVersion).join(', ')} → ${firmware.dice[0]?.targetVersion} · LED ring ${firmware.ring?.reportedVersion||'unavailable'} → ${firmware.ring?.targetVersion||'unavailable'} · ${firmware.phase==='completed'?(firmware.updateRequired?'New simulation available':'Simulation completed'):firmware.phase==='interrupted'?'Previous simulation interrupted; retry available':firmware.phase==='updating'?'Updating simulation…':'Not updated'}`;
    $('simulate-firmware').disabled=busy||!firmware||firmware.phase==='updating'||!firmware.updateRequired;
    const share=latest.share;
    $('remote-details').hidden=!share?.available;$('remote-unavailable').hidden=!!share?.available;
    if(share?.available){$('remote-address').textContent=share.url;$('remote-address').href=share.url;$('remote-code').textContent=share.pin;}
    else $('remote-unavailable').textContent='Remote tabletop is not running. Start it with node tools/share-board.mjs followed by this PC’s LAN IP address.';
  }catch(error){$('core-status').textContent='Control service unavailable';$('message').textContent=error.message;$('start-core').disabled=$('stop-core').disabled=true;}
  finally{reading=false;}
}
async function act(path,label){
  if(busy)return;busy=true;$('start-core').disabled=$('stop-core').disabled=true;$('message').textContent=label;
  try{await api(path,path.endsWith('/start')?{displayConfirmed:document.getElementById('confirm-display')?.checked===true}:{});$('message').textContent=path.endsWith('/start')?'Core started. Connect Milan on the tablet.':'Core stopped and its Bluetooth adapter returned to Windows.';}
  catch(error){$('message').textContent=error.message;}
  finally{busy=false;await refresh();}
}
$('start-core').onclick=()=>act('/api/windows-core/start','Preparing Bluetooth and starting Core…');
$('stop-core').onclick=()=>act('/api/windows-core/stop','Stopping Core…');
$('simulate-firmware').onclick=async()=>{
  if(busy)return;busy=true;$('simulate-firmware').disabled=true;$('message').textContent='Simulating the Core, five dice and LED ring update…';
  try{await api('/api/windows-core/firmware-simulate',{confirmSimulation:true});$('message').textContent='Simulated update saved. Reconnect Milan to read the new Core, dice and LED ring versions. No official firmware was installed.';}
  catch(error){$('message').textContent=error.message;}
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
