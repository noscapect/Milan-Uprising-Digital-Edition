import {artworkImage} from '../presentation/artwork.js';

// A peripheral contact, deliberately separate from persistent board zones.
export function mountScanDock(board,{scan,canScan,selected,onSelect,onHint}){
  const doc=board.ownerDocument,viewport=board.parentElement;
  const area=doc.createElement('div');area.className='board-play-area';viewport.insertBefore(area,board);
  const dock=doc.createElement('aside');dock.className='scan-dock';dock.setAttribute('aria-label','Virtual Core RFID reader');
  const title=doc.createElement('strong');title.textContent='CORE';
  const label=doc.createElement('span');label.className='scan-dock-label';label.textContent='RFID reader';
  const waiting=doc.createElement('div');waiting.className='scan-waiting';waiting.setAttribute('aria-label','Saved miniatures waiting beside the board');
  waiting.onclick=event=>{const miniature=event.target.closest('[data-component]');if(miniature)onSelect(miniature.dataset.component);};
  const pad=doc.createElement('div');pad.className='scan-pad';pad.id='core-scan-pad';pad.setAttribute('role','button');pad.tabIndex=0;pad.setAttribute('aria-label','Scan selected character on the Core reader');
  const contact=doc.createElement('div');contact.className='scan-contact';contact.textContent='◎';contact.setAttribute('aria-hidden','true');
  const preview=doc.createElement('span');preview.className='scan-miniature';
  const hint=doc.createElement('span');hint.className='scan-pad-hint';hint.textContent='Drop miniature here';
  pad.append(contact,preview,hint);
  const status=doc.createElement('span');status.className='scan-dock-status';status.setAttribute('role','status');
  dock.append(title,label,waiting,pad,status);area.append(dock,board);
  const send=()=>{const id=selected(),permission=canScan(id);if(permission!==true){onHint(typeof permission==='string'?permission:'Milan is not requesting a character scan.');return;}Promise.resolve(scan(id)).catch(error=>onHint(error.message));};
  pad.onclick=event=>{const miniature=event.target.closest('[data-component]');if(miniature){onSelect(miniature.dataset.component);return;}send();};
  pad.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();send();}};
  let waitingKey=null,previewId=null;
  function update(view,state={}){
    for(const element of board.querySelectorAll('.at-scan-reader'))element.classList.remove('at-scan-reader');
    for(const element of board.querySelectorAll('[data-component]'))if(state.unplacedIds?.includes(element.dataset.component))element.classList.add('at-scan-reader');
    const nextWaitingKey=JSON.stringify(state.waitingIds||[]);
    if(nextWaitingKey!==waitingKey){waitingKey=nextWaitingKey;waiting.replaceChildren(...(state.waitingIds||[]).map(id=>{
      const component=view.components.find(c=>c.id===id);if(!component)return null;
      const miniature=doc.createElement('button');miniature.type='button';miniature.className='board-piece piece';miniature.dataset.component=id;miniature.dataset.movable='true';miniature.title=component.label;miniature.setAttribute('aria-label',component.label+' · waiting beside the board');
      if(component.portrait||component.icon)miniature.append(artworkImage(component.portrait||component.icon,'piece-icon miniature-icon'));else miniature.textContent=component.label;
      return miniature;
    }).filter(Boolean));}
    waiting.hidden=!waiting.childElementCount;
    const active=view.components.find(c=>c.id===state.componentId);
    if((active?.id||null)!==previewId){previewId=active?.id||null;preview.replaceChildren();if(active){
      const miniature=doc.createElement('span');miniature.className='board-piece piece';miniature.dataset.component=active.id;miniature.dataset.movable='true';miniature.title=active.label;
      if(active.portrait||active.icon)miniature.append(artworkImage(active.portrait||active.icon,'piece-icon miniature-icon'));else miniature.textContent=active.label;
      preview.append(miniature);
    }}
    if(active){
      for(const element of board.querySelectorAll('[data-component]'))if(element.dataset.component===active.id)element.classList.add('at-scan-reader');
    }
    dock.dataset.stage=state.stage||'idle';
    status.textContent=state.message||'Waiting for Milan';hint.textContent=active?'Drag to Milan’s indicated location':'Drop miniature here';
    pad.setAttribute('aria-disabled',String(canScan(selected())!==true));
  }
  return {element:dock,target:{id:'core-rfid-reader',element:pad,label:'Core RFID reader',canDrop:canScan},update,dispose(){for(const e of board.querySelectorAll('.at-scan-reader'))e.classList.remove('at-scan-reader');area.before(board);area.remove();}};
}
