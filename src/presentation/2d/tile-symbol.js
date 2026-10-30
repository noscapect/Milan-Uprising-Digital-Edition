export function tileSymbol(symbol){
  const span=document.createElement('span');span.className='tile-symbol';span.setAttribute('aria-hidden','true');
  if(symbol==='house'||symbol==='underground'||symbol==='media'){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');
    const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('fill-rule','evenodd');path.setAttribute('d',symbol==='house'?'M2 11 12 2l10 9-2 2-1-1v10h-5v-7h-4v7H5V12l-1 1Z':symbol==='media'?'M3 9h12v11H3Zm12 3 8-5v14l-8-5ZM7 1a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm7 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z':'M7 2h10a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3l2 3h-3l-2-3h-4l-2 3H5l2-3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm0 4v6h10V6Zm1 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z');svg.append(path);span.append(svg);
  }else span.textContent=({herd:'◉',income:'+',media:'◌',possibleHaven:'⌂',secretBar:'◇',underground:'M'})[symbol]||'?';
  return span;
}
