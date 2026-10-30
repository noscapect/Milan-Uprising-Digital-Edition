import {readCompletedMovement} from '../../src/games/milan-uprising/completed-movement.js';
const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Read completed moves from ordered map-feed cards, independently of night-start cards.
export function readCharacterRelocations(raw,zones,characters,knownComponents=[]){
 if(!raw.available||raw.mapGeometry!=='android-city-v1'||!Array.isArray(raw.lines))return null;
 if(/anerrorocc|indexwasoutofrange|lostnetworkconnection/.test(normalize(raw.lines.map(l=>l.text).join(' '))))return null;
 const lines=raw.lines.filter(l=>l.x>raw.width*.50&&l.x<raw.width*.70&&l.y>raw.height*.20&&l.y<raw.height*.87).sort((a,b)=>a.y-b.y||a.x-b.x),groups=[];
 for(const line of lines){if(!groups.length||line.y-groups.at(-1).at(-1).y>raw.height*.05)groups.push([]);groups.at(-1).push(line);}
 const latest=new Map(),unsupported=[];
 for(const group of groups){
  const text=group.map(l=>l.text).join(' '),match=readCompletedMovement(text,zones);if(!match)continue;
  const character=characters.find(c=>normalize(c.label.split('·')[0])===match.name);
  if(!character){if(!knownComponents.some(component=>normalize(component.label.split('·')[0])===match.name))unsupported.push(text);continue;}
  const zone=zones.find(z=>z.area==='city'&&z.id===match.zoneId);
  // An unreadable newest destination must not leave an older move authoritative.
  latest.set(character.id,zone?{componentId:character.id,zoneId:zone.id}:null);
  if(!zone)unsupported.push(text);
 }
 const characterMoves=[...latest.values()].filter(Boolean).sort((a,b)=>a.componentId.localeCompare(b.componentId));
 return characterMoves.length||unsupported.length?{characterMoves,unsupported,scope:'visible-ordered-completed-character-moves'}:null;
}
