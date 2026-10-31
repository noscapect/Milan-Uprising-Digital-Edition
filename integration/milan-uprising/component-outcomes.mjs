import {readFeedCards} from './feed-cards.mjs';
import {readCompletedMovement} from '../../src/games/milan-uprising/completed-movement.js';
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function readComponentOutcomes(raw,profile){
 const groups=readFeedCards(raw);if(!groups)return null;
 const latest=new Map(),unsupported=[];
 for(const group of groups){
  const text=group.map(l=>l.text).join(' '),compact=normalize(text);
  const movement=readCompletedMovement(text,profile.zones),placed=compact.match(/^(.+?)(?:placedin|placedat)(.+)$/),removed=compact.match(/^remove(.+?)from(?:the)?map$/)||compact.match(/^(.+?)removedfrom(?:the)?map$/);
  if(!placed&&!removed&&!movement)continue;
  const name=movement?.name||(placed||removed)[1],matches=profile.components.filter(c=>normalize(c.label.split('·')[0])===name);
  if(matches.length!==1){unsupported.push(text);continue;}
  const componentId=matches[0].id;
  if(movement&&matches[0].groupId==='characters')continue;
  if(removed){latest.set(componentId,{componentId,operation:'remove'});continue;}
  const zone=profile.zones.find(z=>z.area==='city'&&(movement?z.id===movement.zoneId:normalize(z.label)===placed[2]));
  if(!zone){latest.set(componentId,null);unsupported.push(text);continue;}
  latest.set(componentId,{componentId,operation:'place',zoneId:zone.id});
 }
 const instructions=[...latest.values()].filter(Boolean).sort((a,b)=>a.componentId.localeCompare(b.componentId));
 return instructions.length||unsupported.length?{instructions,unsupported,scope:'explicit-named-component-feed-cards'}:null;
}
