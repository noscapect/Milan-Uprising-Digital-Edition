// An off-board accessory view. Receives presentation data, never modifies game state.
export function mountMiniatureStand(host,config){
  const doc=host.ownerDocument,ns='http://www.w3.org/2000/svg';
  const stand=doc.createElement('aside');stand.className='miniature-stand';stand.dataset.accessory=config.id;stand.setAttribute('aria-label',config.label+' · '+config.subtitle);
  const title=doc.createElement('h2');title.textContent=config.label;
  const subtitle=doc.createElement('p');subtitle.className='miniature-stand-subtitle';subtitle.textContent=config.subtitle;
  const sculpture=doc.createElement('div');sculpture.className='miniature-stand-sculpture';
  if(config.image){const image=doc.createElement('img');image.src=config.image;image.alt=config.label+' miniature on the LED ring';image.draggable=false;
    const crop=config.imageCrop;sculpture.style.aspectRatio=crop?`${crop.visibleWidth}/${crop.height}`:'1/2';if(crop)image.style.width=`${crop.width/crop.visibleWidth*100}%`;
    image.onerror=()=>{image.remove();sculpture.classList.add('without-artwork');};sculpture.append(image);
  }else sculpture.classList.add('without-artwork');
  const fallback=doc.createElement('span');fallback.className='miniature-stand-fallback';fallback.textContent=config.label;sculpture.append(fallback);
  const ring=doc.createElementNS(ns,'svg');ring.setAttribute('viewBox','0 0 160 86');ring.classList.add('miniature-led-ring');ring.setAttribute('role','img');
  const base=doc.createElementNS(ns,'ellipse');base.setAttribute('cx','80');base.setAttribute('cy','44');base.setAttribute('rx','73');base.setAttribute('ry','35');base.setAttribute('fill','#111616');base.setAttribute('stroke','#252c2d');base.setAttribute('stroke-width','8');ring.append(base);
  const paths=['M 14 43 A 66 29 0 0 1 75 14','M 85 14 A 66 29 0 0 1 146 43','M 146 48 A 66 29 0 0 1 85 77','M 75 77 A 66 29 0 0 1 14 48'];
  // Match Teburu's top view: upper left 3, upper right 4, lower right 1, lower left 2.
  const lightIndices=[2,3,0,1];
  paths.forEach((d,i)=>{const led=doc.createElementNS(ns,'path');led.setAttribute('d',d);led.dataset.light=String(lightIndices[i]+1);ring.append(led);});sculpture.append(ring);
  const status=doc.createElement('p');status.className='miniature-stand-status';status.setAttribute('role','status');
  stand.append(title,subtitle,sculpture,status);host.append(stand);
  function update(state){
    const observed=state?.observed===true&&state.colors?.length===4;
    [...ring.querySelectorAll('path')].forEach((led,i)=>{const color=observed?state.colors[lightIndices[i]]:'#343b3c';led.style.setProperty('--led-color',color);led.dataset.lit=String(observed&&color!=='#000000');});
    ring.setAttribute('aria-label',observed?'LED ring · '+state.colors.map((c,i)=>`light ${i+1}: ${c}`).join(', '):'LED ring · four lights · no signal received');
    status.textContent=observed?'LED ring · the game':'LED ring · awaiting the game';stand.dataset.observed=String(observed);
  }
  update();return {element:stand,update,dispose(){stand.remove();}};
}
