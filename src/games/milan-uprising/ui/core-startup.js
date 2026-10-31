const steps=[['checking','Check Core service'],['linux','Start connection environment'],['bluetooth','Prepare Bluetooth connection'],['service','Start Core service'],['activating','Enable Core for Milan']];
export function renderCoreStartup(document,{core,starting,startup}){
 const $=id=>document.getElementById(id);
 const active=starting&&startup?.phase!=='failed';
 const list=$('core-startup-steps'),time=$('core-startup-time');
 list.hidden=!active;time.hidden=!active;
 if(active){
  const index=steps.findIndex(([id])=>id===startup?.stage);
  list.replaceChildren(...steps.map(([id,label],i)=>{
   const item=document.createElement('li');
   item.textContent=(startup?.phase==='recovering'?'':i<index?'✓ ':i===index?'→ ':'')+label;
   if(i===index)item.setAttribute('aria-current','step');
   return item;
  }));
  const elapsed=Math.max(0,Math.floor((Date.now()-(startup?.startedAt??Date.now()))/1000));
  $('core-status').textContent=startup?.phase==='recovering'?'Returning Bluetooth after startup failed…':`Starting Core · step ${Math.max(1,index+1)} of ${steps.length}`;
  $('core-detail').textContent=startup?.phase==='recovering'?'Please wait while Bluetooth is returned to Windows.':`${steps[index]?.[1]??'Checking startup'}…`;
  time.textContent=`Elapsed: ${elapsed}s. Keep this window open.`+(Date.now()-(startup?.stageStartedAt??Date.now())>15000?' This step is taking longer; startup is still in progress.':'');
 }else if(core.connected){
  $('core-status').textContent='Connected to Milan';
  $('core-detail').textContent='Startup complete. Milan is connected; open the tabletop to continue.';
 }else if(core.running){
  $('core-status').textContent='Core ready · waiting for Milan';
  $('core-detail').textContent='PC startup is complete. Open Milan on the tablet and connect using Single Device.';
 }else if(startup?.phase==='failed'){
  $('core-status').textContent='Core startup failed';
  $('core-detail').textContent=startup.error;
 }
}
