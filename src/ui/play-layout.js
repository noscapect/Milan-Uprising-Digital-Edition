// Optional presentation for an app-led table. Existing controls keep their handlers.
export function mountPlayLayout({scanPanel, secondaryNodes=[], wakeButton}={}) {
  const doc=document, body=doc.body, sidebar=doc.querySelector('.sidebar');
  const actions=doc.querySelector('.header-actions'), moved=[];
  const move=(element,parent)=>{if(!element)return;const marker=doc.createComment('play-layout');element.before(marker);moved.push([element,marker]);parent.append(element);};
  const button=(id,text)=>{const b=doc.createElement('button');b.type='button';b.id=id;b.textContent=text;return b;};
  body.classList.add('table-play');
  const context=doc.createElement('span');context.className='play-context';context.setAttribute('role','status');
  const pieces=button('table-pieces-toggle','Pieces');pieces.setAttribute('aria-controls','table-pieces');pieces.setAttribute('aria-expanded','false');
  sidebar.id='table-pieces';sidebar.inert=true;
  const drawerHeader=doc.createElement('div');drawerHeader.className='play-drawer-header';
  const title=doc.createElement('h2');title.textContent='Table pieces';
  const closePieces=button('table-pieces-close','Close');drawerHeader.append(title,closePieces);sidebar.prepend(drawerHeader);
  const menu=doc.createElement('dialog');menu.id='table-play-menu';menu.setAttribute('aria-labelledby','table-menu-title');
  const menuHeader=doc.createElement('div');menuHeader.className='dialog-header';
  const menuTitle=doc.createElement('h2');menuTitle.id='table-menu-title';menuTitle.textContent='Table menu';
  const closeMenu=button('table-menu-close','Close');menuHeader.append(menuTitle,closeMenu);
  const menuBody=doc.createElement('div');menuBody.className='dialog-body';menu.append(menuHeader,menuBody);body.append(menu);
  const section=(name)=>{const s=doc.createElement('section'),h=doc.createElement('h3');h.textContent=name;s.append(h);menuBody.append(s);return s;};
  move(doc.querySelector('.table-toolbar'),section('View'));
  const tableActions=section('Table information');
  for(const element of [...actions.children])move(element,tableActions);
  const support=doc.createElement('details'),summary=doc.createElement('summary');summary.textContent='Connection & recovery';support.append(summary);menuBody.append(support);
  for(const element of secondaryNodes)move(element,support);
  if(scanPanel){const scanOptions=doc.createElement('details');scanOptions.className='play-scan-options';const s=doc.createElement('summary');s.textContent='Scan a miniature';scanOptions.append(s);sidebar.querySelector('#panel-stock').prepend(scanOptions);move(scanPanel,scanOptions);}
  const openMenu=button('table-menu-toggle','Table menu');openMenu.setAttribute('aria-haspopup','dialog');
  const quickDice=button('table-quick-dice','Wake dice');quickDice.hidden=true;quickDice.onclick=()=>wakeButton?.click();
  actions.append(context,quickDice,pieces,openMenu);
  function showPieces(open,focus=false){body.classList.toggle('pieces-open',open);sidebar.inert=!open;pieces.setAttribute('aria-expanded',String(open));if(focus)(open?closePieces:pieces).focus();}
  pieces.onclick=()=>showPieces(!body.classList.contains('pieces-open'),true);
  closePieces.onclick=()=>showPieces(false,true);
  openMenu.onclick=()=>{showPieces(false);menu.showModal();};closeMenu.onclick=()=>menu.close();
  const reveal=()=>showPieces(true);
  doc.addEventListener('tabletop:location-inspected',reveal);
  const escape=event=>{if(event.key==='Escape'&&body.classList.contains('pieces-open'))showPieces(false,true);};
  doc.addEventListener('keydown',escape);
  const footer=doc.querySelector('.table-status');let toastTimer;
  const statusObserver=new MutationObserver(()=>{footer.classList.add('play-notice');clearTimeout(toastTimer);toastTimer=setTimeout(()=>footer.classList.remove('play-notice'),6000);});
  statusObserver.observe(doc.getElementById('status'),{childList:true,characterData:true,subtree:true});
  window.dispatchEvent(new Event('resize'));
  return {
    setContext({label,connected,diceAvailable=false}){context.textContent=label;context.dataset.connected=String(connected);quickDice.hidden=!diceAvailable;},
    dispose(){clearTimeout(toastTimer);statusObserver.disconnect();doc.removeEventListener('keydown',escape);doc.removeEventListener('tabletop:location-inspected',reveal);showPieces(false);sidebar.inert=false;for(const [element,marker]of moved.reverse()){marker.replaceWith(element);}drawerHeader.remove();menu.remove();context.remove();pieces.remove();quickDice.remove();openMenu.remove();body.classList.remove('table-play');footer.classList.remove('play-notice');}
  };
}
