import {bonusTypes,specialTypes,blankTile} from '../games/milan-uprising/location-tiles.js';
import {describeLocationTile} from '../games/milan-uprising/location-tile-info.js';
import {tileSymbol} from '../presentation/2d/tile-symbol.js';
export function mountLocationTiles(container,tabletop,act){
  if(!tabletop.setLocationTile)return ()=>{};
  const section=document.createElement('fieldset');section.className='location-tile-controls';
  const legend=document.createElement('legend'),cards=document.createElement('div'),next=document.createElement('p'),settings=document.createElement('details'),settingsTitle=document.createElement('summary');
  next.className='tile-next-step';settingsTitle.textContent='Tegel overnemen of corrigeren';settings.append(settingsTitle);section.append(legend,cards,next,settings);container.prepend(section);
  let zone=null;
  const controls=['bonus','special'].map(kind=>{
    const row=document.createElement('div'),label=document.createElement('label'),select=document.createElement('select'),button=document.createElement('button');row.className='tile-setting';
    label.textContent=kind==='bonus'?'Locatiebonus kiezen':'Speciale locatie kiezen';select.setAttribute('aria-label',label.textContent);label.append(select);button.type='button';button.dataset.tileKind=kind;
    for(const [value,text]of Object.entries(kind==='bonus'?bonusTypes:specialTypes)){if(value.startsWith('haven-'))continue;const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
    button.onclick=()=>{if(!zone)return;const tile=zone.locationTiles?.[kind]||blankTile();act(()=>tabletop.setLocationTile(zone.id,kind,{...tile,face:tile.face==='visible'?'hidden':'visible'}),'Tegelzijde overgenomen op het bord.');};
    select.onchange=()=>{if(!zone)return;const tile=zone.locationTiles?.[kind]||blankTile();act(()=>tabletop.setLocationTile(zone.id,kind,{...tile,value:select.value}),'Betekenis van de tegel vastgelegd.');};
    row.append(label,button);settings.append(row);return {kind,select,button};
  });
  const update=current=>{
    zone=current;section.hidden=!zone||zone.area!=='city';if(section.hidden)return;legend.textContent='Bordtegels · '+zone.label;cards.replaceChildren();
    for(const {kind,select,button}of controls){
      const tile=zone.locationTiles?.[kind]||blankTile();select.value=tile.value.startsWith('haven-')?'haven':tile.value;
      button.textContent=tile.face==='visible'?'Draai naar achterzijde':'Toon symboolzijde';button.setAttribute('aria-label',(kind==='bonus'?'Locatiebonus':'Speciale locatie')+' '+zone.label+' '+button.textContent.toLowerCase());
      if(tile.face==='unconfirmed')continue;
      const info=describeLocationTile(kind,tile,zone.label),card=document.createElement('article');card.className='location-tile-card';card.dataset.kind=kind;card.dataset.face=tile.face;
      const heading=document.createElement('h3'),summary=document.createElement('p'),use=document.createElement('p');heading.append(tileSymbol(info.symbol),document.createTextNode(info.title));
      summary.textContent=tile.face==='visible'?info.summary:'Achterzijde boven: dit symbool is nu niet op het bord getoond.';use.textContent=tile.face==='visible'?info.use:'Draai alleen naar de symboolzijde als Milan dat aangeeft.';card.append(heading,summary,use);
      if(info.caution&&tile.face==='visible'){const caution=document.createElement('p');caution.className='tile-caution';caution.textContent=info.caution;card.append(caution);}
      const flip=document.createElement('button');flip.type='button';flip.dataset.tileFlip=kind;flip.textContent=tile.face==='visible'?'Tegel omdraaien · achterzijde':'Tegel omdraaien · symboolzijde';flip.onclick=()=>button.click();
      const source=document.createElement('a');source.href='https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf';source.target='_blank';source.rel='noopener';source.textContent='Speluitleg · handleiding p. '+info.sourcePage;
      card.append(flip,source);cards.append(card);
    }
    if(!cards.childElementCount){const hint=document.createElement('p');hint.textContent='Milan bepaalt welke tegelzijde hier boven ligt. Neem het symbool uit het opstellingsscherm over via de keuze hieronder.';cards.append(hint);}
    next.textContent=tabletop.appScreen?.()==='board-tiles-setup'?'Nu: vergelijk het bord met de opstelling op je tablet. Klopt de getoonde tegelzijde? Druk dan op Continue in Milan.':'Een tegel omdraaien werkt het bord bij. Kies de spelactie zelf in de officiële Milan-app.';
  };
  update.dispose=()=>section.remove();return update;
}
