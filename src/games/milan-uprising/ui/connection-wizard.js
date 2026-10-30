const $=id=>document.getElementById(id);
let current=null,reading=false,disposed=false,checkingTablet=false,lastTabletCheck=0,automaticRunning=false;
document.addEventListener('tce:setup-running',event=>{automaticRunning=event.detail.running;if(current){if(event.detail.ready)current={...current,helpersReady:true,automatic:{phase:'completed'}};render();}});
async function api(path,body){const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const value=await response.json();if(!response.ok)throw Error(value.error||'Connection check failed.');return value;}
function render(){
 const preparing=automaticRunning||current?.automatic?.phase==='running'||current?.preparation?.phase==='running';
 $('helper-status').textContent=current?.restartRequired?'An earlier helper is still running. Return the previous session’s Bluetooth adapter, quit this app and start it again to finish updating.':preparing?'PC setup is preparing the connection tools…':current?.helpersReady?'Connection tools are ready.':current?.preparation?.message||'Use Set up automatically above to prepare this PC.';
 $('prepare-helpers').disabled=preparing;$('check-tablet').disabled=preparing||!current?.helpersReady;$('quit-app').disabled=preparing;
 $('recover-radio').hidden=!current?.recoveryNeeded;$('recover-radio').disabled=preparing;
 $('tablet-status').textContent=current?.tablet?.ready&&!$('confirm-display').checked?'USB is ready. Confirm that Milan is in English and landscape orientation below.':current?.tablet?.message||'Connect the tablet and choose Check tablet.';
 document.dispatchEvent(new CustomEvent('milan:helpers-ready',{detail:{ready:!!current?.helpersReady,preparing:preparing||current?.recoveryNeeded,tabletReady:!!current?.tablet?.ready&&$('confirm-display').checked}}));
}
async function refresh(){if(reading||disposed)return;reading=true;try{current=await api('/api/connection');render();if(current.helpersReady&&!current.recoveryNeeded&&!automaticRunning&&current.automatic?.phase!=='running'&&current.preparation?.phase!=='running'&&!checkingTablet&&Date.now()-lastTabletCheck>5000){checkingTablet=true;lastTabletCheck=Date.now();try{const result=await api('/api/connection/check',{});current={...current,tablet:result.tablet};render();}finally{checkingTablet=false;}}}catch(error){$('connection-error').textContent=error.message;}finally{reading=false;}}
$('prepare-helpers').onclick=()=>{$('android-terms').checked=false;$('helpers-start').disabled=true;$('helpers-confirm').showModal();};
$('android-terms').onchange=()=>{$('helpers-start').disabled=!$('android-terms').checked;};
$('confirm-display').onchange=()=>render();
$('helpers-cancel').onclick=()=>$('helpers-confirm').close();
$('helpers-start').onclick=async()=>{if(!$('android-terms').checked)return;$('helpers-confirm').close();try{await api('/api/connection/prepare',{confirm:true,acceptAndroidTerms:true});await refresh();}catch(error){$('connection-error').textContent=error.message;}};
$('check-tablet').onclick=async()=>{$('check-tablet').disabled=true;try{const result=await api('/api/connection/check',{});current={...current,tablet:result.tablet};render();}catch(error){$('connection-error').textContent=error.message;}finally{if(current)render();}};
$('quit-app').onclick=async()=>{
 if(!window.confirm('Stop the app and return its Bluetooth adapter to Windows? Your saved tabletop and Milan campaign are kept.'))return;
 $('quit-app').disabled=true;
 try{await api('/api/connection/quit',{confirm:true});disposed=true;clearInterval(timer);$('connection-error').textContent='App stopped. You can close this window.';}
 catch(error){$('connection-error').textContent='Could not return Bluetooth. Keep this app open and retry Stop Core. '+error.message;$('quit-app').disabled=false;}
};
$('recover-radio').onclick=async()=>{if(!window.confirm('Stop the interrupted Milan helper and return its saved Bluetooth adapter to Windows? An interrupted transfer may not have completed. Approve only for the adapter you assigned to Milan.'))return;try{await api('/api/connection/recover',{confirm:true});await refresh();}catch(error){$('connection-error').textContent=error.message;}};
const timer=setInterval(refresh,3000);window.addEventListener('pagehide',()=>{disposed=true;clearInterval(timer);},{once:true});await refresh();
