const $=id=>document.getElementById(id);let current=null,reading=false,starting=false,disposed=false,requestError=null;
async function api(path,body){const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const result=await response.json();if(!response.ok)throw Error(result.error||'Setup could not be checked.');return result;}
function render(){
 const job=current?.job,running=starting||job?.phase==='running',ready=current?.ready&&!running,choice=job?.phase==='choice',adapters=job?.adapters||[];
 $('automatic-status').textContent=requestError||(current?.supported===false?'Automatic PC setup is available on Windows only.':ready?(current.textRecognitionReady===false?'Connection tools are ready. Automatic board synchronization is unavailable: repair the included TCE text reader.':'This PC is ready. Connect your tablet below.'):job?.message||'Install and configure the connection tools automatically.');
 $('automatic-start').textContent=running?'Setting up…':ready?'Check setup':job?.phase==='failed'?'Retry setup':job?'Continue setup':'Set up automatically';
 const consent=current?.job?.consentVersion===1||$('automatic-terms').checked;
 $('automatic-consent').hidden=ready||current?.job?.consentVersion===1;
 $('automatic-start').hidden=ready;
 $('automatic-start').disabled=running||current?.supported===false||!consent;
 $('automatic-progress').hidden=!running;$('automatic-progress').removeAttribute('value');
 $('automatic-adapters').hidden=!choice||!adapters.length;
 const select=$('automatic-adapter'),choices=JSON.stringify(adapters.map(adapter=>[adapter.busId,adapter.label]));
 if(select.dataset.choices!==choices){const selected=select.value;select.replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Choose your Bluetooth adapter';select.append(empty);
  for(const adapter of adapters){const option=document.createElement('option');option.value=adapter.busId;option.textContent=adapter.label+(adapters.filter(item=>item.label===adapter.label).length>1?` (USB ${adapter.busId})`:'');select.append(option);}if(adapters.some(adapter=>adapter.busId===selected))select.value=selected;select.dataset.choices=choices;
 }
 if(choice&&adapters.length&&!$('automatic-adapter').value)$('automatic-start').disabled=true;
 $('automatic-restart').hidden=job?.phase!=='restart';$('automatic-app-installer').hidden=job?.help!=='app-installer';
 document.dispatchEvent(new CustomEvent('tce:setup-running',{detail:{running,ready:!!ready}}));
}
async function refresh(){if(reading||disposed||starting)return;reading=true;try{current=await api('/api/automatic-setup');render();}catch(error){$('automatic-status').textContent=error.message;}finally{reading=false;}}
$('automatic-start').onclick=async()=>{const accepted=current?.job?.consentVersion===1||$('automatic-terms').checked;if(!accepted||starting||current?.job?.phase==='running')return;starting=true;requestError=null;render();try{const busId=$('automatic-adapter').value;const request={confirm:true,acceptAndroidTerms:accepted,acceptPackageTerms:accepted,...(busId?{busId}:{})};current={...current,...await api('/api/automatic-setup/start',request),ready:false};}catch(error){requestError=error.message;}finally{starting=false;render();await refresh();}};
$('automatic-terms').onchange=render;
$('automatic-adapter').onchange=render;
const timer=setInterval(refresh,2000);window.addEventListener('pagehide',()=>{disposed=true;clearInterval(timer);},{once:true});await refresh();
