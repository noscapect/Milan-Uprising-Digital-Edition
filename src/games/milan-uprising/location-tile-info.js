import {locationTileLabel} from './location-tiles.js';
export function describeLocationTile(kind,tile,zoneLabel){
  const haven=['haven','haven-11','haven-12'].includes(tile.value);
  const summaries={herd:'Reduce Hunger by 2, to a minimum of 1.',income:'Gain 2 Resources.',media:'Spend Resources to change Suspicion or Masquerade.',possibleHaven:'Pay 5 Resources to move your Haven here.',secretBar:'Exchange resources using the action offered by Milan.',underground:'Travel to another location.'};
  return {title:locationTileLabel(kind,{...tile,face:'visible'}),shortLabel:haven?'Haven':locationTileLabel(kind,{...tile,face:'visible'}),symbol:haven?'house':tile.value,
    summary:haven?`${zoneLabel} is your coterie's Haven: your group's home base. Each night starts here.`:summaries[tile.value]||'The tile type has not been copied from Milan yet.',
    use:haven?'This tile grants no special location action. At Sunrise, choose a Haven room on the left of the board and resolve its action in Milan.':tile.value==='unknown'?'First copy the symbol shown in Milan.':'Unlock this bonus through the Uprising Encounter. Use its action in Milan while your faction controls the district.'+(['herd','income','media','secretBar'].includes(tile.value)?' Once per night.':''),
    caution:haven?'Enemy control together with enemy Influence compromises your Haven. You cannot leave until that Influence is removed.':null,
    sourcePage:haven?'6–7':'7'};
}
