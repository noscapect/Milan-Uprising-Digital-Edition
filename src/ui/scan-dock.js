import {artworkImage} from '../games/milan-uprising/presentation/artwork.js';

// A peripheral contact, deliberately separate from persistent board zones.
export function mountScanDock(board,{scan,canScan,selected,onSelect,onHint}){
  const doc=board.ownerDocument,viewport=board.parentElement;
  const area=doc.createElement('div');area.className='board-play-area';viewport.insertBefore(area,board);
  const station=doc.createElement('div');station.className='scan-station';
  const tray=doc.createElement('aside');tray.className='miniature-tray';tray.setAttribute('aria-label','Miniatures beside the Core');
  const trayHeading=doc.createElement('div');trayHeading.className='miniature-tray-heading';
  const trayTitle=doc.createElement('strong');trayTitle.textContent='Miniatures';
  const trayCount=doc.createElement('span');trayHeading.append(trayTitle,trayCount);
  const search=doc.createElement('input');search.type='search';search.placeholder='Find miniature';search.setAttribute('aria-label','Find a miniature beside the Core');search.hidden=true;
  const dock=doc.createElement('aside');dock.className='scan-dock';dock.setAttribute('aria-label','Virtual Core RFID reader');
  const title=doc.createElement('strong');title.textContent='TEBURU';
  const label=doc.createElement('span');label.className='scan-dock-label';label.textContent='CORE';
  const waiting=doc.createElement('div');waiting.className='scan-waiting';waiting.setAttribute('aria-label','Miniatures waiting beside the board');
  waiting.onclick=event=>{const miniature=event.target.closest('[data-component]');if(miniature)onSelect(miniature.dataset.component);};
  const pad=doc.createElement('div');pad.className='scan-pad';pad.id='core-scan-pad';pad.setAttribute('role','button');pad.tabIndex=0;pad.setAttribute('aria-label','Scan selected miniature on the Core reader');
  const contact=doc.createElement('div');contact.className='scan-contact';contact.textContent='';contact.setAttribute('aria-hidden','true');
  const preview=doc.createElement('span');preview.className='scan-miniature';
  const hint=doc.createElement('span');hint.className='scan-pad-hint';hint.textContent='Drop miniature here';
  pad.append(contact,preview,hint);
  const status=doc.createElement('span');status.className='scan-dock-status sr-only';status.setAttribute('role','status');
  const light=doc.createElement('span');light.className='core-status-light';light.setAttribute('aria-hidden','true');
  const hardwareMark=doc.createElement('div');hardwareMark.className='core-brand';hardwareMark.append(light,title,label);
  tray.append(trayHeading,search,waiting);dock.append(pad,hardwareMark,status);station.append(tray,dock);area.append(station,board);
  function filterWaiting(){const term=search.value.trim().toLocaleLowerCase();let matches=0;for(const card of waiting.children){card.hidden=!!term&&!card.dataset.search.includes(term);if(!card.hidden)matches++;}trayCount.textContent=term?`${matches}/${waiting.childElementCount}`:String(waiting.childElementCount);}
  search.oninput=filterWaiting;
  const send=()=>{const id=selected(),permission=canScan(id);if(permission!==true){onHint(typeof permission==='string'?permission:'the game is not requesting a miniature scan.');return;}Promise.resolve(scan(id)).catch(error=>onHint(error.message));};
  pad.onclick=event=>{const miniature=event.target.closest('[data-component]');if(miniature){onSelect(miniature.dataset.component);return;}send();};
  pad.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();send();}};
  let waitingKey=null,previewId=null;
  function update(view,state={}){
    for(const element of board.querySelectorAll('.at-scan-reader'))element.classList.remove('at-scan-reader');
    for(const element of board.querySelectorAll('[data-component]'))if(state.unplacedIds?.includes(element.dataset.component))element.classList.add('at-scan-reader');
    const nextWaitingKey=JSON.stringify(state.waitingIds||[]);
    if(nextWaitingKey!==waitingKey){waitingKey=nextWaitingKey;waiting.replaceChildren(...(state.waitingIds||[]).map(id=>{
      const component=view.components.find(c=>c.id===id);if(!component)return null;
      const miniature=doc.createElement('button');miniature.type='button';miniature.className='board-piece piece miniature-card';miniature.dataset.component=id;miniature.dataset.movable='true';miniature.title=component.label;miniature.setAttribute('aria-label',component.label+' · waiting beside the board');
      if(component.portrait||component.icon)miniature.append(artworkImage(component.portrait||component.icon,'piece-icon miniature-icon'));
      const name=doc.createElement('span');name.className='miniature-name';name.textContent=component.label.split('·')[0].trim();
      const kind=doc.createElement('span');kind.className='miniature-kind';kind.textContent=component.label.split('·').slice(1).join('·').trim()||view.groups?.find(g=>g.id===component.groupId)?.label||component.groupId;
      miniature.dataset.search=(name.textContent+' '+kind.textContent).toLocaleLowerCase();miniature.append(name,kind);
      return miniature;
    }).filter(Boolean));}
    tray.classList.toggle('is-empty',!waiting.childElementCount);tray.inert=!waiting.childElementCount;search.hidden=waiting.childElementCount<9;
    if(search.hidden)search.value='';filterWaiting();
    const active=view.components.find(c=>c.id===state.componentId);
    if((active?.id||null)!==previewId){previewId=active?.id||null;preview.replaceChildren();if(active){
      const miniature=doc.createElement('span');miniature.className='board-piece piece';miniature.dataset.component=active.id;miniature.dataset.movable='true';miniature.title=active.label;
      if(active.portrait||active.icon)miniature.append(artworkImage(active.portrait||active.icon,'piece-icon miniature-icon'));else miniature.textContent=active.label;
      preview.append(miniature);
    }}
    if(active){
      for(const element of board.querySelectorAll('[data-component]'))if(element.dataset.component===active.id)element.classList.add('at-scan-reader');
    }
    dock.dataset.stage=state.stage||'idle';dock.dataset.readerReady=String(canScan(selected())===true);
    status.textContent=state.message||'Waiting for the game';hint.textContent=active?'Drag to the game’s indicated location':'Drop miniature here';
    pad.setAttribute('aria-disabled',String(canScan(selected())!==true));
  }
  return {element:station,fit({width,height}){const compact=width<650;const coreWidth=compact?48:80;const minimum=compact?96:128;const spare=width-height*2048/1295-coreWidth-24;station.style.setProperty('--miniature-tray-width',`${Math.max(minimum,Math.min(compact?96:260,spare))}px`);},target:{id:'core-rfid-reader',element:pad,label:'Core RFID reader',canDrop:canScan},update,dispose(){for(const e of board.querySelectorAll('.at-scan-reader'))e.classList.remove('at-scan-reader');area.before(board);area.remove();}};
}
