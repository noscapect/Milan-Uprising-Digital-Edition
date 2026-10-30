const $=id=>document.getElementById(id),failed=new Set();let busy=false,reading=false;
async function request(body){const response=await fetch('/api/game-addons',{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const result=await response.json();if(!response.ok)throw Error(result.error||'Game check failed.');return result;}
function render(result){
 const directory=$('resource-directory');if(directory)directory.textContent=`Resource folder: ${result.resourceDirectory}`;
 $('game-addons').replaceChildren();
 for(const game of result.games){
  const section=document.createElement('section'),title=document.createElement('h2'),status=document.createElement('p'),path=document.createElement('code'),actions=document.createElement('div');actions.className='actions';title.textContent=game.title;path.textContent=game.archive;
  const running=game.job?.phase==='running';status.textContent=running?game.job.message:game.job?.phase==='failed'?game.job.message:game.active?'Enabled':game.reason||'Ready to add.';
  section.append(title,status,path);if(game.downloadBytes&&!game.archivePresent){const hint=document.createElement('p');hint.textContent=`Add game downloads approximately ${(game.downloadBytes/1e9).toFixed(2)} GB from the publisher and extracts the artwork. The Windows game is not installed or started.`;section.append(hint);}
  if(running&&game.job.totalBytes){const progress=document.createElement('progress');progress.max=game.job.totalBytes;progress.value=game.job.receivedBytes||0;progress.setAttribute('aria-label','Game artwork download');section.append(progress);}
  function button(label,operation,enabled=true){const element=document.createElement('button');element.textContent=label;element.disabled=busy||running||!enabled;element.onclick=()=>act({operation,id:game.id});actions.append(element);}
  if(game.active){const link=document.createElement('a');link.className='button';link.textContent='Open tabletop';link.href=(result.applicationOrigin||location.origin)+game.tableUrl;actions.append(link);if(game.linked&&result.linkedAvailable)button('Connect Android','open-linked');button('Disable game','disable');}
  else button(game.job?.phase==='failed'?'Retry adding game':'Add game','add',game.canInstall||game.canAcquire);
  if(game.canAcquire&&!game.active&&(failed.has(game.id)||game.job?.phase==='failed'))button('Download artwork again','acquire');
  section.append(actions);$('game-addons').append(section);
 }
 if($('open-game'))$('open-game').hidden=true;$('refresh-addons').disabled=busy;
 document.dispatchEvent(new CustomEvent('tce:game-active',{detail:{id:result.selected,enabled:result.enabled}}));
}
async function refresh(){if(busy||reading)return;reading=true;try{render(await request());}catch(error){$('addon-message').textContent=error.message;document.querySelectorAll('#game-addons button').forEach(button=>button.disabled=true);document.dispatchEvent(new CustomEvent('tce:game-active',{detail:{id:null,enabled:[]}}));}finally{reading=false;}}
async function act(body){if(busy)return;busy=true;document.querySelectorAll('#game-addons button').forEach(button=>button.disabled=true);$('addon-message').textContent=body.operation==='open-linked'?'Opening the Android connection controls…':'Updating game…';try{const result=await request(body);failed.delete(body.id);if(result.url){window.location.assign(result.url);return;}render(result);$('addon-message').textContent=result.games.find(game=>game.id===body.id)?.job?.phase==='running'?'Downloading and preparing artwork in the background. You can manage other games.':body.operation==='disable'?'Game disabled. Its files and saved sessions are kept.':'Game ready.';}catch(error){failed.add(body.id);$('addon-message').textContent=error.message;}finally{busy=false;await refresh();}}
function check(){ $('addon-message').textContent='';void refresh(); }
$('refresh-addons').onclick=check;await refresh();const watcher=setInterval(refresh,2000);window.addEventListener('pagehide',()=>clearInterval(watcher),{once:true});
