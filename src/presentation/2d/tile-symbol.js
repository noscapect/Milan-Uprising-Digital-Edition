export function tileSymbol(symbol){
  const span=document.createElement('span');span.className='tile-symbol';span.setAttribute('aria-hidden','true');
  if(symbol==='house'){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');
    const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M2 11 12 2l10 9-2 2-1-1v10h-5v-7h-4v7H5V12l-1 1Z');svg.append(path);span.append(svg);
  }else span.textContent=({herd:'◉',income:'+',media:'◌',possibleHaven:'⌂',secretBar:'◇',underground:'M'})[symbol]||'?';
  return span;
}
