// Pointer interaction only. The supplied drop command owns validation and state.
export function installPieceDrag({board,sources=[board],canDrag=()=>true,onStart=()=>{},onEnd=()=>{},onDrop,onHint=()=>{}}){
  let gesture=null,ghost=null,highlight=null,suppressClick=false,clickTimer;
  const doc=board.ownerDocument,win=doc.defaultView;
  const zoneAt=(x,y)=>{
    for(const element of doc.elementsFromPoint(x,y)){
      const zone=element.closest('[data-zone]');
      if(zone&&board.contains(zone))return zone.dataset.zone;
    }
    return null;
  };
  function mark(zoneId){
    highlight?.classList.remove('drop-target');highlight=null;
    if(zoneId)highlight=[...board.querySelectorAll('.cell[data-zone]')].find(el=>el.dataset.zone===zoneId);
    highlight?.classList.add('drop-target');
  }
  function silenceClick(){suppressClick=true;win.clearTimeout(clickTimer);clickTimer=win.setTimeout(()=>{suppressClick=false;},500);}
  function finish(cancelled=false){
    const current=gesture;if(!current)return;
    gesture=null;ghost?.remove();ghost=null;mark(null);
    board.classList.remove('dragging-piece');
    if(board.hasPointerCapture?.(current.pointerId))board.releasePointerCapture(current.pointerId);
    if(current.active){silenceClick();onEnd();}
    if(cancelled&&current.active)onHint('Verplaatsing geannuleerd.');
    return current;
  }
  function down(event){
    if(gesture||event.button!==0||event.isPrimary===false)return;
    const element=event.target.closest('[data-component][data-movable="true"]');
    if(!element||!sources.some(source=>source.contains(element)))return;
    const availability=canDrag(element.dataset.component);
    if(availability!==true){if(typeof availability==='string')onHint(availability);return;}
    const rect=element.getBoundingClientRect();
    gesture={pointerId:event.pointerId,componentId:element.dataset.component,sourceZone:element.closest('[data-zone]')?.dataset.zone||null,x:event.clientX,y:event.clientY,active:false,clone:element.cloneNode(true),width:rect.width,height:rect.height};
  }
  function move(event){
    if(!gesture||event.pointerId!==gesture.pointerId)return;
    if(event.pointerType==='mouse'&&!(event.buttons&1)){finish(true);return;}
    if(!gesture.active&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<6)return;
    event.preventDefault();
    if(!gesture.active){
      gesture.active=true;ghost=gesture.clone;ghost.classList.add('drag-ghost');ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('data-component');
      Object.assign(ghost.style,{width:gesture.width+'px',height:gesture.height+'px'});doc.body.append(ghost);
      board.classList.add('dragging-piece');board.setPointerCapture?.(event.pointerId);onStart(gesture.componentId);
    }
    Object.assign(ghost.style,{left:event.clientX+'px',top:event.clientY+'px'});
    const zone=zoneAt(event.clientX,event.clientY);mark(zone);
    onHint(zone?'Laat los op '+(highlight?.title||zone)+'.':'Sleep naar een vak op het bord. Esc annuleert.');
    const viewport=board.closest('.scroll');
    if(viewport){const r=viewport.getBoundingClientRect(),edge=30;viewport.scrollBy(event.clientX<r.left+edge?-14:event.clientX>r.right-edge?14:0,event.clientY<r.top+edge?-14:event.clientY>r.bottom-edge?14:0);}
  }
  function up(event){
    if(!gesture||event.pointerId!==gesture.pointerId)return;
    const zone=gesture.active?zoneAt(event.clientX,event.clientY):null,current=finish();
    if(!current?.active)return;
    if(!zone){onHint('Buiten het bord losgelaten; niets verplaatst.');return;}
    if(zone===current.sourceZone){onHint('Terug op dezelfde locatie; niets verplaatst.');return;}
    Promise.resolve().then(()=>onDrop(current.componentId,zone)).catch(error=>onHint(error.message));
  }
  const cancel=()=>finish(true);
  const key=event=>{if(event.key==='Escape'&&gesture){event.preventDefault();event.stopImmediatePropagation();finish(true);}};
  const click=event=>{if(suppressClick&&event.detail>0){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}};
  const nativeDrag=event=>{if(event.target.closest('[data-movable="true"]'))event.preventDefault();};
  doc.addEventListener('pointerdown',down);doc.addEventListener('pointermove',move,{passive:false});doc.addEventListener('pointerup',up);
  doc.addEventListener('pointercancel',cancel);doc.addEventListener('keydown',key,true);doc.addEventListener('click',click,true);doc.addEventListener('dragstart',nativeDrag);win.addEventListener('blur',cancel);
  return {get active(){return Boolean(gesture?.active);},dispose(){finish(true);win.clearTimeout(clickTimer);doc.removeEventListener('pointerdown',down);doc.removeEventListener('pointermove',move);doc.removeEventListener('pointerup',up);doc.removeEventListener('pointercancel',cancel);doc.removeEventListener('keydown',key,true);doc.removeEventListener('click',click,true);doc.removeEventListener('dragstart',nativeDrag);win.removeEventListener('blur',cancel);}};
}
