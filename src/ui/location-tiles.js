import {bonusTypes,specialTypes,blankTile,locationTileLabel} from '../games/milan-uprising/location-tiles.js';
export function mountLocationTiles(container,tabletop,act){
  if(!tabletop.setLocationTile)return ()=>{};
  const section=document.createElement('fieldset');section.className='location-tile-controls';
  const legend=document.createElement('legend');legend.textContent='Bordtegels';section.append(legend);container.prepend(section);
  const controls=['bonus','special'].map(kind=>{
    const row=document.createElement('div'),title=document.createElement('strong'),select=document.createElement('select'),status=document.createElement('p'),button=document.createElement('button');
    title.textContent=kind==='bonus'?'Locatiebonus':'Speciale locatie';select.setAttribute('aria-label',title.textContent+' kiezen');button.type='button';button.dataset.tileKind=kind;
    for(const [value,label]of Object.entries(kind==='bonus'?bonusTypes:specialTypes)){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
    row.append(title,select,status,button);section.append(row);return {kind,select,status,button};
  });
  let zone=null;
  for(const control of controls){
    control.button.onclick=()=>{if(!zone)return;const tile=zone.locationTiles?.[control.kind]||blankTile();act(()=>tabletop.setLocationTile(zone.id,control.kind,{...tile,face:tile.face==='visible'?'hidden':'visible'}),'Bordtegel omgekeerd.');};
    control.select.onchange=()=>{if(!zone)return;const tile=zone.locationTiles?.[control.kind]||blankTile();act(()=>tabletop.setLocationTile(zone.id,control.kind,{...tile,value:control.select.value}),'Tegeltype vastgelegd.');};
  }
  const update=current=>{zone=current;section.hidden=!zone||zone.area!=='city';if(section.hidden)return;
    for(const {kind,select,status,button}of controls){const tile=zone.locationTiles?.[kind]||blankTile();select.value=tile.value;status.textContent=locationTileLabel(kind,tile);button.textContent=tile.face==='unconfirmed'?'Zichtbaar maken':'Tegel omkeren';button.setAttribute('aria-label',(kind==='bonus'?'Locatiebonus':'Speciale locatie')+' '+zone.label+' '+button.textContent.toLowerCase());}
  };
  update.dispose=()=>section.remove();return update;
}
