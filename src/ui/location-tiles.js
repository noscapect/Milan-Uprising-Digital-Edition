import {bonusTypes,specialTypes,blankTile} from '../games/milan-uprising/location-tiles.js';
import {describeLocationTile} from '../games/milan-uprising/location-tile-info.js';
import {tileSymbol} from '../presentation/2d/tile-symbol.js';
import {havenRoomTypes,havenRoomLabel} from '../games/milan-uprising/haven-rooms.js';
export function mountLocationTiles(container,tabletop,act){
  if(!tabletop.setLocationTile)return ()=>{};
  const section=document.createElement('fieldset');section.className='location-tile-controls';
  const legend=document.createElement('legend'),cards=document.createElement('div'),next=document.createElement('p'),settings=document.createElement('details'),settingsTitle=document.createElement('summary');
  next.className='tile-next-step';settingsTitle.textContent='Copy or correct a tile';settings.append(settingsTitle);section.append(legend,cards,next,settings);container.prepend(section);
  let zone=null,havenEditKey=null;
  const havenSettings=document.createElement('div');havenSettings.hidden=true;
  const roomType=document.createElement('select'),roomLevel=document.createElement('select'),roomBonus=document.createElement('input'),roomSave=document.createElement('button');
  roomType.setAttribute('aria-label','Haven room type');roomLevel.setAttribute('aria-label','Haven room level');roomBonus.setAttribute('aria-label','Current Haven bonus');roomBonus.placeholder='Copy the current bonus shown in Milan';roomBonus.maxLength=160;
  for(const [id,label]of Object.entries(havenRoomTypes)){const o=document.createElement('option');o.value=id;o.textContent=label;roomType.append(o);}
  for(const [id,label]of [['unknown','Level not confirmed'],['standard','Standard'],['upgraded','Upgraded']]){const o=document.createElement('option');o.value=id;o.textContent=label;roomLevel.append(o);}
  roomSave.type='button';roomSave.textContent='Save current Haven bonus';roomSave.onclick=()=>{if(zone)act(()=>tabletop.setHavenRoom(zone.id,{type:roomType.value,level:roomLevel.value,bonus:roomBonus.value}),'Current Haven room and bonus copied to the board.');};
  havenSettings.append(roomType,roomLevel,roomBonus,roomSave);section.append(havenSettings);
  const controls=['bonus','special'].map(kind=>{
    const row=document.createElement('div'),label=document.createElement('label'),select=document.createElement('select'),button=document.createElement('button');row.className='tile-setting';
    label.textContent=kind==='bonus'?'Choose Location Bonus':'Choose Special Location';select.setAttribute('aria-label',label.textContent);label.append(select);button.type='button';button.dataset.tileKind=kind;
    for(const [value,text]of Object.entries(kind==='bonus'?bonusTypes:specialTypes)){if(value.startsWith('haven-'))continue;const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
    button.onclick=()=>{if(!zone)return;const tile=zone.locationTiles?.[kind]||blankTile();act(()=>tabletop.setLocationTile(zone.id,kind,{...tile,face:tile.face==='visible'?'hidden':'visible'}),'Tile side updated on the board.');};
    select.onchange=()=>{if(!zone)return;const tile=zone.locationTiles?.[kind]||blankTile();act(()=>tabletop.setLocationTile(zone.id,kind,{...tile,value:select.value}),'Tile type recorded.');};
    row.append(label,button);settings.append(row);return {kind,select,button};
  });
  const update=current=>{
    zone=current;section.hidden=!zone||!['city','haven'].includes(zone.area);if(section.hidden)return;
    const haven=zone.area==='haven';havenSettings.hidden=!haven;settings.hidden=haven;legend.textContent=(haven?'Haven room · ':'Board tiles · ')+zone.label;cards.replaceChildren();
    if(haven){
      const info=havenRoomLabel(zone.havenRoom),heading=document.createElement('h3'),bonus=document.createElement('p');heading.textContent=info.title;bonus.textContent=info.bonus;cards.append(heading,bonus);
      const editKey=JSON.stringify([zone.id,zone.havenRoom]);
      if(havenEditKey!==editKey){havenEditKey=editKey;roomType.value=zone.havenRoom?.type||'unknown';roomLevel.value=zone.havenRoom?.level||'unknown';roomBonus.value=zone.havenRoom?.bonus||'';}
      next.textContent='Copy the current room, upgrade level and bonus from Milan. Upgrading or using the room is handled in the official app.';return;
    }
    for(const {kind,select,button}of controls){
      const tile=zone.locationTiles?.[kind]||blankTile();select.value=tile.value.startsWith('haven-')?'haven':tile.value;
      button.textContent=tile.face==='visible'?'Turn to back side':'Show symbol side';button.setAttribute('aria-label',(kind==='bonus'?'Location Bonus':'Special Location')+' '+zone.label+' '+button.textContent.toLowerCase());
      if(tile.face==='unconfirmed')continue;
      const info=describeLocationTile(kind,tile,zone.label),card=document.createElement('article');card.className='location-tile-card';card.dataset.kind=kind;card.dataset.face=tile.face;
      const heading=document.createElement('h3'),summary=document.createElement('p'),use=document.createElement('p');heading.append(tileSymbol(info.symbol),document.createTextNode(info.title));
      summary.textContent=tile.face==='visible'?info.summary:'Back side up: this symbol is not currently shown on the board.';use.textContent=tile.face==='visible'?info.use:'Turn to the symbol side only when Milan instructs you to.';card.append(heading,summary,use);
      if(info.caution&&tile.face==='visible'){const caution=document.createElement('p');caution.className='tile-caution';caution.textContent=info.caution;card.append(caution);}
      const flip=document.createElement('button');flip.type='button';flip.dataset.tileFlip=kind;flip.textContent=tile.face==='visible'?'Flip tile · back side':'Flip tile · symbol side';flip.onclick=()=>button.click();
      const source=document.createElement('a');source.href='https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf';source.target='_blank';source.rel='noopener';source.textContent='Game guide · manual p. '+info.sourcePage;
      card.append(flip,source);cards.append(card);
    }
    if(!cards.childElementCount){const hint=document.createElement('p');hint.textContent='Milan determines which tile side faces up. Copy the symbol from its setup screen using the controls below.';cards.append(hint);}
    next.textContent=tabletop.appScreen?.()==='board-tiles-setup'?'Next: compare the board with the setup on your tablet. Does the tile side match? Press Continue in Milan.':'Flipping a tile updates the board. Choose the game action in the official Milan app.';
  };
  update.dispose=()=>section.remove();return update;
}
