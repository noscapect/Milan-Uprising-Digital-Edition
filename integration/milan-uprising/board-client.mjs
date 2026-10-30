import {withPendingPlacement} from '/src/games/milan-uprising/presentation/artwork.js';
import {waitingMiniatures,unplacedMiniatures,isScanScene} from '/src/games/milan-uprising/scan-options.js';
import {prosperoAccessory,ringPresentation} from '/src/games/milan-uprising/prospero.js';
import {milanDieFace} from '/src/games/milan-uprising/dice-faces.js';
import {mountDiceTray} from '/src/ui/dice-tray.js';
import {mountPlayLayout} from '/src/ui/play-layout.js';
import {createSingleFlight} from '/src/adapters/single-flight.js';
import {createTabletop} from '/src/application/tabletop.js';
import {milanModule} from '/src/games/milan-uprising/module.js';
import {mountTabletop} from '/src/games/milan-uprising/ui/controller.js';
import {downloadSession} from '/src/adapters/download.js';
import {decorateLocationTiles} from '/src/games/milan-uprising/location-tiles.js';
import {isCompanion,validateCompanionPlacement} from '/src/games/milan-uprising/companion-placement.js';
const $=id=>document.getElementById(id);
async function api(path,body){
  const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Connection failed');return data;
}
try {
  const [profile,artwork,initial,tileResult]=await Promise.all([
    fetch('/data/games/milan-uprising/city-expansions.json').then(r=>r.json()),
    fetch('/games/milan-uprising/artwork/catalog.json').then(r=>r.json()),
    api('/api/table-session'),api('/api/board-tiles')
  ]);
  const local=createTabletop({profile,module:milanModule,random:()=>{throw Error('Roll the dice in Milan.');}});
  local.restoreSession(initial);
  let locationTiles=tileResult.locationTiles;
  let optimisticMove=null;
  let moving=false,latest=null,lastRevision=initial.state.revision,lastSource=null,disposed=false,scanning=false,localScan=null,renderedStatus=null;
  async function scanCharacter(componentId){
    const permission=table.canScan(componentId);if(permission!==true)throw Error(permission);
    scanning=true;localScan={componentId,slot:latest.roster?.slot};update();
    try{await api('/api/board-scan',{componentId});$('status').textContent='Miniature on the Core reader. Follow Milan for placement.';}
    catch(error){localScan=null;throw error;}
    finally{scanning=false;update();await poll();}
  }
  const appOnly=()=>{throw Error('This action is managed by the official app.');};
  const manualExpansion=id=>profile.components.some(c=>c.id===id&&c.expansionId&&!['characters','allies','ghouls'].includes(c.groupId));
  async function editMarker(componentId,zoneId,operation='place'){
    const result=await api('/api/board-expansion-piece',{componentId,zoneId,operation,expectedRevision:local.snapshot().revision});
    local.restoreSession(result.session);lastRevision=result.session.state.revision;
    update();return result;
  }
  const table={...local,
    offBoardMiniature:()=>({...prosperoAccessory,image:artwork.assets?.[prosperoAccessory.imageAsset],state:ringPresentation(latest?.ledRing)}),
    scan:scanCharacter,
    canScan:id=>{
      if(scanning||moving||latest?.busy)return 'Wait for the current input to finish.';
      if(!profile.components.some(c=>c.id===id&&['characters','allies','ghouls'].includes(c.groupId)))return 'Choose a character, ally or ghoul miniature.';
      if(!latest?.inputHardware?.connected)return 'Connect the Core to the official app.';
      return latest.inputHardware.readerEnabled?true:'The official app has not enabled its RFID reader.';
    },
    scanStatus:()=>{
      const member=localScan?latest?.roster?.characters.find(c=>c.componentId===localScan.componentId):latest?.roster?.characters.find(c=>['sent','scanned'].includes(c.stage));
      const companionId=['component-placement','companion-placement'].includes(latest?.observation.screen)&&profile.components.some(c=>c.id===latest.observation.componentId&&['allies','ghouls'].includes(c.groupId))?latest.observation.componentId:null;
      const componentId=isScanScene(latest?.observation.screen)?localScan?.componentId||companionId||(['sent','scanned'].includes(member?.stage)?member.componentId:null):null;
      return {componentId,waitingIds:waitingMiniatures(profile.components,{screen:latest?.observation.screen,roster:latest?.roster,currentId:componentId,placements:local.snapshot().placements}),unplacedIds:unplacedMiniatures(latest?.roster,latest?.observation.screen),stage:scanning?'sending':member?.stage||'idle',message:scanning?'Reading miniature…':(member?.stage==='scanned'||(componentId===latest?.observation.componentId&&['component-placement','companion-placement'].includes(latest?.observation.screen)))?(member?.zoneId?'Read complete. Move to '+(profile.zones.find(z=>z.id===member.zoneId)?.label||'the indicated location')+'.':'Read complete. Drag to the location shown in Milan.'):componentId?'Waiting for Milan to read this miniature.':latest?.inputHardware?.readerEnabled?'Reader ready. Place a miniature on the Core reader; repeat scans are allowed.':'Waiting for Milan to enable its RFID reader.'};
    },
    appScreen:()=>latest?.observation.screen,
    canMove:id=>manualExpansion(id)?true:latest?.observation.screen==='night-summary'?(latest.observation.daySummary?.applied?'Night positions are synced. Continue in Milan.':'Milan has already moved the miniatures. The board is reading those positions automatically.'):moving?'Wait for Milan to finish the previous move.':latest?.pendingMove?'The previous sensor input is awaiting app confirmation. Check Milan; do not send this move again.':latest?.movement?.allowedComponents?.includes(id)?true:'Milan is expecting a different character or action. Follow the active player in the app.',

    project:()=>({...withPendingPlacement(decorateLocationTiles(local.project(),locationTiles),optimisticMove||latest?.pendingMove?.action),canUndo:false,canRedo:false}),
    exportSession:()=>({...local.exportSession(),locationTiles}),
    setLocationTile:async(zoneId,kind,tile)=>{try{const r=await api('/api/board-tiles',{zoneId,kind,...tile,expectedRevision:locationTiles.revision});locationTiles=r.locationTiles;update();}catch(error){locationTiles=(await api('/api/board-tiles')).locationTiles;update();throw error;}},
    setHavenRoom:async(zoneId,room)=>{try{const r=await api('/api/board-tiles',{zoneId,kind:'haven-room',room,expectedRevision:locationTiles.revision});locationTiles=r.locationTiles;update();}catch(error){locationTiles=(await api('/api/board-tiles')).locationTiles;update();throw error;}},
    place:async(componentId,zoneId)=>{
      if(manualExpansion(componentId))return editMarker(componentId,zoneId);
      if(isCompanion(profile.components.find(c=>c.id===componentId)))validateCompanionPlacement(profile,local.snapshot().placements,{componentId,zoneId});
      if(moving)throw Error('Milan is still processing the previous move.');moving=true;optimisticMove={componentId,zoneId};update();
      $('status').textContent='Sending destination to Milan; waiting for confirmation…';
      try{const result=await api('/api/board-move',{componentId,zoneId});local.restoreSession(result.session);lastRevision=result.session.state.revision;if(result.confirmed){localScan=null;optimisticMove=null;if(latest)latest.pendingMove=null;}return result.awaitingConfirmation?{message:"Input sent; waiting for Milan to confirm the location. Show its city map when possible. Do not repeat the move."}:undefined;}
      catch(error){optimisticMove=null;throw error;}
      finally{moving=false;update();await poll();}
    },remove:appOnly,flip:appOnly,roll:appOnly,reset:appOnly,undo:appOnly,redo:appOnly,arrange:appOnly,restoreSession:appOnly
  };
  const update=mountTabletop(table,downloadSession,null,artwork,true);
  const markers=document.createElement('details');markers.className='small-details';
  const markerTitle=document.createElement('summary');markerTitle.textContent='Place expansion markers';
  const markerNote=document.createElement('p');markerNote.textContent='Copy the official app instructions. These changes update this table only; they do not change Milan’s campaign.';
  const markerSelect=document.createElement('select');markerSelect.id='expansion-marker';markerSelect.setAttribute('aria-label','Expansion marker');
  for(const c of profile.components.filter(c=>manualExpansion(c.id))){const option=document.createElement('option');option.value=c.id;option.textContent=c.expansionLabel+' · '+c.label;markerSelect.append(option);}
  const zoneSelect=document.createElement('select');zoneSelect.id='expansion-marker-zone';zoneSelect.setAttribute('aria-label','Marker location');
  for(const z of profile.zones){const option=document.createElement('option');option.value=z.id;option.textContent=z.label;zoneSelect.append(option);}
  const placeMarker=document.createElement('button');placeMarker.id='place-expansion-marker';placeMarker.textContent='Place marker';
  const removeMarker=document.createElement('button');removeMarker.id='remove-expansion-marker';removeMarker.textContent='Return marker to stock';
  for(const [button,operation]of [[placeMarker,'place'],[removeMarker,'remove']]){button.type='button';button.onclick=async()=>{button.disabled=true;try{await editMarker(markerSelect.value,zoneSelect.value,operation);$('status').textContent='Expansion marker updated on this table. Follow Milan for campaign progress.';}catch(e){$('status').textContent=e.message;}finally{button.disabled=false;}};}
  markers.append(markerTitle,markerNote,markerSelect,zoneSelect,placeMarker,removeMarker);$('panel-stock').append(markers);
  const companionRemoval=document.createElement('details'),removalTitle=document.createElement('summary'),removalNote=document.createElement('p'),removalSelect=document.createElement('select'),removalButton=document.createElement('button');
  companionRemoval.id='companion-removal';removalTitle.textContent='Copy an ally / ghoul removal';removalNote.textContent='Use only after Milan has removed this miniature from its map. This returns it to our stock without changing Milan, recruitment or cooldown.';removalSelect.setAttribute('aria-label','Companion removed in Milan');removalButton.type='button';removalButton.textContent='Copy removal from Milan';
  companionRemoval.append(removalTitle,removalNote,removalSelect,removalButton);$('panel-stock').append(companionRemoval);
  const componentCopy=document.createElement('details');componentCopy.id='copy-component-instruction';
  const copyTitle=document.createElement('summary');copyTitle.textContent='Copy a placement or removal from Milan';
  const copyNote=document.createElement('p');copyNote.textContent='Use after checking the official app. Copy any miniature, cube or token and its side to this table. This sends no scan, movement or game action to Milan.';
  const copySearch=document.createElement('input');copySearch.type='search';copySearch.placeholder='Find a miniature or token';copySearch.setAttribute('aria-label','Find a component');
  const copyPiece=document.createElement('select');copyPiece.setAttribute('aria-label','Component to copy');
  const copyZone=document.createElement('select');copyZone.setAttribute('aria-label','Confirmed location in Milan');
  for(const z of profile.zones){const option=document.createElement('option');option.value=z.id;option.textContent=z.label;copyZone.append(option);}
  const copyFace=document.createElement('select');copyFace.setAttribute('aria-label','Confirmed component side');
  function copySides(){copyFace.replaceChildren();const keep=document.createElement('option');keep.value='';keep.textContent='Keep recorded side';copyFace.append(keep);for(const f of profile.components.find(c=>c.id===copyPiece.value)?.faces||[]){const option=document.createElement('option');option.value=f.id;option.textContent=f.label;copyFace.append(option);}copyFace.disabled=copyFace.options.length===1;}
  function copyChoices(){const selected=copyPiece.value;copyPiece.replaceChildren();for(const c of [...profile.components].sort((a,b)=>a.label.localeCompare(b.label))){if(copySearch.value&&!c.label.toLowerCase().includes(copySearch.value.toLowerCase()))continue;const option=document.createElement('option');option.value=c.id;option.textContent=c.label;copyPiece.append(option);}if([...copyPiece.options].some(o=>o.value===selected))copyPiece.value=selected;copySides();}
  copySearch.oninput=copyChoices;copyPiece.onchange=copySides;copyChoices();componentCopy.append(copyTitle,copyNote,copySearch,copyPiece,copyZone,copyFace);
  for(const [operation,label] of [['place','Copy placement'],['remove','Copy removal'],['face','Copy side']]){
    const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.copyOperation=operation;
    button.onclick=async()=>{if(!copyPiece.value)return;button.disabled=true;try{const instruction={componentId:copyPiece.value,operation};if(operation==='place')instruction.zoneId=copyZone.value;if(copyFace.value&&operation!=='remove')instruction.faceId=copyFace.value;const result=await api('/api/board-move',{operation:'component-record',expectedRevision:latest.session.state.revision,instructions:[instruction]});local.restoreSession(result.session);lastRevision=result.session.state.revision;update();$('status').textContent='Confirmed component change copied to this table. No input sent to Milan.';}catch(error){$('status').textContent=error.message;}finally{button.disabled=false;await poll();}};componentCopy.append(button);
  }
  $('panel-stock').append(componentCopy);
  let removalKey=null;
  removalButton.onclick=async()=>{
    const componentId=removalSelect.value;if(!componentId||moving||latest?.busy)return;removalButton.disabled=true;
    try{const result=await api('/api/board-move',{operation:'companion-removal',componentId,expectedZoneId:latest.session.state.placements[componentId],expectedRevision:latest.session.state.revision});local.restoreSession(result.session);lastRevision=result.session.state.revision;update();$('status').textContent='Companion returned to stock after your verification in Milan.';}
    catch(error){$('status').textContent=error.message;}
    finally{await poll();}
  };
  document.querySelector('#panel-session > p.muted').textContent='This linked board is saved on this PC. Campaign saves are managed separately by the official Milan app.';
  const integration=document.querySelector('.integration-card');
  integration.querySelector('h3').textContent='Official app adapter';
  integration.querySelector('p').textContent='Milan manages rules, story and campaign progress. The local adapter copies supported board instructions automatically.';
  integration.querySelector('summary').textContent='Automatic board updates';
  integration.querySelector('details p').textContent='The background adapter works without this browser or Codex. Instructions that are not yet recognised still require checking against the official app.';
  for(const button of document.querySelectorAll('[data-dialog]'))button.onclick=()=>$(button.dataset.dialog).showModal();
  for(const button of document.querySelectorAll('[data-close-dialog]'))button.onclick=()=>button.closest('dialog').close();
  for(const id of ['open-setup','start-profile','reset','import','remove','flip'])$(id).disabled=true;
  $('dice-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
  const info=document.createElement('p');info.textContent='Hold the left mouse button and drag a miniature onto the Core reader to scan. Then drag it to Milan’s indicated location. Esc cancels.';info.style.cssText='color:#e4c58a;margin:4px 0 12px';
  document.querySelector('.table-toolbar').after(info);
  const syncInfo=document.createElement('p');syncInfo.className='board-sync-status';syncInfo.setAttribute('role','status');syncInfo.style.cssText='color:#e4c58a;margin:4px 0 12px';
  info.after(syncInfo);
  const scanPanel=document.createElement('div');scanPanel.hidden=true;scanPanel.style.cssText='margin:8px 0 16px;display:flex;flex-wrap:wrap;gap:8px';
  // hidden must override the panel's flex layout.
  scanPanel.style.display='none';
  const scanLabel=document.createElement('span');scanLabel.style.cssText='flex-basis:100%;color:#e4c58a';scanLabel.setAttribute('role','status');scanPanel.append(scanLabel);
  for(const character of profile.components.filter(c=>['characters','allies','ghouls'].includes(c.groupId))){
    const button=document.createElement('button');button.type='button';button.textContent='Scan '+character.label.split('·')[0].trim();button.dataset.scanGroup=character.groupId;button.dataset.scanCharacter=character.id;
    button.onclick=async()=>{
      try{await scanCharacter(character.id);}
      catch(error){$('status').textContent=error.message;}
    };
    scanPanel.append(button);
  }
  syncInfo.after(scanPanel);
  const setupButton=document.createElement('button');setupButton.type='button';setupButton.hidden=true;
  setupButton.onclick=async()=>{
    const o=latest?.observation;if(!o?.stable||o.screen!=='setup-placement'||moving)return;
    setupButton.disabled=true;
    try{await table.place(o.componentId,o.zoneId);$('status').textContent='Setup placement confirmed by Milan.';}
    catch(error){$('status').textContent=error.message;}
    finally{await poll();}
  };
  scanPanel.after(setupButton);
  const dicePanel=document.createElement('div');dicePanel.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:8px 0 12px';
  const wakeButton=document.createElement('button');wakeButton.type='button';wakeButton.textContent='Wake 5 dice';wakeButton.id='wake-dice';wakeButton.disabled=true;
  const diceInfo=document.createElement('span');diceInfo.setAttribute('role','status');diceInfo.textContent='Reading virtual dice…';
  let waking=false;
  wakeButton.onclick=async()=>{
    if(waking)return;waking=true;wakeButton.disabled=true;
    try{await api('/api/board-dice-wake',{});$('status').textContent='Five dice announced to Milan. Check the dice shown in the app. No roll was sent.';}
    catch(error){$('status').textContent=error.message;}
    finally{waking=false;await poll();}
  };
  dicePanel.append(wakeButton,diceInfo);setupButton.after(dicePanel);
  const recovery=document.createElement('button');recovery.type='button';recovery.id='recover-board';recovery.textContent='App restarted? Recover input';recovery.className='secondary';recovery.style.marginBottom='10px';
  recovery.onclick=async()=>{
    recovery.disabled=true;
    try{await api('/api/board-recover',{});localScan=null;$('status').textContent='Registrations and pending inputs cleared. Confirmed board positions and campaign saves kept. Follow Milan.';await poll();update();}
    catch(error){$('status').textContent=error.message;}
    finally{recovery.disabled=false;}
  };
  dicePanel.after(recovery);
  const playLayout=mountPlayLayout({scanPanel,secondaryNodes:[info,syncInfo,dicePanel,recovery],wakeButton,showQuickDice:false});
  const companionPanel=document.createElement('section');companionPanel.id='companion-placement';companionPanel.hidden=true;
  companionPanel.style.cssText='padding:10px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;border:1px solid #817157;border-radius:6px;margin:6px 0';
  const companionHelp=document.createElement('span');companionHelp.setAttribute('role','status');companionHelp.style.flexBasis='100%';
  const companionZone=document.createElement('select');companionZone.id='companion-zone';companionZone.setAttribute('aria-label','Ally or ghoul destination');companionZone.style.cssText='width:auto;max-width:100%';
  const chooseZone=document.createElement('option');chooseZone.value='';chooseZone.textContent='Choose a city district';companionZone.append(chooseZone);
  for(const zone of profile.zones.filter(z=>z.area==='city')){const option=document.createElement('option');option.value=zone.id;option.textContent=zone.label;companionZone.append(option);}
  const deployCompanion=document.createElement('button');deployCompanion.type='button';deployCompanion.id='deploy-companion';deployCompanion.textContent='Place in Milan';
  const confirmCompanion=document.createElement('button');confirmCompanion.type='button';confirmCompanion.id='confirm-companion';confirmCompanion.textContent='Milan accepted this placement';
  const rejectCompanion=document.createElement('button');rejectCompanion.type='button';rejectCompanion.id='reject-companion';rejectCompanion.textContent='Milan did not place it';
  companionPanel.append(companionHelp,companionZone,deployCompanion,confirmCompanion,rejectCompanion);$('board-viewport').before(companionPanel);
  deployCompanion.onclick=async()=>{
    const o=latest?.observation;if(!o?.stable||o.screen!=='companion-placement'||!companionZone.value||moving)return;
    deployCompanion.disabled=true;
    try{await table.place(o.componentId,companionZone.value);}
    catch(error){$('status').textContent=error.message;}
    finally{await poll();}
  };
  for(const [button,confirmation]of [[confirmCompanion,'accepted'],[rejectCompanion,'rejected']])button.onclick=async()=>{
    const pending=latest?.pendingMove;if(!pending||moving||latest.busy)return;button.disabled=true;
    try{const result=await api('/api/board-move',{...pending.action,sentAt:pending.sentAt,confirmation});local.restoreSession(result.session);lastRevision=result.session.state.revision;localScan=null;update();$('status').textContent=confirmation==='accepted'?'Placement recorded after your confirmation in Milan.':'Unconfirmed placement cleared. Check Milan before trying again.';}
    catch(error){$('status').textContent=error.message;}
    finally{await poll();}
  };
  const resetSection=document.createElement('section');
  const resetTitle=document.createElement('h3');resetTitle.textContent='Clear the table';
  const resetHelp=document.createElement('p');resetHelp.textContent='Remove all virtual pieces and tile settings, then show the city map in Milan to reread visible Influence, Control and Investigation. Covered miniatures and hidden information may need confirmation. Your Android save is kept.';
  const clearButton=document.createElement('button');clearButton.type='button';clearButton.id='clear-board';clearButton.textContent='Clear board & resync';
  clearButton.onclick=async()=>{
    if(!window.confirm('Clear every virtual piece and tile setting? Your Android save is kept. Only information visible in Milan can be restored automatically.'))return;
    clearButton.disabled=true;
    try{const result=await api('/api/board-clear',{confirm:true});localScan=null;local.restoreSession(result.session);lastRevision=result.session.state.revision;locationTiles=result.locationTiles;renderedStatus=null;update();$('status').textContent='Table cleared. Reading Milan again. Open Scenario Setup in Milan to restore Influence and Control; follow the app to place miniatures and other pieces.';await poll();}
    catch(error){$('status').textContent=error.message;}
    finally{clearButton.disabled=false;}
  };
  resetSection.append(resetTitle,resetHelp,clearButton);document.querySelector('#table-play-menu .dialog-body').prepend(resetSection);
  const diceTray=mountDiceTray({describeFace:value=>milanDieFace(value,artwork),onRoll:async dice=>(await api('/api/board-dice-roll',{dice})).diceHardware,onWake:async()=>{await api('/api/board-dice-wake',{});await poll();return latest?.diceHardware;}});
  $('status').textContent='Game board loaded. The active player and location are read from Milan.';
  document.querySelector('.connection').textContent='Milan · reading app status…';
  const readLatest=createSingleFlight(readStatus);
  function poll(){
    if(disposed)return Promise.resolve();
    return readLatest();
  }
  async function readStatus(){
    try {
      const oldRecovery=latest?.recovery?.recoveredAt;
      latest=await api('/api/board-status');const o=latest.observation;
      if(optimisticMove&&(latest.pendingMove||!moving))optimisticMove=null;
      const placedCompanions=profile.components.filter(c=>isCompanion(c)&&latest.session.state.placements[c.id]);const nextRemovalKey=JSON.stringify(placedCompanions.map(c=>[c.id,latest.session.state.placements[c.id]]));
      if(removalKey!==nextRemovalKey){removalKey=nextRemovalKey;const selected=removalSelect.value;removalSelect.replaceChildren(...placedCompanions.map(c=>{const option=document.createElement('option');option.value=c.id;option.textContent=c.label+' · '+(profile.zones.find(z=>z.id===latest.session.state.placements[c.id])?.label||'on board');return option;}));if(placedCompanions.some(c=>c.id===selected))removalSelect.value=selected;}
      companionRemoval.hidden=!placedCompanions.length;removalButton.disabled=moving||!!latest.busy||!placedCompanions.length;
      const pendingCompanion=latest.pendingMove&&isCompanion(profile.components.find(c=>c.id===latest.pendingMove.action.componentId))?latest.pendingMove:null;
      companionPanel.hidden=o.screen!=='companion-placement'&&!pendingCompanion;
      companionZone.hidden=deployCompanion.hidden=!!pendingCompanion;
      confirmCompanion.hidden=rejectCompanion.hidden=!pendingCompanion;
      confirmCompanion.disabled=rejectCompanion.disabled=moving||!!latest.busy;
      if(pendingCompanion){const action=pendingCompanion.action;companionHelp.textContent=profile.components.find(c=>c.id===action.componentId)?.label+' → '+profile.zones.find(z=>z.id===action.zoneId)?.label+'. Check Milan: confirm only if the app accepted this location and any cost. The board has not placed it yet.';}
      else if(o.screen==='companion-placement'){
        companionHelp.textContent='Optional: place '+profile.components.find(c=>c.id===o.componentId)?.label+' in a city district. Milan checks availability and any Hunger cost. To skip, use Done in Milan.';
        for(const option of companionZone.options){if(!option.value)continue;try{validateCompanionPlacement(profile,latest.session.state.placements,{componentId:o.componentId,zoneId:option.value});option.disabled=false;}catch{option.disabled=true;}}
        deployCompanion.disabled=moving||!!latest.busy||!o.stable||!companionZone.value||!!companionZone.selectedOptions[0]?.disabled;
      }
      if(localScan&&o.stable&&!isScanScene(o.screen))localScan=null;
      if(oldRecovery!==latest.recovery?.recoveredAt){localScan=null;lastRevision=-1;}
      if(localScan&&(latest.roster?.slot!==localScan.slot||latest.roster?.characters.find(c=>c.componentId===localScan.componentId)?.stage==='registered'||['hardware-setup','components-setup'].includes(o.screen)))localScan=null;
      const dice=latest.diceHardware;diceTray.update(dice);
      const activeName=profile.components.find(c=>c.id===o.componentId)?.label.split('·')[0].trim();
      playLayout.setContext({connected:!!latest.inputHardware?.connected,label:!latest.inputHardware?.connected?'Connect Milan':o.screen==='city-map'&&latest.recovery?.resyncRequested?'Map · partial recovery':latest.pendingMove?'Waiting for Milan':o.screen==='error'?'Check Milan':o.screen==='hardware-setup'?'Connect your dice':o.screen==='components-setup'?(o.setupMap?.applied?'Setup · Influence & Control synced':'Setup · reading the app map'):o.screen==='night-summary'?(o.daySummary?.applied?'Night · positions synced':'Night · checking board changes'):o.screen==='companion-scan'?'Scan an Ally / Ghoul':o.screen==='character-scan'?'Scan a character':['setup-placement','setup-placement-reading','component-placement','companion-placement','haven-placement'].includes(o.screen)?'Place '+(activeName||'your miniature'):latest.inputHardware?.readerEnabled?'Ready to scan':'Milan connected',diceAvailable:o.screen==='hardware-setup'&&!!dice?.connected&&!!dice?.ready});
      wakeButton.disabled=waking||o.screen!=='hardware-setup'||!dice?.connected||!dice?.ready||!!dice?.rolling;
      diceInfo.textContent=!dice?.connected?'Virtual dice · Core not connected':o.screen==='hardware-setup'&&!dice.ready?'Virtual dice · open dice setup in Milan':`Virtual dice · ${dice.announced}/5 announced to Milan`;
      setupButton.hidden=o.screen!=='setup-placement';setupButton.disabled=!o.stable||moving||!!latest.pendingMove;
      if(!setupButton.hidden)setupButton.textContent='Place '+profile.components.find(c=>c.id===o.componentId).label.split('·')[0].trim()+' in '+profile.zones.find(z=>z.id===o.zoneId).label+' — confirm in Milan';
      scanPanel.hidden=!latest.inputHardware?.readerEnabled&&!latest.roster?.characters?.length&&!['character-scan','companion-scan','component-placement','setup-placement'].includes(o.screen);scanPanel.style.display=scanPanel.hidden?'none':'flex';
      const roster=latest.roster,registered=roster?.characters.filter(c=>c.stage==='registered').length||0;
      const next=roster?.characters.find(c=>c.stage==='pending');
      const name=id=>profile.components.find(c=>c.id===id)?.label.split('·')[0].trim();
      scanLabel.textContent=roster?.ready?'Saved roster · Slot '+roster.slot+' · '+registered+'/'+roster.characters.length+' registered. '+(next?'Still to scan: '+roster.characters.filter(c=>c.stage==='pending').map(c=>name(c.componentId)).join(', ')+'. ':'')+(o.screen==='character-scan'?'Drag a character onto the Core reader. Repeat scans are allowed.':o.screen==='setup-placement'?'Confirm the indicated placement below.':'Scanning follows the Core reader state; saved progress is advisory.'):'Choose from all eleven characters. Expansion selection remains in Milan. The saved group is not confirmed. '+(roster?.error||'');
      scanPanel.querySelectorAll('button').forEach(b=>{
        const member=roster?.characters.find(c=>c.componentId===b.dataset.scanCharacter);
        b.hidden=false;
        b.disabled=table.canScan(b.dataset.scanCharacter)!==true;
        b.textContent=member?.stage==='registered'?'Scan again: '+name(b.dataset.scanCharacter):'Scan '+name(b.dataset.scanCharacter)+(b.dataset.scanGroup==='allies'?' · Ally':b.dataset.scanGroup==='ghouls'?' · Ghoul':'');
      });
      syncInfo.textContent=latest.synchronization?.issues?.length?'Check Milan — instruction not synchronized: '+latest.synchronization.issues.join(' · '):o.influenceMap?.applied?'Influence verified in all 30 districts. Visible Control icons are read separately; covered or hidden pieces remain unverified.':!o.available?'Sync paused: keep Milan open and the tablet connected. The board shows the last known positions.':o.screen==='components-setup'?(o.setupMap?.applied?'Setup synced: Influence and Control in all 30 districts. Characters, location tiles and story markers still need verification.':o.setupMap?.reason||'Reading setup; waiting for two matching frames.'):'Automatic sync is active for recognised instructions. A complete match for characters, location tiles and story markers is not yet verified.';
      if(latest.source!==lastSource||latest.session.state.revision!==lastRevision){local.restoreSession(latest.session);lastRevision=latest.session.state.revision;lastSource=latest.source;}
      const renderKey=JSON.stringify([latest.source,latest.session.state.revision,o.screen,o.stable,o.componentId,o.zoneId,latest.roster,latest.recovery,latest.busy,latest.pendingMove,latest.movement,latest.inputHardware,latest.diceHardware,latest.ledRing]);
      if(renderKey!==renderedStatus){renderedStatus=renderKey;update();}
      const nextTiles=(await api('/api/board-tiles')).locationTiles;
      if(nextTiles.revision!==locationTiles.revision){locationTiles=nextTiles;update();}
      if(latest.source!==lastSource||latest.session.state.revision!==lastRevision){local.restoreSession(latest.session);lastRevision=latest.session.state.revision;lastSource=latest.source;}
      if(latest.pendingMove)document.querySelector('.connection').textContent='Milan · move awaiting confirmation';
      else if(latest.synchronization?.issues?.length)document.querySelector('.connection').textContent='Milan · check an instruction that was not synchronized';
      else if(o.screen==='hardware-setup')document.querySelector('.connection').textContent='Milan · hardware setup · follow Milan before character registration';
      else if(o.screen==='companion-scan')document.querySelector('.connection').textContent='Milan · scan an Ally or Ghoul, then place it on a location';
      else if(o.screen==='character-scan')document.querySelector('.connection').textContent='Milan · place a saved character on the Core reader';
      else if(o.screen==='setup-placement-reading')document.querySelector('.connection').textContent='Milan · scan received · drag to the location shown in the app';
      else if(o.screen==='setup-placement')document.querySelector('.connection').textContent='Milan · scan received · confirm the indicated setup placement';
      else if(o.screen==='components-setup')document.querySelector('.connection').textContent=o.setupMap?.applied?'Scenario setup · Influence and Control copied':'Scenario setup · checking map against legend';
      else if(o.screen==='board-tiles-setup')document.querySelector('.connection').textContent='Setup · match the displayed board tiles';
      else if(o.screen==='night-summary')document.querySelector('.connection').textContent=o.daySummary?.applied?'Night · visible character positions and Control updated':'Night · reading explicit board changes';
      else if(o.screen==='day-summary')document.querySelector('.connection').textContent=o.daySummary?.applied?'Day Phase · '+o.daySummary.updates.length+' visible Influence counts copied':o.daySummary?.error||o.daySummary?.unsupported?.length?'Day Phase · some instructions are not yet recognised':'Day Phase · reading Influence';
      else if(o.screen==='sunset-summary')document.querySelector('.connection').textContent=o.daySummary?.applied?'Sunset · visible Influence and Control updated':o.daySummary?.error||o.daySummary?.unsupported?.length?'Sunset · some instructions are not yet recognised':'Sunset · reading board changes';
      else if(o.stable&&['location','haven-placement','component-placement','companion-placement','setup-placement','free-character-movement'].includes(o.screen)){
        const character=profile.components.find(c=>c.id===o.componentId),zone=profile.zones.find(z=>z.id===o.zoneId);
        document.querySelector('.connection').textContent='Milan · '+character.label.split('·')[0].trim()+' · '+(zone?.label||(o.screen==='haven-placement'?'choose a Haven room':'choose a destination'));
        if($('piece').value!==o.componentId){$('piece').value=o.componentId;update();}
      }else if(latest.inputHardware?.readerEnabled)document.querySelector('.connection').textContent='Milan · RFID reader ready · scan a character';
      else document.querySelector('.connection').textContent=o.screen==='map'&&o.stable?'Milan map · Influence and Control copied':o.screen==='error'?'Milan is showing an error':"Waiting for Milan's location screen";
    }catch(error){latest=null;document.querySelector('.connection').textContent='Reading app: '+error.message;syncInfo.textContent='Sync paused. The board shows the last known positions.';}
  }
  const timer=setInterval(poll,250);window.addEventListener('pagehide',()=>{disposed=true;clearInterval(timer);diceTray.dispose();playLayout.dispose();update.dispose();},{once:true});
  await poll();
}catch(error){$('status').textContent='Failed to start adapter: '+error.message;}
