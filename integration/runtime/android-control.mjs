import http from 'node:http';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {recordComponentInstructions,boardStatus,moveFromBoard,resolveCompanionPlacement,removeConfirmedCompanion,noteCharacterScan,prepareReaderInput,recoverBoard,clearBoard,setFeedbackSource,tableSession,applyConfirmedAppMarkers,applyConfirmedAppSetup,editExpansionPiece} from './app-feedback.mjs';
import {coreTarget,selectCoreTarget,windowsCore} from './core-target.mjs';
import {createPollingWorker} from '../../src/adapters/polling-worker.js';
import {boardTiles,updateBoardTile} from './location-tiles-store.mjs';
import {startPcCore,coreStarting} from './pc-core-start.mjs';
import {createWindowsSetup} from '../../server/windows-setup.mjs';
let previousSetupJob=null;
try{previousSetupJob=JSON.parse(readFileSync(new URL('./prerequisites-job.json',import.meta.url),'utf8'));}catch(error){if(error.code!=='ENOENT')previousSetupJob={phase:'interrupted',message:'Previous setup progress could not be read. Check this PC again before retrying.'};}
let selectedSetupBus=null;
try{selectedSetupBus=JSON.parse(readFileSync(new URL('./machine.json',import.meta.url),'utf8')).usbBusId;}catch(error){if(error.code!=='ENOENT')throw error;}
const windowsSetup=createWindowsSetup({initialJob:previousSetupJob,initialBusId:selectedSetupBus,save:job=>writeFileSync(new URL('./prerequisites-job.json',import.meta.url),JSON.stringify(job)),configure:adapter=>{
  const path=new URL('./machine.json',import.meta.url);let settings={};
  try{settings=JSON.parse(readFileSync(path,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  writeFileSync(path,JSON.stringify({...settings,usbAdapter:adapter.vidPid,usbBusId:adapter.busId,wslDistribution:settings.wslDistribution||'Debian'},null,2));
}});
setFeedbackSource(coreTarget()==='windows'?'android':'windows');
const scanMiniatures=JSON.parse(readFileSync(new URL('./miniature-scan-mapping.json',import.meta.url),'utf8'));
const configPath=new URL('./phone-config.json',import.meta.url);
let connection=null;
let pendingPair=null;
function validate(value){
  const address=new URL(value.address.startsWith('http://')?value.address:'http://'+value.address);
  if(address.protocol!=='http:'||address.username||address.password||address.pathname!=='/'||address.search||address.hash)throw Error('Vul alleen het getoonde IP-adres en poort in.');
  if(!/^(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/.test(address.hostname))throw Error('Een lokaal wifi-adres is vereist.');
  if(!/^[a-f0-9]{32}$/.test(value.code))throw Error('De koppelcode heeft 32 tekens.');
  if(!address.port)throw Error('De getoonde poort ontbreekt.');
  return {address:address.origin,code:value.code};
}
try{connection=validate(JSON.parse(readFileSync(configPath,'utf8')));}catch{}
async function phone(path,body){return coreTarget()==='windows'?windowsCore(path,body):androidPhone(path,body);}
async function androidPhone(path,body){
  if(!connection)throw Error('Vul eerst de koppelgegevens uit de Android-helper in.');
  const url=new URL(path,connection.address);url.searchParams.set('token',connection.code);
  const result=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(3000)});
  if(!result.ok)throw Error(result.status===403?'De pc-koppeling is verlopen. Klik op Koppelen en bevestig op de tablet.':result.status===409?'De officiële app vraagt nu niet om een scan.':'De Android-helper antwoordt met '+result.status+'.');
  const data=await result.json();return data;
}
async function startPair(address){
  const target=validate({address,code:'0'.repeat(32)}).address;
  const requestId=randomBytes(16).toString('hex');
  const response=await fetch(target+'/pair/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId}),redirect:'error',signal:AbortSignal.timeout(3000)});
  if(!response.ok)throw Error('Deze helper ondersteunt bevestigen op de tablet nog niet. Installeer versie 0.3.');
  const result=await response.json();if(result.state!=='pending')throw Error('Er staat al een koppelverzoek open. Bevestig of weiger dat eerst op de tablet.');
  pendingPair={address:target,requestId,expires:Date.now()+120000};return {pairingPending:true};
}
async function completePair(){
  if(!pendingPair)return null;
  if(Date.now()>pendingPair.expires){pendingPair=null;throw Error('Het koppelverzoek is verlopen. Klik opnieuw op Koppelen.');}
  const result=await fetch(pendingPair.address+'/pair/status?id='+pendingPair.requestId,{redirect:'error',signal:AbortSignal.timeout(3000)}).then(r=>r.json());
  if(result.state==='pending')return {pairingPending:true};
  if(result.state!=='approved'){pendingPair=null;throw Error('Het koppelverzoek is geweigerd of verlopen.');}
  connection=validate({address:pendingPair.address,code:result.token});pendingPair=null;
  writeFileSync(configPath,JSON.stringify(connection,null,2));return null;
}
const page=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Core-proef bedienen</title>
<style>body{font:16px system-ui;background:#171b24;color:#eee;max-width:1100px;margin:32px auto;padding:16px}h1{font-size:24px}input,button{font:inherit;padding:10px;margin:4px;border-radius:6px;border:1px solid #777}label{display:inline-grid;gap:4px}input{background:#fff;color:#111}#sensors{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin:20px 0}#sensors button{margin:0;background:#303b4e;color:white;min-height:56px}#sensors button.on{background:#c84d0c}#status{padding:14px;background:#283143;white-space:pre-line}pre{max-height:300px;overflow:auto;background:#10141b;padding:16px;font-size:12px;white-space:pre-wrap}</style>
<h1>Virtuele Core — verbindingstest</h1><p><a href="/board" style="color:#ffd48a">Open je virtuele speelbord met de overgenomen speelstand</a></p><p>Deze bediening stuurt de aparte Android-helper aan. De sensorlabels zijn nog geen Milan-locatiemapping.</p>
<label>Officiële Milan-app draait op<select id="core-target"><option value="android">Pc · Core-helper op tablet</option><option value="windows">Tablet · Core-helper op pc</option></select></label><button id="pc-start">Start Core op pc</button><button id="pc-stop">Stop Core op pc</button><p id="route-status"></p>
<form id="pair"><label>Adres van de tablet<input name="address" placeholder="192.168.x.x:poort" required></label><button>Koppelen — bevestig op tablet</button></form>
<details><summary>Handmatig koppelen met eerdere helperversie</summary><form id="connect"><label>Adres uit de helper<input name="address" placeholder="192.168.x.x:poort" required></label><label>Koppelcode<input name="code" type="password" autocomplete="off" required></label><button>Koppelen</button></form></details>
<div id="status" role="status">Nog niet gekoppeld.</div><h2>Personage scannen</h2><p>Beschikbaar wanneer de officiële app om een scan vraagt. Iedere pion krijgt een eigen willekeurige testidentiteit.</p><div id="characters"></div><fieldset id="dice-panel" hidden><legend>Vijf virtuele d10’s</legend><p>Selecteer de dobbelstenen die je wilt gooien. Milan bepaalt het spelresultaat.</p><div id="dice"></div><button id="roll-dice" type="button" disabled>Gooi geselecteerde dice</button><p id="dice-result" role="status"></p></fieldset><div id="sensors"></div><button id="clear">Alle contacten vrijgeven</button><pre id="log"></pre>
<script>
const statusEl=document.querySelector('#status'),logEl=document.querySelector('#log'),grid=document.querySelector('#sensors');
let latest=null,updating=false,diceBusy=false;
const characterGrid=document.querySelector('#characters');
const dicePanel=document.querySelector('#dice-panel'),diceGrid=document.querySelector('#dice'),rollButton=document.querySelector('#roll-dice');
for(let i=1;i<=5;i++){const label=document.createElement('label'),check=document.createElement('input'),value=document.createElement('span');check.type='checkbox';check.value=i;check.checked=true;check.onchange=renderDice;value.dataset.die=i;value.textContent='D10 '+i+': —';label.append(check,value);diceGrid.append(label)}
function renderDice(){const available=latest?.capabilities?.diceCount===5;dicePanel.hidden=!available;const enabled=available&&latest.running&&latest.connected&&!latest.dieRolling&&!diceBusy;diceGrid.querySelectorAll('input').forEach(c=>c.disabled=!enabled);rollButton.disabled=!enabled||!diceGrid.querySelector('input:checked');for(const d of latest?.dice||[]){const value=diceGrid.querySelector('[data-die="'+d.index+'"]');if(value)value.textContent='D10 '+d.index+': '+(d.rolling?'rolt…':d.face??'—')}}
rollButton.onclick=async()=>{const dice=[...diceGrid.querySelectorAll('input:checked')].map(c=>Number(c.value));diceBusy=true;renderDice();try{latest=await api('/api/dice/roll',{dice});document.querySelector('#dice-result').textContent='Worp verstuurd naar Milan.';renderDice()}catch(e){document.querySelector('#dice-result').textContent=e.message}finally{diceBusy=false;renderDice()}};

for(const [index,name] of ${JSON.stringify(scanMiniatures.map(m=>m.label))}.entries()){const b=document.createElement('button');b.textContent=name;b.dataset.character=index+1;b.disabled=true;b.onclick=async()=>{characterGrid.querySelectorAll('button').forEach(button=>button.disabled=true);try{await api('/api/scan',{character:index+1});await poll()}catch(e){statusEl.textContent=e.message}};characterGrid.append(b)}
for(let y=4;y>=0;y--)for(let x=0;x<8;x++){const index=y*8+x,b=document.createElement('button');b.textContent=index+' ('+x+','+y+')';b.dataset.index=index;b.disabled=true;b.onclick=async()=>{b.disabled=true;try{await api('/api/sensor',{index,active:!latest.sensors[index]});await poll()}catch(e){statusEl.textContent=e.message}finally{b.disabled=false}};grid.append(b)}
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error);return d}
async function poll(){if(updating)return;updating=true;try{latest=await api('/api/status');renderDice();if(latest.pairingPending){statusEl.textContent='Tik op Toestaan in de melding op je tablet.';grid.querySelectorAll('button').forEach(b=>b.disabled=true);characterGrid.querySelectorAll('button').forEach(b=>b.disabled=true);return}statusEl.textContent=(latest.connected?'Bluetooth-client verbonden':'Wacht op Bluetooth-client')+' · helper '+(latest.version||'oudere versie')+' · opdrachten ontvangen: '+latest.commands+' · meldingen verzonden: '+latest.notifications+(latest.readerEnabled?' · app vraagt om scan':'');logEl.textContent=latest.log||'';characterGrid.querySelectorAll('button').forEach(b=>b.disabled=!(['0.5','windows-0.1'].includes(latest.version)&&latest.running&&latest.connected&&latest.readerEnabled));grid.querySelectorAll('button').forEach(b=>{b.disabled=!latest.running;b.classList.toggle('on',!!latest.sensors[+b.dataset.index])})}catch(e){if(latest)latest={...latest,connected:false};renderDice();statusEl.textContent=e.message;grid.querySelectorAll('button').forEach(b=>b.disabled=true);characterGrid.querySelectorAll('button').forEach(b=>b.disabled=true)}finally{updating=false}}
document.querySelector('#pair').onsubmit=async e=>{e.preventDefault();try{await api('/api/pair',{address:new FormData(e.target).get('address').trim()});await poll()}catch(e){statusEl.textContent=e.message}};
document.querySelector('#connect').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('/api/connect',{address:f.get('address').trim(),code:f.get('code').trim()});e.target.code.value='';await poll()}catch(e){statusEl.textContent=e.message}};
document.querySelector('#clear').onclick=async()=>{if(!latest)return;try{for(let index=0;index<40;index++)if(latest.sensors[index])await api('/api/sensor',{index,active:false});await poll()}catch(e){statusEl.textContent=e.message}};
const targetEl=document.querySelector('#core-target'),routeStatus=document.querySelector('#route-status');
api('/api/core-target').then(result=>{targetEl.value=result.target;routeStatus.textContent=result.target==='windows'?'Stop eerst de oude helper op de tablet. De virtuele Core adverteert als Teburu; tabletscherm uitlezen vereist een geautoriseerde USB-verbinding.':'Bestaande Windows-spelproef.';});
targetEl.onchange=async()=>{try{await api('/api/core-target',{target:targetEl.value});routeStatus.textContent='Route gewijzigd. Herlaad het bord om de nieuwe verbinding te gebruiken.';await poll();}catch(e){routeStatus.textContent=e.message;}};
for(const [id,path] of [['pc-start','/api/windows-core/start'],['pc-stop','/api/windows-core/stop']])document.getElementById(id).onclick=async()=>{try{await api(path,{});await poll();}catch(e){routeStatus.textContent=e.message;}};
setInterval(poll,1500);poll();
</script>`;
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>4096)throw Error('Verzoek te groot.')}return JSON.parse(data);}
const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.headers.host!=='127.0.0.1:5180'){res.writeHead(403).end();return;}
  if(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:5180'){res.writeHead(403).end();return;}
  try{
    if(req.url==='/'&&req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync(new URL('../../control-center.html',import.meta.url)));return;}
    if(req.url==='/diagnostics'&&req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page);return;}
    if(req.url==='/control-center.js'&&req.method==='GET'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(readFileSync(new URL('../../src/ui/control-center.js',import.meta.url)));return;}
    if(req.method==='GET'&&req.url==='/board'){
      const upstream=await fetch('http://127.0.0.1:5178/',{signal:AbortSignal.timeout(3000)});
      if(!upstream.ok)throw Error('Bordserver is niet beschikbaar.');
      const html=(await upstream.text()).replace('src="src/app.js"','src="/board-client.mjs"');
      res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;
    }
    if(req.method==='GET'&&req.url==='/board-loader.mjs'){
      res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(readFileSync(new URL('./board-loader.mjs',import.meta.url)));return;
    }
    if(req.method==='GET'&&req.url==='/board-client.mjs'){
      res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(readFileSync(new URL('./board-client.mjs',import.meta.url)));return;
    }
    if(req.method==='GET'&&req.url==='/api/table-session'){
      res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(tableSession()));return;
    }
    if(req.method==='GET'&&/^\/(src\/|data\/games\/|local-artwork\/)/.test(req.url)){
      // Fixed upstream exposes only the public demo's registered assets and local artwork.
      const upstream=await fetch('http://127.0.0.1:5178'+req.url,{signal:AbortSignal.timeout(3000),redirect:'error'});
      res.writeHead(upstream.status,{'Content-Type':upstream.headers.get('content-type')||'application/octet-stream'});
      res.end(Buffer.from(await upstream.arrayBuffer()));return;
    }
    let result;
    if(req.url==='/api/windows-setup'&&req.method==='GET')result=await windowsSetup.check();
    else if(req.url==='/api/windows-setup/check'&&req.method==='POST'){
      if(req.headers.origin!=='http://127.0.0.1:5180'||!req.headers['content-type']?.startsWith('application/json')){res.writeHead(403).end();return;}
      await body(req);result=await windowsSetup.check(true);
    }
    else if(req.url==='/api/windows-setup/action'&&req.method==='POST'){
      if(req.headers.origin!=='http://127.0.0.1:5180'||!req.headers['content-type']?.startsWith('application/json')){res.writeHead(403).end();return;}
      result=windowsSetup.start(await body(req));
    }
    else if(req.url==='/api/control-center'&&req.method==='GET'){
      let core={available:false,running:false,connected:false};
      try{const s=await windowsCore('/status');core={available:true,running:!!s.running,connected:!!s.connected,firmware:s.firmware||null};}catch{}
      let share={available:false};
      try{const s=JSON.parse(readFileSync(new URL('./board-share-state.json',import.meta.url)));const u=new URL(s.url);if(u.protocol==='http:'&&/^\d{6}$/.test(s.pin)){const response=await fetch(u,{redirect:'manual',signal:AbortSignal.timeout(1500)});if(response.ok)share={available:true,url:s.url,pin:s.pin};}}catch{}
      result={core,share,starting:coreStarting()};
    }
    else if(req.url==='/api/windows-core/firmware-simulate'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');
      const action=await body(req);if(action.confirmSimulation!==true)throw Error('Confirm the simulated update.');
      if(coreTarget()!=='windows')throw Error('Select the PC Core first.');
      result=await windowsCore('/firmware/simulate-update',{confirmSimulation:true});
    }
    else if(req.url==='/api/board-tiles'&&req.method==='GET')result={locationTiles:boardTiles()};
    else if(req.url==='/api/board-tiles'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      result=updateBoardTile(await body(req));
    }
    else if(req.url==='/api/core-target'&&req.method==='GET')result={target:coreTarget()};
    else if(req.url==='/api/core-target'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      const value=(await body(req)).target;
      if(value==='android'&&coreTarget()==='windows'){await windowsCore('/stop',{});}
      selectCoreTarget(value);setFeedbackSource(value==='windows'?'android':'windows');result={target:value};
    }else if(req.url==='/api/windows-core/start'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      if(coreTarget()!=='windows')throw Error('Kies eerst Milan op tablet.');
      let old=null;try{old=await androidPhone('/status');}catch{}
      if(old?.running)throw Error('Druk eerst op Stop in de oude Android-helper.');
      result=await startPcCore();
    }else if(req.url==='/api/windows-core/stop'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      result=await windowsCore('/stop',{});
    }else if(req.url==='/api/pair'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      result=await startPair((await body(req)).address);
    }else if(req.url==='/api/connect'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      const old=connection;connection=validate(await body(req));try{await phone('/status');}catch(e){connection=old;throw e;}
      writeFileSync(configPath,JSON.stringify(connection,null,2));result={connected:true};
    }else if(req.url==='/api/status'&&req.method==='GET')result=await completePair()||await phone('/status');
    else if(req.url==='/api/board-status'&&req.method==='GET'){
      result=await boardStatus({refresh:false});
      try{const s=await windowsCore('/status');result.inputHardware={connected:!!(s.running&&s.connected),readerEnabled:!!s.readerEnabled};result.ledRing=s.ledRing||null;result.diceHardware={available:true,connected:s.running&&s.connected,ready:!!s.diceChannelReady,canRoll:s.diceRadioMode===1,rolling:s.dieRolling,dice:s.dice,announced:s.dice?.filter(d=>d.announced).length||0};}
      catch{result.inputHardware={connected:false,readerEnabled:false};result.diceHardware={available:false,connected:false,ready:false,announced:0};}
    }
    else if(req.url==='/api/board-clear'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');
      const action=await body(req);if(action.confirm!==true)throw Error('Confirm clearing the virtual table.');
      result=await clearBoard(phone);
    }
    else if(req.url==='/api/board-recover'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');
      await body(req);result=await recoverBoard(phone);
    }
    else if(req.url==='/api/board-dice-wake'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');
      await body(req);
      if(coreTarget()!=='windows')throw Error('Connect the PC Core first.');
      const s=await windowsCore('/status');
      if(!s.running||!s.connected||!s.diceChannelReady||s.dieRolling)throw Error('Milan has not opened its dice channel. Connect the Core and enable dice in Milan.');
      await windowsCore('/dice/wake',{});result={sent:true,count:5,rollSent:false};
    }
    else if(req.url==='/api/board-dice-roll'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');
      const action=await body(req),dice=action.dice;
      if(!Array.isArray(dice)||dice.length<1||dice.length>5||dice.some(i=>!Number.isInteger(i)||i<1||i>5)||new Set(dice).size!==dice.length)throw Error('Select one to five different dice.');
      if(coreTarget()!=='windows')throw Error('Connect the PC Core first.');
      const before=await windowsCore('/status');if(!before.running||!before.connected||!before.diceChannelReady||before.diceRadioMode!==1||before.dieRolling)throw Error('A connected Core with an idle dice channel is required.');
      await windowsCore('/dice/roll',{dice});const after=await windowsCore('/status');
      result={sent:true,diceHardware:{connected:!!(after.running&&after.connected),ready:!!after.diceChannelReady,canRoll:after.diceRadioMode===1,rolling:!!after.dieRolling,dice:after.dice}};
    }
    else if(req.url==='/api/confirmed-app-markers'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      result=applyConfirmedAppMarkers(await body(req));
    }
    else if(req.url==='/api/confirmed-app-setup'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      result=applyConfirmedAppSetup(await body(req));
    }
    else if(req.url==='/api/board-expansion-piece'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON required.');
      result=editExpansionPiece(await body(req));
    }
    else if(req.url==='/api/board-move'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      const action=await body(req);
      result=action.operation==='component-record'?recordComponentInstructions(action):action.operation==='companion-removal'?removeConfirmedCompanion(action):action.confirmation!==undefined?await resolveCompanionPlacement(action):await moveFromBoard(action,phone);
    }
    else if(req.url==='/api/board-scan'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');
      const action=await body(req);
      const index=scanMiniatures.findIndex(m=>m.componentId===action.componentId);
      if(index<0)throw Error('Choose a character, ally or ghoul miniature.');
      if(index>=11&&coreTarget()!=='windows')throw Error('Expansion scans require the PC Core.');
      const status=await phone('/status');
      if(!status.running||!status.connected||!status.readerEnabled)throw Error('Milan has not enabled its miniature reader.');
      prepareReaderInput();
      await phone('/scan',{character:index+1});
      noteCharacterScan(action.componentId);
      result={sent:true,componentId:action.componentId};
    }
    else if(req.url==='/api/scan'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      const action=await body(req);if(!Number.isInteger(action.character)||action.character<1||action.character>scanMiniatures.length)throw Error('Ongeldig personage.');
      if(action.character>11&&coreTarget()!=='windows')throw Error('Expansion scans require the PC Core.');
      result=await phone('/scan',{character:action.character});
      noteCharacterScan(scanMiniatures[action.character-1].componentId);
    }
    else if(req.url==='/api/dice/roll'&&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      if(coreTarget()!=='windows')throw Error('Virtuele dice vereisen de pc-Core.');
      const {dice}=await body(req);
      if(!Array.isArray(dice)||dice.length<1||dice.length>5||dice.some(i=>!Number.isInteger(i)||i<1||i>5)||new Set(dice).size!==dice.length)throw Error('Selecteer één tot vijf verschillende dobbelstenen.');
      result=await windowsCore('/dice/roll',{dice});
    }
    else if(req.url==='/api/sensor' &&req.method==='POST'){
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON vereist.');
      const action=await body(req);if(!Number.isInteger(action.index)||action.index<0||action.index>=40||typeof action.active!=='boolean')throw Error('Ongeldig sensorcontact.');
      result=await phone('/sensor',action);
    }else{res.writeHead(404).end();return;}
    res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result));
  }catch(e){res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:e.name==='TimeoutError'?'Android-helper niet bereikbaar. Controleer dezelfde wifi en houd de helper open.':e.message}));}
});
server.listen(5180,'127.0.0.1',()=>console.log('Core-bediening: http://127.0.0.1:5180'));
const syncWorker=createPollingWorker({run:()=>boardStatus(),interval:50,onState:state=>writeFileSync(new URL('./sync-worker-status.json',import.meta.url),JSON.stringify({...state,pid:process.pid,updatedAt:new Date().toISOString(),browserRequired:false,codexRequired:false},null,2))});
server.on('listening',()=>syncWorker.start());
server.on('close',()=>syncWorker.stop());
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await syncWorker.stop();server.close();});
