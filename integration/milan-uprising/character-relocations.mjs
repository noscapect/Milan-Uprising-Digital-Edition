import {readFeedCards} from './feed-cards.mjs';
import {matchesOutcomeName} from './component-outcomes.mjs';
import {readCompletedMovement} from '../../src/games/milan-uprising/completed-movement.js';
const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Read completed moves from ordered map-feed cards, independently of night-start cards.
export function readCharacterRelocations(raw,zones,characters,knownComponents=[]){
 const groups=readFeedCards(raw);if(!groups)return null;
 const latest=new Map(),unsupported=[];
 for(const group of groups){
  const text=group.map(l=>l.text).join(' '),match=readCompletedMovement(text,zones);if(!match)continue;
  const character=characters.find(c=>normalize(c.label.split('·')[0])===match.name);
  if(!character){if(!knownComponents.some(component=>matchesOutcomeName(component,match.name)))unsupported.push(text);continue;}
  const zone=zones.find(z=>z.area==='city'&&z.id===match.zoneId);
  // An unreadable newest destination must not leave an older move authoritative.
  latest.set(character.id,zone?{componentId:character.id,zoneId:zone.id}:null);
  if(!zone)unsupported.push(text);
 }
 const characterMoves=[...latest.values()].filter(Boolean).sort((a,b)=>a.componentId.localeCompare(b.componentId));
 return characterMoves.length||unsupported.length?{characterMoves,unsupported,scope:'visible-ordered-completed-character-moves'}:null;
}
